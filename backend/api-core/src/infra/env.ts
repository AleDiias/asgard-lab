interface CoreEnv {
  NODE_ENV: string;
  PORT: number;
  TRUST_PROXY: boolean;
  JWT_SECRET: string;
  DATABASE_URL: string;
  CORS_ALLOWED_ORIGINS: string;
  JSON_LIMIT: string;
  REDIS_URL: string;
}

let cachedEnv: CoreEnv | null = null;

function required(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export function validateAndGetEnv(): CoreEnv {
  if (cachedEnv) return cachedEnv;

  const rawPort = process.env.PORT?.trim();
  const portNum = rawPort ? Number(rawPort) : 3002;
  if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error("PORT inválida: use um número entre 1 e 65535 (padrão api-core: 3002).");
  }

  const env: CoreEnv = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: portNum,
    TRUST_PROXY:
      process.env.TRUST_PROXY !== undefined
        ? process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY.toLowerCase() === "true"
        : (process.env.NODE_ENV ?? "development") === "production",
    JWT_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
    DATABASE_URL: required("DATABASE_URL", process.env.DATABASE_URL),
    CORS_ALLOWED_ORIGINS:
      process.env.CORS_ALLOWED_ORIGINS ??
      "http://localhost:3005,http://127.0.0.1:3005,http://demo.localhost:3005,https://*.asgardai.com.br",
    JSON_LIMIT: process.env.JSON_LIMIT ?? "1mb",
    REDIS_URL: process.env.REDIS_URL?.trim() || "redis://127.0.0.1:6379",
  };

  cachedEnv = env;
  return env;
}
