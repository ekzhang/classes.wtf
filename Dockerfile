FROM node:16-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM golang:1.19 AS builder
WORKDIR /go/app
COPY . .
RUN go build

FROM redis/redis-stack-server:7.0.2-RC1 AS redis-stack

FROM redis:7-bullseye
RUN apt-get update && apt-get install -y ca-certificates && apt-get clean
COPY --from=redis-stack /opt/redis-stack/lib/redisearch.so /opt/redis-stack/lib/redisearch.so
COPY --from=redis-stack /opt/redis-stack/lib/rejson.so /opt/redis-stack/lib/rejson.so
COPY --from=builder /go/app/classes.wtf /usr/bin
COPY --from=frontend /app/frontend/dist static
ENTRYPOINT [ "classes.wtf" ]
CMD [ "server", "-static", "static", "-data", "https://s3.amazonaws.com/classes.wtf/courses.json" ]
