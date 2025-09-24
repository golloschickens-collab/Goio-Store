# Servicios systemd y Webhooks/MÃ©tricas

## Archivos
- `palacio-worker.service`: worker continuo que ejecuta la cola periÃ³dicamente.
- `palacio-webhooks.service`: servidor HTTP con `/webhook/task`, `/health`, `/metrics`.

## InstalaciÃ³n
```bash
sudo cp /srv/apps/palacio-central/scripts/systemd/palacio-*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable palacio-worker palacio-webhooks
sudo systemctl start palacio-worker palacio-webhooks
sudo systemctl status palacio-worker palacio-webhooks
```

Edita variables (tokens, puertos) en los unit files si es necesario y reinicia.

## Variables de entorno
- WORKER_INTERVAL_MS (ms)
- TASK_MAX_RETRIES (por defecto 3)
- TASK_BASE_BACKOFF_MS (ms, backoff exponencial; por defecto 30000)
- PORT (por defecto 3002)
- API_TOKEN (requerido para POST /webhook/task si se define)
- METRICS_TOKEN (requerido para GET /metrics si se define)

## Pruebas rÃ¡pidas
```bash
curl -s http://127.0.0.1:3002/health | jq .
curl -s -H "Authorization: Bearer <METRICS_TOKEN>" http://127.0.0.1:3002/metrics
curl -s -X POST \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"tema":"Desde webhook","unidad":"Eco Eterno"}' \
  http://127.0.0.1:3002/webhook/task
```

## Nginx (opcional)
Proxy y control de acceso:
```
location /palacio/ {
  proxy_pass http://127.0.0.1:3002/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```
