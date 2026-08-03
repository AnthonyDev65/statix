# =====================================================
# Statix — imagen de producción (SPA estática)
# =====================================================

# ----- Stage 1: build -----
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias con la lockfile (build reproducible)
COPY package.json package-lock.json ./
RUN npm ci

# Copia el código y genera dist/
COPY . .
RUN npm run build

# ----- Stage 2: runtime (nginx) -----
FROM nginx:1.27-alpine AS runtime

# Config de nginx con fallback SPA + caché de assets
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia solo el build final
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
