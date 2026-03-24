# Contexto de build: raiz do repositório (asgard_crm).
# URLs públicas das APIs (o browser chama estas origens; não use hostnames só internos do Docker).
ARG VITE_API_URL=http://localhost:3001
ARG VITE_API_CORE_URL=http://localhost:3002

FROM oven/bun:1 AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_API_CORE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_CORE_URL=$VITE_API_CORE_URL

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ .
RUN bun run build

FROM nginx:1.27-alpine
COPY deploy/docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
