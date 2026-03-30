FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.28-alpine AS runner
ENV APP_HOME=/usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d/default.conf \
  && mkdir -p /var/cache/nginx /var/run /tmp/nginx \
  && chown -R nginx:nginx /var/cache/nginx /var/run /tmp/nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist ${APP_HOME}
RUN chown -R nginx:nginx ${APP_HOME}
EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
