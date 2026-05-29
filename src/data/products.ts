import type { Locale, LocalizedText } from "@/lib/language";
import productStatue1 from "@/assets/Products/product-2.jpeg";
import productStatue2 from "@/assets/Products/product-3.jpeg";
import productStatue3 from "@/assets/Products/product-4.jpeg";
import productWeapon1 from "@/assets/Products/product-5.jpeg";
import productWeapon2 from "@/assets/Products/product-2.jpeg";
import productWeapon3 from "@/assets/Products/product-3.jpeg";
import productDhoop1 from "@/assets/Products/product-1.png";
import productShield1 from "@/assets/Products/product-4.jpeg";
import productTalwar1 from "@/assets/Products/product-5.jpeg";
import productWeapon4 from "@/assets/Products/product-2.jpeg";
import productWeapon5 from "@/assets/Products/product-3.jpeg";
import productWeapon6 from "@/assets/Products/product-4.jpeg";
import productWeapon7 from "@/assets/Products/product-5.jpeg";

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
  Statues: { en: "Statues", mr: "मूर्ती" },
  Weapons: { en: "Weapons", mr: "शस्त्रे" },
  Shields: { en: "Shields", mr: "ढाली" },
  Dhoop: { en: "Dhoop", mr: "धूप" },
};

export function getCategoryLabel(category: ProductCategory, locale: Locale) {
  const known = categoryLabels[category];
  if (known) return known[locale];
  return category;
}

export const allProducts: Product[] = [
  {
    id: "shastradhari-maharaj-coloured",
    name: { en: "Shastradhari Maharaj - coloured", mr: "शस्त्रधारी महाराज - रंगीत" },
    price: "Rs. 12,500",
    image: productStatue1,
    category: "Statues",
    tag: { en: "Featured", mr: "विशेष" },
    shortDescription: { en: "A vibrant handcrafted Maharaj idol with warrior detailing.", mr: "योद्धा शैलीतील नक्षीसह हाताने तयार केलेली आकर्षक महाराज मूर्ती." },
    details: { en: "A premium hand-finished statue crafted for collectors and devotees who value historical authenticity and intricate artistry.", mr: "इतिहासातील अस्सलता आणि सूक्ष्म कलाकुसर जपणाऱ्या संग्राहक आणि भक्तांसाठी तयार केलेली प्रीमियम हाताने पूर्ण केलेली मूर्ती." },
    material: { en: "Resin with premium color finish", mr: "प्रीमियम रंगसंगतीसह रेझिन" },
    dimensions: { en: "Approx. 12 in height", mr: "अंदाजे १२ इंच उंची" },
  },
  {
    id: "ashwarudh-maharaj",
    name: { en: "Ashwarudh Maharaj", mr: "अश्वारूढ महाराज" },
    price: "Rs. 12,850",
    image: productStatue2,
    category: "Statues",
    tag: { en: "Featured", mr: "विशेष" },
    shortDescription: { en: "Mounted Maharaj sculpture with regal posture and detail.", mr: "राजेशाही भाव आणि देखणे तपशील असलेली अश्वारूढ महाराज शिल्पकृती." },
    details: { en: "This heroic composition captures leadership and bravery, ideal for display in homes, offices, and heritage-themed spaces.", mr: "नेतृत्व आणि शौर्य व्यक्त करणारी ही भव्य रचना घर, कार्यालय आणि वारसा-प्रेरित सजावटीसाठी उत्तम आहे." },
    material: { en: "Metal-resin composite", mr: "मेटल-रेझिन मिश्रधातू" },
    dimensions: { en: "Approx. 18 in height", mr: "अंदाजे १८ इंच उंची" },
  },
  {
    id: "roudra-shambhu-chatrapati",
    name: { en: "Roudra Shambhu Chatrapati", mr: "रौद्र शंभू छत्रपती" },
    price: "Rs. 12,600",
    image: productStatue3,
    category: "Statues",
    tag: { en: "", mr: "" },
    shortDescription: { en: "Powerful artistic representation inspired by Maratha valor.", mr: "मराठा पराक्रमातून प्रेरित प्रभावी कलात्मक साकार." },
    details: { en: "Designed with sharp silhouette and expressive craftsmanship to celebrate the spirit of Chhatrapati-era heritage.", mr: "छत्रपतींच्या कालखंडातील वारशाचा आत्मा साजरा करणारी तीक्ष्ण रचना आणि भावपूर्ण कलाकुसर." },
    material: { en: "Resin", mr: "रेझिन" },
    dimensions: { en: "Approx. 12 in height", mr: "अंदाजे १२ इंच उंची" },
  },
  {
    id: "royal-khanjar-with-sheath",
    name: { en: "Royal Khanjar with sheath", mr: "म्यानसह रॉयल खंजीर" },
    price: "Rs. 13,200",
    image: productWeapon1,
    category: "Weapons",
    tag: { en: "Popular", mr: "लोकप्रिय" },
    shortDescription: { en: "Decorative khanjar set with ornate sheath and rich finish.", mr: "सुशोभित म्यान आणि आकर्षक फिनिश असलेला सजावटी खंजीर संच." },
    details: { en: "An elegant collectible inspired by historic ceremonial daggers, balanced for visual appeal and detailed craftsmanship.", mr: "इतिहासातील समारंभिक कट्यारांपासून प्रेरित, देखण्या मांडणीसाठी संतुलित आणि तपशीलवार कलाकुसरीचा हा संग्रहणीय तुकडा." },
    material: { en: "Forged steel and decorative metalwork", mr: "घडवलेले स्टील आणि सजावटी मेटलवर्क" },
    dimensions: { en: "Approx. 16 in length", mr: "अंदाजे १६ इंच लांबी" },
  },
  {
    id: "vita-battle-axe",
    name: { en: "Vita (battle axe)", mr: "वीटा (युद्ध कुऱ्हाड)" },
    price: "Rs. 12,800",
    image: productWeapon2,
    category: "Weapons",
    tag: { en: "", mr: "" },
    shortDescription: { en: "Traditional battle-axe replica with warrior-era styling.", mr: "योद्धा काळाची झलक देणारी पारंपरिक युद्ध कुऱ्हाडीची प्रतिकृती." },
    details: { en: "A handcrafted showpiece celebrating battlefield aesthetics, made for historical decor and gifting collections.", mr: "युद्धभूमीच्या सौंदर्याची आठवण करून देणारा हाताने तयार केलेला शोपीस, ऐतिहासिक सजावट आणि भेटवस्तूसाठी योग्य." },
    material: { en: "Steel head with wooden handle", mr: "स्टील पाते आणि लाकडी दांडा" },
    dimensions: { en: "Approx. 24 in length", mr: "अंदाजे २४ इंच लांबी" },
  },
  {
    id: "ceremonial-gada",
    name: { en: "Ceremonial Gada", mr: "समारंभिक गदा" },
    price: "Rs. 13,400",
    image: productWeapon3,
    category: "Weapons",
    tag: { en: "New", mr: "नवीन" },
    shortDescription: { en: "Royal ceremonial mace with engraved design language.", mr: "कोरीव डिझाइनसह राजेशाही समारंभिक गदा." },
    details: { en: "Crafted to evoke strength and heritage, this gada is a centerpiece artifact for premium cultural interiors.", mr: "शक्ती आणि वारसा यांचा भाव जागवणारी ही गदा, सांस्कृतिक सजावटीसाठी मध्यवर्ती शोभेची वस्तू आहे." },
    material: { en: "Brass and steel blend", mr: "पितळ आणि स्टील मिश्रण" },
    dimensions: { en: "Approx. 30 in length", mr: "अंदाजे ३० इंच लांबी" },
  },
  {
    id: "brass-dhoop-stand",
    name: { en: "Brass Dhoop stand", mr: "पितळी धूप स्टँड" },
    price: "Rs. 12,100",
    image: productDhoop1,
    category: "Dhoop",
    tag: { en: "New", mr: "नवीन" },
    shortDescription: { en: "Traditional brass incense stand for pooja and decor.", mr: "पूजा आणि सजावटीसाठी पारंपरिक पितळी धूप स्टँड." },
    details: { en: "A durable handcrafted dhoop stand combining devotional use with elegant heritage-inspired design.", mr: "भक्तीमय वापर आणि सुंदर वारसा-प्रेरित रचना एकत्र करणारा टिकाऊ हाताने तयार केलेला धूप स्टँड." },
    material: { en: "Solid brass", mr: "घन पितळ" },
    dimensions: { en: "Approx. 6 in height", mr: "अंदाजे ६ इंच उंची" },
  },
  {
    id: "maratha-war-shield",
    name: { en: "Maratha war shield", mr: "मराठा युद्ध ढाल" },
    price: "Rs. 12,900",
    image: productShield1,
    category: "Shields",
    tag: { en: "", mr: "" },
    shortDescription: { en: "Historical style shield replica with rugged detailing.", mr: "खडबडीत तपशीलांसह ऐतिहासिक शैलीतील ढालीची प्रतिकृती." },
    details: { en: "Designed for display and themed environments, this shield reflects traditional defensive armory motifs.", mr: "प्रदर्शन आणि थीम-आधारित सजावटीसाठी तयार केलेली ही ढाल पारंपरिक संरक्षणात्मक शस्त्रांची झलक दाखवते." },
    material: { en: "Wood and metal accents", mr: "लाकूड आणि धातूची सजावट" },
    dimensions: { en: "Approx. 20 in diameter", mr: "अंदाजे २० इंच व्यास" },
  },
  {
    id: "talwar-curved-sword",
    name: { en: "Talwar - curved sword", mr: "तलवार - वक्र शस्त्र" },
    price: "Rs. 13,600",
    image: productTalwar1,
    category: "Weapons",
    tag: { en: "Featured", mr: "विशेष" },
    shortDescription: { en: "Classic curved talwar inspired by Maratha battle tradition.", mr: "मराठा युद्धपरंपरेतून प्रेरित पारंपरिक वक्र तलवार." },
    details: { en: "A statement piece made with attention to blade profile, grip detail, and ceremonial display aesthetics.", mr: "पात्याचा आकार, मुठीचे तपशील आणि समारंभिक मांडणी लक्षात घेऊन तयार केलेला आकर्षक शोभेचा तुकडा." },
    material: { en: "Steel blade with crafted hilt", mr: "कोरीव मुठीसह स्टीलचे पाते" },
    dimensions: { en: "Approx. 34 in length", mr: "अंदाजे ३४ इंच लांबी" },
  },
  {
    id: "saffron-straight-sword",
    name: { en: "Saffron straight sword", mr: "केशरी सरळ तलवार" },
    price: "Rs. 12,700",
    image: productWeapon4,
    category: "Weapons",
    tag: { en: "New", mr: "नवीन" },
    shortDescription: { en: "Straight ceremonial sword with a saffron blade finish and display-ready profile.", mr: "केशरी फिनिश आणि प्रदर्शनास योग्य रचनेसह सरळ समारंभिक तलवार." },
    details: { en: "A heritage-inspired sword crafted for decorative walls, collector displays, and premium gifting sets.", mr: "सजावटी भिंती, संग्राहकांची मांडणी आणि प्रीमियम भेट संचांसाठी तयार केलेली वारसा-प्रेरित तलवार." },
    material: { en: "Steel blade with finished hilt", mr: "पूर्ण केलेल्या मुठीसह स्टीलचे पाते" },
    dimensions: { en: "Approx. 30 in length", mr: "अंदाजे ३० इंच लांबी" },
  },
  {
    id: "black-curved-talwar",
    name: { en: "Black curved talwar", mr: "काळी वक्र तलवार" },
    price: "Rs. 13,100",
    image: productWeapon5,
    category: "Weapons",
    tag: { en: "New", mr: "नवीन" },
    shortDescription: { en: "Curved talwar design with dark finish and traditional warrior silhouette.", mr: "गडद फिनिश आणि पारंपरिक योद्धा आकारसहित वक्र तलवार." },
    details: { en: "Built for heritage-themed interiors, this decorative talwar balances classic curve styling with a strong display presence.", mr: "वारसा-थीम सजावटीसाठी तयार केलेली ही सजावटी तलवार पारंपरिक वक्र शैली आणि प्रभावी प्रदर्शनाचा समतोल राखते." },
    material: { en: "Forged steel with decorative grip", mr: "सजावटी मुठीसह घडवलेले स्टील" },
    dimensions: { en: "Approx. 31 in length", mr: "अंदाजे ३१ इंच लांबी" },
  },
  {
    id: "decorated-talwar-with-sheath",
    name: { en: "Decorated talwar with sheath", mr: "म्यानसह सजावटी तलवार" },
    price: "Rs. 13,800",
    image: productWeapon6,
    category: "Weapons",
    tag: { en: "Featured", mr: "विशेष" },
    shortDescription: { en: "Curved display talwar paired with a decorated sheath for ceremonial presentation.", mr: "समारंभिक सादरीकरणासाठी सजावटी म्यानसह वक्र प्रदर्शन तलवार." },
    details: { en: "Designed as a premium wall or showcase piece, this set combines vibrant sheath work with a heritage weapon form.", mr: "प्रीमियम भिंत किंवा शोकेस पीस म्हणून तयार केलेल्या या संचात रंगीत म्यान आणि वारसा-प्रेरित शस्त्ररूप यांचा सुंदर मिलाफ आहे." },
    material: { en: "Steel blade, carved grip, decorative sheath", mr: "स्टीलचे पाते, कोरीव मुठ आणि सजावटी म्यान" },
    dimensions: { en: "Approx. 32 in length", mr: "अंदाजे ३२ इंच लांबी" },
  },
  {
    id: "royal-straight-blade",
    name: { en: "Royal straight blade", mr: "रॉयल सरळ तलवार" },
    price: "Rs. 13,300",
    image: productWeapon7,
    category: "Weapons",
    tag: { en: "Popular", mr: "लोकप्रिय" },
    shortDescription: { en: "Long straight blade with ornate hilt detailing and a regal display look.", mr: "सुंदर मुठीची नक्षी आणि राजेशाही प्रदर्शनासह लांब सरळ पाते." },
    details: { en: "A statement sword for collectors who want a cleaner blade line while keeping the premium Shivray presentation style.", mr: "शिवरायच्या प्रीमियम सादरीकरण शैलीसह अधिक स्वच्छ पात्याची रेषा पसंत करणाऱ्या संग्राहकांसाठी आकर्षक तलवार." },
    material: { en: "Steel blade with engraved hilt accents", mr: "कोरलेल्या मुठीसह स्टीलचे पाते" },
    dimensions: { en: "Approx. 33 in length", mr: "अंदाजे ३३ इंच लांबी" },
  },
];

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
