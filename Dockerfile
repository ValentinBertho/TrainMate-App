# Étape 1 : Build de l'application avec pnpm et Node 22.4
FROM node:22.4 AS build

# Activer corepack (gestionnaire de package intégré dans Node) pour pnpm
RUN corepack enable

# Variables d'environnement pour pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour les dépendances
COPY package.json pnpm-lock.yaml ./

# Utiliser cache Docker pour pnpm store
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile

# Copier le reste des fichiers source
COPY . .

# Builder l'application Vite
RUN pnpm build

# Étape 2 : serveur léger avec nginx pour servir les fichiers statiques
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
