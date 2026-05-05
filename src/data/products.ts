import productStatue1 from "@/assets/product-statue-1.jpg";
import productStatue2 from "@/assets/product-statue-2.jpg";
import productStatue3 from "@/assets/product-statue-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import productWeapon2 from "@/assets/product-weapon-2.jpg";
import productWeapon3 from "@/assets/product-weapon-3.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productShield1 from "@/assets/product-shield-1.jpg";
import productTalwar1 from "@/assets/product-talwar-1.jpg";
import productWeapon4 from "@/assets/Products/product-2.jpeg";
import productWeapon5 from "@/assets/Products/product-3.jpeg";
import productWeapon6 from "@/assets/Products/product-4.jpeg";
import productWeapon7 from "@/assets/Products/product-5.jpeg";

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: "Statues" | "Weapons" | "Shields" | "Dhoop";
  tag: string;
  shortDescription: string;
  details: string;
  material: string;
  dimensions: string;
};

export const productCategories = [
  "Statues",
  "Weapons",
  "Shields",
  "Dhoop",
] as const;

export const allProducts: Product[] = [
  {
    id: "shastradhari-maharaj-coloured",
    name: "Shastradhari maharaj - coloured",
    price: "Rs. 5,100",
    image: productStatue1,
    category: "Statues",
    tag: "Featured",
    shortDescription: "A vibrant handcrafted Maharaj idol with warrior detailing.",
    details:
      "A premium hand-finished statue crafted for collectors and devotees who value historical authenticity and intricate artistry.",
    material: "Resin with premium color finish",
    dimensions: "Approx. 12 in height",
  },
  {
    id: "ashwarudh-maharaj",
    name: "Ashwarudh maharaj",
    price: "Rs. 12,850",
    image: productStatue2,
    category: "Statues",
    tag: "Featured",
    shortDescription: "Mounted Maharaj sculpture with regal posture and detail.",
    details:
      "This heroic composition captures leadership and bravery, ideal for display in homes, offices, and heritage-themed spaces.",
    material: "Metal-resin composite",
    dimensions: "Approx. 18 in height",
  },
  {
    id: "roudra-shambhu-chatrapati",
    name: "Roudra shambhu chatrapati",
    price: "Rs. 5,100",
    image: productStatue3,
    category: "Statues",
    tag: "",
    shortDescription: "Powerful artistic representation inspired by Maratha valor.",
    details:
      "Designed with sharp silhouette and expressive craftsmanship to celebrate the spirit of Chhatrapati-era heritage.",
    material: "Resin",
    dimensions: "Approx. 12 in height",
  },
  {
    id: "royal-khanjar-with-sheath",
    name: "Royal khanjar with sheath",
    price: "Rs. 8,500",
    image: productWeapon1,
    category: "Weapons",
    tag: "Popular",
    shortDescription: "Decorative khanjar set with ornate sheath and rich finish.",
    details:
      "An elegant collectible inspired by historic ceremonial daggers, balanced for visual appeal and detailed craftsmanship.",
    material: "Forged steel and decorative metalwork",
    dimensions: "Approx. 16 in length",
  },
  {
    id: "vita-battle-axe",
    name: "Vita (battle axe)",
    price: "Rs. 6,200",
    image: productWeapon2,
    category: "Weapons",
    tag: "",
    shortDescription: "Traditional battle-axe replica with warrior-era styling.",
    details:
      "A handcrafted showpiece celebrating battlefield aesthetics, made for historical decor and gifting collections.",
    material: "Steel head with wooden handle",
    dimensions: "Approx. 24 in length",
  },
  {
    id: "ceremonial-gada",
    name: "Ceremonial gada",
    price: "Rs. 9,800",
    image: productWeapon3,
    category: "Weapons",
    tag: "New",
    shortDescription: "Royal ceremonial mace with engraved design language.",
    details:
      "Crafted to evoke strength and heritage, this gada is a centerpiece artifact for premium cultural interiors.",
    material: "Brass and steel blend",
    dimensions: "Approx. 30 in length",
  },
  {
    id: "brass-dhoop-stand",
    name: "Brass dhoop stand",
    price: "Rs. 2,200",
    image: productDhoop1,
    category: "Dhoop",
    tag: "New",
    shortDescription: "Traditional brass incense stand for pooja and decor.",
    details:
      "A durable handcrafted dhoop stand combining devotional use with elegant heritage-inspired design.",
    material: "Solid brass",
    dimensions: "Approx. 6 in height",
  },
  {
    id: "maratha-war-shield",
    name: "Maratha war shield",
    price: "Rs. 7,500",
    image: productShield1,
    category: "Shields",
    tag: "",
    shortDescription: "Historical style shield replica with rugged detailing.",
    details:
      "Designed for display and themed environments, this shield reflects traditional defensive armory motifs.",
    material: "Wood and metal accents",
    dimensions: "Approx. 20 in diameter",
  },
  {
    id: "talwar-curved-sword",
    name: "Talwar - curved sword",
    price: "Rs. 11,000",
    image: productTalwar1,
    category: "Weapons",
    tag: "Featured",
    shortDescription: "Classic curved talwar inspired by Maratha battle tradition.",
    details:
      "A statement piece made with attention to blade profile, grip detail, and ceremonial display aesthetics.",
    material: "Steel blade with crafted hilt",
    dimensions: "Approx. 34 in length",
  },
  {
    id: "saffron-straight-sword",
    name: "Saffron straight sword",
    price: "Rs. 6,800",
    image: productWeapon4,
    category: "Weapons",
    tag: "New",
    shortDescription: "Straight ceremonial sword with a saffron blade finish and display-ready profile.",
    details:
      "A heritage-inspired sword crafted for decorative walls, collector displays, and premium gifting sets.",
    material: "Steel blade with finished hilt",
    dimensions: "Approx. 30 in length",
  },
  {
    id: "black-curved-talwar",
    name: "Black curved talwar",
    price: "Rs. 7,400",
    image: productWeapon5,
    category: "Weapons",
    tag: "New",
    shortDescription: "Curved talwar design with dark finish and traditional warrior silhouette.",
    details:
      "Built for heritage-themed interiors, this decorative talwar balances classic curve styling with a strong display presence.",
    material: "Forged steel with decorative grip",
    dimensions: "Approx. 31 in length",
  },
  {
    id: "decorated-talwar-with-sheath",
    name: "Decorated talwar with sheath",
    price: "Rs. 9,500",
    image: productWeapon6,
    category: "Weapons",
    tag: "Featured",
    shortDescription: "Curved display talwar paired with a decorated sheath for ceremonial presentation.",
    details:
      "Designed as a premium wall or showcase piece, this set combines vibrant sheath work with a heritage weapon form.",
    material: "Steel blade, carved grip, decorative sheath",
    dimensions: "Approx. 32 in length",
  },
  {
    id: "royal-straight-blade",
    name: "Royal straight blade",
    price: "Rs. 8,200",
    image: productWeapon7,
    category: "Weapons",
    tag: "Popular",
    shortDescription: "Long straight blade with ornate hilt detailing and a regal display look.",
    details:
      "A statement sword for collectors who want a cleaner blade line while keeping the premium Shivray presentation style.",
    material: "Steel blade with engraved hilt accents",
    dimensions: "Approx. 33 in length",
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
        typeof item.name === "string" &&
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
