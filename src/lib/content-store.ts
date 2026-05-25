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

const defaultProductImageById = new Map<string, string>(
  defaultProducts.map((product) => [product.id, product.image]),
);

const defaultCatalogueImageById = new Map<string, string>(
  defaultCatalogueTypes.map((catalogue) => [catalogue.id, catalogue.image]),
);

const defaultBannerImageById = new Map<string, string>(
  defaultHomeContent.banners.map((banner) => [banner.id, banner.image]),
);
const defaultBannerImages = defaultHomeContent.banners.map((banner) => banner.image);
const defaultHomeBanners: HomeBanner[] = defaultHomeContent.banners.map((banner) => ({ ...banner }));
const defaultHomeReviews: HomeReview[] = defaultHomeContent.reviews.map((review) => ({ ...review }));
const defaultHomeVideos: HomeVideo[] = defaultHomeContent.videos.map((video) => {
  const raw = video as HomeVideo & { thumbnail?: unknown };
  return {
    ...video,
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : "",
  };
});

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

const defaultHomeVideoIds = new Set(defaultHomeVideos.map((video) => video.id));

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
  const defaultVideo = defaultHomeVideos.find((item) => item.id === video.id);
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

function ensureArray<T>(value: unknown, fallback: readonly T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : [...fallback];
}

function normalizeStoredHomeContent(value: Partial<StoredHomeContent> | null | undefined): StoredHomeContent {
  return {
    banners: ensureArray<HomeBanner>(value?.banners, defaultHomeBanners).map((banner) => normalizeHomeBanner(banner)),
    reviews: ensureArray<HomeReview>(value?.reviews, defaultHomeReviews).map((review) => normalizeHomeReview(review)),
    videos: ensureArray<HomeVideo>(value?.videos, defaultHomeVideos).map((video) => normalizeHomeVideo(video)),
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

const PRODUCTS_EVENT = "shivray-products-updated";
const CATALOGUES_EVENT = "shivray-catalogues-updated";
const HOME_CONTENT_EVENT = "shivray-home-content-updated";

let storefrontBootstrapPromise: Promise<void> | null = null;
let productsCache: Product[] = [...defaultProducts];
let catalogueCache: CatalogueType[] = [...defaultCatalogueTypes];
let homeContentCache: StoredHomeContent = normalizeStoredHomeContent({
  banners: defaultHomeBanners,
  reviews: defaultHomeReviews,
  videos: defaultHomeVideos,
});

function canUseWindow() {
  return typeof window !== "undefined";
}

function dispatchStoreEvent(eventName: string) {
  if (!canUseWindow()) return;
  window.dispatchEvent(new Event(eventName));
}

function applyStorefrontPayload(payload: Partial<StorefrontPayload>) {
  const normalized = normalizeStorefrontPayload(payload);

  if (normalized.products) {
    productsCache = normalized.products;
    dispatchStoreEvent(PRODUCTS_EVENT);
  }

  if (normalized.catalogueTypes) {
    catalogueCache = normalized.catalogueTypes;
    dispatchStoreEvent(CATALOGUES_EVENT);
  }

  if (normalized.homeContent) {
    homeContentCache = normalizeStoredHomeContent(normalized.homeContent);
    dispatchStoreEvent(HOME_CONTENT_EVENT);
  }
}

async function refreshStorefrontData() {
  const payload = await apiRequest<StorefrontPayload>("/api/storefront");
  applyStorefrontPayload(payload);
}

function logSyncError(scope: string, error: unknown) {
  console.error(`Failed to sync ${scope} with the backend.`, error);
}

async function syncProductsToApi(products: Product[]) {
  const payload = await apiRequest<StorefrontPayload>("/api/admin/products", {
    method: "PUT",
    body: { products },
  });
  applyStorefrontPayload(payload);
}

async function syncProductToApi(product: Product) {
  const productId = String(product.id || "").trim();
  if (!productId) {
    throw new Error("Product id is required.");
  }
  const payload = await apiRequest<StorefrontPayload>(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: { product },
  });
  applyStorefrontPayload(payload);
}

async function syncCataloguesToApi(catalogues: CatalogueType[]) {
  const payload = await apiRequest<StorefrontPayload>("/api/admin/catalogues", {
    method: "PUT",
    body: { catalogues },
  });
  applyStorefrontPayload(payload);
}

async function syncHomeContentToApi(content: StoredHomeContent) {
  const payload = await apiRequest<StorefrontPayload>("/api/admin/home-content", {
    method: "PUT",
    body: { content },
  });
  applyStorefrontPayload(payload);
}

function bootstrapStorefrontData() {
  if (!storefrontBootstrapPromise) {
    storefrontBootstrapPromise = refreshStorefrontData().catch((error) => {
      storefrontBootstrapPromise = null;
      logSyncError("storefront bootstrap", error);
    });
  }

  return storefrontBootstrapPromise;
}

export function getStoredProducts() {
  return [...productsCache];
}

export async function saveStoredProducts(products: Product[]) {
  try {
    await syncProductsToApi(products);
    return true;
  } catch (error) {
    logSyncError("products", error);
    return false;
  }
}

export async function saveStoredProduct(product: Product) {
  try {
    await syncProductToApi(product);
    return true;
  } catch (error) {
    logSyncError("product", error);
    return false;
  }
}

export function resetStoredProducts() {
  productsCache = [...defaultProducts];
  dispatchStoreEvent(PRODUCTS_EVENT);
}

export function getStoredCatalogueTypes() {
  return [...catalogueCache];
}

export async function saveStoredCatalogueTypes(catalogues: CatalogueType[]) {
  try {
    await syncCataloguesToApi(catalogues);
    return true;
  } catch (error) {
    logSyncError("catalogues", error);
    return false;
  }
}

export function resetStoredCatalogueTypes() {
  catalogueCache = [...defaultCatalogueTypes];
  dispatchStoreEvent(CATALOGUES_EVENT);
}

export function getStoredHomeContent(): StoredHomeContent {
  return normalizeStoredHomeContent(homeContentCache);
}

export async function saveStoredHomeContent(content: StoredHomeContent) {
  try {
    await syncHomeContentToApi(content);
    return true;
  } catch (error) {
    logSyncError("home content", error);
    return false;
  }
}

export function resetStoredHomeContent() {
  homeContentCache = normalizeStoredHomeContent({
    banners: defaultHomeBanners,
    reviews: defaultHomeReviews,
    videos: defaultHomeVideos,
  });
  dispatchStoreEvent(HOME_CONTENT_EVENT);
}

function useStoredValue<T>(read: () => T, eventName: string) {
  const [value, setValue] = useState<T>(() => read());

  useEffect(() => {
    if (!canUseWindow()) return;

    const syncValue = () => setValue(read());

    syncValue();
    void bootstrapStorefrontData().then(syncValue).catch(() => undefined);
    window.addEventListener(eventName, syncValue);

    return () => {
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
