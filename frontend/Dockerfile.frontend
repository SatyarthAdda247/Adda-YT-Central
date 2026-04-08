FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
# VITE_API_URL is passed as a build argument so it gets baked into the static bundle
ARG VITE_API_URL=https://yt-central-mind-api.adda247.com
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ── Production stage: serve with Nginx ──
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config: serve SPA, proxy /yt/* to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
