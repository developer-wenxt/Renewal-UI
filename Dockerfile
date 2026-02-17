FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG ANGULAR_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npx ng build --configuration=${ANGULAR_ENV} --aot --base-href=/Renewal/ --source-map=false

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/Renewal /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
