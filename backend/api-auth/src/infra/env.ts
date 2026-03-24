interface SecurityEnv {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  CORS_ALLOWED_ORIGINS: string;
  JSON_LIMIT: string;
  ASGARD_SEED_EMAIL: string;
  ASGARD_SEED_PASSWORD: string;
  ASGARD_SEED_NAME: string;
}

let cachedEnv: SecurityEnv | null = null;

function required(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export function validateAndGetEnv(): SecurityEnv {
  if (cachedEnv) return cachedEnv;

  const env: SecurityEnv = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT ?? "3001"),
    JWT_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
    DATABASE_URL: required("DATABASE_URL", process.env.DATABASE_URL),
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3005",
    CORS_ALLOWED_ORIGINS:
      process.env.CORS_ALLOWED_ORIGINS ??
      "http://localhost:3005,http://127.0.0.1:3005,http://demo.localhost:3005,https://*.asgardai.com.br",
    JSON_LIMIT: process.env.JSON_LIMIT ?? "1mb",
    ASGARD_SEED_EMAIL:
      process.env.ASGARD_SEED_EMAIL ?? "administrador@asgardai.com.br",
    ASGARD_SEED_PASSWORD:
      process.env.ASGARD_SEED_PASSWORD ?? "SenhaAdminInicial123",
    ASGARD_SEED_NAME: process.env.ASGARD_SEED_NAME ?? "Administrador",
  };

  cachedEnv = env;
  return env;
}
