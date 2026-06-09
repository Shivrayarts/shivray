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

const siteUrl = String(
  process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    localEnv.VITE_SITE_URL ||
    localEnv.SITE_URL ||
    "https://www.shivrayart.in",
).replace(/\/+$/, "");
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
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map(
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

writeFileSync(resolve("public", "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap.xml for ${routes.length} routes.`);
