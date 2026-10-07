# Astro 7 exige Node >= 22.12 (el frontend del CRM usa 20: no sirve aquí).
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Si las pruebas del chat fallan, la imagen NO se construye (y por tanto nada se despliega).
RUN npm run build && npm test

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Node solo para el servicio de chat (segundo contenedor del pod, mismo imagen). Sin dependencias de npm.
RUN apk add --no-cache nodejs
COPY --from=builder /app/dist/ /usr/share/nginx/html/
# knowledge.json lo lee el chat y NO debe servirse al público: se saca de lo que sirve nginx.
RUN mkdir -p /app/chat && mv /usr/share/nginx/html/knowledge.json /app/chat/knowledge.json
COPY --from=builder /app/chat/core.mjs /app/chat/providers.mjs /app/chat/server.mjs /app/chat/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
