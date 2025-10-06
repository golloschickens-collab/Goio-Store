# Sprint: Fortificar la Fortaleza (Infra / Seguridad / Costos)

Objetivo: Endurecer cimientos, asegurar resiliencia y preparar ahorro basado en datos. DuraciÃ³n: ~7 dÃ­as (en paralelo a la recolecciÃ³n de mÃ©tricas).

## Alcance
- Seguridad base (SO + red + Docker)
- Backups y restauraciÃ³n de prueba
- Observabilidad mÃ­nima (mÃ©tricas horarias + chequeos bÃ¡sicos)
- PreparaciÃ³n de rightsizing (decisiÃ³n tras 3â€“7 dÃ­as de datos)

## Entregables
- Checklist de seguridad completo con evidencia
- Resumen de mÃ©tricas (CSV + MD) y recomendaciÃ³n de rightsizing
- Plan de rollback/resizing y ventana sugerida
- DocumentaciÃ³n de procedimientos (esta carpeta + runbooks)

## Checklist

- [ ] Firewall Hetzner aplicado a todos los servidores, polÃ­tica: permitir 22 (sÃ³lo IPs gestiÃ³n), 80/443; denegar resto
- [ ] UFW coherente con firewall cloud (mirroring) o deshabilitado si se usa sÃ³lo el de Hetzner
- [ ] SSH endurecido: key-only, `PermitRootLogin no` (o restringido), `PasswordAuthentication no`, `AllowUsers`
- [ ] fail2ban activo con jails para sshd y mÃ©tricas de bans disponibles
- [ ] Unattended-upgrades y auto-reboot fuera de ventana crÃ­tica
- [ ] Logs saneados: journald cuotas, logrotate y Docker log-driver con rotaciÃ³n
- [ ] Docker daemon: live-restore, default-address-pools, user namespace (si aplica)
- [ ] Inventario de usuarios/sudoers y llaves autorizadas (limpieza de cuentas no usadas)
- [ ] Backups: habilitados en todos los nodos; snapshot de prueba + verificaciÃ³n de restore (dry-run)
- [ ] MÃ©tricas: timer hourly activo (4 hosts), dispersiÃ³n por host, carpeta de logs con rotaciÃ³n bÃ¡sica
- [ ] Parser ejecutado al final del perÃ­odo; artefactos: `metrics.csv` y `summary.md`
- [ ] RecomendaciÃ³n de rightsizing (CPU/RAM/disco) con estimaciÃ³n de ahorro y plan de ejecuciÃ³n

## Pasos operativos

1) Seguridad de red
- Hetzner Firewall: aplicar perfil estÃ¡ndar (22 desde IPs de gestiÃ³n, 80/443 abierto; ICMP opcional) a: ai-masterkernel, goio-store, eco-eterno, gollos-server-1.
- UFW: o bien espejo del policy cloud o dejarlo en estado permisivo si se gestiona todo en cloud firewall; documentar decisiÃ³n.

2) Endurecimiento del sistema
- Revisar `/etc/ssh/sshd_config` (root login, auth por clave, Kex/HostKeyAlgorithms saneados).
- fail2ban: activar jails bÃ¡sicas; registrar bans/alerts.
- Unattended upgrades: confirmar polÃ­ticas y exclusiones.
- Logs: `journalctl --disk-usage` bajo control; `logrotate` activo; Docker con rotaciÃ³n.

3) Docker
- Confirmar `daemon.json` (live-restore, log-opts, default-address-pools).
- Limpieza controlada: `docker system df -v` y plan de prune fuera de hora pico.

4) Backups
- Verificar backups en todos los nodos; tomar snapshot de prueba en un nodo y documentar tiempos/espacio.

5) MÃ©tricas y anÃ¡lisis
- Timer hourly activo (ya definido). DispersiÃ³n por host aplicada.
- Al completar 7 dÃ­as: ejecutar `scripts/parse_metrics.py` para consolidar CSV y resumen MD.
- Preparar recomendaciÃ³n de rightsizing y rollback.

## Criterios de aceptaciÃ³n
- Todos los nodos protegidos por firewall cloud y SSH endurecido.
- Backups habilitados y snapshot de prueba realizado con Ã©xito.
- Artefactos de mÃ©tricas consolidados y recomendaciÃ³n documentada.
- Sin pÃ©rdida de servicio reportada durante el sprint.

## Notas
- CoordinaciÃ³n con Cloudflare (reglas/Access) se realizarÃ¡ en el sprint de â€œPuenteâ€, al exponer servicios.
- Este sprint prepara la base para Traefik en producciÃ³n con menor riesgo.
