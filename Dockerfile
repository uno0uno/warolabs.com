# Etapa 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./ 

RUN npm cache clean --force && npm install --force

COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.output/ ./.output/
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]