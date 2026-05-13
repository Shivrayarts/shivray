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
  authorName: string;
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

const legacyHomeVideoUrls = new Set([
  "https://youtu.be/xh-ibz0qxaA",
  "https://youtu.be/2alkiZgDxMI",
  "https://youtu.be/WpBQTatwZhs",
]);

function normalizeHomeVideo(video: HomeVideo): HomeVideo {
  const defaultVideo = defaultHomeContent.videos.find((item) => item.id === video.id);
  const migratedVideo =
    defaultVideo && legacyHomeVideoUrls.has(video.videoUrl)
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
  const mediaType =
    banner.mediaType ??
    (banner.videoUrl || /^data:video\//i.test(banner.image) ? "video" : "image");

  return {
    ...banner,
    mediaType,
    videoUrl: banner.videoUrl ?? (mediaType === "video" ? banner.image : ""),
  };
}

function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeStoredHomeContent(value: Partial<StoredHomeContent> | null | undefined): StoredHomeContent {
  return {
    banners: ensureArray(value?.banners, defaultHomeContent.banners).map((banner) => normalizeHomeBanner(banner)),
    reviews: ensureArray(value?.reviews, defaultHomeContent.reviews),
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
