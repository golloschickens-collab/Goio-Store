# Reverse proxy (Traefik) — Producción

Este stack expone servicios internos vía HTTPS con certificados ACME y dashboard protegido.

## Requisitos
- DNS apuntando a la IP pública (Cloudflare recomendado):
  - traefik.goio.store → servidor (A/AAAA)
  - whoami.goio.store → servidor (A/AAAA)
  - palacio.goio.store → servidor (A/AAAA)
  - ai.goio.store → servidor (A/AAAA)
- Red Docker `edge` creada (si no existe): `docker network create edge`

## Arranque
```bash
# Levantar Traefik
cd reverse-proxy
mkdir -p letsencrypt && touch letsencrypt/acme.json && chmod 600 letsencrypt/acme.json
docker compose up -d

# Servicios de ejemplo / producción
cd ../palacio-central && docker compose up -d
cd ../ollama && docker compose up -d
```

## Seguridad
- Dashboard protegido con basic auth (cambia la credencial en labels del servicio traefik).
- HTTP redirige a HTTPS de forma global.
- Traefik sólo expone contenedores con `traefik.enable=true`.

## Pruebas
- https://whoami.goio.store debe responder con datos del contenedor.
- https://traefik.goio.store debe pedir credenciales y mostrar el dashboard.
- https://palacio.goio.store debe enrutar al servicio palacio-central.
- https://ai.goio.store debe responder el endpoint de Ollama (por ejemplo `GET /api/tags`).

## Notas
- Para Cloudflare proxy (naranja), usa ACME HTTP‑01; si hay problemas, desactiva proxy temporalmente para el primer issuance.
- Ajusta rate limits/Firewall en Cloudflare según exposición.