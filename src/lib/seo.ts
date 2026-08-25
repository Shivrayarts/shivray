const SITE_URL = String(import.meta.env.VITE_SITE_URL || "https://www.shivrayart.in").replace(/\/+$/, "");
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/storefront/banner-banner-1784840579566.webp`;
const DEFAULT_KEYWORDS = [
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
  "Chatrapati Shivaji maharaj",
  "Royal Maratha",
  "Damascus blead",
  "Gomukhi talwar",
  "Bhavani talwar",
  "Sward",
  "Decorative sward",
  "Wedding sward",
  "Sambhumudra",
  "Raygad",
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
