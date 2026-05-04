import { createServerFn } from "@tanstack/react-start";
import {
  allProducts,
  productCategories,
  type Product,
} from "@/data/products";
import { getMysqlPool } from "@/lib/server/mysql";
import type { ResultSetHeader } from "mysql2/promise";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productStatue2 from "@/assets/product-statue-2.jpg";
import productStatue3 from "@/assets/product-statue-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import productWeapon2 from "@/assets/product-weapon-2.jpg";
import productWeapon3 from "@/assets/product-weapon-3.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productShield1 from "@/assets/product-shield-1.jpg";
import productTalwar1 from "@/assets/product-talwar-1.jpg";
import { normalizeDisplayCase } from "@/lib/utils";

type DbProductRow = {
  id: number;
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
  stock_quantity?: number | string | null;
  is_published: number;
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
  stockQuantity?: number;
};

type UpdateProductInput = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: Product["category"];
  tag: string;
  shortDescription: string;
  details: string;
  material: string;
  dimensions: string;
  stockQuantity: number;
  isPublished: boolean;
};

type DeleteProductInput = {
  id: string;
};

export type AdminProduct = Product & {
  stockQuantity: number;
  isPublished: boolean;
  fromDb: boolean;
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

let adminSchemaReady = false;

function formatInrPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function parsePrice(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseStockQuantity(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

function slugify(name: string) {
  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now()}`;
}

function normalizeCategory(value: string): Product["category"] {
  const normalized = value.trim().toLowerCase();
  return (
    productCategories.find((category) => category.toLowerCase() === normalized) ?? "Statues"
  );
}

function resolveImageUrl(row: Pick<DbProductRow, "image_url" | "slug">) {
  const raw = row.image_url.trim();
  if (!raw) return allProducts.find((item) => item.id === row.slug)?.image ?? "";

  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  const normalized = raw.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop()?.toLowerCase() ?? "";
  const mapped = legacyAssetPathMap[fileName];
  if (mapped) return mapped;

  return allProducts.find((item) => item.id === row.slug)?.image ?? raw;
}

function mapDbRowToProduct(row: DbProductRow): Product {
  return {
    id: row.slug,
    name: normalizeDisplayCase(row.name, "sentence"),
    price:
      typeof row.price === "number"
        ? formatInrPrice(row.price)
        : formatInrPrice(Number(row.price)),
    image: resolveImageUrl(row),
    category: normalizeCategory(row.category),
    tag: normalizeDisplayCase(row.tag ?? "", "title"),
    shortDescription: normalizeDisplayCase(row.short_description),
    details: normalizeDisplayCase(row.details),
    material: normalizeDisplayCase(row.material),
    dimensions: normalizeDisplayCase(row.dimensions),
  };
}

function mapDbRowToAdminProduct(row: DbProductRow): AdminProduct {
  return {
    ...mapDbRowToProduct(row),
    stockQuantity: parseStockQuantity(row.stock_quantity),
    isPublished: row.is_published === 1,
    fromDb: true,
  };
}

async function ensureAdminProductSchema() {
  if (adminSchemaReady) return;

  const pool = getMysqlPool();
  const [stockCol] = await pool.query<Array<{ Field: string }>>(
    "SHOW COLUMNS FROM products LIKE 'stock_quantity'",
  );

  if (!stockCol.length) {
    await pool.query(
      "ALTER TABLE products ADD COLUMN stock_quantity INT UNSIGNED NOT NULL DEFAULT 0 AFTER dimensions",
    );
  }

  const [imageCol] = await pool.query<Array<{ Type: string }>>(
    "SHOW COLUMNS FROM products LIKE 'image_url'",
  );

  const imageType = imageCol[0]?.Type?.toLowerCase() ?? "";
  if (imageType.startsWith("varchar")) {
    await pool.query(
      "ALTER TABLE products MODIFY image_url MEDIUMTEXT NOT NULL",
    );
  }

  adminSchemaReady = true;
}

export const getProductsFromDbServer = createServerFn({ method: "GET" })
  .handler(async (): Promise<Product[]> => {
    try {
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbProductRow[]>(
        `SELECT
          id,
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

      return [...dbProducts, ...oldProductsMissingFromDb];
    } catch (error) {
      console.error("getProductsFromDbServer error:", error);
      return allProducts;
    }
  });

export const getAdminProductsFromDbServer = createServerFn({ method: "GET" })
  .handler(async (): Promise<AdminProduct[]> => {
    try {
      await ensureAdminProductSchema();
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbProductRow[]>(
        `SELECT
          id,
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
          stock_quantity,
          is_published
         FROM products
         ORDER BY updated_at DESC`,
      );

      const dbProducts = rows.map(mapDbRowToAdminProduct);
      const dbIds = new Set(dbProducts.map((item) => item.id));
      const staticProductsMissingFromDb: AdminProduct[] = allProducts
        .filter((item) => !dbIds.has(item.id))
        .map((item) => ({
          ...item,
          stockQuantity: 0,
          isPublished: true,
          fromDb: false,
        }));

      return [...dbProducts, ...staticProductsMissingFromDb];
    } catch (error) {
      console.error("getAdminProductsFromDbServer error:", error);
      return allProducts.map((item) => ({
        ...item,
        stockQuantity: 0,
        isPublished: true,
        fromDb: false,
      }));
    }
  });

export const getProductByIdFromDbServer = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<Product | null> => {
    try {
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbProductRow[]>(
        `SELECT
          id,
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
      await ensureAdminProductSchema();
      const pool = getMysqlPool();
      const slug = slugify(data.name);
      const numericPrice = parsePrice(data.price);
      const stockQuantity = parseStockQuantity(data.stockQuantity ?? 0);

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
          stock_quantity,
          is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
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
          stockQuantity,
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

export const updateProductInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateProductInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureAdminProductSchema();
      const pool = getMysqlPool();
      const numericPrice = parsePrice(data.price);
      const stockQuantity = parseStockQuantity(data.stockQuantity);

      const [updateResult] = await pool.query<ResultSetHeader>(
        `UPDATE products
         SET
           name = ?,
           price = ?,
           image_url = ?,
           category = ?,
           tag = ?,
           short_description = ?,
           details = ?,
           material = ?,
           dimensions = ?,
           stock_quantity = ?,
           is_published = ?
         WHERE slug = ?`,
        [
          data.name.trim(),
          numericPrice,
          data.image.trim(),
          data.category,
          data.tag.trim() || null,
          data.shortDescription.trim(),
          data.details.trim(),
          data.material.trim(),
          data.dimensions.trim(),
          stockQuantity,
          data.isPublished ? 1 : 0,
          data.id,
        ],
      );

      if (updateResult.affectedRows === 0) {
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
            stock_quantity,
            is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.name.trim(),
            numericPrice,
            data.image.trim(),
            data.category,
            data.tag.trim() || null,
            data.shortDescription.trim(),
            data.details.trim(),
            data.material.trim(),
            data.dimensions.trim(),
            stockQuantity,
            data.isPublished ? 1 : 0,
          ],
        );
      }

      return {
        success: true,
        message: "Product updated successfully.",
      };
    } catch (error) {
      console.error("updateProductInDbServer error:", error);
      return {
        success: false,
        message: "Could not update product right now.",
      };
    }
  });

export const deleteProductFromDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteProductInput) => data)
  .handler(async ({ data }) => {
    try {
      const pool = getMysqlPool();
      const [deleteResult] = await pool.query<ResultSetHeader>(
        "DELETE FROM products WHERE slug = ?",
        [data.id],
      );

      if (deleteResult.affectedRows === 0) {
        return {
          success: false,
          message: "This product could not be deleted from the database.",
        };
      }

      return {
        success: true,
        message: "Product deleted successfully.",
      };
    } catch (error) {
      console.error("deleteProductFromDbServer error:", error);
      return {
        success: false,
        message: "Could not delete product right now.",
      };
    }
  });
