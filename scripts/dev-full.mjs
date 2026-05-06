import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const REQUIRED_VARS = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
function getSpawnSafeEnv(envObj) {
  const out = {};
  for (const [key, value] of Object.entries(envObj)) {
    // Windows may include special per-drive vars like "=C:" which break spawn.
    if (!key || key.startsWith("=") || value == null) continue;
    out[key] = String(value);
  }
  return out;
}

function readDotEnv(path) {
  if (!existsSync(path)) return {};

  const content = readFileSync(path, "utf8");
  const vars = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    vars[key] = value;
  }

  return vars;
}

const envFromFile = readDotEnv(".env");
const resolvedEnv = { ...envFromFile, ...process.env };
const missing = REQUIRED_VARS.filter((name) => !resolvedEnv[name]);

if (missing.length > 0) {
  console.error("Missing required DB env vars:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  console.error("\nCreate or update .env before running dev:full.");
  process.exit(1);
}

if (process.argv.includes("--check")) {
  console.log("DB env check passed.");
  console.log("Check mode complete.");
  process.exit(0);
}

console.log("DB env check passed. Starting frontend + backend dev server...\n");

const resolvedSpawnEnv = getSpawnSafeEnv({
  ...process.env,
  ...envFromFile,
});

const extraArgs = process.argv.slice(2);

function spawnScript(scriptName, args = []) {
  if (process.platform === "win32") {
    return spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `npm run ${scriptName}`], {
      stdio: "inherit",
      env: resolvedSpawnEnv,
    });
  }

  return spawn("npm", ["run", scriptName, ...args], {
    stdio: "inherit",
    env: resolvedSpawnEnv,
  });
}

const serverChild = spawnScript("dev:server");
const clientChild = spawnScript("dev", extraArgs);

function shutdown(code = 0) {
  for (const child of [serverChild, clientChild]) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

serverChild.on("exit", (code) => shutdown(code ?? 0));
clientChild.on("exit", (code) => shutdown(code ?? 0));
