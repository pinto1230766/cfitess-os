# ==============================================================================
# C.FITNESS OS v1.2 — Dockerfile Multi-Stage Optimisé pour Linux (Debian 12)
# Siège : 2 Rue Jacquard, 69120 Vaulx-en-Velin (Carré de Soie)
# Établissement secondaire : ZAC des Baterses, 01700 Beynost
# ==============================================================================
# Étape 1 : Compilation du Frontend Web / PWA (React 19 + TypeScript + Tailwind -> dist/)
# Étape 2 : Compilation du Serveur Backend natif en Rust (Axum -> cfitness-os-server)
# Étape 3 : Image finale minimale Debian 12 (bookworm-slim) sécurisée (utilisateur non-root)
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1 : Build Frontend (Vite -> dist/)
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY index.html tsconfig.json vite.config.ts metadata.json ./
COPY public ./public
COPY src ./src

RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2 : Build Backend Rust (Axum -> binaire natif Linux x86_64)
# ------------------------------------------------------------------------------
FROM rust:1.82-bookworm AS rust-builder

WORKDIR /app/backend

# Mise en cache des dépendances Cargo
COPY Cargo.toml ./
COPY src-rust ./src-rust

RUN cargo build --release --bin cfitness-os-server

# ------------------------------------------------------------------------------
# STAGE 3 : Runtime de Production Debian 12 (Bookworm Slim)
# ------------------------------------------------------------------------------
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Europe/Paris \
    PORT=3000 \
    STATIC_DIR=/opt/cfitness-os/dist \
    RUST_LOG=cfitness_os_server=info,tower_http=info

# Création d'un compte système dédié non-privilégié
RUN groupadd -r cfitness && useradd -r -g cfitness -d /opt/cfitness-os -s /sbin/nologin cfitness

WORKDIR /opt/cfitness-os

# Copie du binaire Rust compilé et des assets Frontend (dist/)
COPY --from=rust-builder /app/backend/target/release/cfitness-os-server /usr/local/bin/cfitness-os-server
COPY --from=frontend-builder /app/frontend/dist /opt/cfitness-os/dist

RUN chown -R cfitness:cfitness /opt/cfitness-os

USER cfitness

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/cfitness-os-server"]
