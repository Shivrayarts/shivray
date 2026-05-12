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

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseCurrencyAmount(value) {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function toBoolean(value) {
  return Boolean(Number(value));
}

function toSha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
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

function buildOrderNumber() {
  return `#order-${Date.now().toString().slice(-6)}`;
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
  const [products, catalogues, banners, reviews, videos] = await Promise.all([
    query(
      `
      SELECT slug, name, price, image_url, category, tag, short_description, details, material, dimensions
      FROM products
      WHERE is_published = 1
      ORDER BY sort_order ASC, id DESC
      `,
    ),
    query(
      `
      SELECT slug, title, short_label, description, image_url, item_count_label, sort_order, is_active
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
  ]);

  return {
    products: products.map((row) => ({
      id: row.slug,
      name: row.name,
      price: formatCurrency(row.price),
      image: row.image_url,
      category: row.category,
      tag: row.tag ?? "",
      shortDescription: row.short_description,
      details: row.details,
      material: row.material,
      dimensions: row.dimensions,
    })),
    catalogueTypes: catalogues.map((row) => ({
      id: row.slug,
      title: row.title,
      shortLabel: row.short_label,
      description: row.description,
      image: row.image_url,
      itemCountLabel: row.item_count_label ?? "",
      isActive: toBoolean(row.is_active),
      sortOrder: Number(row.sort_order),
    })),
    homeContent: {
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
    },
  };
}

async function fetchCustomersPayload() {
  const rows = await query(
    `
    SELECT id, full_name, email, phone, address, created_at, last_login_at, updated_at
    FROM users
    WHERE role = 'customer'
    ORDER BY COALESCE(last_login_at, updated_at, created_at) DESC, id DESC
    `,
  );

  return rows.map((row) => ({
    id: `customer-${row.id}`,
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    address: row.address ?? "",
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: new Date(row.last_login_at ?? row.updated_at ?? row.created_at).toISOString(),
  }));
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
      productId: row.product_id ? String(row.product_id) : "",
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
    paymentMethod: row.payment_method ?? "Cash On Delivery",
    paymentInfo: row.payment_info ?? `${row.payment_method ?? "Cash On Delivery"} ${mapOrderStatusFromDb(row.status)}`,
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
    res.json(await fetchStorefrontPayload());
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
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to log in." });
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
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to load customers." });
  }
});

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  try {
    res.json({ orders: await fetchOrdersPayload() });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to load orders." });
  }
});

app.put("/api/admin/products", requireAdmin, async (req, res) => {
  const products = Array.isArray(req.body?.products) ? req.body.products : [];

  try {
    await withTransaction(async (connection) => {
      const keepSlugs = [];

      for (let index = 0; index < products.length; index += 1) {
        const product = products[index];
        const slug = slugify(product.id || product.name, "product");
        keepSlugs.push(slug);

        await connection.query(
          `
          INSERT INTO products (
            slug, name, price, image_url, category, tag, short_description, details, material, dimensions, stock_quantity, is_published, sort_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price = VALUES(price),
            image_url = VALUES(image_url),
            category = VALUES(category),
            tag = VALUES(tag),
            short_description = VALUES(short_description),
            details = VALUES(details),
            material = VALUES(material),
            dimensions = VALUES(dimensions),
            is_published = VALUES(is_published),
            sort_order = VALUES(sort_order)
          `,
          [
            slug,
            product.name,
            parseCurrencyAmount(product.price),
            product.image,
            product.category,
            product.tag || "",
            product.shortDescription || "",
            product.details || "",
            product.material || "",
            product.dimensions || "",
            index + 1,
          ],
        );
      }

      if (keepSlugs.length > 0) {
        const placeholders = keepSlugs.map(() => "?").join(", ");
        await connection.query(`DELETE FROM products WHERE slug NOT IN (${placeholders})`, keepSlugs);
      } else {
        await connection.query("DELETE FROM products");
      }
    });

    res.json(await fetchStorefrontPayload());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save products." });
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
            slug, title, short_label, description, image_url, item_count_label, sort_order, is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            slugify(item.id || item.title, "catalogue"),
            item.title,
            item.shortLabel,
            item.description || "",
            item.mediaType === "video" ? item.videoUrl || item.image : item.image,
            item.itemCountLabel || "",
            item.sortOrder ?? index + 1,
            item.isActive ? 1 : 0,
          ],
        );
      }
    });

    res.json(await fetchStorefrontPayload());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save catalogues." });
  }
});

app.put("/api/admin/home-content", requireAdmin, async (req, res) => {
  const content = req.body?.content ?? {};
  const banners = Array.isArray(content.banners) ? content.banners : [];
  const reviews = Array.isArray(content.reviews) ? content.reviews : [];
  const videos = Array.isArray(content.videos) ? content.videos : [];

  try {
    await withTransaction(async (connection) => {
      await connection.query("DELETE FROM hero_banners");
      await connection.query("DELETE FROM homepage_reviews");
      await connection.query("DELETE FROM homepage_videos");

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
          [item.authorName || "", item.reviewText || "", item.rating || 5, item.location || "", index + 1],
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

    res.json(await fetchStorefrontPayload());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save home content." });
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
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to save customer." });
  }
});

app.put("/api/customers/:customerId", async (req, res) => {
  const customerId = parseCustomerId(req.params.customerId);
  if (!customerId) {
    res.status(400).json({ message: "Invalid customer id." });
    return;
  }

  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const phone = String(req.body?.phone ?? "").trim();
  const address = String(req.body?.address ?? "").trim();
  const lastLoginAt = req.body?.lastLoginAt ? new Date(req.body.lastLoginAt) : new Date();

  try {
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
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to update customer." });
  }
});

app.post("/api/orders", async (req, res) => {
  const payload = req.body ?? {};
  const customer = payload.customer ?? {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paymentMethod = payload.paymentMethod === "Online Payment" ? "Online Payment" : "Cash On Delivery";

  if (!customer.email || !customer.name || !customer.phone || !customer.address || items.length === 0) {
    res.status(400).json({ message: "Customer details and at least one order item are required." });
    return;
  }

  try {
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
            String(customer.email).toLowerCase(),
            toSha256(`${String(customer.email).toLowerCase()}:customer`),
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
          [customer.name, String(customer.email).toLowerCase(), customer.phone, customer.address, new Date(), customerId],
        );
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + parseCurrencyAmount(item.price) * (Number(item.quantity) || 0),
        0,
      );

      const orderNumber = buildOrderNumber();
      const orderStatus = "pending";
      const paymentInfo = `${paymentMethod} Pending`;

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
          String(customer.email).toLowerCase(),
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
            order_id, product_id, product_name_snapshot, product_image_snapshot, unit_price, quantity
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            orderResult.insertId,
            productId,
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
        customerEmail: String(customer.email).toLowerCase(),
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

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to place order." });
  }
});

app.patch("/api/admin/orders/:orderId/status", requireAdmin, async (req, res) => {
  const status = String(req.body?.status ?? "");
  const orderNumber = String(req.params.orderId ?? "").trim();
  const dbStatus = mapOrderStatusToDb(status);
  const paymentMethod = req.body?.paymentMethod === "Online Payment" ? "Online Payment" : "Cash On Delivery";
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
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to update order status." });
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

app.listen(env.PORT, () => {
  console.log(`Shivray backend listening on http://localhost:${env.PORT}`);
});
