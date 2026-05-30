import type { Locale, LocalizedText } from "@/lib/language";

type ProductCategory = string;
type Translatable = string | LocalizedText;

export type ProductOption = {
  label: string;
  price: string;
  discount: string;
  finalPrice: string;
};

export type Product = {
  id: string;
  name: Translatable;
  price: string;
  discount?: string;
  finalPrice?: string;
  image: string;
  galleryImages?: string[];
  category: ProductCategory;
  tag: Translatable;
  shortDescription: Translatable;
  details: Translatable;
  material: Translatable;
  dimensions: Translatable;
  historicalBackground?: Translatable;
  productOptions?: ProductOption[];
};

export const productCategories = ["Statues", "Weapons", "Shields", "Dhoop"] as const;

export const categoryLabels: Record<string, LocalizedText> = {
  Statues: { en: "Statues", mr: "Statues" },
  Weapons: { en: "Weapons", mr: "Weapons" },
  Shields: { en: "Shields", mr: "Shields" },
  Dhoop: { en: "Dhoop", mr: "Dhoop" },
};

function normalizeCategoryKey(category: ProductCategory) {
  const raw = String(category || "").trim().toLowerCase();
  if (!raw) return "";

  for (const [key, labels] of Object.entries(categoryLabels)) {
    const knownValues = [key, labels.en, labels.mr]
      .map((value) => String(value || "").trim().toLowerCase())
      .filter(Boolean);

    if (knownValues.includes(raw)) return key;
  }

  return "";
}

export function getCategoryLabel(category: ProductCategory, locale: Locale) {
  const normalizedKey = normalizeCategoryKey(category);
  const known = categoryLabels[normalizedKey || category];
  if (known) return known[locale];
  return category;
}

export const allProducts: Product[] = [];

export const categories = ["All", ...productCategories] as const;

const CUSTOM_PRODUCTS_KEY = "shivray_custom_products";

function getCustomProductsFromStorage(): Product[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CUSTOM_PRODUCTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name !== "undefined" &&
        typeof item.price === "string" &&
        typeof item.image === "string" &&
        typeof item.category === "string",
    );
  } catch {
    return [];
  }
}

export function getAllProducts() {
  const custom = getCustomProductsFromStorage();
  const existingIds = new Set(allProducts.map((product) => product.id));
  const uniqueCustom = custom.filter((item) => !existingIds.has(item.id));
  return [...uniqueCustom, ...allProducts];
}

export function saveCustomProduct(product: Product) {
  if (typeof window === "undefined") return;
  const existing = getCustomProductsFromStorage();
  const next = [product, ...existing];
  window.localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(next));
}

export function getProductById(id: string) {
  return getAllProducts().find((product) => product.id === id);
}
