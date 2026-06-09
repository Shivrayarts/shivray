import crypto from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { env } from "./env.mjs";
import { query, withTransaction } from "./db.mjs";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  parseCookies,
  verifyAdminSessionToken,
} from "./session.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const app = express();
const hasBuiltClient = existsSync(path.join(distDir, "index.html"));
const isVercelRuntime = Boolean(process.env.VERCEL);
let serverBootstrapPromise = null;

function ensureServerBootstrap() {
  if (!serverBootstrapPromise) {
    serverBootstrapPromise = (async () => {
      await withTransaction(async (connection) => {
        await ensureHomepageSettingsTable(connection);
      });
      await ensureHomepageSettingsValueColumnSupportsLargePayloads();
      await ensureCataloguesDownloadUrlColumn();
      await ensureCatalogueRequestsTable();
      await ensureBlogSubmissionsTable();
      await ensureHomepageVideosSchema();
      await ensureProductsCategoryColumnSupportsCustomValues();
      await ensureProductsLocalizedColumnsSupportJson();
      await ensureProductsDiscountColumns();
      await ensureOrderItemsProductSlugSnapshotColumn();
      await normalizeLegacySeedAssetPaths();
    })().catch((error) => {
      serverBootstrapPromise = null;
      throw error;
    });
  }

  return serverBootstrapPromise;
}

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(async (_req, _res, next) => {
  try {
    await ensureServerBootstrap();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api", (req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.path === "/storefront") {
    next();
    return;
  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const allowedOrigins = new Set(
  String(env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

const memoryCustomers = [];
const memoryOrders = [];
const PRODUCT_OPTIONS_SETTING_KEY = "product_options_map";
const PRODUCT_GALLERY_SETTING_KEY = "product_gallery_map";
const BLOG_POSTS_SETTING_KEY = "blog_posts";
const ANNOUNCEMENT_BAR_SETTING_KEY = "announcement_bar";
const STOREFRONT_CACHE_TTL_MS = 5 * 60 * 1000;
const LEGACY_SEEDED_PRODUCT_SLUGS = [
  "shastradhari-maharaj-coloured",
  "ashwarudh-maharaj",
  "roudra-shambhu-chatrapati",
  "royal-khanjar-with-sheath",
  "vita-battle-axe",
  "ceremonial-gada",
  "brass-dhoop-stand",
  "maratha-war-shield",
  "talwar-curved-sword",
  "saffron-straight-sword",
  "black-curved-talwar",
  "decorated-talwar-with-sheath",
  "royal-straight-blade",
];
const LEGACY_SEEDED_CATALOGUE_SLUGS = [
  "statues-catalogue",
  "weapons-catalogue",
  "shield-catalogue",
  "dhoop-catalogue",
  "full-catalogue",
];

let storefrontPayloadCache = null;
let storefrontPayloadCacheExpiresAt = 0;

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseCurrencyAmount(value) {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function normalizeUnicodeDigits(value) {
  return String(value ?? "").replace(/\p{Nd}/gu, (char) => {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x30 && code <= 0x39) return char; // ASCII
    if (code >= 0x660 && code <= 0x669) return String(code - 0x660); // Arabic-Indic
    if (code >= 0x6f0 && code <= 0x6f9) return String(code - 0x6f0); // Eastern Arabic-Indic
    if (code >= 0x966 && code <= 0x96f) return String(code - 0x966); // Devanagari
    if (code >= 0xff10 && code <= 0xff19) return String(code - 0xff10); // Full-width
    return char;
  });
}

function parseProductPrice(value) {
  const raw = normalizeUnicodeDigits(value).trim();
  if (!raw) return null;

  const digitsOnly = raw.replace(/[^\d.,]/g, "");
  if (!digitsOnly) return null;

  const lastDot = digitsOnly.lastIndexOf(".");
  const integerPart = (lastDot >= 0 ? digitsOnly.slice(0, lastDot) : digitsOnly).replace(/[^\d]/g, "");
  const fractionalPart = lastDot >= 0 ? digitsOnly.slice(lastDot + 1).replace(/[^\d]/g, "") : "";
  const normalized = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parseDiscountPercentage(value) {
  const normalized = String(value ?? "").replace(/[^\d.]/g, "").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, 100);
}

function normalizeProductForDb(product) {
  const parsedPrice = parseProductPrice(product?.price);
  if (parsedPrice === null) return null;
  const discountPercentage = parseDiscountPercentage(product?.discount);
  const parsedFinalPrice = discountPercentage > 0
    ? Number((parsedPrice - parsedPrice * (discountPercentage / 100)).toFixed(2))
    : null;

  const productOptions = Array.isArray(product?.productOptions)
    ? product.productOptions
        .map((option) => {
          const price = parseCurrencyAmount(option?.price);
          const discount = parseDiscountPercentage(option?.discount);
          const finalPrice = discount > 0
            ? Number((price - price * (discount / 100)).toFixed(2))
            : parseCurrencyAmount(option?.finalPrice) || price;

          return {
            label: String(option?.label || "").trim(),
            price: formatCurrency(price),
            discount: discount.toFixed(2),
            finalPrice: formatCurrency(finalPrice),
          };
        })
        .filter((option) => option.label && parseCurrencyAmount(option.price) > 0 && parseCurrencyAmount(option.finalPrice) > 0)
    : [];

  return {
    slug: slugify(product?.id || getEnglishText(product?.name), "product"),
    name: encodeLocalizedValue(product?.name),
    price: parsedPrice,
    discountPercentage,
    finalPrice: parsedFinalPrice,
    image: product?.image,
    category: product?.category,
    tag: encodeLocalizedValue(product?.tag),
    shortDescription: encodeLocalizedValue(product?.shortDescription),
    details: encodeLocalizedValue(product?.details),
    material: encodeLocalizedValue(product?.material),
    dimensions: encodeLocalizedValue(product?.dimensions),
    historicalBackground: encodeLocalizedValue(product?.historicalBackground),
    galleryImages: Array.isArray(product?.galleryImages)
      ? product.galleryImages
          .map((image) => String(image || "").trim())
          .filter(Boolean)
          .slice(0, 4)
      : [],
    productOptions,
  };
}

async function upsertProductRow(connection, product, sortOrder) {
  await connection.query(
    `
    INSERT INTO products (
      slug, name, price, discount_percentage, final_price, image_url, category, tag, short_description, details, material, dimensions, history_background, stock_quantity, is_published, sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      price = VALUES(price),
      discount_percentage = VALUES(discount_percentage),
      final_price = VALUES(final_price),
      image_url = VALUES(image_url),
      category = VALUES(category),
      tag = VALUES(tag),
      short_description = VALUES(short_description),
      details = VALUES(details),
      material = VALUES(material),
      dimensions = VALUES(dimensions),
      history_background = VALUES(history_background),
      is_published = VALUES(is_published),
      sort_order = VALUES(sort_order)
    `,
    [
      product.slug,
      product.name,
      product.price,
      product.discountPercentage,
      product.finalPrice,
      product.image,
      product.category,
      product.tag,
      product.shortDescription,
      product.details,
      product.material,
      product.dimensions,
      product.historicalBackground,
      sortOrder,
    ],
  );
}

function toBoolean(value) {
  return Boolean(Number(value));
}

function toSha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getRazorpayBasicAuthHeader() {
  const keyId = String(env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keyId || !keySecret) {
    throw createHttpError(500, "Razorpay credentials are not configured on server.");
  }

  const encoded = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${encoded}`;
}

function verifyRazorpayPaymentSignature(orderId, paymentId, signature) {
  const secret = String(env.RAZORPAY_KEY_SECRET || "").trim();
  if (!secret) {
    throw createHttpError(500, "Razorpay credentials are not configured on server.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function slugify(value, fallbackPrefix) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug) return slug;
  return `${fallbackPrefix}-${Date.now()}`;
}

function getEnglishText(value) {
  if (value && typeof value === "object") return value.en || value.mr || "";
  return value || "";
}

function encodeLocalizedValue(value) {
  if (!value || typeof value !== "object") return String(value || "");
  const en = String(value.en || "").trim();
  const mr = String(value.mr || "").trim();
  if (!en && !mr) return "";
  return JSON.stringify({ en, mr });
}

function decodeLocalizedValue(value) {
  const raw = String(value || "").trim();
  if (!raw || !raw.startsWith("{")) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return raw;
    const en = String(parsed.en || "").trim();
    const mr = String(parsed.mr || "").trim();
    if (!en && !mr) return raw;
    return { en, mr };
  } catch {
    return raw;
  }
}

function buildOrderNumber() {
  return `#order-${Date.now().toString().slice(-6)}`;
}

function canUseLocalAdminFallback(email, password) {
  return (
    email === String(env.ADMIN_EMAIL || "").trim().toLowerCase() &&
    password === String(env.ADMIN_PASSWORD || "")
  );
}

function sendLocalAdminLogin(res, email) {
  setAdminSessionCookie(res, {
    userId: 1,
    email,
    role: "admin",
  });

  res.json({
    ok: true,
    admin: {
      id: 1,
      fullName: "Admin",
      email,
    },
  });
}

function upsertMemoryCustomer(input) {
  const now = new Date().toISOString();
  const email = String(input.email || "").trim().toLowerCase();
  const existingIndex = memoryCustomers.findIndex((customer) => customer.email.toLowerCase() === email);
  const existing = existingIndex >= 0 ? memoryCustomers[existingIndex] : null;
  const customer = {
    id: existing?.id ?? `customer-local-${Date.now()}`,
    name: String(input.name || existing?.name || email.split("@")[0] || "Customer").trim(),
    email,
    phone: String(input.phone || existing?.phone || "").trim(),
    address: String(input.address || existing?.address || "").trim(),
    createdAt: existing?.createdAt ?? now,
    lastLoginAt: now,
  };

  if (existingIndex >= 0) memoryCustomers[existingIndex] = customer;
  else memoryCustomers.unshift(customer);

  return customer;
}

function updateMemoryCustomer(customerId, updates) {
  const index = memoryCustomers.findIndex((customer) => customer.id === customerId);
  if (index === -1) return null;

  memoryCustomers[index] = {
    ...memoryCustomers[index],
    ...updates,
    id: memoryCustomers[index].id,
    lastLoginAt: updates.lastLoginAt ?? new Date().toISOString(),
  };

  return memoryCustomers[index];
}

function createMemoryOrder(payload, paymentMethod) {
  const customer = upsertMemoryCustomer(payload.customer);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const totalAmount = items.reduce(
    (sum, item) => sum + parseCurrencyAmount(item.price) * (Number(item.quantity) || 0),
    0,
  );
  const order = {
    id: buildOrderNumber(),
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    items: items.map((item) => ({
      productId: String(item.productId || ""),
      productName: item.productName,
      price: formatCurrency(parseCurrencyAmount(item.price)),
      quantity: Number(item.quantity) || 1,
      image: item.image || "",
    })),
    paymentMethod,
    paymentInfo: String(payload.paymentInfo || `${paymentMethod} Pending`),
    status: "Pending",
    totalPrice: formatCurrency(totalAmount),
    createdAt: new Date().toISOString(),
  };

  memoryOrders.unshift(order);
  return order;
}

function parseCustomerId(value) {
  const raw = String(value || "").replace(/^customer-/, "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getAdminSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifyAdminSessionToken(cookies[ADMIN_SESSION_COOKIE] ?? "");
}

function setAdminSessionCookie(res, payload) {
  const token = createAdminSessionToken(payload);
  const cookieParts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=604800",
  ];

  if (env.NODE_ENV === "production") {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

function clearAdminSessionCookie(res) {
  const cookieParts = [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (env.NODE_ENV === "production") {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

async function ensureHomepageSettingsTable(connection) {
  await connection.query(
    `
    CREATE TABLE IF NOT EXISTS homepage_settings (
      setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
      setting_value MEDIUMTEXT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  );
}

async function ensureHomepageSettingsValueColumnSupportsLargePayloads() {
  try {
    await query(
      `
      ALTER TABLE homepage_settings
      MODIFY COLUMN setting_value MEDIUMTEXT NULL
      `,
    );
  } catch (error) {
    console.warn(
      "Unable to expand homepage settings storage for product galleries.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureCataloguesDownloadUrlColumn() {
  try {
    const rows = await query(
      `
      SHOW COLUMNS FROM catalogues LIKE 'download_url'
      `,
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      await query(
        `
        ALTER TABLE catalogues
        ADD COLUMN download_url MEDIUMTEXT NULL AFTER image_url
        `,
      );
    }
  } catch (error) {
    console.warn(
      "Unable to verify catalogue download URL schema.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureCatalogueRequestsTable() {
  try {
    await query(
      `
      CREATE TABLE IF NOT EXISTS catalogue_requests (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        address TEXT NOT NULL,
        note TEXT NULL,
        catalogue_slug VARCHAR(191) NOT NULL,
        catalogue_title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
    );
  } catch (error) {
    console.warn(
      "Unable to verify catalogue requests table.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureBlogSubmissionsTable() {
  try {
    await query(
      `
      CREATE TABLE IF NOT EXISTS blog_submissions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        title VARCHAR(255) NOT NULL,
        story TEXT NOT NULL,
        image_url MEDIUMTEXT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        published_blog_id VARCHAR(191) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
    );

    const imageColumnRows = await query(
      `
      SHOW COLUMNS FROM blog_submissions LIKE 'image_url'
      `,
    );
    if (!Array.isArray(imageColumnRows) || imageColumnRows.length === 0) {
      await query(
        `
        ALTER TABLE blog_submissions
        ADD COLUMN image_url MEDIUMTEXT NULL AFTER story
        `,
      );
    }
  } catch (error) {
    console.warn(
      "Unable to verify blog submissions table.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureHomepageVideosSchema() {
  try {
    const rows = await query(
      `
      SHOW COLUMNS FROM homepage_videos
      `,
    );

    const columns = new Set(
      Array.isArray(rows) ? rows.map((row) => String(row.Field || row.field || "").trim()) : [],
    );

    if (!columns.has("video_type")) {
      await query(
        `
        ALTER TABLE homepage_videos
        ADD COLUMN video_type ENUM('reel', 'youtube') NOT NULL DEFAULT 'youtube' AFTER video_url
        `,
      );
    }

    if (!columns.has("thumbnail_url")) {
      await query(
        `
        ALTER TABLE homepage_videos
        ADD COLUMN thumbnail_url MEDIUMTEXT NULL AFTER video_type
        `,
      );
    }
  } catch (error) {
    console.warn(
      "Unable to verify homepage video schema.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureProductsCategoryColumnSupportsCustomValues() {
  try {
    const rows = await query(
      `
      SHOW COLUMNS FROM products LIKE 'category'
      `,
    );

    const column = Array.isArray(rows) ? rows[0] : null;
    const rawType = String(column?.Type ?? column?.type ?? "").toLowerCase();
    if (!rawType.startsWith("enum(")) return;

    await query(
      `
      ALTER TABLE products
      MODIFY COLUMN category VARCHAR(191) NOT NULL
      `,
    );
    console.log("Updated products.category column from ENUM to VARCHAR(191).");
  } catch (error) {
    console.warn(
      "Unable to verify or update products.category column. Product saves may fail for custom categories.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureProductsLocalizedColumnsSupportJson() {
  try {
    await query(
      `
      ALTER TABLE products
      MODIFY COLUMN name TEXT NOT NULL,
      MODIFY COLUMN tag TEXT NULL,
      MODIFY COLUMN short_description TEXT NOT NULL,
      MODIFY COLUMN material TEXT NOT NULL,
      MODIFY COLUMN dimensions TEXT NOT NULL
      `,
    );
  } catch (error) {
    console.warn(
      "Unable to expand product text columns for localized admin content.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureProductsDiscountColumns() {
  try {
    await query(
      `
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER price,
      ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2) NULL AFTER discount_percentage
      `,
    );

    await query(
      `
      UPDATE products
      SET final_price = NULL
      WHERE discount_percentage <= 0
      `,
    );

    await query(
      `
      UPDATE products
      SET final_price = ROUND(price - (price * discount_percentage / 100), 2)
      WHERE discount_percentage > 0
      `,
    );
  } catch (error) {
    console.warn(
      "Unable to verify product discount columns.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function ensureOrderItemsProductSlugSnapshotColumn() {
  try {
    const rows = await query(
      `
      SHOW COLUMNS FROM order_items LIKE 'product_slug_snapshot'
      `,
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      await query(
        `
        ALTER TABLE order_items
        ADD COLUMN product_slug_snapshot VARCHAR(191) NULL AFTER product_id
        `,
      );
    }

    await query(
      `
      UPDATE order_items order_items_row
      LEFT JOIN products products_row ON products_row.id = order_items_row.product_id
      SET order_items_row.product_slug_snapshot = products_row.slug
      WHERE order_items_row.product_slug_snapshot IS NULL
        AND order_items_row.product_id IS NOT NULL
      `,
    );
  } catch (error) {
    console.warn(
      "Unable to verify order item slug snapshots.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function normalizeLegacySeedAssetPaths() {
  const replacements = [
    ["/assets/product-statue-2.jpg", "/assets/product-statue-2.jpeg"],
    ["/assets/product-statue-3.jpg", "/assets/product-statue-3.jpeg"],
    ["/assets/product-weapon-1.jpg", "/assets/product-weapon-1.jpeg"],
    ["/assets/product-weapon-2.jpg", "/assets/product-weapon-2.jpeg"],
    ["/assets/product-weapon-3.jpg", "/assets/product-weapon-3.jpeg"],
    ["/assets/product-talwar-1.jpg", "/assets/product-talwar-1.jpeg"],
  ];

  try {
    for (const [fromPath, toPath] of replacements) {
      await query(
        `
        UPDATE products
        SET image_url = ?
        WHERE image_url = ?
        `,
        [toPath, fromPath],
      );
    }
  } catch (error) {
    console.warn(
      "Unable to normalize legacy product asset paths.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function loadProductOptionsMap() {
  const rows = await query(
    `
    SELECT setting_value
    FROM homepage_settings
    WHERE setting_key = ?
    LIMIT 1
    `,
    [PRODUCT_OPTIONS_SETTING_KEY],
  ).catch(() => []);

  const rawValue = rows?.[0]?.setting_value;
  if (typeof rawValue !== "string" || !rawValue.trim()) return {};

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function saveProductOptionsMap(connection, productOptionsMap) {
  await ensureHomepageSettingsTable(connection);
  await connection.query(
    `
    INSERT INTO homepage_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [PRODUCT_OPTIONS_SETTING_KEY, JSON.stringify(productOptionsMap)],
  );
}

async function loadProductGalleryMap() {
  const rows = await query(
    `
    SELECT setting_value
    FROM homepage_settings
    WHERE setting_key = ?
    LIMIT 1
    `,
    [PRODUCT_GALLERY_SETTING_KEY],
  ).catch(() => []);

  const rawValue = rows?.[0]?.setting_value;
  if (typeof rawValue !== "string" || !rawValue.trim()) return {};

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function saveProductGalleryMap(connection, productGalleryMap) {
  await ensureHomepageSettingsTable(connection);
  await connection.query(
    `
    INSERT INTO homepage_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [PRODUCT_GALLERY_SETTING_KEY, JSON.stringify(productGalleryMap)],
  );
}

async function loadBlogPosts() {
  const rows = await query(
    `
    SELECT setting_value
    FROM homepage_settings
    WHERE setting_key = ?
    LIMIT 1
    `,
    [BLOG_POSTS_SETTING_KEY],
  ).catch(() => []);

  const rawValue = rows?.[0]?.setting_value;
  if (typeof rawValue !== "string" || !rawValue.trim()) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveBlogPosts(connection, blogPosts) {
  await ensureHomepageSettingsTable(connection);
  await connection.query(
    `
    INSERT INTO homepage_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [BLOG_POSTS_SETTING_KEY, JSON.stringify(blogPosts)],
  );
}

async function loadAnnouncementBar() {
  const rows = await query(
    `
    SELECT setting_value
    FROM homepage_settings
    WHERE setting_key = ?
    LIMIT 1
    `,
    [ANNOUNCEMENT_BAR_SETTING_KEY],
  ).catch(() => []);

  const rawValue = rows?.[0]?.setting_value;
  if (typeof rawValue !== "string" || !rawValue.trim()) return { enabled: false, text: "" };

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : { enabled: false, text: "" };
  } catch {
    return { enabled: false, text: "" };
  }
}

async function saveAnnouncementBar(connection, announcementBar) {
  await ensureHomepageSettingsTable(connection);
  await connection.query(
    `
    INSERT INTO homepage_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [ANNOUNCEMENT_BAR_SETTING_KEY, JSON.stringify(announcementBar)],
  );
}

async function findUserByEmail(email) {
  const rows = await query(
    `
    SELECT id, role
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

function requireAdmin(req, res, next) {
  const session = getAdminSession(req);
  if (!session?.userId) {
    res.status(401).json({ message: "Admin session required." });
    return;
  }

  req.adminSession = session;
  next();
}

async function fetchStorefrontPayload() {
  const [products, catalogues, banners, reviews, videos, spotlightSettings, productOptionsMap, productGalleryMap, blogPosts, announcementBar] = await Promise.all([
    query(
      `
      SELECT slug, name, price, image_url, category, tag, short_description, details, material, dimensions, history_background
      , discount_percentage, final_price
      FROM products
      WHERE is_published = 1
      ORDER BY sort_order ASC, id DESC
      `,
    ),
    query(
      `
      SELECT slug, title, short_label, description, image_url, download_url, item_count_label, sort_order, is_active
      FROM catalogues
      ORDER BY sort_order ASC, id ASC
      `,
    ),
    query(
      `
      SELECT slug, eyebrow, title_top, title_bottom, copy_text, image_url
      FROM hero_banners
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC
      `,
    ),
    query(
      `
      SELECT id, author_name, review_text, rating, location
      FROM homepage_reviews
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC
      `,
    ),
    query(
      `
      SELECT id, title, description, video_url, video_type, thumbnail_url
      FROM homepage_videos
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC
      `,
    ),
    query(
      `
      SELECT setting_value
      FROM homepage_settings
      WHERE setting_key = 'spotlight_product_ids'
      LIMIT 1
      `,
    ).catch(() => []),
    loadProductOptionsMap(),
    loadProductGalleryMap(),
    loadBlogPosts(),
    loadAnnouncementBar(),
  ]);

  let spotlightProductIds = [];
  const rawSpotlight = spotlightSettings?.[0]?.setting_value;
  if (typeof rawSpotlight === "string" && rawSpotlight.trim()) {
    try {
      const parsed = JSON.parse(rawSpotlight);
      if (Array.isArray(parsed)) {
        spotlightProductIds = parsed.filter((id) => typeof id === "string" && id.trim()).map((id) => id.trim());
      }
    } catch {
      spotlightProductIds = [];
    }
  }

  return {
    products: products.map((row) => ({
      id: row.slug,
      name: decodeLocalizedValue(row.name),
      price: formatCurrency(row.price),
      discount: Number(row.discount_percentage || 0).toFixed(2),
      finalPrice: row.final_price ? formatCurrency(row.final_price) : "",
      image: row.image_url,
      category: row.category,
      tag: decodeLocalizedValue(row.tag ?? ""),
      shortDescription: decodeLocalizedValue(row.short_description),
      details: decodeLocalizedValue(row.details),
      material: decodeLocalizedValue(row.material),
      dimensions: decodeLocalizedValue(row.dimensions),
      historicalBackground: decodeLocalizedValue(row.history_background ?? ""),
      galleryImages: Array.isArray(productGalleryMap?.[row.slug]) ? productGalleryMap[row.slug] : [],
      productOptions: Array.isArray(productOptionsMap?.[row.slug]) ? productOptionsMap[row.slug] : [],
    })),
    catalogueTypes: catalogues.map((row) => ({
      id: row.slug,
      title: row.title,
      shortLabel: row.short_label,
      description: row.description,
      image: row.image_url,
      downloadUrl: row.download_url ?? "",
      itemCountLabel: row.item_count_label ?? "",
      isActive: toBoolean(row.is_active),
      sortOrder: Number(row.sort_order),
    })),
    homeContent: {
      announcementBar: {
        enabled: Boolean(announcementBar?.enabled),
        text: announcementBar?.text || "",
      },
      spotlightProductIds,
      banners: banners.map((row) => ({
        id: row.slug,
        eyebrow: row.eyebrow,
        titleTop: row.title_top,
        titleBottom: row.title_bottom,
        copy: row.copy_text,
        image: row.image_url,
      })),
      reviews: reviews.map((row) => ({
        id: `review-${row.id}`,
        authorName: row.author_name,
        reviewText: row.review_text,
        rating: Number(row.rating),
        location: row.location ?? "",
      })),
      videos: videos.map((row) => ({
        id: `video-${row.id}`,
        title: row.title,
        description: row.description,
        videoType: row.video_type === "reel" ? "reel" : "youtube",
        videoUrl: row.video_url,
        thumbnail: row.thumbnail_url ?? "",
      })),
      blogPosts: blogPosts.map((post, index) => ({
        id: String(post?.id || `blog-${index + 1}`),
        title: post?.title || "",
        excerpt: post?.excerpt || "",
        content: post?.content || "",
        image: post?.image || "",
        tag: post?.tag || "",
        href: post?.href || "",
      })),
    },
  };
}

function invalidateStorefrontPayloadCache() {
  storefrontPayloadCache = null;
  storefrontPayloadCacheExpiresAt = 0;
}

async function fetchCachedStorefrontPayload({ forceFresh = false } = {}) {
  const now = Date.now();
  if (!forceFresh && storefrontPayloadCache && storefrontPayloadCacheExpiresAt > now) {
    return storefrontPayloadCache;
  }

  const payload = await fetchStorefrontPayload();
  storefrontPayloadCache = payload;
  storefrontPayloadCacheExpiresAt = now + STOREFRONT_CACHE_TTL_MS;
  return payload;
}

async function fetchCustomersPayload() {
  const [customerRows, catalogueRequestRows] = await Promise.all([
    query(
      `
      SELECT id, full_name, email, phone, address, created_at, last_login_at, updated_at
      FROM users
      WHERE role = 'customer'
      ORDER BY COALESCE(last_login_at, updated_at, created_at) DESC, id DESC
      `,
    ),
    query(
      `
      SELECT id, full_name, phone, address, note, catalogue_slug, catalogue_title, created_at
      FROM catalogue_requests
      ORDER BY created_at DESC, id DESC
      `,
    ).catch(() => []),
  ]);

  const customers = customerRows.map((row) => ({
    id: `customer-${row.id}`,
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    address: row.address ?? "",
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: new Date(row.last_login_at ?? row.updated_at ?? row.created_at).toISOString(),
    source: "website-customer",
  }));

  const catalogueLeads = catalogueRequestRows.map((row) => ({
    id: `catalogue-request-${row.id}`,
    name: row.full_name,
    email: "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: new Date(row.created_at).toISOString(),
    source: "catalogue-request",
    note: row.note ?? "",
    requestedCatalogueId: row.catalogue_slug ?? "",
    requestedCatalogueTitle: row.catalogue_title ?? "",
  }));

  return [...catalogueLeads, ...customers];
}

function mapOrderStatusFromDb(status) {
  if (status === "pending") return "Pending";
  if (status === "packed") return "Processing";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function mapOrderStatusToDb(status) {
  if (status === "Pending") return "pending";
  if (status === "Processing") return "packed";
  if (status === "Shipped") return "shipped";
  if (status === "Delivered") return "delivered";
  if (status === "Cancelled") return "cancelled";
  return "pending";
}

async function sendOrderLeadToPrivyr(order) {
  const webhookUrl = String(env.PRIVYR_WEBHOOK_URL || "").trim();
  if (!webhookUrl) return;

  const itemSummary = (Array.isArray(order.items) ? order.items : [])
    .map((item) => `${item.productName || "Product"} x${item.quantity || 1}`)
    .join(", ");

  const payload = {
    source: "Shivray Arts Website",
    campaign: "Website Order",
    name: order.customerName || "Website Customer",
    phone: order.customerPhone || "",
    email: order.customerEmail || "",
    city: "",
    country: "India",
    notes: [
      `Order ID: ${order.id || ""}`,
      `Payment: ${order.paymentMethod || ""}`,
      `Amount: ${order.totalPrice || ""}`,
      `Address: ${order.customerAddress || ""}`,
      `Items: ${itemSummary || "N/A"}`,
    ].join("\n"),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Privyr webhook failed:", response.status, body);
    }
  } catch (error) {
    console.error("Privyr webhook error:", error);
  }
}

async function sendCatalogueLeadToPrivyr(lead) {
  const webhookUrl = String(env.PRIVYR_WEBHOOK_URL || "").trim();
  if (!webhookUrl) return;

  const payload = {
    source: "Shivray Arts Website",
    campaign: "Catalogue Request",
    name: lead.name || "Catalogue Lead",
    phone: lead.phone || "",
    email: "",
    city: "",
    country: "India",
    notes: [
      `Catalogue: ${lead.catalogueTitle || "Full Catalogue"}`,
      `Address: ${lead.address || ""}`,
      `Requirement: ${lead.note || "N/A"}`,
      `Lead ID: ${lead.id || ""}`,
    ].join("\n"),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Privyr catalogue webhook failed:", response.status, body);
    }
  } catch (error) {
    console.error("Privyr catalogue webhook error:", error);
  }
}

async function fetchOrdersPayload() {
  const orderRows = await query(
    `
    SELECT
      id,
      order_no,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      total_amount,
      status,
      payment_method,
      payment_info,
      created_at
    FROM orders
    ORDER BY created_at DESC, id DESC
    `,
  );

  const orderItemRows = await query(
    `
    SELECT
      order_id,
      product_id,
      product_slug_snapshot,
      product_name_snapshot,
      product_image_snapshot,
      unit_price,
      quantity
    FROM order_items
    ORDER BY id ASC
    `,
  );

  const itemsByOrderId = new Map();
  for (const row of orderItemRows) {
    const list = itemsByOrderId.get(row.order_id) ?? [];
    list.push({
      productId: row.product_slug_snapshot || (row.product_id ? String(row.product_id) : ""),
      productName: row.product_name_snapshot,
      price: formatCurrency(row.unit_price),
      quantity: Number(row.quantity),
      image: row.product_image_snapshot ?? "",
    });
    itemsByOrderId.set(row.order_id, list);
  }

  return orderRows.map((row) => ({
    id: row.order_no,
    customerId: row.customer_id ? `customer-${row.customer_id}` : "",
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? "",
    customerAddress: row.shipping_address ?? "",
    items: itemsByOrderId.get(row.id) ?? [],
    paymentMethod: row.payment_method ?? "Online Payment",
    paymentInfo: row.payment_info ?? `${row.payment_method ?? "Online Payment"} ${mapOrderStatusFromDb(row.status)}`,
    status: mapOrderStatusFromDb(row.status),
    totalPrice: formatCurrency(row.total_amount),
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : "DB error" });
  }
});

app.get("/api/storefront", async (_req, res) => {
  try {
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
    res.setHeader("Vary", "Accept-Encoding");
    res.json(await fetchCachedStorefrontPayload());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to load storefront data." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  if (env.NODE_ENV !== "production" && canUseLocalAdminFallback(email, password)) {
    sendLocalAdminLogin(res, email);
    return;
  }

  try {
    const rows = await query(
      `
      SELECT id, full_name, email, password_hash
      FROM users
      WHERE email = ? AND role = 'admin' AND is_active = 1
      LIMIT 1
      `,
      [email],
    );

    const admin = rows[0];
    if (!admin || String(admin.password_hash).toLowerCase() !== toSha256(password)) {
      res.status(401).json({ message: "Invalid admin email or password." });
      return;
    }

    setAdminSessionCookie(res, {
      userId: admin.id,
      email: admin.email,
      role: "admin",
    });

    res.json({
      ok: true,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
      },
    });
  } catch (error) {
    if (canUseLocalAdminFallback(email, password)) {
      sendLocalAdminLogin(res, email);
      return;
    }

    console.error("Admin login failed.", error);
    res.status(500).json({ message: "Unable to reach the admin database. Check server database access." });
  }
});

app.get("/api/admin/session", (req, res) => {
  const session = getAdminSession(req);
  res.json({ authenticated: Boolean(session?.userId) });
});

app.post("/api/admin/logout", (_req, res) => {
  clearAdminSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
  try {
    res.json({ customers: await fetchCustomersPayload() });
  } catch (error) {
    console.error("Unable to load customers from database. Using memory fallback.", error);
    res.json({ customers: memoryCustomers });
  }
});

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  try {
    res.json({ orders: await fetchOrdersPayload() });
  } catch (error) {
    console.error("Unable to load orders from database. Using memory fallback.", error);
    res.json({ orders: memoryOrders });
  }
});

app.put("/api/admin/products", requireAdmin, async (req, res) => {
  const products = Array.isArray(req.body?.products) ? req.body.products : [];

  try {
    const normalizedProducts = products.map((product) => normalizeProductForDb(product));
    for (let index = 0; index < normalizedProducts.length; index += 1) {
      if (!normalizedProducts[index]) {
        res.status(400).json({
          message: `Invalid price for product "${getEnglishText(products[index]?.name) || products[index]?.id || "unknown"}". Price must be greater than 0.`,
        });
        return;
      }
    }

    await withTransaction(async (connection) => {
      const productOptionsMap = {};
      const productGalleryMap = {};
      for (let index = 0; index < normalizedProducts.length; index += 1) {
        const product = normalizedProducts[index];
        await upsertProductRow(connection, product, index + 1);
        productOptionsMap[product.slug] = product.productOptions;
        productGalleryMap[product.slug] = product.galleryImages;
      }
      await saveProductOptionsMap(connection, productOptionsMap);
      await saveProductGalleryMap(connection, productGalleryMap);
    });

    invalidateStorefrontPayloadCache();
    res.json(await fetchCachedStorefrontPayload({ forceFresh: true }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save products." });
  }
});

app.delete("/api/admin/products/:slug", requireAdmin, async (req, res) => {
  const slug = String(req.params.slug || "").trim();
  if (!slug) {
    res.status(400).json({ message: "Product slug is required." });
    return;
  }

  try {
    await query(
      `
      DELETE FROM products
      WHERE slug = ?
      `,
      [slug],
    );
    await withTransaction(async (connection) => {
      const productOptionsMap = await loadProductOptionsMap();
      const productGalleryMap = await loadProductGalleryMap();
      delete productOptionsMap[slug];
      delete productGalleryMap[slug];
      await saveProductOptionsMap(connection, productOptionsMap);
      await saveProductGalleryMap(connection, productGalleryMap);
    });
    invalidateStorefrontPayloadCache();
    res.json(await fetchCachedStorefrontPayload({ forceFresh: true }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to delete product." });
  }
});

app.put("/api/admin/products/:slug", requireAdmin, async (req, res) => {
  const slug = String(req.params.slug || "").trim();
  const product = req.body?.product;

  if (!slug || !product) {
    res.status(400).json({ message: "Product slug and payload are required." });
    return;
  }

  const normalizedProduct = normalizeProductForDb(product);
  if (!normalizedProduct) {
    res.status(400).json({
      message: `Invalid price for product "${getEnglishText(product?.name) || product?.id || slug}". Received price: "${String(product?.price ?? "")}". Price must be greater than 0.`,
    });
    return;
  }

  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        `
        SELECT sort_order
        FROM products
        WHERE slug = ?
        LIMIT 1
        `,
        [slug],
      );
      const sortOrder = Number(rows?.[0]?.sort_order) || 1;
      await upsertProductRow(connection, { ...normalizedProduct, slug }, sortOrder);
      const productOptionsMap = await loadProductOptionsMap();
      const productGalleryMap = await loadProductGalleryMap();
      productOptionsMap[slug] = normalizedProduct.productOptions;
      productGalleryMap[slug] = normalizedProduct.galleryImages;
      await saveProductOptionsMap(connection, productOptionsMap);
      await saveProductGalleryMap(connection, productGalleryMap);
    });

    invalidateStorefrontPayloadCache();
    res.json(await fetchCachedStorefrontPayload({ forceFresh: true }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save product." });
  }
});

app.put("/api/admin/catalogues", requireAdmin, async (req, res) => {
  const catalogues = Array.isArray(req.body?.catalogues) ? req.body.catalogues : [];

  try {
    await withTransaction(async (connection) => {
      await connection.query("DELETE FROM catalogues");

      for (let index = 0; index < catalogues.length; index += 1) {
        const item = catalogues[index];
        await connection.query(
          `
          INSERT INTO catalogues (
            slug, title, short_label, description, image_url, download_url, item_count_label, sort_order, is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            slugify(item.id || item.title, "catalogue"),
            item.title,
            item.shortLabel,
            item.description || "",
            item.mediaType === "video" ? item.videoUrl || item.image : item.image,
            item.downloadUrl || "",
            item.itemCountLabel || "",
            item.sortOrder ?? index + 1,
            item.isActive ? 1 : 0,
          ],
        );
      }
    });

    invalidateStorefrontPayloadCache();
    res.json(await fetchCachedStorefrontPayload({ forceFresh: true }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save catalogues." });
  }
});

app.post("/api/catalogue-requests", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const phone = normalizeUnicodeDigits(String(req.body?.phone ?? "")).replace(/[^\d]/g, "").slice(0, 10);
  const address = String(req.body?.address ?? "").trim();
  const note = String(req.body?.note ?? "").trim();
  const catalogueId = String(req.body?.catalogueId ?? "").trim();
  const catalogueTitle = String(req.body?.catalogueTitle ?? "").trim();

  if (!name || name.length < 2) {
    res.status(400).json({ message: "Customer name is required." });
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    res.status(400).json({ message: "A valid 10-digit phone number is required." });
    return;
  }

  if (!address || address.length < 10) {
    res.status(400).json({ message: "A complete address is required." });
    return;
  }

  if (!catalogueId || !catalogueTitle) {
    res.status(400).json({ message: "Catalogue selection is required." });
    return;
  }

  try {
    const createdAt = new Date().toISOString();
    const result = await query(
      `
      INSERT INTO catalogue_requests (
        full_name, phone, address, note, catalogue_slug, catalogue_title
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, phone, address, note, catalogueId, catalogueTitle],
    );

    const customer = {
      id: `catalogue-request-${result.insertId}`,
      name,
      email: "",
      phone,
      address,
      createdAt,
      lastLoginAt: createdAt,
      source: "catalogue-request",
      note,
      requestedCatalogueId: catalogueId,
      requestedCatalogueTitle: catalogueTitle,
    };

    res.json({
      ok: true,
      customer,
    });
    void sendCatalogueLeadToPrivyr({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      note: customer.note,
      catalogueTitle: customer.requestedCatalogueTitle,
    });
  } catch (error) {
    console.error("Unable to save catalogue request.", error);
    res.status(500).json({ message: "Unable to save catalogue request right now." });
  }
});

app.post("/api/blog-submissions", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const phone = normalizeUnicodeDigits(String(req.body?.phone ?? "")).replace(/[^\d]/g, "").slice(0, 10);
  const title = String(req.body?.title ?? "").trim();
  const story = String(req.body?.story ?? "").trim();
  const image = String(req.body?.image ?? "").trim();

  if (!name || name.length < 2) {
    res.status(400).json({ message: "Name is required." });
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    res.status(400).json({ message: "A valid 10-digit phone number is required." });
    return;
  }
  if (!title || title.length < 5) {
    res.status(400).json({ message: "Blog title must be at least 5 characters." });
    return;
  }
  if (!story || story.length < 20) {
    res.status(400).json({ message: "Story must be at least 20 characters." });
    return;
  }

  try {
    const [result] = await query(
      `
      INSERT INTO blog_submissions (full_name, phone, title, story, image_url, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      [name, phone, title, story, image || null],
    );

    res.json({
      ok: true,
      submission: {
        id: `blog-submission-${result.insertId}`,
        name,
        phone,
        title,
        story,
        image,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Unable to save blog submission.", error);
    res.status(500).json({ message: "Unable to submit blog right now." });
  }
});

app.get("/api/admin/blog-submissions", requireAdmin, async (_req, res) => {
  try {
    const rows = await query(
      `
      SELECT id, full_name, phone, title, story, image_url, status, published_blog_id, created_at, reviewed_at
      FROM blog_submissions
      ORDER BY
        CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
        created_at DESC,
        id DESC
      `,
    );

    res.json({
      submissions: rows.map((row) => ({
        id: `blog-submission-${row.id}`,
        name: row.full_name,
        phone: row.phone,
        title: row.title,
        story: row.story,
        image: row.image_url ?? "",
        status: row.status,
        publishedBlogId: row.published_blog_id ?? "",
        createdAt: new Date(row.created_at).toISOString(),
        reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : "",
      })),
    });
  } catch (error) {
    console.error("Unable to load blog submissions.", error);
    res.status(500).json({ message: "Unable to load blog submissions right now." });
  }
});

app.patch("/api/admin/blog-submissions/:submissionId/status", requireAdmin, async (req, res) => {
  const rawSubmissionId = String(req.params.submissionId ?? "").trim();
  const submissionId = Number(rawSubmissionId.replace(/^blog-submission-/, ""));
  const status = String(req.body?.status ?? "").trim().toLowerCase();
  const publishedBlogId = String(req.body?.publishedBlogId ?? "").trim();

  if (!Number.isFinite(submissionId) || submissionId <= 0) {
    res.status(400).json({ message: "Invalid blog submission id." });
    return;
  }
  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ message: "Invalid blog submission status." });
    return;
  }

  try {
    await query(
      `
      UPDATE blog_submissions
      SET status = ?, published_blog_id = ?, reviewed_at = CASE WHEN ? = 'pending' THEN NULL ELSE CURRENT_TIMESTAMP END
      WHERE id = ?
      `,
      [status, publishedBlogId || null, status, submissionId],
    );
    res.json({ ok: true });
  } catch (error) {
    console.error("Unable to update blog submission status.", error);
    res.status(500).json({ message: "Unable to update blog submission right now." });
  }
});

app.post("/api/contact", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const phone = normalizeUnicodeDigits(String(req.body?.phone ?? "")).replace(/[^\d]/g, "").slice(0, 10);
  const city = String(req.body?.city ?? "").trim();

  if (!name || name.length < 2) {
    res.status(400).json({ message: "Customer name is required." });
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    res.status(400).json({ message: "A valid 10-digit phone number is required." });
    return;
  }

  if (!city || city.length < 2) {
    res.status(400).json({ message: "City is required." });
    return;
  }

  const contactApiKey = String(env.CONTACT_FORM_API_KEY || "").trim();
  if (!contactApiKey) {
    res.status(500).json({ message: "Contact form API key is not configured on server." });
    return;
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: contactApiKey,
        subject: "New contact enquiry from Shivray website",
        from_name: "Shivray Contact Form",
        name,
        phone,
        city,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      const message = String(data?.message || "Unable to submit contact form right now.");
      res.status(502).json({ message });
      return;
    }

    res.json({ ok: true, message: "Contact form submitted successfully." });
  } catch (error) {
    console.error("Unable to submit contact form.", error);
    res.status(500).json({ message: "Unable to submit contact form right now." });
  }
});

app.put("/api/admin/home-content", requireAdmin, async (req, res) => {
  const content = req.body?.content ?? {};
  const announcementBar =
    content.announcementBar && typeof content.announcementBar === "object"
      ? {
          enabled: Boolean(content.announcementBar.enabled),
          text: content.announcementBar.text || "",
        }
      : { enabled: false, text: "" };
  const spotlightProductIds = Array.isArray(content.spotlightProductIds)
    ? content.spotlightProductIds.filter((id) => typeof id === "string" && id.trim()).map((id) => id.trim()).slice(0, 8)
    : [];
  const banners = Array.isArray(content.banners) ? content.banners : [];
  const reviews = Array.isArray(content.reviews) ? content.reviews : [];
  const videos = Array.isArray(content.videos) ? content.videos : [];
  const blogPosts = Array.isArray(content.blogPosts) ? content.blogPosts : [];

  try {
    await withTransaction(async (connection) => {
      await ensureHomepageSettingsTable(connection);
      await connection.query("DELETE FROM hero_banners");
      await connection.query("DELETE FROM homepage_reviews");
      await connection.query("DELETE FROM homepage_videos");
      await connection.query(
        `
        INSERT INTO homepage_settings (setting_key, setting_value)
        VALUES ('spotlight_product_ids', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `,
        [JSON.stringify(spotlightProductIds)],
      );
      await saveAnnouncementBar(connection, announcementBar);
      await saveBlogPosts(connection, blogPosts);

      for (let index = 0; index < banners.length; index += 1) {
        const item = banners[index];
        await connection.query(
          `
          INSERT INTO hero_banners (
            slug, eyebrow, title_top, title_bottom, copy_text, image_url, sort_order, is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
          `,
          [
            slugify(item.id || `${item.titleTop}-${item.titleBottom}`, "banner"),
            item.eyebrow || "",
            item.titleTop || "",
            item.titleBottom || "",
            item.copy || "",
            item.image,
            index + 1,
          ],
        );
      }

      for (let index = 0; index < reviews.length; index += 1) {
        const item = reviews[index];
        await connection.query(
          `
          INSERT INTO homepage_reviews (
            author_name, review_text, rating, location, sort_order, is_active
          )
          VALUES (?, ?, ?, ?, ?, 1)
          `,
          [
            getEnglishText(item.authorName),
            getEnglishText(item.reviewText),
            item.rating || 5,
            getEnglishText(item.location),
            index + 1,
          ],
        );
      }

      for (let index = 0; index < videos.length; index += 1) {
        const item = videos[index];
        await connection.query(
          `
          INSERT INTO homepage_videos (
            title, description, video_url, video_type, thumbnail_url, sort_order, is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, 1)
          `,
          [
            item.title || "",
            item.description || "",
            item.videoUrl || "",
            item.videoType === "reel" ? "reel" : "youtube",
            item.thumbnail || "",
            index + 1,
          ],
        );
      }
    });

    invalidateStorefrontPayloadCache();
    res.json(await fetchCachedStorefrontPayload({ forceFresh: true }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save home content." });
  }
});

app.delete("/api/admin/cleanup-legacy-seeded-content", requireAdmin, async (_req, res) => {
  try {
    await withTransaction(async (connection) => {
      if (LEGACY_SEEDED_PRODUCT_SLUGS.length > 0) {
        const placeholders = LEGACY_SEEDED_PRODUCT_SLUGS.map(() => "?").join(", ");
        await connection.query(
          `
          DELETE FROM products
          WHERE slug IN (${placeholders})
          `,
          LEGACY_SEEDED_PRODUCT_SLUGS,
        );
      }

      if (LEGACY_SEEDED_CATALOGUE_SLUGS.length > 0) {
        const placeholders = LEGACY_SEEDED_CATALOGUE_SLUGS.map(() => "?").join(", ");
        await connection.query(
          `
          DELETE FROM catalogues
          WHERE slug IN (${placeholders})
          `,
          LEGACY_SEEDED_CATALOGUE_SLUGS,
        );
      }

      const productOptionsMap = await loadProductOptionsMap();
      const productGalleryMap = await loadProductGalleryMap();

      for (const slug of LEGACY_SEEDED_PRODUCT_SLUGS) {
        delete productOptionsMap[slug];
        delete productGalleryMap[slug];
      }

      await saveProductOptionsMap(connection, productOptionsMap);
      await saveProductGalleryMap(connection, productGalleryMap);
    });

    invalidateStorefrontPayloadCache();
    res.json(await fetchCachedStorefrontPayload({ forceFresh: true }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to clean legacy content." });
  }
});

app.post("/api/customers/login", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const phone = String(req.body?.phone ?? "").trim();
  const address = String(req.body?.address ?? "").trim();

  if (!email) {
    res.status(400).json({ message: "Customer email is required." });
    return;
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.role !== "customer") {
      res.status(409).json({ message: "This email is reserved for an admin account. Use a different customer email." });
      return;
    }

    const customer = await withTransaction(async (connection) => {
      const [existingRows] = await connection.query(
        `
        SELECT id, full_name, email, phone, address, created_at, last_login_at, updated_at
        FROM users
        WHERE email = ? AND role = 'customer'
        LIMIT 1
        `,
        [email],
      );

      const existing = existingRows[0];
      const now = new Date();

      if (existing) {
        await connection.query(
          `
          UPDATE users
          SET
            full_name = ?,
            phone = ?,
            address = ?,
            last_login_at = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [name || existing.full_name || email.split("@")[0], phone || existing.phone || "", address || existing.address || "", now, existing.id],
        );

        return {
          id: existing.id,
          name: name || existing.full_name || email.split("@")[0],
          email: existing.email,
          phone: phone || existing.phone || "",
          address: address || existing.address || "",
          createdAt: new Date(existing.created_at).toISOString(),
          lastLoginAt: now.toISOString(),
        };
      }

      const [result] = await connection.query(
        `
        INSERT INTO users (
          full_name, email, password_hash, role, is_active, phone, address, last_login_at
        )
        VALUES (?, ?, ?, 'customer', 1, ?, ?, ?)
        `,
        [name || email.split("@")[0] || "Customer", email, toSha256(`${email}:customer`), phone, address, now],
      );

      return {
        id: result.insertId,
        name: name || email.split("@")[0] || "Customer",
        email,
        phone,
        address,
        createdAt: now.toISOString(),
        lastLoginAt: now.toISOString(),
      };
    });

    res.json({
      customer: {
        id: `customer-${customer.id}`,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        createdAt: customer.createdAt,
        lastLoginAt: customer.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Unable to save customer to database. Using memory fallback.", error);
    res.json({ customer: upsertMemoryCustomer({ name, email, phone, address }) });
  }
});

app.put("/api/customers/:customerId", async (req, res) => {
  const customerId = parseCustomerId(req.params.customerId);
  const rawCustomerId = String(req.params.customerId ?? "");
  if (!customerId && !rawCustomerId.startsWith("customer-local-")) {
    res.status(400).json({ message: "Invalid customer id." });
    return;
  }

  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const phone = String(req.body?.phone ?? "").trim();
  const address = String(req.body?.address ?? "").trim();
  const lastLoginAt = req.body?.lastLoginAt ? new Date(req.body.lastLoginAt) : new Date();

  try {
    if (email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.role !== "customer" && existingUser.id !== customerId) {
        res.status(409).json({ message: "This email is reserved for an admin account. Use a different customer email." });
        return;
      }
    }

    if (!customerId && rawCustomerId.startsWith("customer-local-")) {
      updateMemoryCustomer(rawCustomerId, {
        name,
        email,
        phone,
        address,
        lastLoginAt: lastLoginAt.toISOString(),
      });
      res.json({ ok: true });
      return;
    }

    await query(
      `
      UPDATE users
      SET
        full_name = ?,
        email = ?,
        phone = ?,
        address = ?,
        last_login_at = ?
      WHERE id = ? AND role = 'customer'
      `,
      [name, email, phone, address, lastLoginAt, customerId],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Unable to update customer in database. Using memory fallback.", error);
    updateMemoryCustomer(rawCustomerId, {
      name,
      email,
      phone,
      address,
      lastLoginAt: lastLoginAt.toISOString(),
    });
    res.json({ ok: true });
  }
});

app.post("/api/orders", async (req, res) => {
  const payload = req.body ?? {};
  const customer = payload.customer ?? {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paymentMethod = "Online Payment";
  const paymentInfo = String(payload.paymentInfo ?? `${paymentMethod} Pending`).trim() || `${paymentMethod} Pending`;

  if (!customer.email || !customer.name || !customer.phone || !customer.address || items.length === 0) {
    res.status(400).json({ message: "Customer details and at least one order item are required." });
    return;
  }

  try {
    const customerEmail = String(customer.email).toLowerCase();
    const existingUser = await findUserByEmail(customerEmail);
    if (!parseCustomerId(customer.id) && existingUser && existingUser.role !== "customer") {
      res.status(409).json({ message: "This email is reserved for an admin account. Use a different customer email for orders." });
      return;
    }

    const order = await withTransaction(async (connection) => {
      let customerId = parseCustomerId(customer.id);

      if (!customerId) {
        const [customerResult] = await connection.query(
          `
          INSERT INTO users (
            full_name, email, password_hash, role, is_active, phone, address, last_login_at
          )
          VALUES (?, ?, ?, 'customer', 1, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            full_name = VALUES(full_name),
            phone = VALUES(phone),
            address = VALUES(address),
            last_login_at = VALUES(last_login_at),
            id = LAST_INSERT_ID(id)
          `,
          [
            customer.name,
            customerEmail,
            toSha256(`${customerEmail}:customer`),
            customer.phone,
            customer.address,
            new Date(),
          ],
        );

        customerId = customerResult.insertId;
      } else {
        await connection.query(
          `
          UPDATE users
          SET full_name = ?, email = ?, phone = ?, address = ?, last_login_at = ?
          WHERE id = ? AND role = 'customer'
          `,
          [customer.name, customerEmail, customer.phone, customer.address, new Date(), customerId],
        );
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + parseCurrencyAmount(item.price) * (Number(item.quantity) || 0),
        0,
      );

      const orderNumber = buildOrderNumber();
      const orderStatus = "pending";
      const [orderResult] = await connection.query(
        `
        INSERT INTO orders (
          order_no, customer_id, customer_name, customer_email, customer_phone, total_amount, status, shipping_address, payment_method, payment_info
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            orderNumber,
            customerId,
            customer.name,
            customerEmail,
            customer.phone,
            totalAmount,
            orderStatus,
          customer.address,
          paymentMethod,
          paymentInfo,
        ],
      );

      for (const item of items) {
        const productSlug = String(item.productId || "");
        const [productRows] = await connection.query(
          "SELECT id FROM products WHERE slug = ? LIMIT 1",
          [productSlug],
        );
        const productId = productRows[0]?.id ?? null;

        await connection.query(
          `
          INSERT INTO order_items (
            order_id, product_id, product_slug_snapshot, product_name_snapshot, product_image_snapshot, unit_price, quantity
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderResult.insertId,
            productId,
            productSlug,
            item.productName,
            item.image || "",
            parseCurrencyAmount(item.price),
            Number(item.quantity) || 1,
          ],
        );
      }

      return {
        id: orderNumber,
        customerId: `customer-${customerId}`,
        customerName: customer.name,
        customerEmail: customerEmail,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        items: items.map((item) => ({
          productId: String(item.productId || ""),
          productName: item.productName,
          price: formatCurrency(parseCurrencyAmount(item.price)),
          quantity: Number(item.quantity) || 1,
          image: item.image || "",
        })),
        paymentMethod,
        paymentInfo,
        status: "Pending",
        totalPrice: formatCurrency(totalAmount),
        createdAt: new Date().toISOString(),
      };
    });

    void sendOrderLeadToPrivyr(order);
    res.json({ order });
  } catch (error) {
    console.error("Unable to place order in database. Using memory fallback.", error);
    const fallbackOrder = createMemoryOrder(payload, paymentMethod);
    void sendOrderLeadToPrivyr(fallbackOrder);
    res.json({ order: fallbackOrder });
  }
});

app.patch("/api/admin/orders/:orderId/status", requireAdmin, async (req, res) => {
  const status = String(req.body?.status ?? "");
  const orderNumber = String(req.params.orderId ?? "").trim();
  const dbStatus = mapOrderStatusToDb(status);
  const paymentMethod = "Online Payment";
  const paymentInfo =
    status === "Cancelled"
      ? `${paymentMethod} Cancelled`
      : `${paymentMethod} ${status || "Pending"}`;

  if (!orderNumber) {
    res.status(400).json({ message: "Invalid order id." });
    return;
  }

  try {
    await query(
      `
      UPDATE orders
      SET status = ?, payment_info = ?
      WHERE order_no = ?
      `,
      [dbStatus, paymentInfo, orderNumber],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Unable to update order status in database. Using memory fallback.", error);
    const order = memoryOrders.find((item) => item.id === orderNumber);
    if (order) {
      order.status = status || "Pending";
      order.paymentInfo = paymentInfo;
    }
    res.json({ ok: true });
  }
});

app.post("/api/payments/razorpay/order", async (req, res) => {
  const amount = Number(req.body?.amount ?? 0);
  const receipt = String(req.body?.receipt ?? "").trim() || `receipt_${Date.now()}`;

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ message: "A valid amount is required to create a Razorpay order." });
    return;
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: getRazorpayBasicAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: "INR",
        receipt,
        payment_capture: 1,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = String(data?.error?.description || data?.message || "Unable to create Razorpay order.");
      res.status(502).json({ message });
      return;
    }

    res.json({
      orderId: data.id,
      amount: Number(data.amount || amount),
      currency: data.currency || "INR",
      keyId: String(env.RAZORPAY_KEY_ID || "").trim(),
    });
  } catch (error) {
    console.error("Unable to create Razorpay order.", error);
    res.status(500).json({ message: "Unable to create Razorpay order right now." });
  }
});

app.post("/api/payments/razorpay/verify", async (req, res) => {
  const orderId = String(req.body?.orderId ?? "").trim();
  const paymentId = String(req.body?.paymentId ?? "").trim();
  const signature = String(req.body?.signature ?? "").trim();

  if (!orderId || !paymentId || !signature) {
    res.status(400).json({ message: "Razorpay verification details are required." });
    return;
  }

  try {
    const verified = verifyRazorpayPaymentSignature(orderId, paymentId, signature);
    if (!verified) {
      res.status(400).json({ message: "Razorpay payment verification failed." });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Unable to verify Razorpay payment.", error);
    res.status(error?.statusCode || 500).json({
      message: error instanceof Error ? error.message : "Unable to verify Razorpay payment right now.",
    });
  }
});

if (hasBuiltClient) {
  app.use(express.static(distDir));
  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }

    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error instanceof Error ? error.message : "Unexpected server error." });
});

async function startServer() {
  await ensureServerBootstrap();
  app.listen(env.PORT, () => {
    console.log(`Shivray backend listening on http://localhost:${env.PORT}`);
  });
}

if (!isVercelRuntime) {
  startServer().catch((error) => {
    console.error("Unable to start Shivray backend.", error);
    process.exit(1);
  });
}

export default app;
