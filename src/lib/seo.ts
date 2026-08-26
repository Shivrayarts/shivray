const SITE_URL = String(import.meta.env.VITE_SITE_URL || "https://www.shivrayart.in").replace(/\/+$/, "");
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/storefront/banner-banner-1784840579566.webp`;
const DEFAULT_KEYWORDS = [
  "Shivray Art and Handcraft",
  "Shivray Art Pune",
  "Shivrayart.in",
  "Shivray Art Dhanakwadi Pune",
  "Contact for Booking 75 58 58 58 58",
  "Pune 43",
  "Pune",
  "Mumbai",
  "Maharashtra",
  "Marathi",
  "Shivaji Maharaj",
  "Chhatrapati Shivaji Maharaj",
  "Chatrapati Shivaji maharaj",
  "Sambhaji Maharaj",
  "Maharaj",
  "Maratha",
  "Maratha weapons",
  "Shashtra weapons",
  "Shastra weapons",
  "Bhagwa",
  "Baghawa",
  "Raigad",
  "Raygad",
  "Rajyabhishek",
  "Bhavani Talwar",
  "Dhop Talwar",
  "Maharaj Dhop Talwar",
  "Maharaj Bhavani Talwar",
  "Maharashtra",
  "studio",
  "arts gallery",
  "history",
  "gadkille",
  "sale",
  "gift house",
  "Dhankawadi",
  "SambhajiMaharaj",
  "Shivray Arts",
  "ShivrayArt.in",
  "Premium Maratha Weapons",
  "Handmade Maratha Weapons",
  "Historical Weapon Replicas",
  "Indian Weapon Replicas",
  "Shivaji Maharaj Collection",
  "Maratha Heritage",
  "Maratha Dhop",
  "Dandpatta",
  "Patta Sword",
  "Vijaynagar Patta",
  "Gurj",
  "Mace",
  "Spear",
  "Katar",
  "Jambiya",
  "Shield",
  "Dhal",
  "Mavala Armor",
  "Maratha Armor",
  "Historical Shields",
  "Engraved Sword",
  "Damascus Blade",
  "Silver Wire Work",
  "ramraje",
  "rajaram",
  "Gold Wire Work",
  "Premium Threadwork",
  "Customized Engraving",
  "sahuraje",
  "Shivaji Maharaj Photo Frame",
  "rudra",
  "Shivaji Maharaj Statue",
  "Shivaji Maharaj Wall Decor",
  "Historical Decor",
  "Warrior Collection",
  "Shivray Arts Maharashtra",
  "Shivray Arts India",
  "Premium Handicrafts",
  "Heritage Art",
  "Indian Craftsmanship",
  "Custom Engraving",
  "Premium Collectibles",
  "Gift for History Lovers",
  "Maratha Culture",
  "Swarajya",
  "Marathi Heritage",
  "शिवराय आर्ट्स",
  "मराठा शस्त्रे",
  "शिवकालीन शस्त्रे",
  "ऐतिहासिक शस्त्रे",
  "छत्रपती शिवाजी महाराज",
  "छत्रपती संभाजी महाराज",
  "मराठा वारसा",
  "दांडपट्टा",
  "ढोप",
  "गुरज",
  "तलवार",
  "ढाल",
  "भाला",
  "मावळा",
  "हस्तकला",
  "चांदीच्या तारेचे नक्षीकाम",
  "सोन्याच्या तारेचे नक्षीकाम",
  "शिवाजी महाराज फोटो फ्रेम",
  "शिवरायांची प्रतिमा",
  "महाराष्ट्र हस्तकला",
  "स्वराज्य",
  "मराठी संस्कृती",
  "ऐतिहासिक कलाकृती",
  "प्रीमियम कलाकुसर",
  "मराठा इतिहास",
  "शिवप्रेमी",
  "इतिहासप्रेमी",
  "संग्रहणीय वस्तू",
  "राजेशाही भेटवस्तू",
  "Bhanavani talwar",
  "Shivray",
  "Rayari",
  "Dhop Talwar",
  "Saral talwar",
  "Talwar",
  "Tulja bhavani talwar",
  "Pratapgad",
  "Shivpratap",
  "Maratha",
  "Maratha warrior",
  "Rajmudra talwar",
  "Rajmudra",
  "Shivaji maharaj",
  "Sambhaji maharaj",
  "Sambhuraje",
  "Dhop Talwar near me",
  "Rayari arts",
  "Maratha arsenal",
  "Surmukhi talwar",
  "Tega",
  "Khanda",
  "Katyar",
  "Patta",
  "Bhala",
  "Waghnakh",
  "Waghnakhya",
  "Bitchwa",
  "Chinalam",
  "Royal Maratha",
  "Damascus blead",
  "Gomukhi talwar",
  "Bhavani talwar",
  "Sward",
  "Decorative sward",
  "Wedding sward",
  "Sambhumudra",
  "Rudra arts",
  "Atak killa",
  "Rajput",
  "Baghat Singh",
  "Dagadushet",
  "Pune",
  "Talwar Pune",
  "Arms",
  "Baji Pasalkar",
  "Hirohito Indalkar",
  "Talwar factory",
  "Veerbhadra Talwar",
  "Wedding talwar",
  "Indian talwar",
  "Agni veer talwar",
  "Sirohi talwar",
  "Rajwada talwar",
  "Rajwada",
  "Punjabi sward",
  "Sultan Talwar",
  "Maharana Pratap talwar",
  "Shivaji maharaj talwar",
  "Sambhaji maharaj talwar",
  "Gold talwar",
  "Talwar but online",
  "Silver work talwar",
  "Rantnajadit talwar",
  "Talwar price",
  "Dhop Talwar buy online",
  "Maratha Dhop Talwar for sale",
  "Dhop Talwar handle",
  "Dhop Talwar Pune",
  "Maratha Dhop Talwar buy online",
  "Maratha Dhop Talwar price",
  "Maratha Dhop Talwar r",
  "Dhop Talwar shop near me",
  "Jagdamba talwar",
  "Jagdamba talwar photo",
  "Jagdamba talwar Khute ahe",
  "Jagdamba talwar original",
  "Jagdamba talwar in London",
  "Shivaji maharaj Jagdamba talwar",
  "#pune",
  "#shivajimaharaj",
  "#mumbai",
  "#marathi",
  "#maharashtra",
].join(", ");

export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  keywords?: string;
  image?: string;
  type?: string;
};

function ensureMeta(name: string) {
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  return meta;
}

function ensurePropertyMeta(property: string) {
  let meta = document.head.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  return meta;
}

function ensureCanonicalLink() {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  return link;
}

export function applySeoMeta(meta: SeoMeta) {
  if (typeof document === "undefined") return;

  document.title = meta.title;
  ensureMeta("description").setAttribute("content", meta.description);
  ensureMeta("keywords").setAttribute("content", meta.keywords || DEFAULT_KEYWORDS);
  ensureMeta("robots").setAttribute("content", meta.robots || "index,follow");
  const canonicalUrl = `${SITE_URL}${meta.canonicalPath}`;
  const image = meta.image || DEFAULT_OG_IMAGE;
  const type = meta.type || "website";

  ensureCanonicalLink().setAttribute("href", canonicalUrl);
  ensurePropertyMeta("og:title").setAttribute("content", meta.title);
  ensurePropertyMeta("og:description").setAttribute("content", meta.description);
  ensurePropertyMeta("og:type").setAttribute("content", type);
  ensurePropertyMeta("og:url").setAttribute("content", canonicalUrl);
  ensurePropertyMeta("og:site_name").setAttribute("content", "Shivray Art");
  ensurePropertyMeta("og:image").setAttribute("content", image);
  ensureMeta("twitter:card").setAttribute("content", "summary_large_image");
  ensureMeta("twitter:title").setAttribute("content", meta.title);
  ensureMeta("twitter:description").setAttribute("content", meta.description);
  ensureMeta("twitter:image").setAttribute("content", image);
}
