import { useEffect, useState } from "react";
import { type Product, allProducts as defaultProducts } from "@/data/products";
import { defaultCatalogueTypes, type CatalogueType } from "@/lib/catalogue-types";
import { homeContent as defaultHomeContent } from "@/data/home-content";
import { apiRequest } from "@/lib/api";
import type { LocalizedText } from "@/lib/language";

type Translatable = string | LocalizedText;

export type HomeBanner = {
  id: string;
  eyebrow: Translatable;
  titleTop: Translatable;
  titleBottom: Translatable;
  copy: Translatable;
  image: string;
  mediaType?: "image" | "video";
  videoUrl?: string;
};

export type HomeReview = {
  id: string;
  authorName: Translatable;
  reviewText: Translatable;
  rating: number;
  location: Translatable;
};

export type HomeVideo = {
  id: string;
  title: Translatable;
  description: Translatable;
  videoType: "reel" | "youtube";
  videoUrl: string;
  thumbnail?: string;
};

export type StoredHomeContent = {
  banners: HomeBanner[];
  reviews: HomeReview[];
  videos: HomeVideo[];
};

type StorefrontPayload = {
  products: Product[];
  catalogueTypes: CatalogueType[];
  homeContent: StoredHomeContent;
};

const defaultProductImageById = new Map(
  defaultProducts.map((product) => [product.id, product.image]),
);

const defaultCatalogueImageById = new Map(
  defaultCatalogueTypes.map((catalogue) => [catalogue.id, catalogue.image]),
);

const defaultBannerImageById = new Map(
  defaultHomeContent.banners.map((banner) => [banner.id, banner.image]),
);
const defaultBannerImages = defaultHomeContent.banners.map((banner) => banner.image);

const apiAssetBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function normalizeAssetUrl(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  if (/^(data:|blob:|https?:\/\/)/i.test(raw)) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw) && apiAssetBaseUrl) {
      return raw.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, apiAssetBaseUrl);
    }
    return raw;
  }
  if (raw.startsWith("/") && apiAssetBaseUrl) return `${apiAssetBaseUrl}${raw}`;
  return raw;
}

function resolveLegacyBannerAssetPath(rawPath: string) {
  const fileName = rawPath.split("/").pop() || "";
  const stem = fileName.replace(/\.[^.]+$/, "").toLowerCase();
  if (!stem) return "";
  return (
    defaultBannerImages.find((imageUrl) => imageUrl.toLowerCase().includes(stem)) || ""
  );
}

const legacyHomeVideoUrls = new Set([
  "https://youtu.be/xh-ibz0qxaA",
  "https://youtu.be/2alkiZgDxMI",
  "https://youtu.be/WpBQTatwZhs",
]);

const defaultHomeVideoIds = new Set(defaultHomeContent.videos.map((video) => video.id));

const fixedDefaultReviews = new Map<string, Pick<HomeReview, "authorName" | "reviewText" | "location">>([
  [
    "review-1",
    {
      authorName: { en: "Prasad Jadhav", mr: "प्रसाद जाधव" },
      reviewText: {
        en: "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.",
        mr: "मूर्तीची गुणवत्ता उत्कृष्ट आहे आणि फिनिशिंग खूप प्रीमियम वाटते. डिलिव्हरी आणि सपोर्ट दोन्ही छान होते.",
      },
      location: { en: "Pune", mr: "पुणे" },
    },
  ],
  [
    "review-2",
    {
      authorName: { en: "Snehal Patil", mr: "स्नेहल पाटील" },
      reviewText: {
        en: "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.",
        mr: "आम्ही ऑफिससाठी वारसा-शैलीतील भेटवस्तू मागवली आणि ती प्रत्यक्षात फोटोपेक्षा अधिक सुंदर दिसली.",
      },
      location: { en: "Kolhapur", mr: "कोल्हापूर" },
    },
  ],
  [
    "review-3",
    {
      authorName: { en: "Amit Deshmukh", mr: "अमित देशमुख" },
      reviewText: {
        en: "Very responsive team, great craftsmanship, and clear updates throughout the order process.",
        mr: "टीम खूप प्रतिसाद देणारी आहे, कारागिरी सुंदर आहे आणि संपूर्ण ऑर्डर प्रक्रियेत स्पष्ट अपडेट्स मिळाले.",
      },
      location: { en: "Mumbai", mr: "मुंबई" },
    },
  ],
]);

function normalizeHomeVideo(video: HomeVideo): HomeVideo {
  const defaultVideo = defaultHomeContent.videos.find((item) => item.id === video.id);
  const migratedVideo =
    defaultVideo && defaultHomeVideoIds.has(video.id) && video.videoType === "reel"
      ? {
          ...video,
          videoType: defaultVideo.videoType,
          videoUrl: defaultVideo.videoUrl,
          thumbnail: defaultVideo.thumbnail,
        }
      : defaultVideo && legacyHomeVideoUrls.has(video.videoUrl)
      ? {
          ...video,
          videoType: defaultVideo.videoType,
          videoUrl: defaultVideo.videoUrl,
        }
      : video;
  const inferredType =
    migratedVideo.videoType ??
    (/(youtube\.com|youtu\.be)/i.test(migratedVideo.videoUrl) ? "youtube" : "reel");

  return {
    ...migratedVideo,
    videoType: inferredType,
    thumbnail: migratedVideo.thumbnail ?? "",
  };
}

function normalizeHomeBanner(banner: HomeBanner): HomeBanner {
  const defaultImage = defaultBannerImageById.get(banner.id) ?? banner.image;
  const rawImage = String(banner.image || "").trim();
  const looksLikeUnhashedLegacyAsset =
    /^\/assets\/[^?#]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(rawImage) &&
    !/-[A-Za-z0-9]{6,}\.[A-Za-z0-9]+$/i.test(rawImage);
  const legacyResolvedImage = looksLikeUnhashedLegacyAsset
    ? resolveLegacyBannerAssetPath(rawImage)
    : "";
  const normalizedImage = looksLikeUnhashedLegacyAsset
    ? legacyResolvedImage || defaultImage
    : normalizeAssetUrl(rawImage || defaultImage);
  const mediaType =
    banner.mediaType ??
    (banner.videoUrl || /^data:video\//i.test(normalizedImage) ? "video" : "image");

  return {
    ...banner,
    image: normalizedImage,
    mediaType,
    videoUrl: banner.videoUrl ? normalizeAssetUrl(banner.videoUrl) : mediaType === "video" ? normalizedImage : "",
  };
}

function getEnglishText(value: Translatable) {
  return typeof value === "string" ? value : value.en;
}

function isDefaultText(value: Translatable, fixedValue: Translatable) {
  return getEnglishText(value) === getEnglishText(fixedValue);
}

function normalizeHomeReview(review: HomeReview): HomeReview {
  const defaultReview = fixedDefaultReviews.get(review.id);

  if (!defaultReview) return review;

  return {
    ...review,
    authorName: isDefaultText(review.authorName, defaultReview.authorName)
      ? defaultReview.authorName
      : review.authorName,
    reviewText: isDefaultText(review.reviewText, defaultReview.reviewText)
      ? defaultReview.reviewText
      : review.reviewText,
    location: isDefaultText(review.location, defaultReview.location) ? defaultReview.location : review.location,
  };
}

function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeStoredHomeContent(value: Partial<StoredHomeContent> | null | undefined): StoredHomeContent {
  return {
    banners: ensureArray(value?.banners, defaultHomeContent.banners).map((banner) => normalizeHomeBanner(banner)),
    reviews: ensureArray(value?.reviews, defaultHomeContent.reviews).map((review) => normalizeHomeReview(review)),
    videos: ensureArray(value?.videos, defaultHomeContent.videos).map((video) => normalizeHomeVideo(video)),
  };
}

function normalizeStorefrontPayload(payload: Partial<StorefrontPayload>) {
  return {
    ...payload,
    products: payload.products?.map((product) => ({
      ...product,
      image: defaultProductImageById.get(product.id) ?? product.image,
    })),
    catalogueTypes: payload.catalogueTypes?.map((catalogue) => ({
      ...catalogue,
      image: defaultCatalogueImageById.get(catalogue.id) ?? catalogue.image,
    })),
    homeContent: payload.homeContent
      ? {
          ...payload.homeContent,
          banners: payload.homeContent.banners.map((banner) => normalizeHomeBanner(banner)),
          reviews: payload.homeContent.reviews.map((review) => normalizeHomeReview(review)),
          videos: payload.homeContent.videos.map((video) => normalizeHomeVideo(video)),
        }
      : payload.homeContent,
  };
}

const PRODUCTS_KEY = "shivray_products_store_v3";
const CATALOGUES_KEY = "shivray_catalogues_store_v1";
const HOME_CONTENT_KEY = "shivray_home_content_store_v1";

const PRODUCTS_EVENT = "shivray-products-updated";
const CATALOGUES_EVENT = "shivray-catalogues-updated";
const HOME_CONTENT_EVENT = "shivray-home-content-updated";

let storefrontBootstrapPromise: Promise<void> | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function shouldBootstrapStorefront() {
  if (!canUseStorage()) return false;
  return window.location.pathname.startsWith("/admin");
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T, eventName: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}

function removeStored(key: string, eventName: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(eventName));
}

function applyStorefrontPayload(payload: Partial<StorefrontPayload>) {
  if (!canUseStorage()) return;
  const normalized = normalizeStorefrontPayload(payload);

  if (normalized.products) {
    writeJson(PRODUCTS_KEY, normalized.products, PRODUCTS_EVENT);
  }

  if (normalized.catalogueTypes) {
    writeJson(CATALOGUES_KEY, normalized.catalogueTypes, CATALOGUES_EVENT);
  }

  if (normalized.homeContent) {
    writeJson(HOME_CONTENT_KEY, normalized.homeContent, HOME_CONTENT_EVENT);
  }
}

async function refreshStorefrontData() {
  const payload = await apiRequest<StorefrontPayload>("/api/storefront");
  applyStorefrontPayload(payload);
}

function logSyncError(scope: string, error: unknown) {
  console.error(`Failed to sync ${scope} with the backend.`, error);
}

function syncProductsToApi(products: Product[]) {
  void apiRequest<StorefrontPayload>("/api/admin/products", {
    method: "PUT",
    body: { products },
  })
    .then((payload) => applyStorefrontPayload(payload))
    .catch((error) => logSyncError("products", error));
}

function syncCataloguesToApi(catalogues: CatalogueType[]) {
  void apiRequest<StorefrontPayload>("/api/admin/catalogues", {
    method: "PUT",
    body: { catalogues },
  })
    .then((payload) => applyStorefrontPayload(payload))
    .catch((error) => logSyncError("catalogues", error));
}

function syncHomeContentToApi(content: StoredHomeContent) {
  void apiRequest<StorefrontPayload>("/api/admin/home-content", {
    method: "PUT",
    body: { content },
  })
    .then((payload) => applyStorefrontPayload(payload))
    .catch((error) => logSyncError("home content", error));
}

function bootstrapStorefrontData() {
  if (!shouldBootstrapStorefront()) {
    return Promise.resolve();
  }

  if (!storefrontBootstrapPromise) {
    storefrontBootstrapPromise = refreshStorefrontData().catch((error) => {
      storefrontBootstrapPromise = null;
      logSyncError("storefront bootstrap", error);
    });
  }

  return storefrontBootstrapPromise;
}

export function getStoredProducts() {
  return ensureArray(readJson<Product[]>(PRODUCTS_KEY, defaultProducts), defaultProducts);
}

export function saveStoredProducts(products: Product[]) {
  writeJson(PRODUCTS_KEY, products, PRODUCTS_EVENT);
  syncProductsToApi(products);
}

export function resetStoredProducts() {
  removeStored(PRODUCTS_KEY, PRODUCTS_EVENT);
}

export function getStoredCatalogueTypes() {
  return ensureArray(
    readJson<CatalogueType[]>(CATALOGUES_KEY, defaultCatalogueTypes),
    defaultCatalogueTypes,
  );
}

export function saveStoredCatalogueTypes(catalogues: CatalogueType[]) {
  writeJson(CATALOGUES_KEY, catalogues, CATALOGUES_EVENT);
  syncCataloguesToApi(catalogues);
}

export function resetStoredCatalogueTypes() {
  removeStored(CATALOGUES_KEY, CATALOGUES_EVENT);
}

export function getStoredHomeContent(): StoredHomeContent {
  return normalizeStoredHomeContent(
    readJson<StoredHomeContent>(HOME_CONTENT_KEY, defaultHomeContent),
  );
}

export function saveStoredHomeContent(content: StoredHomeContent) {
  writeJson(HOME_CONTENT_KEY, content, HOME_CONTENT_EVENT);
  syncHomeContentToApi(content);
}

export function resetStoredHomeContent() {
  removeStored(HOME_CONTENT_KEY, HOME_CONTENT_EVENT);
}

function useStoredValue<T>(read: () => T, eventName: string) {
  const [value, setValue] = useState<T>(() => read());

  useEffect(() => {
    if (!canUseStorage()) return;

    const syncValue = () => setValue(read());

    syncValue();
    void bootstrapStorefrontData().then(syncValue).catch(() => undefined);
    window.addEventListener("storage", syncValue);
    window.addEventListener(eventName, syncValue);

    return () => {
      window.removeEventListener("storage", syncValue);
      window.removeEventListener(eventName, syncValue);
    };
  }, [eventName, read]);

  return value;
}

export function useStoredProducts() {
  return useStoredValue(getStoredProducts, PRODUCTS_EVENT);
}

export function useStoredCatalogueTypes() {
  return useStoredValue(getStoredCatalogueTypes, CATALOGUES_EVENT);
}

export function useStoredHomeContent() {
  return useStoredValue(getStoredHomeContent, HOME_CONTENT_EVENT);
}
