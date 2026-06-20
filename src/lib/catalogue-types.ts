import type { LocalizedText } from "@/lib/language";

type Translatable = string | LocalizedText;

export type CatalogueType = {
  id: string;
  title: Translatable;
  shortLabel: Translatable;
  description: Translatable;
  image: string;
  downloadUrl?: string;
  itemCountLabel: Translatable;
  isActive: boolean;
  sortOrder: number;
};

export const defaultCatalogueTypes: CatalogueType[] = [
  {
    id: "statues-catalogue",
    title: { en: "Statue Catalogue", mr: "मूर्ती कॅटलॉग" },
    shortLabel: { en: "Statues", mr: "Statues" },
    description: {
      en: "Maharaj statues, wall pieces, premium display idols, and gifting options.",
      mr: "महाराज मूर्ती, वॉल पीस, प्रीमियम डिस्प्ले आयडल्स आणि गिफ्टिंग पर्याय.",
    },
    image: "/assets/product-statue-1.jpg",
    itemCountLabel: { en: "170 products", mr: "170 products" },
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "weapons-catalogue",
    title: { en: "Weapon Catalogue", mr: "शस्त्र कॅटलॉग" },
    shortLabel: { en: "Weapons", mr: "Weapons" },
    description: {
      en: "Talwar, khanjar, warrior weapons, ceremonial pieces, and display sets.",
      mr: "तलवार, खंजर, योद्धा शस्त्रे, समारंभिक वस्तू आणि डिस्प्ले सेट्स.",
    },
    image: "/assets/product-weapon-1.jpeg",
    itemCountLabel: { en: "52 products", mr: "52 products" },
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "shield-catalogue",
    title: { en: "Shield Catalogue", mr: "ढाल कॅटलॉग" },
    shortLabel: { en: "Shields", mr: "Shields" },
    description: {
      en: "Decor shields, premium heritage shields, and combo display collections.",
      mr: "डेकोर ढाली, प्रीमियम वारसा ढाली आणि कॉम्बो डिस्प्ले कलेक्शन्स.",
    },
    image: "/assets/product-shield-1.jpg",
    itemCountLabel: { en: "18 products", mr: "18 products" },
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "dhoop-catalogue",
    title: { en: "Dhoop & Decor Catalogue", mr: "धूप आणि डेकोर कॅटलॉग" },
    shortLabel: { en: "Dhoop", mr: "Dhoop" },
    description: {
      en: "Dhoop stands, devotional decor, brass pieces, and pooja accessories.",
      mr: "धूप स्टँड, भक्ती सजावट, पितळी वस्तू आणि पूजा अॅक्सेसरीज.",
    },
    image: "/assets/product-dhoop-1.jpg",
    itemCountLabel: { en: "34 products", mr: "34 products" },
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "full-catalogue",
    title: { en: "Full Catalogue", mr: "पूर्ण कॅटलॉग" },
    shortLabel: { en: "Full Range", mr: "Full Range" },
    description: {
      en: "Complete Shivray range in one place for browsing, enquiry, and bulk selection.",
      mr: "ब्राउझिंग, चौकशी आणि बल्क निवडीसाठी संपूर्ण शिवराय श्रेणी एकाच ठिकाणी.",
    },
    image: "/assets/products-poster.jpg",
    itemCountLabel: { en: "All collections", mr: "All collections" },
    isActive: true,
    sortOrder: 5,
  },
];

export function getCatalogueTypeById(id: string, types: CatalogueType[] = defaultCatalogueTypes) {
  return types.find((type) => type.id === id) ?? types[types.length - 1];
}
