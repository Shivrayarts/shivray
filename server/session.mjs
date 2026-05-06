import crypto from "node:crypto";
import { env } from "./env.mjs";

export const ADMIN_SESSION_COOKIE = "shivray_admin_session";

function sign(value) {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest("base64url");
}

export function createAdminSessionToken(payload) {
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
  ).toString("base64url");

  return `${body}.${sign(body)}`;
}

export function verifyAdminSessionToken(token) {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (sign(body) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(headerValue) {
  if (!headerValue) return {};

  return headerValue.split(";").reduce((all, entry) => {
    const [name, ...rest] = entry.trim().split("=");
    if (!name) return all;
    all[name] = decodeURIComponent(rest.join("="));
    return all;
  }, {});
}

