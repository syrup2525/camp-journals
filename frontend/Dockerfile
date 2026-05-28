FROM node:25-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

ENV API_BASE_URL=http://localhost:8080

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/30-generate-env.sh /docker-entrypoint.d/30-generate-env.sh
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod +x /docker-entrypoint.d/30-generate-env.sh

EXPOSE 80
