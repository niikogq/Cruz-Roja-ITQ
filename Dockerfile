# Etapa 1: build del frontend
FROM node:20-slim AS build-frontend
WORKDIR /app

# Copiar y construir frontend
COPY cruz-roja-app/package*.json ./cruz-roja-app/
WORKDIR /app/cruz-roja-app
RUN npm install
COPY cruz-roja-app/ .
RUN npm run build

# Etapa 2: backend + frontend build
FROM node:20-slim AS backend
WORKDIR /app

# Copiar y preparar backend
COPY cruz-roja-importador/package*.json ./cruz-roja-importador/
WORKDIR /app/cruz-roja-importador
RUN npm install --omit=dev

# Copiar código backend
COPY cruz-roja-importador/ .

# Copiar build de React al backend
# Queda en /app/cruz-roja-importador/build
COPY --from=build-frontend /app/cruz-roja-app/build ./build

# Variables para Cloud Run
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/server.js"]
