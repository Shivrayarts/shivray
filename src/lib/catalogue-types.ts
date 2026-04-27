import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productsPoster from "@/assets/products-poster.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";

export type CatalogueType = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  image: string;
  itemCountLabel: string;
  isActive: boolean;
  sortOrder: number;
};

export const defaultCatalogueTypes: CatalogueType[] = [
  {
    id: "statues-catalogue",
    title: "Statue Catalogue",
    shortLabel: "Statues",
    description: "Maharaj statues, wall pieces, premium display idols, and gifting options.",
    image: productStatue1,
    itemCountLabel: "170 products",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "weapons-catalogue",
    title: "Weapon Catalogue",
    shortLabel: "Weapons",
    description: "Talwar, khanjar, warrior weapons, ceremonial pieces, and display sets.",
    image: productWeapon1,
    itemCountLabel: "52 products",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "shield-catalogue",
    title: "Shield Catalogue",
    shortLabel: "Shields",
    description: "Decor shields, premium heritage shields, and combo display collections.",
    image: heroBanner3,
    itemCountLabel: "18 products",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "dhoop-catalogue",
    title: "Dhoop & Decor Catalogue",
    shortLabel: "Dhoop",
    description: "Dhoop stands, devotional decor, brass pieces, and pooja accessories.",
    image: productDhoop1,
    itemCountLabel: "34 products",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "full-catalogue",
    title: "Full Catalogue",
    shortLabel: "Full Range",
    description: "Complete Shivray range in one place for browsing, enquiry, and bulk selection.",
    image: productsPoster,
    itemCountLabel: "All collections",
    isActive: true,
    sortOrder: 5,
  },
];

export function getCatalogueTypeById(id: string, types: CatalogueType[] = defaultCatalogueTypes) {
  return types.find((type) => type.id === id) ?? types[types.length - 1] ?? defaultCatalogueTypes[0];
}
