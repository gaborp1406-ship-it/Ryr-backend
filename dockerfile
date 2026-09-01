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

# --- Python para el servicio de predicción (ML) ---
RUN apk add --no-cache python3 py3-pip

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# --- Archivos del servicio de predicción (Python) ---
# Estos NO se compilan con "npm run build", por eso hay que copiarlos
# a mano a una carpeta fija dentro de la imagen final.
COPY src/modules/prediccion/api_prediccion.py ./ml/
COPY src/modules/prediccion/modelo_entrenado.joblib ./ml/
COPY src/modules/prediccion/requirements.txt ./ml/

# Entorno virtual de Python dentro de la imagen (evita el error
# "externally-managed-environment" de pip en versiones nuevas de Python)
RUN python3 -m venv /app/ml/venv \
  && /app/ml/venv/bin/pip install --no-cache-dir -r /app/ml/requirements.txt \
  && chown -R nestjs:nodejs /app/ml

USER nestjs

EXPOSE 3003

ENV NODE_ENV=production
ENV PORT=3003
# El backend usa estas dos variables para saber dónde está Python y
# dónde están api_prediccion.py + modelo_entrenado.joblib
ENV PYTHON_BIN=/app/ml/venv/bin/python3
ENV PREDICCION_DIR=/app/ml

CMD ["node", "dist/main"]