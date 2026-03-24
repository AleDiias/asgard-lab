import { config, parse } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Carrega `.env` da pasta `api-core` e, se `JWT_SECRET` ainda faltar,
 * tenta o `.env` da `api-auth` (mesmo monorepo) para desenvolvimento local.
 */
const srcDir = dirname(fileURLToPath(import.meta.url));
const apiCoreRoot = join(srcDir, "..");
const localEnvPath = join(apiCoreRoot, ".env");
const authEnvPath = join(apiCoreRoot, "..", "api-auth", ".env");

if (existsSync(localEnvPath)) {
  config({ path: localEnvPath });
}

/** Não herdar da api-auth — evita `PORT=3001` na api-core. */
const AUTH_ENV_KEYS_SKIP = new Set(["PORT"]);

if (!process.env.JWT_SECRET?.trim() && existsSync(authEnvPath)) {
  const parsed = parse(readFileSync(authEnvPath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (AUTH_ENV_KEYS_SKIP.has(key)) continue;
    const current = process.env[key];
    if (current === undefined || current === "") {
      process.env[key] = value;
    }
  }
}
