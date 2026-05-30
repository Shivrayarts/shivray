import type { LocalizedText } from "@/lib/language";

type Translatable = string | LocalizedText;

export type CatalogueType = {
  id: string;
  title: Translatable;
  shortLabel: Translatable;
  description: Translatable;
  image: string;
  itemCountLabel: Translatable;
  isActive: boolean;
  sortOrder: number;
};

export const defaultCatalogueTypes: CatalogueType[] = [];

export function getCatalogueTypeById(id: string, types: CatalogueType[] = defaultCatalogueTypes) {
  return types.find((type) => type.id === id) ?? types[types.length - 1];
}
