# Contexto de build: raiz do repositório (asgard_crm).
FROM oven/bun:1
WORKDIR /app

COPY backend/api-core/package.json backend/api-core/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/api-core/ .

ENV NODE_ENV=production
EXPOSE 3002
CMD ["bun", "run", "src/server.ts"]
