import { createServerFn } from "@tanstack/react-start";
import type { ResultSetHeader } from "mysql2/promise";
import { defaultCatalogueTypes, type CatalogueType } from "@/lib/catalogue-types";
import { getMysqlPool } from "@/lib/server/mysql";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productsPoster from "@/assets/products-poster.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";

type DbCatalogueRow = {
  slug: string;
  title: string;
  short_label: string;
  description: string;
  image_url: string;
  item_count_label: string | null;
  is_active: number;
  sort_order: number;
};

type CreateCatalogueInput = {
  title: string;
  shortLabel: string;
  description: string;
  image: string;
  itemCountLabel: string;
};

type UpdateCatalogueInput = CreateCatalogueInput & {
  id: string;
  isActive: boolean;
  sortOrder: number;
};

type DeleteCatalogueInput = {
  id: string;
};

export type AdminCatalogueType = CatalogueType & {
  fromDb: boolean;
};

const legacyAssetPathMap: Record<string, string> = {
  "product-statue-1.jpg": productStatue1,
  "product-weapon-1.jpg": productWeapon1,
  "hero-banner-3.jpg": heroBanner3,
  "product-dhoop-1.jpg": productDhoop1,
  "products-poster.jpg": productsPoster,
};

let catalogueSchemaReady = false;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveCatalogueImageUrl(rawValue: string, slug: string) {
  const raw = rawValue.trim();
  if (!raw) {
    return defaultCatalogueTypes.find((item) => item.id === slug)?.image ?? "";
  }

  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  const normalized = raw.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop()?.toLowerCase() ?? "";
  const mapped = legacyAssetPathMap[fileName];
  if (mapped) return mapped;

  return defaultCatalogueTypes.find((item) => item.id === slug)?.image ?? raw;
}

function mapDbRowToCatalogue(row: DbCatalogueRow): CatalogueType {
  return {
    id: row.slug,
    title: row.title,
    shortLabel: row.short_label,
    description: row.description,
    image: resolveCatalogueImageUrl(row.image_url, row.slug),
    itemCountLabel: row.item_count_label?.trim() || "Collection",
    isActive: row.is_active === 1,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

async function ensureCatalogueSchema() {
  if (catalogueSchemaReady) return;

  const pool = getMysqlPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS catalogues (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      slug VARCHAR(191) NOT NULL,
      title VARCHAR(191) NOT NULL,
      short_label VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      image_url MEDIUMTEXT NOT NULL,
      item_count_label VARCHAR(60) DEFAULT NULL,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_catalogues_slug (slug),
      KEY idx_catalogues_active (is_active),
      KEY idx_catalogues_sort (sort_order)
    ) ENGINE=InnoDB
  `);

  catalogueSchemaReady = true;
}

async function seedDefaultCataloguesIfEmpty() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<Array<{ total: number | string }>>(
    "SELECT COUNT(*) AS total FROM catalogues",
  );

  if (Number(rows[0]?.total ?? 0) > 0) {
    return;
  }

  for (const item of defaultCatalogueTypes) {
    await pool.query(
      `INSERT INTO catalogues (
        slug,
        title,
        short_label,
        description,
        image_url,
        item_count_label,
        sort_order,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        item.id,
        item.title,
        item.shortLabel,
        item.description,
        item.image,
        item.itemCountLabel,
        item.sortOrder,
      ],
    );
  }
}

export const getCatalogueTypesFromDbServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogueType[]> => {
    try {
      await ensureCatalogueSchema();
      await seedDefaultCataloguesIfEmpty();
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbCatalogueRow[]>(
        `SELECT slug, title, short_label, description, image_url, item_count_label, is_active, sort_order
         FROM catalogues
         WHERE is_active = 1
         ORDER BY sort_order ASC, title ASC`,
      );

      if (!rows.length) {
        return defaultCatalogueTypes;
      }

      return rows.map(mapDbRowToCatalogue);
    } catch (error) {
      console.error("getCatalogueTypesFromDbServer error:", error);
      return defaultCatalogueTypes;
    }
  },
);

export const getAdminCatalogueTypesFromDbServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCatalogueType[]> => {
    try {
      await ensureCatalogueSchema();
      await seedDefaultCataloguesIfEmpty();
      const pool = getMysqlPool();
      const [rows] = await pool.query<DbCatalogueRow[]>(
        `SELECT slug, title, short_label, description, image_url, item_count_label, is_active, sort_order
         FROM catalogues
         ORDER BY sort_order ASC, title ASC`,
      );

      if (!rows.length) {
        return defaultCatalogueTypes.map((item) => ({
          ...item,
          fromDb: false,
        }));
      }

      return rows.map((row) => ({
        ...mapDbRowToCatalogue(row),
        fromDb: true,
      }));
    } catch (error) {
      console.error("getAdminCatalogueTypesFromDbServer error:", error);
      return defaultCatalogueTypes.map((item) => ({
        ...item,
        fromDb: false,
      }));
    }
  },
);

export const createCatalogueInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: CreateCatalogueInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureCatalogueSchema();
      await seedDefaultCataloguesIfEmpty();
      const pool = getMysqlPool();
      const slug = `${slugify(data.title)}-catalogue`;

      await pool.query(
        `INSERT INTO catalogues (
          slug,
          title,
          short_label,
          description,
          image_url,
          item_count_label,
          sort_order,
          is_active
        )
        VALUES (
          ?, ?, ?, ?, ?, ?,
          COALESCE((SELECT MAX(sort_order) + 1 FROM (SELECT sort_order FROM catalogues) AS catalogue_orders), 1),
          1
        )`,
        [
          slug,
          data.title.trim(),
          data.shortLabel.trim(),
          data.description.trim(),
          data.image.trim(),
          data.itemCountLabel.trim() || null,
        ],
      );

      return { success: true, message: "Catalogue created successfully." };
    } catch (error) {
      console.error("createCatalogueInDbServer error:", error);
      return {
        success: false,
        message: "Could not create catalogue right now.",
      };
    }
  });

export const updateCatalogueInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateCatalogueInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureCatalogueSchema();
      await seedDefaultCataloguesIfEmpty();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE catalogues
         SET
           title = ?,
           short_label = ?,
           description = ?,
           image_url = ?,
           item_count_label = ?,
           sort_order = ?,
           is_active = ?
         WHERE slug = ?`,
        [
          data.title.trim(),
          data.shortLabel.trim(),
          data.description.trim(),
          data.image.trim(),
          data.itemCountLabel.trim() || null,
          Math.max(1, Math.floor(data.sortOrder || 1)),
          data.isActive ? 1 : 0,
          data.id,
        ],
      );

      if (result.affectedRows === 0) {
        await pool.query(
          `INSERT INTO catalogues (
            slug,
            title,
            short_label,
            description,
            image_url,
            item_count_label,
            sort_order,
            is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.title.trim(),
            data.shortLabel.trim(),
            data.description.trim(),
            data.image.trim(),
            data.itemCountLabel.trim() || null,
            Math.max(1, Math.floor(data.sortOrder || 1)),
            data.isActive ? 1 : 0,
          ],
        );
      }

      return { success: true, message: "Catalogue updated successfully." };
    } catch (error) {
      console.error("updateCatalogueInDbServer error:", error);
      return {
        success: false,
        message: "Could not update catalogue right now.",
      };
    }
  });

export const deleteCatalogueFromDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteCatalogueInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureCatalogueSchema();
      await seedDefaultCataloguesIfEmpty();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM catalogues WHERE slug = ?",
        [data.id],
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "This catalogue could not be deleted from the database.",
        };
      }

      return { success: true, message: "Catalogue deleted successfully." };
    } catch (error) {
      console.error("deleteCatalogueFromDbServer error:", error);
      return {
        success: false,
        message: "Could not delete catalogue right now.",
      };
    }
  });
