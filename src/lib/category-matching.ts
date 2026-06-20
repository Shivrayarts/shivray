import type { Product } from "@/data/products";
import type { CatalogueType } from "@/lib/catalogue-types";
import type { Locale } from "@/lib/language";

const legacySeededCatalogueLabels: Record<string, string> = {
  "statues-catalogue": "statues",
  "weapons-catalogue": "weapons",
  "shield-catalogue": "shields",
  "dhoop-catalogue": "dhoop",
  "full-catalogue": "full range",
};

function normalizeCategoryValue(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toTextList(value: string | { en?: string; mr?: string }) {
  if (typeof value === "string") {
    return [value];
  }

  return [value.en ?? "", value.mr ?? ""];
}

export function getCatalogueShortLabel(catalogue: Pick<CatalogueType, "shortLabel">) {
  return (typeof catalogue.shortLabel === "string"
    ? catalogue.shortLabel
    : catalogue.shortLabel.en || catalogue.shortLabel.mr || ""
  ).trim();
}

export function isUnchangedLegacySeededCatalogue(
  catalogue: Pick<CatalogueType, "id" | "shortLabel">,
) {
  const id = String(catalogue.id || "").trim();
  const legacyLabel = legacySeededCatalogueLabels[id];
  if (!legacyLabel) return false;
  return normalizeCategoryValue(getCatalogueShortLabel(catalogue)) === normalizeCategoryValue(legacyLabel);
}

export function getCatalogueCategoryAliases(
  catalogue: Pick<CatalogueType, "id" | "shortLabel" | "title">,
) {
  const aliases = new Set<string>();

  for (const rawValue of [...toTextList(catalogue.shortLabel), ...toTextList(catalogue.title)]) {
    const normalizedValue = normalizeCategoryValue(rawValue);
    if (normalizedValue) {
      aliases.add(normalizedValue);
    }
  }

  const legacyAlias = legacySeededCatalogueLabels[String(catalogue.id || "").trim()];
  if (legacyAlias) {
    aliases.add(normalizeCategoryValue(legacyAlias));
  }

  return aliases;
}

export function getCataloguePrimaryCategoryKey(
  catalogue: Pick<CatalogueType, "shortLabel" | "title">,
) {
  const primaryKey = getCatalogueShortLabel(catalogue);
  if (primaryKey) return primaryKey;

  return (typeof catalogue.title === "string"
    ? catalogue.title
    : catalogue.title.en || catalogue.title.mr || ""
  ).trim();
}

export function findMatchingCatalogue(
  rawCategory: string,
  catalogueTypes: Pick<CatalogueType, "id" | "shortLabel" | "title">[],
) {
  const normalizedCategory = normalizeCategoryValue(rawCategory);
  if (!normalizedCategory) return null;

  return (
    catalogueTypes.find((catalogue) => getCatalogueCategoryAliases(catalogue).has(normalizedCategory)) ?? null
  );
}

export function getCategoryDisplayLabel(
  rawCategory: string,
  locale: Locale,
  catalogueTypes: Pick<CatalogueType, "id" | "shortLabel" | "title">[],
) {
  const matchedCatalogue = findMatchingCatalogue(rawCategory, catalogueTypes);
  if (!matchedCatalogue) {
    return String(rawCategory || "").trim();
  }

  if (typeof matchedCatalogue.shortLabel === "string") {
    return matchedCatalogue.shortLabel.trim();
  }

  return (
    matchedCatalogue.shortLabel[locale] ||
    matchedCatalogue.shortLabel.en ||
    matchedCatalogue.shortLabel.mr ||
    String(rawCategory || "").trim()
  ).trim();
}

export function resolveCategoryMatchKey(
  rawCategory: string,
  catalogueTypes: Pick<CatalogueType, "id" | "shortLabel" | "title">[],
) {
  const matchedCatalogue = findMatchingCatalogue(rawCategory, catalogueTypes);
  if (matchedCatalogue) {
    return getCataloguePrimaryCategoryKey(matchedCatalogue);
  }

  return String(rawCategory || "").trim();
}

export function categoriesMatch(
  firstCategory: string,
  secondCategory: string,
  catalogueTypes: Pick<CatalogueType, "id" | "shortLabel" | "title">[],
) {
  const firstKey = normalizeCategoryValue(resolveCategoryMatchKey(firstCategory, catalogueTypes));
  const secondKey = normalizeCategoryValue(resolveCategoryMatchKey(secondCategory, catalogueTypes));

  if (!firstKey || !secondKey) return false;
  return firstKey === secondKey;
}

export function countProductsForCatalogue(
  catalogue: Pick<CatalogueType, "id" | "shortLabel" | "title">,
  products: Pick<Product, "category">[],
) {
  return products.filter((product) => categoriesMatch(product.category, getCataloguePrimaryCategoryKey(catalogue), [catalogue])).length;
}

export function findFirstProductImageForCatalogue(
  catalogue: Pick<CatalogueType, "id" | "shortLabel" | "title">,
  products: Pick<Product, "category" | "image">[],
) {
  return products.find((product) => categoriesMatch(product.category, getCataloguePrimaryCategoryKey(catalogue), [catalogue]))?.image || "";
}
