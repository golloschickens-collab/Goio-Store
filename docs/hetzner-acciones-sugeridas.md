# Plan de acciones sugeridas — Hetzner (Gollos‑Infra)

Este plan traduce la auditoría (23‑Sep‑2025) en pasos concretos. Incluye alternativas, riesgos y rollback. Ejecutar fuera de horario comercial cuando haya impacto.

---

## 1) Proteger el servidor AI (CCX33) con firewall
- Objetivo: Limitar exposición; mantener 22/80/443 únicamente (o los puertos que uses)
- Método recomendado (UI Hetzner):
  1. Networking → Firewalls → editar `standard-ports-22-80-443`
  2. Añadir el servidor `ai-masterkernel`
  3. Guardar. Verificar conectividad por SSH/HTTP(s)
- Riesgo: Bajo (puertos fuera de la lista quedarán bloqueados)
- Rollback: Quitar el servidor del firewall o añadir reglas específicas

## 2) Revisar y eliminar snapshot huérfano
- Objetivo: Evitar costes residuales y acumulación
- Método (UI Hetzner): Snapshots → localizar `gollos-landing-1757577832` (0,92 GB) → confirmar que no se necesita → Delete
- Riesgo: Bajo si es huérfano; irreversible
- Rollback: No aplica

## 3) Definir estrategia de backups
- Situación: 3× CPX11 con backups (coste +20%). CCX33 sin backups
- Opciones:
  - A) Activar backups en CCX33 (añade ~20% del coste del server)
  - B) Mantener sin backups y realizar copia fuera de banda (snapshot semanal + rsync de datos críticos)
- Recomendación: Si el servidor aloja modelos/datos no reproducibles, activar backups mínimo durante la fase crítica
- Riesgo: Muy bajo
- Rollback: Desactivar backups

## 4) Rightsizing del CCX33 (tras medir)
- Objetivo: Reducir coste si RAM/CPU quedan holgadas
- Pasos:
  1. Medir 3–7 días (CPU, RAM, swap, IO) y consumo de modelos en Ollama
  2. Si cabe en menor tamaño/familia (p.ej. CPX31/CAX31), planificar ventana y migrar (snapshot → resize o reconstrucción)
- Riesgo: Medio/alto (downtime)
- Rollback: Volver al tamaño previo o restaurar desde backup

## 5) Documentar propósito de cada CPX11
- Objetivo: Evitar servidores ociosos y prevenir “VM creep”
- Acción: Para goio-store, eco-eterno y gollos-server-1, anotar Owner, Servicio, Contacto, y si puede consolidarse

## 6) Métricas mínimas por SSH (read-only)
- En cada server (referencia):
  - Host: `uname -a`; `lsb_release -a`
  - Carga: `uptime`; `top -b -n1 | head -5`
  - Memoria: `free -m`; `swapon --show`
  - Disco: `df -h`; `lsblk`
  - Docker: `docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'`
  - Stats: `docker stats --no-stream`
  - Espacio Docker: `docker system df -v`

## 7) Buenas prácticas Docker (cuando aplique)
- Rotación de logs (en `/etc/docker/daemon.json`):
```
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3", "compress": "true" },
  "live-restore": true,
  "default-address-pools": [{"base":"172.30.0.0/16","size":24}]
}
```
- Reiniciar daemon en ventana: `systemctl reload docker` (o `restart` si no aplica reload)
- Limpieza segura: `docker image prune -af`; `docker container prune -f`; `docker volume prune -f` (solo tras revisar)

## 8) Trazabilidad
- Registra en `docs/auditoria-hetzner-finops-capture.md` qué acciones se ejecutaron, fecha y responsable.

---

Checklist rápida
- [ ] Firewall aplicado al CCX33
- [ ] Snapshot huérfano eliminado
- [ ] Decisión de backups del CCX33
- [ ] Métricas recogidas y decisión de rightsizing
- [ ] Propósito y owner de cada CPX11 documentados
