import { useEffect, useState } from "react";
import {
  allProducts as defaultProducts,
  type Product,
} from "@/data/products";
import {
  defaultCatalogueTypes,
  type CatalogueType,
} from "@/lib/catalogue-types";
import { homeContent as defaultHomeContent } from "@/data/home-content";

export type HomeBanner = {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  copy: string;
  image: string;
};

export type HomeReview = {
  id: string;
  authorName: string;
  reviewText: string;
  rating: number;
  location: string;
};

export type HomeVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
};

export type StoredHomeContent = {
  banners: HomeBanner[];
  reviews: HomeReview[];
  videos: HomeVideo[];
};

const PRODUCTS_KEY = "shivray_products_store_v2";
const CATALOGUES_KEY = "shivray_catalogues_store_v1";
const HOME_CONTENT_KEY = "shivray_home_content_store_v1";

const PRODUCTS_EVENT = "shivray-products-updated";
const CATALOGUES_EVENT = "shivray-catalogues-updated";
const HOME_CONTENT_EVENT = "shivray-home-content-updated";

function canUseStorage() {
  return typeof window !== "undefined";
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

export function getStoredProducts() {
  return readJson<Product[]>(PRODUCTS_KEY, defaultProducts);
}

export function saveStoredProducts(products: Product[]) {
  writeJson(PRODUCTS_KEY, products, PRODUCTS_EVENT);
}

export function resetStoredProducts() {
  removeStored(PRODUCTS_KEY, PRODUCTS_EVENT);
}

export function getStoredCatalogueTypes() {
  return readJson<CatalogueType[]>(CATALOGUES_KEY, defaultCatalogueTypes);
}

export function saveStoredCatalogueTypes(catalogues: CatalogueType[]) {
  writeJson(CATALOGUES_KEY, catalogues, CATALOGUES_EVENT);
}

export function resetStoredCatalogueTypes() {
  removeStored(CATALOGUES_KEY, CATALOGUES_EVENT);
}

export function getStoredHomeContent(): StoredHomeContent {
  return readJson<StoredHomeContent>(HOME_CONTENT_KEY, defaultHomeContent);
}

export function saveStoredHomeContent(content: StoredHomeContent) {
  writeJson(HOME_CONTENT_KEY, content, HOME_CONTENT_EVENT);
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
