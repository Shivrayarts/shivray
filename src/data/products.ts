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

export function getProductPaymentMode(product: Pick<Product, "category" | "paymentMode">): ProductPaymentMode {
  if (product.paymentMode === "whatsapp") return "whatsapp";
  if (product.paymentMode === "razorpay") return "razorpay";
  return "razorpay";
}

export const allProducts: Product[] = [
  {
    id: "shastradhari-maharaj-coloured",
    name: { en: "Shastradhari Maharaj - Coloured", mr: "शस्त्रधारी महाराज - रंगीत" },
    price: "12500",
    image: "/assets/product-statue-1.jpg",
    galleryImages: ["/assets/product-statue-1.jpg"],
    category: "Statues",
    tag: { en: "Featured", mr: "Featured" },
    shortDescription: {
      en: "A vibrant handcrafted Maharaj idol with warrior detailing.",
      mr: "योद्धा शैलीतील तपशीलांसह तयार केलेली आकर्षक महाराज मूर्ती.",
    },
    details: {
      en: "A premium hand-finished statue crafted for collectors and devotees who value historical authenticity and intricate artistry.",
      mr: "इतिहासाची जपणूक आणि सूक्ष्म कारागिरी आवडणाऱ्या संग्राहकांसाठी व भक्तांसाठी तयार केलेली प्रीमियम हस्तकला मूर्ती.",
    },
    material: { en: "Resin with premium color finish", mr: "प्रीमियम रंग फिनिशसह रेजिन" },
    dimensions: { en: "Approx. 12 in height", mr: "सुमारे 12 इंच उंची" },
  },
  {
    id: "ashwarudh-maharaj",
    name: { en: "Ashwarudh Maharaj", mr: "अश्वारूढ महाराज" },
    price: "12850",
    image: "/assets/product-statue-2.jpeg",
    galleryImages: ["/assets/product-statue-2.jpeg"],
    category: "Statues",
    tag: { en: "Featured", mr: "Featured" },
    shortDescription: {
      en: "Mounted Maharaj sculpture with regal posture and detail.",
      mr: "राजेशाही मुद्रा आणि सूक्ष्म तपशीलांसह अश्वारूढ महाराज शिल्प.",
    },
    details: {
      en: "This heroic composition captures leadership and bravery, ideal for display in homes, offices, and heritage-themed spaces.",
      mr: "शौर्य आणि नेतृत्व दर्शवणारी ही रचना घर, कार्यालय आणि वारसा-थीम असलेल्या जागांसाठी योग्य आहे.",
    },
    material: { en: "Metal-resin composite", mr: "मेटल-रेझिन कॉम्पोझिट" },
    dimensions: { en: "Approx. 18 in height", mr: "सुमारे 18 इंच उंची" },
  },
  {
    id: "roudra-shambhu-chatrapati",
    name: { en: "Roudra Shambhu Chatrapati", mr: "रौद्र शंभू छत्रपती" },
    price: "12600",
    image: "/assets/product-statue-3.jpeg",
    galleryImages: ["/assets/product-statue-3.jpeg"],
    category: "Statues",
    tag: "",
    shortDescription: {
      en: "Powerful artistic representation inspired by Maratha valor.",
      mr: "मराठा शौर्याने प्रेरित प्रभावी कलात्मक सादरीकरण.",
    },
    details: {
      en: "Designed with sharp silhouette and expressive craftsmanship to celebrate the spirit of Chhatrapati-era heritage.",
      mr: "छत्रपतीकालीन वारशाचा आत्मा साजरा करणारी प्रभावी आकाररेषा आणि कारागिरी.",
    },
    material: { en: "Resin", mr: "रेझिन" },
    dimensions: { en: "Approx. 12 in height", mr: "सुमारे 12 इंच उंची" },
  },
  {
    id: "royal-khanjar-with-sheath",
    name: { en: "Royal Khanjar with Sheath", mr: "रॉयल खंजर विथ शीथ" },
    price: "13200",
    image: "/assets/product-weapon-1.jpeg",
    galleryImages: ["/assets/product-weapon-1.jpeg"],
    category: "Weapons",
    tag: { en: "Popular", mr: "Popular" },
    shortDescription: {
      en: "Decorative khanjar set with ornate sheath and rich finish.",
      mr: "सुंदर म्यान आणि आकर्षक फिनिशसह सजावटी खंजर सेट.",
    },
    details: {
      en: "An elegant collectible inspired by historic ceremonial daggers, balanced for visual appeal and detailed craftsmanship.",
      mr: "ऐतिहासिक समारंभिक कट्यारांपासून प्रेरित, आकर्षक आणि सूक्ष्म कारागिरी असलेला संग्रहणीय नमुना.",
    },
    material: { en: "Forged steel and decorative metalwork", mr: "फोर्ज्ड स्टील आणि सजावटी धातुकाम" },
    dimensions: { en: "Approx. 16 in length", mr: "सुमारे 16 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "vita-battle-axe",
    name: { en: "Vita (Battle Axe)", mr: "विटा (बॅटल अॅक्स)" },
    price: "12800",
    image: "/assets/product-weapon-2.jpeg",
    galleryImages: ["/assets/product-weapon-2.jpeg"],
    category: "Weapons",
    tag: "",
    shortDescription: {
      en: "Traditional battle-axe replica with warrior-era styling.",
      mr: "योद्धा काळाची झलक देणारी पारंपरिक युद्धकुऱ्हाडीची प्रतिकृती.",
    },
    details: {
      en: "A handcrafted showpiece celebrating battlefield aesthetics, made for historical decor and gifting collections.",
      mr: "ऐतिहासिक सजावट आणि भेटवस्तूंसाठी तयार केलेला युद्धकालीन सौंदर्य जपणारा हस्तकला शोपीस.",
    },
    material: { en: "Steel head with wooden handle", mr: "स्टील हेड आणि लाकडी दांडा" },
    dimensions: { en: "Approx. 24 in length", mr: "सुमारे 24 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "ceremonial-gada",
    name: { en: "Ceremonial Gada", mr: "समारंभिक गदा" },
    price: "13400",
    image: "/assets/product-weapon-3.jpeg",
    galleryImages: ["/assets/product-weapon-3.jpeg"],
    category: "Weapons",
    tag: { en: "New", mr: "New" },
    shortDescription: {
      en: "Royal ceremonial mace with engraved design language.",
      mr: "कोरीव डिझाइनसह रॉयल समारंभिक गदा.",
    },
    details: {
      en: "Crafted to evoke strength and heritage, this gada is a centerpiece artifact for premium cultural interiors.",
      mr: "शक्ती आणि वारसा दर्शवणारी ही गदा प्रीमियम सांस्कृतिक इंटेरियरसाठी मध्यवर्ती आकर्षण आहे.",
    },
    material: { en: "Brass and steel blend", mr: "पितळ आणि स्टील मिश्रण" },
    dimensions: { en: "Approx. 30 in length", mr: "सुमारे 30 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "brass-dhoop-stand",
    name: { en: "Brass Dhoop Stand", mr: "पितळी धूप स्टँड" },
    price: "12100",
    image: "/assets/product-dhoop-1.jpg",
    galleryImages: ["/assets/product-dhoop-1.jpg"],
    category: "Dhoop",
    tag: { en: "New", mr: "New" },
    shortDescription: {
      en: "Traditional brass incense stand for pooja and decor.",
      mr: "पूजा आणि सजावटीसाठी पारंपरिक पितळी धूप स्टँड.",
    },
    details: {
      en: "A durable handcrafted dhoop stand combining devotional use with elegant heritage-inspired design.",
      mr: "भक्ती आणि सुंदर वारसा-प्रेरित डिझाइन यांचा संगम असलेला टिकाऊ हस्तकला धूप स्टँड.",
    },
    material: { en: "Solid brass", mr: "घन पितळ" },
    dimensions: { en: "Approx. 6 in height", mr: "सुमारे 6 इंच उंची" },
  },
  {
    id: "maratha-war-shield",
    name: { en: "Maratha War Shield", mr: "मराठा युद्ध ढाल" },
    price: "12900",
    image: "/assets/product-shield-1.jpg",
    galleryImages: ["/assets/product-shield-1.jpg"],
    category: "Shields",
    tag: "",
    shortDescription: {
      en: "Historical style shield replica with rugged detailing.",
      mr: "रग्ड तपशीलांसह ऐतिहासिक शैलीतील ढाल प्रतिकृती.",
    },
    details: {
      en: "Designed for display and themed environments, this shield reflects traditional defensive armory motifs.",
      mr: "डिस्प्ले आणि थीम असलेल्या जागांसाठी तयार केलेली ही ढाल पारंपरिक संरक्षण कवचाची झलक देते.",
    },
    material: { en: "Wood and metal accents", mr: "लाकूड आणि धातूचे अॅक्सेंट" },
    dimensions: { en: "Approx. 20 in diameter", mr: "सुमारे 20 इंच व्यास" },
  },
  {
    id: "talwar-curved-sword",
    name: { en: "Talwar - Curved Sword", mr: "तलवार - कर्व्ड स्वॉर्ड" },
    price: "13600",
    image: "/assets/product-talwar-1.jpeg",
    galleryImages: ["/assets/product-talwar-1.jpeg"],
    category: "Weapons",
    tag: { en: "Featured", mr: "Featured" },
    shortDescription: {
      en: "Classic curved talwar inspired by Maratha battle tradition.",
      mr: "मराठा युद्धपरंपरेने प्रेरित क्लासिक कर्व्ड तलवार.",
    },
    details: {
      en: "A statement piece made with attention to blade profile, grip detail, and ceremonial display aesthetics.",
      mr: "ब्लेड प्रोफाइल, ग्रिप डिटेल आणि समारंभिक सादरीकरणाचा विचार करून तयार केलेला आकर्षक नमुना.",
    },
    material: { en: "Steel blade with crafted hilt", mr: "कोरलेल्या मुठीसह स्टील ब्लेड" },
    dimensions: { en: "Approx. 34 in length", mr: "सुमारे 34 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "saffron-straight-sword",
    name: { en: "Saffron Straight Sword", mr: "केशरी स्ट्रेट स्वॉर्ड" },
    price: "12700",
    image: "/assets/product-2-Cpp2Ti8D.jpeg",
    galleryImages: ["/assets/product-2-Cpp2Ti8D.jpeg"],
    category: "Weapons",
    tag: { en: "New", mr: "New" },
    shortDescription: {
      en: "Straight ceremonial sword with a saffron blade finish and display-ready profile.",
      mr: "केशरी फिनिशसह समारंभिक सरळ तलवार.",
    },
    details: {
      en: "A heritage-inspired sword crafted for decorative walls, collector displays, and premium gifting sets.",
      mr: "सजावटी भिंती, कलेक्टर डिस्प्ले आणि प्रीमियम गिफ्ट सेटसाठी तयार केलेली वारसा-प्रेरित तलवार.",
    },
    material: { en: "Steel blade with finished hilt", mr: "फिनिश्ड हिल्टसह स्टील ब्लेड" },
    dimensions: { en: "Approx. 30 in length", mr: "सुमारे 30 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "black-curved-talwar",
    name: { en: "Black Curved Talwar", mr: "ब्लॅक कर्व्ड तलवार" },
    price: "13100",
    image: "/assets/product-3-C820CibQ.jpeg",
    galleryImages: ["/assets/product-3-C820CibQ.jpeg"],
    category: "Weapons",
    tag: { en: "New", mr: "New" },
    shortDescription: {
      en: "Curved talwar design with dark finish and traditional warrior silhouette.",
      mr: "गडद फिनिश आणि पारंपरिक योद्धा सिल्हूटसह कर्व्ड तलवार.",
    },
    details: {
      en: "Built for heritage-themed interiors, this decorative talwar balances classic curve styling with a strong display presence.",
      mr: "वारसा-थीम असलेल्या इंटेरियरसाठी तयार केलेली ही सजावटी तलवार क्लासिक वक्र शैली आणि प्रभावी लूक देते.",
    },
    material: { en: "Forged steel with decorative grip", mr: "सजावटी ग्रिपसह फोर्ज्ड स्टील" },
    dimensions: { en: "Approx. 31 in length", mr: "सुमारे 31 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "decorated-talwar-with-sheath",
    name: { en: "Decorated Talwar with Sheath", mr: "सजावटी तलवार विथ शीथ" },
    price: "13800",
    image: "/assets/product-4-CiEPJh0Z.jpeg",
    galleryImages: ["/assets/product-4-CiEPJh0Z.jpeg"],
    category: "Weapons",
    tag: { en: "Featured", mr: "Featured" },
    shortDescription: {
      en: "Curved display talwar paired with a decorated sheath for ceremonial presentation.",
      mr: "समारंभिक सादरीकरणासाठी सजावटी म्यानासह कर्व्ड डिस्प्ले तलवार.",
    },
    details: {
      en: "Designed as a premium wall or showcase piece, this set combines vibrant sheath work with a heritage weapon form.",
      mr: "प्रीमियम वॉल किंवा शोकेस पीस म्हणून तयार केलेला हा सेट वारसा-प्रेरित शस्त्ररूप आणि सजावटी म्यान यांचा संगम आहे.",
    },
    material: { en: "Steel blade, carved grip, decorative sheath", mr: "स्टील ब्लेड, कोरलेली मुठ आणि सजावटी म्यान" },
    dimensions: { en: "Approx. 32 in length", mr: "सुमारे 32 इंच लांबी" },
    paymentMode: "whatsapp",
  },
  {
    id: "royal-straight-blade",
    name: { en: "Royal Straight Blade", mr: "रॉयल स्ट्रेट ब्लेड" },
    price: "13300",
    image: "/assets/product-5-DHYO5lNW.jpeg",
    galleryImages: ["/assets/product-5-DHYO5lNW.jpeg"],
    category: "Weapons",
    tag: { en: "Popular", mr: "Popular" },
    shortDescription: {
      en: "Long straight blade with ornate hilt detailing and a regal display look.",
      mr: "अलंकारिक मुठीसह आकर्षक आणि राजेशाही सरळ ब्लेड.",
    },
    details: {
      en: "A statement sword for collectors who want a cleaner blade line while keeping the premium Shivray presentation style.",
      mr: "स्वच्छ ब्लेड लाईन आणि प्रीमियम शिवराय सादरीकरण जपणाऱ्या संग्राहकांसाठी खास तलवार.",
    },
    material: { en: "Steel blade with engraved hilt accents", mr: "कोरीव मुठीच्या अॅक्सेंटसह स्टील ब्लेड" },
    dimensions: { en: "Approx. 33 in length", mr: "सुमारे 33 इंच लांबी" },
    paymentMode: "whatsapp",
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
