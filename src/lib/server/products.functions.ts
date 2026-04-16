import { createServerFn } from "@tanstack/react-start";
import {
  allProducts,
  productCategories,
  type Product,
} from "@/data/products";
import { getMysqlPool } from "@/lib/server/mysql";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productStatue2 from "@/assets/product-statue-2.jpg";
import productStatue3 from "@/assets/product-statue-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import productWeapon2 from "@/assets/product-weapon-2.jpg";
import productWeapon3 from "@/assets/product-weapon-3.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productShield1 from "@/assets/product-shield-1.jpg";
import productTalwar1 from "@/assets/product-talwar-1.jpg";

type DbProductRow = {
  slug: string;
  name: string;
  price: number | string;
  image_url: string;
  category: string;
  tag: string | null;
  short_description: string;
  details: string;
  material: string;
  dimensions: string;
};

type CreateProductInput = {
  name: string;
  price: string;
  image: string;
  category: Product["category"];
  tag: string;
  shortDescription: string;
  details: string;
  material: string;
  dimensions: string;
};

const legacyAssetPathMap: Record<string, string> = {
  "product-statue-1.jpg": productStatue1,
  "product-statue-2.jpg": productStatue2,
  "product-statue-3.jpg": productStatue3,
  "product-weapon-1.jpg": productWeapon1,
  "product-weapon-2.jpg": productWeapon2,
  "product-weapon-3.jpg": productWeapon3,
  "product-dhoop-1.jpg": productDhoop1,
  "product-shield-1.jpg": productShield1,
  "product-talwar-1.jpg": productTalwar1,
};

function formatInrPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function parsePrice(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function slugify(name: string) {
  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now()}`;
}

function normalizeCategory(value: string): Product["category"] {
  return (
    productCategories.find((category) => category === value) ?? "Statues"
  );
}

function resolveImageUrl(row: DbProductRow) {
  const raw = row.image_url.trim();
  if (!raw) return allProducts.find((item) => item.id === row.slug)?.image ?? "";

  // Keep absolute URLs (or protocol-relative URLs) unchanged.
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  // Normalize old DB values like /assets/product-*.jpg or src/assets/product-*.jpg.
  const normalized = raw.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop()?.toLowerCase() ?? "";
  const mapped = legacyAssetPathMap[fileName];
  if (mapped) return mapped;

  // Last fallback for known static products by slug.
  return allProducts.find((item) => item.id === row.slug)?.image ?? raw;
}

function mapDbRowToProduct(row: DbProductRow): Product {
  return {
    id: row.slug,
    name: row.name,
    price:
      typeof row.price === "number"
        ? formatInrPrice(row.price)
        : formatInrPrice(Number(row.price)),
    image: resolveImageUrl(row),
    category: normalizeCategory(row.category),
    tag: row.tag ?? "",
    shortDescription: row.short_description,
    details: row.details,
    material: row.material,
    dimensions: row.dimensions,
  };
}

export const getProductsFromDbServer = createServerFn({ method: "GET" })
  .handler(async (): Promise<Product[]> => {
    try {
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbProductRow[]>(
        `SELECT
          slug,
          name,
          price,
          image_url,
          category,
          tag,
          short_description,
          details,
          material,
          dimensions
         FROM products
         WHERE is_published = 1
         ORDER BY created_at DESC`,
      );

      if (!rows.length) {
        return allProducts;
      }

      const dbProducts = rows.map(mapDbRowToProduct);
      const dbIds = new Set(dbProducts.map((item) => item.id));
      const oldProductsMissingFromDb = allProducts.filter(
        (item) => !dbIds.has(item.id),
      );

      // Keep DB order first (newest first), then append older static catalog entries.
      return [...dbProducts, ...oldProductsMissingFromDb];
    } catch (error) {
      console.error("getProductsFromDbServer error:", error);
      return allProducts;
    }
  });

export const getProductByIdFromDbServer = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<Product | null> => {
    try {
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbProductRow[]>(
        `SELECT
          slug,
          name,
          price,
          image_url,
          category,
          tag,
          short_description,
          details,
          material,
          dimensions
         FROM products
         WHERE slug = ?
         LIMIT 1`,
        [data.id],
      );

      if (!rows.length) {
        return allProducts.find((item) => item.id === data.id) ?? null;
      }

      return mapDbRowToProduct(rows[0]);
    } catch (error) {
      console.error("getProductByIdFromDbServer error:", error);
      return allProducts.find((item) => item.id === data.id) ?? null;
    }
  });

export const createProductInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: CreateProductInput) => data)
  .handler(async ({ data }) => {
    try {
      const pool = getMysqlPool();
      const slug = slugify(data.name);
      const numericPrice = parsePrice(data.price);

      await pool.query(
        `INSERT INTO products (
          slug,
          name,
          price,
          image_url,
          category,
          tag,
          short_description,
          details,
          material,
          dimensions,
          is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          slug,
          data.name.trim(),
          numericPrice,
          data.image.trim(),
          data.category,
          data.tag.trim() || null,
          data.shortDescription.trim(),
          data.details.trim(),
          data.material.trim(),
          data.dimensions.trim(),
        ],
      );

      return { success: true, message: "Product created in MySQL successfully." };
    } catch (error) {
      console.error("createProductInDbServer error:", error);
      return {
        success: false,
        message: "Could not create product in MySQL. Check DB connection/env.",
      };
    }
  });

