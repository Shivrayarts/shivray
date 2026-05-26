import mysql from "mysql2/promise";
import { env } from "./env.mjs";

let pool;
let fallbackPool;
let isUsingDevFallback = false;

function createPool(config) {
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

function canUseDevFallback() {
  return env.NODE_ENV !== "production";
}

function shouldTryFallback(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  return code === "ER_ACCESS_DENIED_ERROR" || /access denied/i.test(message);
}

function getFallbackPool() {
  if (!fallbackPool) {
    fallbackPool = createPool({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "root",
      database: "shivray_arts",
    });
  }
  return fallbackPool;
}

export function getPool() {
  if (!pool) {
    pool = createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });
  }

  return pool;
}

export async function query(sql, params = []) {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows;
  } catch (error) {
    if (!canUseDevFallback() || !shouldTryFallback(error)) {
      throw error;
    }
    const [rows] = await getFallbackPool().query(sql, params);
    if (!isUsingDevFallback) {
      isUsingDevFallback = true;
      console.warn(
        "Primary DB login failed. Using local development fallback DB (127.0.0.1/root/shivray_arts).",
      );
    }
    return rows;
  }
}

export async function withTransaction(run) {
  let connection;
  try {
    connection = await getPool().getConnection();
  } catch (error) {
    if (!canUseDevFallback() || !shouldTryFallback(error)) {
      throw error;
    }
    connection = await getFallbackPool().getConnection();
    if (!isUsingDevFallback) {
      isUsingDevFallback = true;
      console.warn(
        "Primary DB login failed. Using local development fallback DB (127.0.0.1/root/shivray_arts).",
      );
    }
  }
  try {
    await connection.beginTransaction();
    const result = await run(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
