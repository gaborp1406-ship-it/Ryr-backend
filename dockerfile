FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# ===== Dependencies =====

FROM base AS deps

RUN npm ci

# ===== Build =====

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY src/ ./src/

RUN npm run build

# ===== Production =====

FROM node:22-alpine AS production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3003

ENV NODE_ENV=production
ENV PORT=3003

CMD ["node", "dist/main"]