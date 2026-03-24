# Contexto de build: raiz do repositório (asgard_crm).
# Debian (não Alpine) para compilar dependências nativas (ex.: argon2).
FROM oven/bun:1
WORKDIR /app

COPY backend/api-auth/package.json backend/api-auth/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/api-auth/ .
COPY deploy/docker/entrypoint-api-auth.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
