import type { Locale, LocalizedText } from "@/lib/language";

type ProductCategory = string;
type Translatable = string | LocalizedText;
export type ProductPaymentMode = "razorpay" | "whatsapp";

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
  paymentMode?: ProductPaymentMode;
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

export function getProductPaymentMode(product: Pick<Product, "paymentMode">): ProductPaymentMode {
  if (product.paymentMode === "whatsapp") return "whatsapp";
  if (product.paymentMode === "razorpay") return "razorpay";
  return "razorpay";
}
