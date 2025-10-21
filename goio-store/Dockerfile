#### Goio Store (Node ESM) - Multi-stage ####
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts || npm install --production

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# RUN npm run build # si aplica

FROM node:20-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=6 CMD curl -fsS http://localhost:3000/health || exit 1
CMD ["npm","run","start"]
