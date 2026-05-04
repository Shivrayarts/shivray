import { createServerFn } from "@tanstack/react-start";
import type { ResultSetHeader } from "mysql2/promise";
import { getMysqlPool } from "@/lib/server/mysql";
import heroBanner1 from "@/assets/products-poster.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

type DbBannerRow = {
  id: number;
  slug: string;
  eyebrow: string;
  title_top: string;
  title_bottom: string;
  copy_text: string;
  image_url: string;
  is_active: number;
  sort_order: number;
};

type DbReviewRow = {
  id: number;
  author_name: string;
  review_text: string;
  rating: number;
  location: string | null;
  is_active: number;
  sort_order: number;
};

type DbVideoRow = {
  id: number;
  title: string;
  description: string;
  video_url: string;
  is_active: number;
  sort_order: number;
};

type CreateBannerInput = {
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  copy: string;
  image: string;
};

type UpdateBannerInput = CreateBannerInput & {
  id: string;
  isActive: boolean;
  sortOrder: number;
};

type CreateReviewInput = {
  authorName: string;
  reviewText: string;
  rating: number;
  location: string;
};

type UpdateReviewInput = CreateReviewInput & {
  id: string;
  isActive: boolean;
  sortOrder: number;
};

type CreateVideoInput = {
  title: string;
  description: string;
  videoUrl: string;
};

type UpdateVideoInput = CreateVideoInput & {
  id: string;
  isActive: boolean;
  sortOrder: number;
};

type DeleteInput = {
  id: string;
};

export type HomeBanner = {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  copy: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
};

export type HomeReview = {
  id: string;
  authorName: string;
  reviewText: string;
  rating: number;
  location: string;
  isActive: boolean;
  sortOrder: number;
};

export type HomeVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isActive: boolean;
  sortOrder: number;
};

export type AdminHomeBanner = HomeBanner & {
  fromDb: boolean;
};

export type AdminHomeReview = HomeReview & {
  fromDb: boolean;
};

export type AdminHomeVideo = HomeVideo & {
  fromDb: boolean;
};

export type AdminHomePageContent = {
  banners: AdminHomeBanner[];
  reviews: AdminHomeReview[];
  videos: AdminHomeVideo[];
};

export type HomePageContent = {
  banners: HomeBanner[];
  reviews: HomeReview[];
  videos: HomeVideo[];
};

const bannerAssetMap: Record<string, string> = {
  "products-poster.jpg": heroBanner1,
  "hero-banner-2.jpg": heroBanner2,
  "hero-banner-3.jpg": heroBanner3,
};

const defaultBanners: HomeBanner[] = [
  {
    id: "timeless-culture-banner",
    eyebrow: "Premium Craftsmanship Since 2015",
    titleTop: "Timeless Culture",
    titleBottom: "Modern Vision",
    copy:
      "From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.",
    image: heroBanner3,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "warrior-legacy-banner",
    eyebrow: "Made For Proud Spaces",
    titleTop: "Warrior Legacy",
    titleBottom: "Handcrafted Detail",
    copy:
      "Bring home statues, shields, and decor pieces shaped with heritage-inspired artistry and a premium finish.",
    image: heroBanner1,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "royal-presence-banner",
    eyebrow: "Signature Heritage Collection",
    titleTop: "Royal Presence",
    titleBottom: "Bold Display",
    copy:
      "Explore statement pieces designed for gifting, home decor, devotion, and unforgettable first impressions.",
    image: heroBanner2,
    isActive: true,
    sortOrder: 3,
  },
];

const defaultReviews: HomeReview[] = [
  {
    id: "review-1",
    authorName: "Prasad Jadhav",
    reviewText:
      "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.",
    rating: 5,
    location: "Pune",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "review-2",
    authorName: "Snehal Patil",
    reviewText:
      "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.",
    rating: 5,
    location: "Kolhapur",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "review-3",
    authorName: "Amit Deshmukh",
    reviewText:
      "Very responsive team, great craftsmanship, and clear updates throughout the order process.",
    rating: 4,
    location: "Mumbai",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "review-4",
    authorName: "Vaishnavi More",
    reviewText:
      "The product packaging was neat, the finish was elegant, and it made a beautiful gift for our family event.",
    rating: 5,
    location: "Satara",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "review-5",
    authorName: "Rohit Shinde",
    reviewText:
      "We appreciated the personal guidance before ordering. The final piece matched the photos and arrived on time.",
    rating: 4,
    location: "Nashik",
    isActive: true,
    sortOrder: 5,
  },
];

const defaultVideos: HomeVideo[] = [
  {
    id: "video-1",
    title: "Shivkalin Shastranche Aajche Shilpakar",
    description:
      "Satyajit Arun Vaidya shares his journey from passion to profession in historical weapon crafting.",
    videoUrl: "https://youtu.be/xh-ibz0qxaA",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "video-2",
    title: "Bhetarupi Aitihasik Shastra Banavnare Satyajeet Vaidya",
    description:
      "Historic weapons as gifts and display pieces that preserve traditional craftsmanship.",
    videoUrl: "https://youtu.be/2alkiZgDxMI",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "video-3",
    title: "Puratan Shastrancha Itihas Jopasanara Kalakar Mavala",
    description:
      "A short feature on the artisan spirit and the story behind these heritage-inspired creations.",
    videoUrl: "https://youtu.be/WpBQTatwZhs",
    isActive: true,
    sortOrder: 3,
  },
];

let homeContentSchemaReady = false;

function slugify(value: string) {
  return `${value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now()}`;
}

function resolveBannerImage(rawValue: string, slug: string) {
  const raw = rawValue.trim();
  if (!raw) {
    return defaultBanners.find((item) => item.id === slug)?.image ?? "";
  }

  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  const normalized = raw.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop()?.toLowerCase() ?? "";
  const mapped = bannerAssetMap[fileName];
  if (mapped) return mapped;

  return defaultBanners.find((item) => item.id === slug)?.image ?? raw;
}

function mapDbRowToBanner(row: DbBannerRow): HomeBanner {
  return {
    id: row.slug,
    eyebrow: row.eyebrow,
    titleTop: row.title_top,
    titleBottom: row.title_bottom,
    copy: row.copy_text,
    image: resolveBannerImage(row.image_url, row.slug),
    isActive: row.is_active === 1,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapDbRowToReview(row: DbReviewRow): HomeReview {
  return {
    id: String(row.id),
    authorName: row.author_name,
    reviewText: row.review_text,
    rating: Number(row.rating ?? 5),
    location: row.location?.trim() || "Verified Customer",
    isActive: row.is_active === 1,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapDbRowToVideo(row: DbVideoRow): HomeVideo {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    isActive: row.is_active === 1,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

async function ensureHomeContentSchema() {
  if (homeContentSchemaReady) return;

  const pool = getMysqlPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_banners (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      slug VARCHAR(191) NOT NULL,
      eyebrow VARCHAR(191) NOT NULL,
      title_top VARCHAR(191) NOT NULL,
      title_bottom VARCHAR(191) NOT NULL,
      copy_text TEXT NOT NULL,
      image_url MEDIUMTEXT NOT NULL,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_hero_banners_slug (slug),
      KEY idx_hero_banners_active (is_active),
      KEY idx_hero_banners_sort (sort_order)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_reviews (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      author_name VARCHAR(191) NOT NULL,
      review_text TEXT NOT NULL,
      rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
      location VARCHAR(120) DEFAULT NULL,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_homepage_reviews_active (is_active),
      KEY idx_homepage_reviews_sort (sort_order)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_videos (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(191) NOT NULL,
      description TEXT NOT NULL,
      video_url MEDIUMTEXT NOT NULL,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_homepage_videos_active (is_active),
      KEY idx_homepage_videos_sort (sort_order)
    ) ENGINE=InnoDB
  `);

  homeContentSchemaReady = true;
}

async function seedHomeContentIfEmpty() {
  const pool = getMysqlPool();

  const [bannerCountRows] = await pool.query<Array<{ total: number | string }>>(
    "SELECT COUNT(*) AS total FROM hero_banners",
  );
  if (Number(bannerCountRows[0]?.total ?? 0) === 0) {
    for (const banner of defaultBanners) {
      await pool.query(
        `INSERT INTO hero_banners (
          slug, eyebrow, title_top, title_bottom, copy_text, image_url, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          banner.id,
          banner.eyebrow,
          banner.titleTop,
          banner.titleBottom,
          banner.copy,
          banner.image,
          banner.sortOrder,
        ],
      );
    }
  }

  const [reviewCountRows] = await pool.query<Array<{ total: number | string }>>(
    "SELECT COUNT(*) AS total FROM homepage_reviews",
  );
  if (Number(reviewCountRows[0]?.total ?? 0) === 0) {
    for (const review of defaultReviews) {
      await pool.query(
        `INSERT INTO homepage_reviews (
          author_name, review_text, rating, location, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, 1)`,
        [review.authorName, review.reviewText, review.rating, review.location, review.sortOrder],
      );
    }
  }

  const [videoCountRows] = await pool.query<Array<{ total: number | string }>>(
    "SELECT COUNT(*) AS total FROM homepage_videos",
  );
  if (Number(videoCountRows[0]?.total ?? 0) === 0) {
    for (const video of defaultVideos) {
      await pool.query(
        `INSERT INTO homepage_videos (
          title, description, video_url, sort_order, is_active
        ) VALUES (?, ?, ?, ?, 1)`,
        [video.title, video.description, video.videoUrl, video.sortOrder],
      );
    }
  }
}

export const getHomePageContentServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomePageContent> => {
    try {
      await ensureHomeContentSchema();
      await seedHomeContentIfEmpty();
      const pool = getMysqlPool();

      const [bannerRows] = await pool.query<DbBannerRow[]>(
        `SELECT id, slug, eyebrow, title_top, title_bottom, copy_text, image_url, is_active, sort_order
         FROM hero_banners
         WHERE is_active = 1
         ORDER BY sort_order ASC, id ASC`,
      );

      const [reviewRows] = await pool.query<DbReviewRow[]>(
        `SELECT id, author_name, review_text, rating, location, is_active, sort_order
         FROM homepage_reviews
         WHERE is_active = 1
         ORDER BY sort_order ASC, id ASC`,
      );

      const [videoRows] = await pool.query<DbVideoRow[]>(
        `SELECT id, title, description, video_url, is_active, sort_order
         FROM homepage_videos
         WHERE is_active = 1
         ORDER BY sort_order ASC, id ASC`,
      );

      return {
        banners: bannerRows.length ? bannerRows.map(mapDbRowToBanner) : defaultBanners,
        reviews: reviewRows.length ? reviewRows.map(mapDbRowToReview) : defaultReviews,
        videos: videoRows.length ? videoRows.map(mapDbRowToVideo) : defaultVideos,
      };
    } catch (error) {
      console.error("getHomePageContentServer error:", error);
      return {
        banners: defaultBanners,
        reviews: defaultReviews,
        videos: defaultVideos,
      };
    }
  },
);

export const getAdminHomePageContentServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminHomePageContent> => {
    try {
      await ensureHomeContentSchema();
      await seedHomeContentIfEmpty();
      const pool = getMysqlPool();

      const [bannerRows] = await pool.query<DbBannerRow[]>(
        `SELECT id, slug, eyebrow, title_top, title_bottom, copy_text, image_url, is_active, sort_order
         FROM hero_banners
         ORDER BY sort_order ASC, id ASC`,
      );
      const [reviewRows] = await pool.query<DbReviewRow[]>(
        `SELECT id, author_name, review_text, rating, location, is_active, sort_order
         FROM homepage_reviews
         ORDER BY sort_order ASC, id ASC`,
      );
      const [videoRows] = await pool.query<DbVideoRow[]>(
        `SELECT id, title, description, video_url, is_active, sort_order
         FROM homepage_videos
         ORDER BY sort_order ASC, id ASC`,
      );

      return {
        banners: bannerRows.length
          ? bannerRows.map((row) => ({ ...mapDbRowToBanner(row), fromDb: true }))
          : defaultBanners.map((item) => ({ ...item, fromDb: false })),
        reviews: reviewRows.length
          ? reviewRows.map((row) => ({ ...mapDbRowToReview(row), fromDb: true }))
          : defaultReviews.map((item) => ({ ...item, fromDb: false })),
        videos: videoRows.length
          ? videoRows.map((row) => ({ ...mapDbRowToVideo(row), fromDb: true }))
          : defaultVideos.map((item) => ({ ...item, fromDb: false })),
      };
    } catch (error) {
      console.error("getAdminHomePageContentServer error:", error);
      return {
        banners: defaultBanners.map((item) => ({ ...item, fromDb: false })),
        reviews: defaultReviews.map((item) => ({ ...item, fromDb: false })),
        videos: defaultVideos.map((item) => ({ ...item, fromDb: false })),
      };
    }
  },
);

export const createBannerInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: CreateBannerInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      await seedHomeContentIfEmpty();
      const pool = getMysqlPool();
      const slug = slugify(data.titleTop || data.titleBottom || data.eyebrow || "banner");

      // Put the newest banner first so the home hero updates immediately.
      await pool.query("UPDATE hero_banners SET sort_order = sort_order + 1");

      await pool.query(
        `INSERT INTO hero_banners (
          slug, eyebrow, title_top, title_bottom, copy_text, image_url, sort_order, is_active
        ) VALUES (
          ?, ?, ?, ?, ?, ?, 1, 1
        )`,
        [
          slug,
          data.eyebrow.trim(),
          data.titleTop.trim(),
          data.titleBottom.trim(),
          data.copy.trim(),
          data.image.trim(),
        ],
      );

      return { success: true, message: "Banner created successfully." };
    } catch (error) {
      console.error("createBannerInDbServer error:", error);
      return { success: false, message: "Could not create banner right now." };
    }
  });

export const updateBannerInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateBannerInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE hero_banners
         SET eyebrow = ?, title_top = ?, title_bottom = ?, copy_text = ?, image_url = ?, is_active = ?, sort_order = ?
         WHERE slug = ?`,
        [
          data.eyebrow.trim(),
          data.titleTop.trim(),
          data.titleBottom.trim(),
          data.copy.trim(),
          data.image.trim(),
          data.isActive ? 1 : 0,
          Math.max(1, Math.floor(data.sortOrder || 1)),
          data.id,
        ],
      );

      if (!result.affectedRows) {
        return { success: false, message: "Banner not found." };
      }

      return { success: true, message: "Banner updated successfully." };
    } catch (error) {
      console.error("updateBannerInDbServer error:", error);
      return { success: false, message: "Could not update banner right now." };
    }
  });

export const deleteBannerFromDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM hero_banners WHERE slug = ? LIMIT 1",
        [data.id],
      );

      if (!result.affectedRows) {
        return { success: false, message: "Banner not found." };
      }

      return { success: true, message: "Banner deleted successfully." };
    } catch (error) {
      console.error("deleteBannerFromDbServer error:", error);
      return { success: false, message: "Could not delete banner right now." };
    }
  });

export const createReviewInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: CreateReviewInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      await seedHomeContentIfEmpty();
      const pool = getMysqlPool();

      await pool.query(
        `INSERT INTO homepage_reviews (
          author_name, review_text, rating, location, sort_order, is_active
        ) VALUES (
          ?, ?, ?, ?,
          COALESCE((SELECT MAX(sort_order) + 1 FROM (SELECT sort_order FROM homepage_reviews) AS review_orders), 1),
          1
        )`,
        [
          data.authorName.trim(),
          data.reviewText.trim(),
          Math.max(1, Math.min(5, Math.floor(data.rating || 5))),
          data.location.trim() || "Verified Customer",
        ],
      );

      return { success: true, message: "Review created successfully." };
    } catch (error) {
      console.error("createReviewInDbServer error:", error);
      return { success: false, message: "Could not create review right now." };
    }
  });

export const updateReviewInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateReviewInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE homepage_reviews
         SET author_name = ?, review_text = ?, rating = ?, location = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.authorName.trim(),
          data.reviewText.trim(),
          Math.max(1, Math.min(5, Math.floor(data.rating || 5))),
          data.location.trim() || "Verified Customer",
          data.isActive ? 1 : 0,
          Math.max(1, Math.floor(data.sortOrder || 1)),
          Number(data.id),
        ],
      );

      if (!result.affectedRows) {
        return { success: false, message: "Review not found." };
      }

      return { success: true, message: "Review updated successfully." };
    } catch (error) {
      console.error("updateReviewInDbServer error:", error);
      return { success: false, message: "Could not update review right now." };
    }
  });

export const deleteReviewFromDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM homepage_reviews WHERE id = ? LIMIT 1",
        [Number(data.id)],
      );

      if (!result.affectedRows) {
        return { success: false, message: "Review not found." };
      }

      return { success: true, message: "Review deleted successfully." };
    } catch (error) {
      console.error("deleteReviewFromDbServer error:", error);
      return { success: false, message: "Could not delete review right now." };
    }
  });

export const createVideoInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: CreateVideoInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      await seedHomeContentIfEmpty();
      const pool = getMysqlPool();

      await pool.query(
        `INSERT INTO homepage_videos (
          title, description, video_url, sort_order, is_active
        ) VALUES (
          ?, ?, ?,
          COALESCE((SELECT MAX(sort_order) + 1 FROM (SELECT sort_order FROM homepage_videos) AS video_orders), 1),
          1
        )`,
        [data.title.trim(), data.description.trim(), data.videoUrl.trim()],
      );

      return { success: true, message: "Video created successfully." };
    } catch (error) {
      console.error("createVideoInDbServer error:", error);
      return { success: false, message: "Could not create video right now." };
    }
  });

export const updateVideoInDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateVideoInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE homepage_videos
         SET title = ?, description = ?, video_url = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.title.trim(),
          data.description.trim(),
          data.videoUrl.trim(),
          data.isActive ? 1 : 0,
          Math.max(1, Math.floor(data.sortOrder || 1)),
          Number(data.id),
        ],
      );

      if (!result.affectedRows) {
        return { success: false, message: "Video not found." };
      }

      return { success: true, message: "Video updated successfully." };
    } catch (error) {
      console.error("updateVideoInDbServer error:", error);
      return { success: false, message: "Could not update video right now." };
    }
  });

export const deleteVideoFromDbServer = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteInput) => data)
  .handler(async ({ data }) => {
    try {
      await ensureHomeContentSchema();
      const pool = getMysqlPool();
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM homepage_videos WHERE id = ? LIMIT 1",
        [Number(data.id)],
      );

      if (!result.affectedRows) {
        return { success: false, message: "Video not found." };
      }

      return { success: true, message: "Video deleted successfully." };
    } catch (error) {
      console.error("deleteVideoFromDbServer error:", error);
      return { success: false, message: "Could not delete video right now." };
    }
  });
