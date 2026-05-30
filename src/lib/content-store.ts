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

export type HomeBlogPost = {
  id: string;
  title: Translatable;
  excerpt: Translatable;
  image: string;
  tag: Translatable;
  href?: string;
};

export type StoredHomeContent = {
  spotlightProductIds: string[];
  banners: HomeBanner[];
  reviews: HomeReview[];
  videos: HomeVideo[];
  blogPosts: HomeBlogPost[];
};

type StorefrontPayload = {
  products: Product[];
  catalogueTypes: CatalogueType[];
  homeContent: StoredHomeContent;
};

const defaultProductById = new Map<string, Product>(
  defaultProducts.map((product) => [product.id, product]),
);

const defaultBannerImageById = new Map<string, string>(
  defaultHomeContent.banners.map((banner) => [banner.id, banner.image]),
);
const defaultBannerImages = defaultHomeContent.banners.map((banner) => banner.image);
const defaultHomeBanners: HomeBanner[] = defaultHomeContent.banners.map((banner) => ({ ...banner }));
const defaultHomeReviews: HomeReview[] = defaultHomeContent.reviews.map((review) => ({ ...review }));
const defaultSpotlightProductIds: string[] = Array.isArray((defaultHomeContent as { spotlightProductIds?: unknown }).spotlightProductIds)
  ? ((defaultHomeContent as { spotlightProductIds?: string[] }).spotlightProductIds ?? []).filter(Boolean).slice(0, 8)
  : [];
const defaultHomeVideos: HomeVideo[] = defaultHomeContent.videos.map((video) => {
  const raw = video as HomeVideo & { thumbnail?: unknown };
  return {
    ...video,
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : "",
  };
});
const defaultHomeBlogPosts: HomeBlogPost[] = (
  (defaultHomeContent as { blogPosts?: readonly HomeBlogPost[] }).blogPosts ?? []
).map((post) => ({
  ...post,
  href: typeof post.href === "string" ? post.href : "",
}));

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

function normalizeHomeBlogPost(post: HomeBlogPost): HomeBlogPost {
  return {
    ...post,
    title: asLocalizedText(post.title),
    excerpt: asLocalizedText(post.excerpt),
    tag: asLocalizedText(post.tag),
    image: normalizeAssetUrl(String(post.image || "").trim()),
    href: String(post.href || "").trim(),
  };
}

function getEnglishText(value: Translatable) {
  return typeof value === "string" ? value : value.en;
}

function isBrokenObjectPlaceholder(value: Translatable) {
  return typeof value === "string" && value.trim().toLowerCase() === "[object object]";
}

function asLocalizedText(value: Translatable, fallback?: Translatable): LocalizedText {
  if (typeof value !== "string") {
    return {
      en: value.en || (typeof fallback === "string" ? fallback : fallback?.en) || "",
      mr: value.mr || (typeof fallback === "string" ? fallback : fallback?.mr) || value.en || "",
    };
  }

  if (typeof fallback === "string") {
    return { en: value, mr: fallback || value };
  }

  if (fallback) {
    if (!fallback.en || value === fallback.en) {
      return { en: fallback.en || value, mr: fallback.mr || value };
    }
    return { en: value, mr: fallback.mr || value };
  }

  return { en: value, mr: value };
}

const productNameMarathiFallbacks: Record<string, string> = {
  "chh. sambhaji maharaj": "छ. संभाजी महाराज",
  "chh sambhaji maharaj": "छ. संभाजी महाराज",
  "rajdanddhari shivaji maharaj statue": "राजदंडधारी शिवाजी महाराज मूर्ती",
  "rajdanddhari shivaji maharaj": "राजदंडधारी शिवाजी महाराज",
};

const productNameWordFallbacks: Record<string, string> = {
  ashwarudh: "अश्वारूढ",
  battle: "युद्ध",
  black: "काळी",
  brass: "पितळी",
  ceremonial: "समारंभिक",
  chh: "छ.",
  chhatrapati: "छत्रपती",
  chatrapati: "छत्रपती",
  coloured: "रंगीत",
  colored: "रंगीत",
  curved: "वक्र",
  dandpatta: "दांडपट्टा",
  decorated: "सजावटी",
  dhoop: "धूप",
  gada: "गदा",
  khanjar: "खंजीर",
  maharaj: "महाराज",
  maharaja: "महाराज",
  maratha: "मराठा",
  murti: "मूर्ती",
  rajdanddhari: "राजदंडधारी",
  roudra: "रौद्र",
  royal: "रॉयल",
  saffron: "केशरी",
  sambhaji: "संभाजी",
  shambhu: "शंभू",
  shastradhari: "शस्त्रधारी",
  sheath: "म्यान",
  shield: "ढाल",
  shivaji: "शिवाजी",
  stand: "स्टँड",
  statue: "मूर्ती",
  straight: "सरळ",
  sword: "तलवार",
  talwar: "तलवार",
  vita: "वीटा",
  war: "युद्ध",
  weapon: "शस्त्र",
  weapons: "शस्त्रे",
  with: "सह",
};

function createMarathiProductNameFallback(englishName: string) {
  const normalizedName = englishName.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalizedName) return "";
  const exactFallback = productNameMarathiFallbacks[normalizedName];
  if (exactFallback) return exactFallback;

  const words = normalizedName
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9.]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "";

  const translatedWords = words.map((word) => productNameWordFallbacks[word.replace(/\.$/, "")] ?? word);
  const hasTranslation = translatedWords.some((word, index) => word !== words[index]);
  return hasTranslation ? translatedWords.join(" ") : "";
}

function normalizeProductName(value: Translatable, fallback?: Translatable) {
  const localizedName = asLocalizedText(value, fallback);
  if (!localizedName.mr || localizedName.mr === localizedName.en) {
    const marathiFallback = createMarathiProductNameFallback(localizedName.en);
    if (marathiFallback) return { ...localizedName, mr: marathiFallback };
  }
  return localizedName;
}

function isDefaultText(value: Translatable, fixedValue: Translatable) {
  return getEnglishText(value) === getEnglishText(fixedValue);
}

function normalizeHomeReview(review: HomeReview): HomeReview {
  const defaultReview = fixedDefaultReviews.get(review.id);

  if (!defaultReview) return review;

  return {
    ...review,
    authorName: asLocalizedText(
      isDefaultText(review.authorName, defaultReview.authorName)
        ? defaultReview.authorName
        : review.authorName,
      defaultReview.authorName,
    ),
    reviewText: asLocalizedText(
      isDefaultText(review.reviewText, defaultReview.reviewText)
        ? defaultReview.reviewText
        : review.reviewText,
      defaultReview.reviewText,
    ),
    location: asLocalizedText(
      isDefaultText(review.location, defaultReview.location) ? defaultReview.location : review.location,
      defaultReview.location,
    ),
  };
}

function normalizeProduct(product: Product): Product {
  const defaultProduct = defaultProductById.get(product.id);
  const safeValue = (value: Translatable, fallback?: Translatable) =>
    isBrokenObjectPlaceholder(value) && fallback ? fallback : value;

  return {
    ...product,
    image: normalizeAssetUrl(product.image),
    discount: String(product.discount || "0").trim(),
    finalPrice: String(product.finalPrice || "").trim(),
    name: normalizeProductName(safeValue(product.name, defaultProduct?.name), defaultProduct?.name),
    tag: asLocalizedText(safeValue(product.tag, defaultProduct?.tag), defaultProduct?.tag),
    shortDescription: asLocalizedText(
      safeValue(product.shortDescription, defaultProduct?.shortDescription),
      defaultProduct?.shortDescription,
    ),
    details: asLocalizedText(safeValue(product.details, defaultProduct?.details), defaultProduct?.details),
    material: asLocalizedText(safeValue(product.material, defaultProduct?.material), defaultProduct?.material),
    dimensions: asLocalizedText(safeValue(product.dimensions, defaultProduct?.dimensions), defaultProduct?.dimensions),
    historicalBackground: product.historicalBackground
      ? asLocalizedText(
          safeValue(product.historicalBackground, defaultProduct?.historicalBackground),
          defaultProduct?.historicalBackground,
        )
      : defaultProduct?.historicalBackground
      ? asLocalizedText(defaultProduct.historicalBackground)
      : undefined,
    productOptions: Array.isArray(product.productOptions)
      ? product.productOptions
          .map((option) => ({
            label: String(option?.label || "").trim(),
            price: String(option?.price || "").trim(),
            discount: String(option?.discount || "").trim(),
            finalPrice: String(option?.finalPrice || "").trim(),
          }))
          .filter((option) => option.label || option.price || option.discount || option.finalPrice)
      : [],
  };
}

function ensureArray<T>(value: unknown, fallback: readonly T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : [...fallback];
}

const emptyHomeContent: StoredHomeContent = {
  spotlightProductIds: [],
  banners: [],
  reviews: [],
  videos: [],
  blogPosts: [],
};

function normalizeStoredHomeContent(
  value: Partial<StoredHomeContent> | null | undefined,
  fallback: StoredHomeContent = {
    spotlightProductIds: defaultSpotlightProductIds,
    banners: defaultHomeBanners,
    reviews: defaultHomeReviews,
    videos: defaultHomeVideos,
    blogPosts: defaultHomeBlogPosts,
  },
): StoredHomeContent {
  const spotlightProductIds = ensureArray<string>(value?.spotlightProductIds, fallback.spotlightProductIds)
    .filter((id) => typeof id === "string" && id.trim())
    .map((id) => id.trim())
    .slice(0, 8);

  return {
    spotlightProductIds,
    banners: ensureArray<HomeBanner>(value?.banners, fallback.banners).map((banner) => normalizeHomeBanner(banner)),
    reviews: ensureArray<HomeReview>(value?.reviews, fallback.reviews).map((review) => normalizeHomeReview(review)),
    videos: ensureArray<HomeVideo>(value?.videos, fallback.videos).map((video) => normalizeHomeVideo(video)),
    blogPosts: ensureArray<HomeBlogPost>(value?.blogPosts, fallback.blogPosts).map((post) => normalizeHomeBlogPost(post)),
  };
}

function normalizeStorefrontPayload(payload: Partial<StorefrontPayload>) {
  return {
    ...payload,
    products: payload.products?.map((product) => normalizeProduct(product)),
    catalogueTypes: payload.catalogueTypes?.map((catalogue) => ({
      ...catalogue,
      image: normalizeAssetUrl(catalogue.image),
    })),
    homeContent: payload.homeContent
      ? {
          ...payload.homeContent,
          spotlightProductIds: payload.homeContent.spotlightProductIds,
          banners: ensureArray<HomeBanner>(payload.homeContent.banners, []).map((banner) => normalizeHomeBanner(banner)),
          reviews: ensureArray<HomeReview>(payload.homeContent.reviews, []).map((review) => normalizeHomeReview(review)),
          videos: ensureArray<HomeVideo>(payload.homeContent.videos, []).map((video) => normalizeHomeVideo(video)),
          blogPosts: ensureArray<HomeBlogPost>(payload.homeContent.blogPosts, []).map((post) => normalizeHomeBlogPost(post)),
        }
      : payload.homeContent,
  };
}

const PRODUCTS_EVENT = "shivray-products-updated";
const CATALOGUES_EVENT = "shivray-catalogues-updated";
const HOME_CONTENT_EVENT = "shivray-home-content-updated";
const LOCAL_PRODUCTS_FALLBACK_KEY = "shivray-products-local-fallback-v1";
const LOCAL_CATALOGUES_FALLBACK_KEY = "shivray-catalogues-local-fallback-v1";
const LOCAL_HOME_CONTENT_FALLBACK_KEY = "shivray-home-content-local-fallback-v1";

let storefrontBootstrapPromise: Promise<void> | null = null;
let productsCache: Product[] = defaultProducts.map((product) => normalizeProduct(product));
let catalogueCache: CatalogueType[] = defaultCatalogueTypes.map((catalogue) => ({
  ...catalogue,
  image: normalizeAssetUrl(catalogue.image),
}));
let homeContentCache: StoredHomeContent = { ...emptyHomeContent };

function canUseWindow() {
  return typeof window !== "undefined";
}

function canUseLocalFallback() {
  if (!canUseWindow()) return false;
  if (import.meta.env.DEV) return true;
  const host = window.location.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

function readLocalProductsFallback(): Product[] | null {
  if (!canUseLocalFallback()) return null;
  const raw = window.localStorage.getItem(LOCAL_PRODUCTS_FALLBACK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((product) => normalizeProduct(product as Product));
  } catch {
    return null;
  }
}

function writeLocalProductsFallback(products: Product[]) {
  if (!canUseLocalFallback()) return;
  window.localStorage.setItem(LOCAL_PRODUCTS_FALLBACK_KEY, JSON.stringify(products));
}

function clearLocalProductsFallback() {
  if (!canUseWindow()) return;
  window.localStorage.removeItem(LOCAL_PRODUCTS_FALLBACK_KEY);
}

function readLocalCataloguesFallback(): CatalogueType[] | null {
  if (!canUseLocalFallback()) return null;
  const raw = window.localStorage.getItem(LOCAL_CATALOGUES_FALLBACK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as CatalogueType[];
  } catch {
    return null;
  }
}

function writeLocalCataloguesFallback(catalogues: CatalogueType[]) {
  if (!canUseLocalFallback()) return;
  window.localStorage.setItem(LOCAL_CATALOGUES_FALLBACK_KEY, JSON.stringify(catalogues));
}

function clearLocalCataloguesFallback() {
  if (!canUseWindow()) return;
  window.localStorage.removeItem(LOCAL_CATALOGUES_FALLBACK_KEY);
}

function readLocalHomeContentFallback(): StoredHomeContent | null {
  if (!canUseLocalFallback()) return null;
  const raw = window.localStorage.getItem(LOCAL_HOME_CONTENT_FALLBACK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredHomeContent>;
    return normalizeStoredHomeContent(parsed, emptyHomeContent);
  } catch {
    return null;
  }
}

function writeLocalHomeContentFallback(content: StoredHomeContent) {
  if (!canUseLocalFallback()) return;
  window.localStorage.setItem(LOCAL_HOME_CONTENT_FALLBACK_KEY, JSON.stringify(content));
}

function clearLocalHomeContentFallback() {
  if (!canUseWindow()) return;
  window.localStorage.removeItem(LOCAL_HOME_CONTENT_FALLBACK_KEY);
}

function dispatchStoreEvent(eventName: string) {
  if (!canUseWindow()) return;
  window.dispatchEvent(new Event(eventName));
}

function preloadHomeBannerMedia(content: StoredHomeContent) {
  if (!canUseWindow()) return;
  const firstBanner = content.banners[0];
  if (!firstBanner) return;

  const mediaType =
    firstBanner.mediaType ?? (firstBanner.videoUrl || /^data:video\//i.test(firstBanner.image) ? "video" : "image");
  const mediaUrl =
    mediaType === "video"
      ? String(firstBanner.videoUrl || firstBanner.image || "").trim()
      : String(firstBanner.image || "").trim();

  if (!mediaUrl) return;

  if (mediaType === "video") {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = mediaUrl;
    return;
  }

  const image = new Image();
  image.fetchPriority = "high";
  image.decoding = "sync";
  image.src = mediaUrl;
}

function applyStorefrontPayload(payload: Partial<StorefrontPayload>) {
  const normalized = normalizeStorefrontPayload(payload);

  if (normalized.products) {
    productsCache = normalized.products;
    dispatchStoreEvent(PRODUCTS_EVENT);
  }

  if (normalized.catalogueTypes) {
    catalogueCache = normalized.catalogueTypes;
    writeLocalCataloguesFallback(normalized.catalogueTypes);
    dispatchStoreEvent(CATALOGUES_EVENT);
  }

  if (normalized.homeContent) {
    homeContentCache = normalizeStoredHomeContent(normalized.homeContent, emptyHomeContent);
    preloadHomeBannerMedia(homeContentCache);
    dispatchStoreEvent(HOME_CONTENT_EVENT);
  }
}

async function refreshStorefrontData() {
  const payload = await apiRequest<StorefrontPayload>("/api/storefront");
  applyStorefrontPayload(payload);
  clearLocalProductsFallback();
  clearLocalHomeContentFallback();
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

async function syncDeleteProductToApi(productId: string) {
  const payload = await apiRequest<StorefrontPayload>(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
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
  const localFallback = readLocalProductsFallback();
  if (localFallback && localFallback.length > 0) {
    productsCache = localFallback;
  }
  return [...productsCache];
}

export async function saveStoredProducts(products: Product[]) {
  try {
    await syncProductsToApi(products);
    clearLocalProductsFallback();
    return true;
  } catch (error) {
    logSyncError("products", error);
    if (!canUseLocalFallback()) {
      void refreshStorefrontData().catch(() => undefined);
      return false;
    }
    // Local fallback keeps the admin session usable, but API sync failed.
    const normalized = products.map((product) => normalizeProduct(product));
    productsCache = normalized;
    writeLocalProductsFallback(normalized);
    dispatchStoreEvent(PRODUCTS_EVENT);
    return true;
  }
}

export async function saveStoredProduct(product: Product) {
  try {
    await syncProductToApi(product);
    clearLocalProductsFallback();
    return true;
  } catch (error) {
    logSyncError("product", error);
    if (!canUseLocalFallback()) {
      void refreshStorefrontData().catch(() => undefined);
      return false;
    }
    // Localhost/dev fallback for single-product save.
    const nextProduct = normalizeProduct(product);
    const nextProducts = [...productsCache];
    const existingIndex = nextProducts.findIndex((item) => item.id === nextProduct.id);
    if (existingIndex >= 0) nextProducts[existingIndex] = nextProduct;
    else nextProducts.unshift(nextProduct);
    productsCache = nextProducts;
    writeLocalProductsFallback(nextProducts);
    dispatchStoreEvent(PRODUCTS_EVENT);
    return true;
  }
}

export async function deleteStoredProduct(productId: string) {
  const normalizedId = String(productId || "").trim();
  if (!normalizedId) return false;

  try {
    await syncDeleteProductToApi(normalizedId);
    clearLocalProductsFallback();
    return true;
  } catch (error) {
    logSyncError("product delete", error);
    if (!canUseLocalFallback()) {
      void refreshStorefrontData().catch(() => undefined);
      return false;
    }
    const nextProducts = productsCache.filter((item) => item.id !== normalizedId);
    productsCache = nextProducts;
    writeLocalProductsFallback(nextProducts);
    dispatchStoreEvent(PRODUCTS_EVENT);
    return true;
  }
}

export function resetStoredProducts() {
  productsCache = defaultProducts.map((product) => normalizeProduct(product));
  dispatchStoreEvent(PRODUCTS_EVENT);
}

export function getStoredCatalogueTypes() {
  const localFallback = readLocalCataloguesFallback();
  if (localFallback && localFallback.length > 0) {
    catalogueCache = localFallback;
  }
  return [...catalogueCache];
}

export async function saveStoredCatalogueTypes(catalogues: CatalogueType[]) {
  try {
    await syncCataloguesToApi(catalogues);
    return true;
  } catch (error) {
    logSyncError("catalogues", error);
    if (!canUseLocalFallback()) {
      void refreshStorefrontData().catch(() => undefined);
      return false;
    }
    // Localhost/dev fallback: keep category edits/deletes after refresh if backend sync fails.
    catalogueCache = [...catalogues];
    writeLocalCataloguesFallback(catalogues);
    dispatchStoreEvent(CATALOGUES_EVENT);
    return true;
  }
}

export function resetStoredCatalogueTypes() {
  catalogueCache = defaultCatalogueTypes.map((catalogue) => ({
    ...catalogue,
    image: normalizeAssetUrl(catalogue.image),
  }));
  dispatchStoreEvent(CATALOGUES_EVENT);
}

export function getStoredHomeContent(): StoredHomeContent {
  const localFallback = readLocalHomeContentFallback();
  if (localFallback) {
    homeContentCache = normalizeStoredHomeContent(localFallback, emptyHomeContent);
  }
  return normalizeStoredHomeContent(homeContentCache, emptyHomeContent);
}

export async function saveStoredHomeContent(content: StoredHomeContent) {
  try {
    await syncHomeContentToApi(content);
    clearLocalHomeContentFallback();
    return true;
  } catch (error) {
    logSyncError("home content", error);
    if (!canUseLocalFallback()) {
      void refreshStorefrontData().catch(() => undefined);
      return false;
    }
    const normalized = normalizeStoredHomeContent(content);
    homeContentCache = normalized;
    writeLocalHomeContentFallback(normalized);
    dispatchStoreEvent(HOME_CONTENT_EVENT);
    return true;
  }
}

export function resetStoredHomeContent() {
  homeContentCache = normalizeStoredHomeContent({
    spotlightProductIds: defaultSpotlightProductIds,
    banners: defaultHomeBanners,
    reviews: defaultHomeReviews,
    videos: defaultHomeVideos,
    blogPosts: defaultHomeBlogPosts,
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
