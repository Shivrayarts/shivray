import mysql from "mysql2/promise";

type MysqlGlobal = typeof globalThis & {
  __shivrayMysqlPool?: mysql.Pool;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required MySQL env: ${name}`);
  }
  return value;
}

export function getMysqlPool() {
  const g = globalThis as MysqlGlobal;
  if (g.__shivrayMysqlPool) {
    return g.__shivrayMysqlPool;
  }

  const pool = mysql.createPool({
    host: getRequiredEnv("DB_HOST"),
    user: getRequiredEnv("DB_USER"),
    password: getRequiredEnv("DB_PASSWORD"),
    database: getRequiredEnv("DB_NAME"),
    port: Number(process.env.DB_PORT ?? 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  g.__shivrayMysqlPool = pool;
  return pool;
}

