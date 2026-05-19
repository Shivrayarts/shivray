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

export const env = {
  ...envFile,
  ...process.env,
  DB_HOST: process.env.DB_HOST ?? envFile.DB_HOST ?? "127.0.0.1",
  DB_PORT: Number(process.env.DB_PORT ?? envFile.DB_PORT ?? 3306),
  DB_USER: process.env.DB_USER ?? envFile.DB_USER ?? "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? envFile.DB_PASSWORD ?? "",
  DB_NAME: process.env.DB_NAME ?? envFile.DB_NAME ?? "shivray_arts",
  PORT: Number(process.env.PORT ?? envFile.PORT ?? 3001),
  SESSION_SECRET:
    process.env.SESSION_SECRET ??
    envFile.SESSION_SECRET ??
    "shivray-change-this-session-secret",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? envFile.ADMIN_EMAIL ?? "admin@shivray.local",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? envFile.ADMIN_PASSWORD ?? "Admin@123",
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    envFile.CORS_ORIGIN ??
    "https://shivrayart.in,https://www.shivrayart.in",
  PRIVYR_WEBHOOK_URL: process.env.PRIVYR_WEBHOOK_URL ?? envFile.PRIVYR_WEBHOOK_URL ?? "",
  NODE_ENV: process.env.NODE_ENV ?? envFile.NODE_ENV ?? "development",
};

export function hasDatabaseConfig() {
  return Boolean(env.DB_HOST && env.DB_USER && env.DB_NAME);
}
