import cors, { type CorsOptions } from "cors";
import rateLimit from "express-rate-limit";

function parseOrigins(originsRaw: string): string[] {
  return originsRaw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

export function createCorsOptions(originsRaw: string, isProduction: boolean): CorsOptions {
  const configuredOrigins = parseOrigins(originsRaw);
  const regexOrigins = configuredOrigins
    .filter((origin) => origin.includes("*"))
    .map((origin) => wildcardToRegex(origin));
  const exactOrigins = new Set(configuredOrigins.filter((origin) => !origin.includes("*")));

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const matchByExact = exactOrigins.has(origin);
      const matchByRegex = regexOrigins.some((regex) => regex.test(origin));
      const matchByLocalhost = /^https?:\/\/([a-z0-9-]+\.)?localhost(:\d+)?$/i.test(origin);

      if (matchByExact || matchByRegex || (!isProduction && matchByLocalhost)) {
        return callback(null, true);
      }

      callback(new Error("Origem não permitida por política de CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Domain"],
  };
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Muitas requisições. Tente novamente em alguns minutos." },
  },
});

export { cors };
