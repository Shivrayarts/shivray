import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function readEnvFile(fileName) {
  const filePath = resolve(fileName);
  if (!existsSync(filePath)) return {};

  const entries = {};
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }

  return entries;
}

const localEnv = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.production"),
};

const configuredSiteUrl = String(
  process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    localEnv.VITE_SITE_URL ||
    localEnv.SITE_URL ||
    "https://www.shivrayart.in",
).replace(/\/+$/, "");
const siteUrl = configuredSiteUrl.replace("https://shivrayart.in", "https://www.shivrayart.in");
const today = new Date().toISOString().slice(0, 10);

const routes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/required-catalogue", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/our-team", changefreq: "monthly", priority: "0.6" },
  { path: "/wall-of-fame", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/shipping-delivery-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/cancellation-refund-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.4" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
];

async function fetchProductRoutes() {
  try {
    const response = await fetch(`${siteUrl}/api/storefront`);
    if (!response.ok) return [];

    const payload = await response.json();
    if (!Array.isArray(payload?.products)) return [];

    return payload.products
      .map((product) => String(product?.id || "").trim())
      .filter(Boolean)
      .map((id) => ({
        path: `/products/${encodeURIComponent(id)}`,
        changefreq: "weekly",
        priority: "0.7",
      }));
  } catch (error) {
    console.warn(
      "Unable to fetch product routes for sitemap. Continuing with static routes only.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

const allRoutes = [...routes, ...(await fetchProductRoutes())];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allRoutes.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ),
  "</urlset>",
  "",
].join("\n");

const sitemapPath = resolve("public", "sitemap.xml");
const existingXml = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : null;

if (existingXml === xml) {
  console.log(`sitemap.xml already up to date for ${allRoutes.length} routes.`);
} else {
  try {
    writeFileSync(sitemapPath, xml, "utf8");
    console.log(`Generated sitemap.xml for ${allRoutes.length} routes.`);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EPERM") {
      console.warn("Unable to update sitemap.xml because the file is locked. Continuing with the existing sitemap.");
    } else {
      throw error;
    }
  }
}
