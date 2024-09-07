FROM node:18-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM golang:1.22-bookworm AS builder
WORKDIR /go/app
COPY . .
RUN go build -buildvcs=false

FROM redis/redis-stack-server:7.0.6-RC8 AS redis-stack

FROM redis:7.0-bookworm
RUN ln -sf /bin/bash /bin/sh
RUN apt-get update && apt-get install -y ca-certificates procps && apt-get clean
COPY --from=redis-stack /opt/redis-stack/lib/redisearch.so /opt/redis-stack/lib/redisearch.so
COPY --from=redis-stack /opt/redis-stack/lib/rejson.so /opt/redis-stack/lib/rejson.so
COPY --from=builder /go/app/classes.wtf /usr/bin
COPY --from=frontend /app/frontend/dist static
# Install ~5 GB swap space on Fly.io: see https://community.fly.io/t/swap-memory/2749
CMD if [[ ! -z "$SWAP" ]]; then \
    fallocate -l $(($(stat -f -c "(%a*%s/10)*7" .))) _swapfile && \
    mkswap _swapfile && swapon _swapfile && ls -hla; \
    fi; \
    free -m; \
    classes.wtf server -static static -data https://s3.amazonaws.com/classes.wtf/courses.json
