# Auditoría FinOps/SRE en Hetzner (solo lectura)

Encargo listo para usar con tu agente (GPT) para detectar ahorros del 20–40% sin degradar estabilidad ni seguridad. Trabaja en dos fases: 1) Descubrimiento read‑only, 2) Recomendaciones y plan de acción con estimación de ahorro y riesgo.

---

## Rol y objetivo
- Actúa como auditor FinOps + SRE.
- Prioriza ahorro del 20–40% manteniendo estabilidad, seguridad y SLOs.
- Fases: 1) Descubrimiento 100% read‑only, 2) Recomendaciones + plan (con €/% ahorro y riesgo/rollback).
- Pide aprobación explícita antes de aplicar cambios.

## Contexto
- Host: Ubuntu 22.04, Docker CE + Compose v2, Traefik como reverse proxy.
- Servicios: goio-store, palacio-central (incluye Ollama), gollos-landing, eco-eterno.
- DNS/CDN: Cloudflare posible. Meta: optimizar cómputo, almacenamiento, red y logging.

## Entradas que debes solicitar (si faltan)
- Acceso SSH read‑only (host/IP, usuario, puerto, llave/clave) para inspección.
- (Opcional) Token Hetzner Cloud (hcloud) y proyecto para inventario de recursos.
- Presupuesto objetivo/mes y umbral de riesgo aceptable (SLOs básicos).

### Checklist rápida: datos a compartir
- Host/IP, puerto, usuario SSH y llave pública (idealmente sin contraseña).
- Ventana operativa y alcance (solo lectura hasta “APROBADO”).
- Estado de backups automáticos/snapshots y su cadencia (ojo con +20% del coste si están activos).
- Lista de servicios/puertos relevantes (palacio-central, goio-store, gollos-landing, eco-eterno; 80/443 Traefik).
- Cloudflare/DNS: modo proxy (nube naranja) y dominios.
- Presupuesto objetivo y límites de riesgo (SLOs/SLA).
- Opcional: token hcloud y proyecto para listar recursos.

## Reglas de seguridad
- No ejecutes acciones destructivas ni cambios de configuración sin aprobación (“APROBADO”).
- Si detectas riesgo alto, notifícalo y espera instrucciones.

---

## Plan de trabajo (descubrimiento read‑only)
1) Inventario de recursos/costes (Hetzner)
- Si hay hcloud: servidores (tipo CX/CPX/CAX), vCPU/RAM, volúmenes, snapshots, floating IPs, load balancers, imágenes, tráfico.
- Estimar coste mensual por recurso; marcar volúmenes/snapshots huérfanos, recursos infrautilizados.

2) Uso del host y contenedores
- CPU/memoria/load average; swap; top procesos.
- Disco: particiones; carpetas y volúmenes Docker top por tamaño; logs del sistema y de contenedores.
- Docker: contenedores, imágenes pesadas, volúmenes, redes; límites de recursos en Compose; logging/rotación.

3) Red y TLS/CDN
- Tráfico de salida estimado; puertos expuestos; Traefik entrypoints y certificados (staging/prod).
- Cloudflare: beneficio potencial de proxy/caché/compresión; efectos sobre IP real y trusted IPs.

4) Almacenamiento y backups
- Volúmenes/snapshots sin uso; política de retención; tamaño y cadencia de backups; compresión/rotación de logs.

5) Oportunidades de rightsizing/optimización
- Ajuste de tamaño/tipo de servidor; límites de recursos en contenedores; imágenes Alpine/multi‑stage; pruning seguro programado.
- Retención de snapshots/logs; mover artefactos pesados a almacenamiento barato (si aplica).

---

## Comandos sugeridos (Ubuntu/Docker; solo lectura)
Sistema
```
uname -a
lsb_release -a
uptime
free -m
swapon --show
df -h
lsblk
top -b -n1 | head -20
ps aux --sort=-%mem | head -15
```
Espacio y logs
```
du -xh /var/lib/docker | sort -h | tail -30
du -xh /var/lib/docker/volumes | sort -h | tail -20
du -xh /var/lib/docker/containers | sort -h | tail -20
du -xh /var/log | sort -h | tail -20
journalctl --disk-usage
sudo cat /etc/docker/daemon.json || cat /etc/docker/daemon.json
```
Docker
```
docker info
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
docker stats --no-stream
docker system df -v
docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'
docker volume ls
```
“palacio-central” y Ollama (ajusta rutas si difieren)
```
docker ps | grep -i palacio
docker stats --no-stream | grep -i palacio
du -xh ~ | grep -i ollama | tail -20
du -xh /usr/share | grep -i ollama | tail -20
du -xh /root | grep -i ollama | tail -20
```

---

## Entregables
- Resumen ejecutivo (1 página): ahorro potencial (min/med/max), riesgos, quick wins (1 semana), plan 30/90 días.
- Tabla de costes actuales por recurso (estimado/real) y tabla de ahorro por recomendación (€/mes, %).
- Matriz riesgo/impacto (bajo/medio/alto) y plan de rollback por acción.
- Checklist de cambios propuestos: rightsizing, límites en Compose, rotación de logs, pruning seguro, retención snapshots/backups, imágenes ligeras, opciones Cloudflare.

## Formato de salida (Markdown)
1) Resumen ejecutivo
2) Hallazgos (sistema, Docker, red, almacenamiento, Hetzner)
3) Oportunidades de ahorro (€/mes y %)
4) Plan de acción (7/30/90 días)
5) Apéndice: evidencias (salidas de comandos/capturas)
6) Lista aparte de “comandos propuestos” a ejecutar solo con “APROBADO”.

## Criterios de éxito
- 5–10 oportunidades claras.
- Ahorro potencial ≥ 20% manteniendo SLOs.
- Cada recomendación con estimación, riesgo y rollback.

---

## Notas específicas para “palacio-central”
- Verificar si Ollama está en producción y qué modelos ocupan más GB.
- Si RAM/CPU promedio es baja: sugerir bajar tamaño del servidor (rightsizing).
- Alternativas: LLM por API externa (prod) y dejar Ollama para dev/PoC; modelos más pequeños/quantizados; apagar Ollama fuera de horario; separarlo en VM on‑demand.

---

## Mini solicitud rápida (si no hay hcloud)
Pégale esto a tu agente para una recolección mínima vía SSH:

> "Conéctate por SSH (solo lectura) y devuélveme: tipo y tamaño de servidor (si lo puedes inferir), uptime, CPU/RAM/swap, `docker ps`, `docker stats --no-stream`, `docker system df -v`, top 20 tamaños en `/var/lib/docker` (volumes/containers), `journalctl --disk-usage` y el contenido de `/etc/docker/daemon.json`. Señala quick wins de ahorro (rightsizing, logs, pruning, snapshots/volúmenes)."

---

## Cómo usar este archivo
- Entrega este texto a tu agente tal cual.
- Completa las credenciales SSH cuando te las pida.
- Espera el informe y confirma con “APROBADO” antes de aplicar cambios.
