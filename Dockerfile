# build app
FROM node:alpine as builder

WORKDIR /app
COPY packge.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm build

# deploy built app to nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]
