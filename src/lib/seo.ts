const SITE_URL = String(import.meta.env.VITE_SITE_URL || "https://www.shivrayart.in").replace(/\/+$/, "");

export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
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
  ensureMeta("robots").setAttribute("content", meta.robots || "index,follow");
  ensureCanonicalLink().setAttribute("href", `${SITE_URL}${meta.canonicalPath}`);
}
