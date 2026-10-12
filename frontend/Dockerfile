# ---- build: static bundle ----
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Baked in at build time. "/api" is proxied to the backend by nginx below,
# so the browser only ever talks to one origin.
ARG VITE_API_BASE_URL=/api
ARG VITE_ENABLE_MERGE_EDITING=true
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENABLE_MERGE_EDITING=$VITE_ENABLE_MERGE_EDITING

RUN npm run build

# ---- runtime: nginx serving the bundle and proxying the API ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
