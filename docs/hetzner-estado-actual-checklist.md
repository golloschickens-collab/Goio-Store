# Checklist de Estado Actual (as-built) — Hetzner (Read-only)

Encargo para tu agente (SRE/DevOps) a fin de verificar, en modo solo lectura, que el host coincide con el estado deseado y documentar evidencias.

---

## Rol y objetivo
- Rol: Auditor SRE/DevOps (read-only).
- Objetivo: confirmar la configuración real del host, documentar “Esperado vs Observado” y listar cualquier drift con siguientes pasos. No se aplican cambios.

## Alcance (verificar y evidenciar)
1) Docker / Compose
- Docker CE instalado y versión.
- Compose v2 disponible.
- `/etc/docker/daemon.json` contiene:
  - `log-driver: json-file`
  - `log-opts: { "max-size": "10m", "max-file": "3" }` (ideal: `"compress": "true"`)
  - `live-restore: true`
  - `default-address-pools: [{ base: "172.30.0.0/16", size: 24 }]`
- `Cgroup Version: 2` en `docker info`.

2) Swap y kernel params
- Swapfile ~4G activo y persistente en `/etc/fstab`.
- `vm.swappiness=10` persistente en `/etc/sysctl.d/99-swap.conf` y efectivo (`sysctl vm.swappiness`).

3) SSH endurecido (efectivo)
- `PasswordAuthentication no`
- `PubkeyAuthentication yes`
- `PermitRootLogin prohibit-password` (o `without-password`)

4) Actualizaciones automáticas
- `unattended-upgrades` perfil seguridad activo.
- Timers APT visibles y funcionando.
- Log de `unattended-upgrades` sin errores recientes.

5) Firewall y hardening
- UFW activo con allow 22/80/443 y default deny incoming.
- fail2ban activo; jail `sshd` con métricas de bans.

6) Reverse proxy (Traefik)
- Compose/labels de Traefik presentes.
- ACME (staging o prod) configurado; `acme.json` existe (perm 600 en el host).
- Redirección HTTP→HTTPS y routers (dashboard/whoami) definidos.

7) DNS/CDN (solo constatación)
- A/AAAA para los subdominios definidos; estado de Cloudflare proxy (ON/OFF) si aplica.

---

## Comandos sugeridos (solo lectura)
Sistema
```
uname -a
lsb_release -a
uptime
free -m
swapon --show
df -h
lsblk
```
Docker/Compose
```
docker --version
docker compose version || docker compose ls
docker info | sed -n '1,120p'
docker info | grep -i cgroup
cat /etc/docker/daemon.json 2>/dev/null || sudo cat /etc/docker/daemon.json
```
Swap y sysctl
```
grep -E 'swap|Swap' /etc/fstab || true
cat /etc/sysctl.d/99-swap.conf 2>/dev/null || true
sysctl vm.swappiness
```
SSH efectivo
```
sshd -T | egrep 'passwordauthentication|permitrootlogin|pubkeyauthentication'
```
Unattended upgrades
```
systemctl status unattended-upgrades --no-pager
systemctl list-timers --all | grep -i apt
ls -l /etc/apt/apt.conf.d/50unattended-upgrades
sed -n '1,200p' /etc/apt/apt.conf.d/50unattended-upgrades
tail -n 200 /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null || true
```
UFW / fail2ban
```
ufw status verbose
sudo fail2ban-client status 2>/dev/null || fail2ban-client status 2>/dev/null || echo "fail2ban no instalado/activo"
sudo fail2ban-client status sshd 2>/dev/null || true
```
Espacio y logs
```
docker system df -v
du -xh /var/lib/docker | sort -h | tail -30
du -xh /var/log | sort -h | tail -20
journalctl --disk-usage
```
Traefik (estructura)
```
# Ajustar ruta si aplica
[ -f reverse-proxy/docker-compose.yml ] && docker compose -f reverse-proxy/docker-compose.yml config | head -n 80 || echo "No se encontró compose de Traefik"
ls -l reverse-proxy/letsencrypt/acme.json 2>/dev/null || true
```

---

## Plantilla “Esperado vs Observado” (usar por cada punto)
- Esperado:
  - live-restore: true
  - log-opts: max-size 10m, max-file 3 (ideal compress true)
- Observado:
  - live-restore: … (OK/DRIFT)
  - log-opts: … (OK/DRIFT)
- Evidencia:
  - Salida de `cat /etc/docker/daemon.json`: …
- Nota / Acción sugerida:
  - … (no aplicar hasta “APROBADO”).

---

## Entregables
- Informe Markdown con:
  - Resumen por área (OK/DRIFT).
  - Evidencias acotadas (salidas de comandos recortadas).
  - Lista de drifts y “Siguientes pasos” (sin ejecutar).
- Nombre sugerido: `as-built-hetzner-estado-actual-YYYYMMDD.md`.

## Criterios de éxito
- Configuración clave confirmada o drift identificado.
- Evidencias claras y reproducibles.
- Siguientes pasos listos para aprobación.

## Cómo usar este archivo
- Pega este encargo a tu agente y facilita acceso SSH read-only.
- El agente rellena “Esperado vs Observado” con evidencias y te devuelve el informe.
- Tras tu “APROBADO”, se preparan comandos de corrección (en otro documento).
