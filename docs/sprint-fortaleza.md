# Sprint: Fortificar la Fortaleza (Infra / Seguridad / Costos)

Objetivo: Endurecer cimientos, asegurar resiliencia y preparar ahorro basado en datos. Duración: ~7 días (en paralelo a la recolección de métricas).

## Alcance
- Seguridad base (SO + red + Docker)
- Backups y restauración de prueba
- Observabilidad mínima (métricas horarias + chequeos básicos)
- Preparación de rightsizing (decisión tras 3–7 días de datos)

## Entregables
- Checklist de seguridad completo con evidencia
- Resumen de métricas (CSV + MD) y recomendación de rightsizing
- Plan de rollback/resizing y ventana sugerida
- Documentación de procedimientos (esta carpeta + runbooks)

## Checklist

- [ ] Firewall Hetzner aplicado a todos los servidores, política: permitir 22 (sólo IPs gestión), 80/443; denegar resto
- [ ] UFW coherente con firewall cloud (mirroring) o deshabilitado si se usa sólo el de Hetzner
- [ ] SSH endurecido: key-only, `PermitRootLogin no` (o restringido), `PasswordAuthentication no`, `AllowUsers`
- [ ] fail2ban activo con jails para sshd y métricas de bans disponibles
- [ ] Unattended-upgrades y auto-reboot fuera de ventana crítica
- [ ] Logs saneados: journald cuotas, logrotate y Docker log-driver con rotación
- [ ] Docker daemon: live-restore, default-address-pools, user namespace (si aplica)
- [ ] Inventario de usuarios/sudoers y llaves autorizadas (limpieza de cuentas no usadas)
- [ ] Backups: habilitados en todos los nodos; snapshot de prueba + verificación de restore (dry-run)
- [ ] Métricas: timer hourly activo (4 hosts), dispersión por host, carpeta de logs con rotación básica
- [ ] Parser ejecutado al final del período; artefactos: `metrics.csv` y `summary.md`
- [ ] Recomendación de rightsizing (CPU/RAM/disco) con estimación de ahorro y plan de ejecución

## Pasos operativos

1) Seguridad de red
- Hetzner Firewall: aplicar perfil estándar (22 desde IPs de gestión, 80/443 abierto; ICMP opcional) a: ai-masterkernel, goio-store, eco-eterno, gollos-server-1.
- UFW: o bien espejo del policy cloud o dejarlo en estado permisivo si se gestiona todo en cloud firewall; documentar decisión.

2) Endurecimiento del sistema
- Revisar `/etc/ssh/sshd_config` (root login, auth por clave, Kex/HostKeyAlgorithms saneados).
- fail2ban: activar jails básicas; registrar bans/alerts.
- Unattended upgrades: confirmar políticas y exclusiones.
- Logs: `journalctl --disk-usage` bajo control; `logrotate` activo; Docker con rotación.

3) Docker
- Confirmar `daemon.json` (live-restore, log-opts, default-address-pools).
- Limpieza controlada: `docker system df -v` y plan de prune fuera de hora pico.

4) Backups
- Verificar backups en todos los nodos; tomar snapshot de prueba en un nodo y documentar tiempos/espacio.

5) Métricas y análisis
- Timer hourly activo (ya definido). Dispersión por host aplicada.
- Al completar 7 días: ejecutar `scripts/parse_metrics.py` para consolidar CSV y resumen MD.
- Preparar recomendación de rightsizing y rollback.

## Criterios de aceptación
- Todos los nodos protegidos por firewall cloud y SSH endurecido.
- Backups habilitados y snapshot de prueba realizado con éxito.
- Artefactos de métricas consolidados y recomendación documentada.
- Sin pérdida de servicio reportada durante el sprint.

## Notas
- Coordinación con Cloudflare (reglas/Access) se realizará en el sprint de “Puente”, al exponer servicios.
- Este sprint prepara la base para Traefik en producción con menor riesgo.
