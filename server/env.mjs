import { existsSync, readFileSync } from "node:fs";

function readDotEnv(path) {
  if (!existsSync(path)) return {};

  const content = readFileSync(path, "utf8");
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const envFile = readDotEnv(".env");
const nodeEnv = process.env.NODE_ENV ?? envFile.NODE_ENV ?? "development";
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.MYSQL_URL ??
  process.env.MYSQL_PUBLIC_URL ??
  envFile.DATABASE_URL ??
  envFile.MYSQL_URL ??
  envFile.MYSQL_PUBLIC_URL ??
  "";
const parsedDatabaseUrl = (() => {
  if (!databaseUrl) return {};
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : undefined,
      user: decodeURIComponent(url.username || ""),
      password: decodeURIComponent(url.password || ""),
      database: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
    };
  } catch {
    return {};
  }
})();

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const useLocalDbDefaults = nodeEnv !== "production";

export const env = {
  ...envFile,
  ...process.env,
  DB_HOST: firstDefined(
    process.env.DB_HOST,
    process.env.MYSQLHOST,
    process.env.MYSQL_HOST,
    envFile.DB_HOST,
    envFile.MYSQLHOST,
    envFile.MYSQL_HOST,
    parsedDatabaseUrl.host,
    useLocalDbDefaults ? "127.0.0.1" : "",
  ),
  DB_PORT: optionalNumber(firstDefined(
    process.env.DB_PORT,
    process.env.MYSQLPORT,
    process.env.MYSQL_PORT,
    envFile.DB_PORT,
    envFile.MYSQLPORT,
    envFile.MYSQL_PORT,
    parsedDatabaseUrl.port,
    useLocalDbDefaults ? 3306 : undefined,
  )),
  DB_USER: firstDefined(
    process.env.DB_USER,
    process.env.MYSQLUSER,
    process.env.MYSQL_USER,
    envFile.DB_USER,
    envFile.MYSQLUSER,
    envFile.MYSQL_USER,
    parsedDatabaseUrl.user,
    useLocalDbDefaults ? "root" : "",
  ),
  DB_PASSWORD: firstDefined(
    process.env.DB_PASSWORD,
    process.env.MYSQLPASSWORD,
    process.env.MYSQL_PASSWORD,
    envFile.DB_PASSWORD,
    envFile.MYSQLPASSWORD,
    envFile.MYSQL_PASSWORD,
    parsedDatabaseUrl.password,
    "",
  ),
  DB_NAME: firstDefined(
    process.env.DB_NAME,
    process.env.MYSQLDATABASE,
    process.env.MYSQL_DATABASE,
    envFile.DB_NAME,
    envFile.MYSQLDATABASE,
    envFile.MYSQL_DATABASE,
    parsedDatabaseUrl.database,
    useLocalDbDefaults ? "shivray_arts" : "",
  ),
  PORT: Number(process.env.PORT ?? envFile.PORT ?? 3001),
  SESSION_SECRET:
    process.env.SESSION_SECRET ??
    envFile.SESSION_SECRET ??
    "shivray-change-this-session-secret",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? envFile.ADMIN_EMAIL ?? "admin@shivray.local",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? envFile.ADMIN_PASSWORD ?? "Admin@123",
  GOOGLE_CLIENT_ID:
    process.env.GOOGLE_CLIENT_ID ??
    envFile.GOOGLE_CLIENT_ID ??
    process.env.VITE_GOOGLE_CLIENT_ID ??
    envFile.VITE_GOOGLE_CLIENT_ID ??
    "",
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    envFile.CORS_ORIGIN ??
    "https://shivrayart.in,https://www.shivrayart.in",
  PRIVYR_WEBHOOK_URL: process.env.PRIVYR_WEBHOOK_URL ?? envFile.PRIVYR_WEBHOOK_URL ?? "",
  CONTACT_FORM_API_KEY: process.env.CONTACT_FORM_API_KEY ?? envFile.CONTACT_FORM_API_KEY ?? "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? envFile.RAZORPAY_KEY_ID ?? "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? envFile.RAZORPAY_KEY_SECRET ?? "",
  NODE_ENV: nodeEnv,
};

export function hasDatabaseConfig() {
  return Boolean(env.DB_HOST && env.DB_USER && env.DB_NAME);
}
