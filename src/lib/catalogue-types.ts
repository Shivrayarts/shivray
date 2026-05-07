import type { LocalizedText } from "@/lib/language";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productsPoster from "@/assets/products-poster.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";

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

export const defaultCatalogueTypes: CatalogueType[] = [
  {
    id: "statues-catalogue",
    title: { en: "Statue Catalogue", mr: "मूर्ती कॅटलॉग" },
    shortLabel: { en: "Statues", mr: "मूर्ती" },
    description: { en: "Maharaj statues, wall pieces, premium display idols, and gifting options.", mr: "महाराज मूर्ती, भिंतीवरील कलाकृती, प्रीमियम प्रदर्शन मूर्ती आणि भेटवस्तू पर्याय." },
    image: productStatue1,
    itemCountLabel: { en: "170 products", mr: "१७० उत्पादने" },
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "weapons-catalogue",
    title: { en: "Weapon Catalogue", mr: "शस्त्र कॅटलॉग" },
    shortLabel: { en: "Weapons", mr: "शस्त्रे" },
    description: { en: "Talwar, khanjar, warrior weapons, ceremonial pieces, and display sets.", mr: "तलवारी, खंजीर, योद्धा शस्त्रे, समारंभिक वस्तू आणि प्रदर्शन संच." },
    image: productWeapon1,
    itemCountLabel: { en: "52 products", mr: "५२ उत्पादने" },
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "shield-catalogue",
    title: { en: "Shield Catalogue", mr: "ढाल कॅटलॉग" },
    shortLabel: { en: "Shields", mr: "ढाली" },
    description: { en: "Decor shields, premium heritage shields, and combo display collections.", mr: "सजावटी ढाली, प्रीमियम वारसा ढाली आणि कॉम्बो प्रदर्शन संच." },
    image: heroBanner3,
    itemCountLabel: { en: "18 products", mr: "१८ उत्पादने" },
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "dhoop-catalogue",
    title: { en: "Dhoop & Decor Catalogue", mr: "धूप आणि डेकोर कॅटलॉग" },
    shortLabel: { en: "Dhoop", mr: "धूप" },
    description: { en: "Dhoop stands, devotional decor, brass pieces, and pooja accessories.", mr: "धूप स्टँड, भक्ती सजावट, पितळी वस्तू आणि पूजेची अ‍ॅक्सेसरीज." },
    image: productDhoop1,
    itemCountLabel: { en: "34 products", mr: "३४ उत्पादने" },
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "full-catalogue",
    title: { en: "Full Catalogue", mr: "पूर्ण कॅटलॉग" },
    shortLabel: { en: "Full Range", mr: "पूर्ण संग्रह" },
    description: { en: "Complete Shivray range in one place for browsing, enquiry, and bulk selection.", mr: "ब्राउझिंग, चौकशी आणि मोठ्या निवडीसाठी संपूर्ण शिवराय संग्रह एकाच ठिकाणी." },
    image: productsPoster,
    itemCountLabel: { en: "All collections", mr: "सर्व संग्रह" },
    isActive: true,
    sortOrder: 5,
  },
];

export function getCatalogueTypeById(id: string, types: CatalogueType[] = defaultCatalogueTypes) {
  return types.find((type) => type.id === id) ?? types[types.length - 1] ?? defaultCatalogueTypes[0];
}
