#!/usr/bin/env bash
set -euo pipefail

# diagnose_genmini.sh
# Recolecta información útil para depurar un agente llamado "genmini" que no responde.
# Produce un tar.gz en /tmp con la información y un SHA256.

OUTDIR="/tmp/genmini_diag_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTDIR"

echo "Recolección empezando -> $OUTDIR"

echo "1) Información básica del sistema" > "$OUTDIR/README.txt"
uname -a >> "$OUTDIR/README.txt" 2>&1 || true
cat /etc/os-release >> "$OUTDIR/README.txt" 2>&1 || true
echo "uptime:" >> "$OUTDIR/README.txt"; uptime >> "$OUTDIR/README.txt" 2>&1 || true

echo "2) Uso de disco y memoria" > "$OUTDIR/resources.txt"
df -h >> "$OUTDIR/resources.txt" 2>&1 || true
free -h >> "$OUTDIR/resources.txt" 2>&1 || true

echo "3) Procesos relacionados con genmini" > "$OUTDIR/processes.txt"
ps aux | egrep 'genmini|gen-mini|gen_mini' | sed -n '1,200p' >> "$OUTDIR/processes.txt" 2>&1 || true

echo "4) Puertos y listeners" > "$OUTDIR/listeners.txt"
ss -tunelp 2>/dev/null | egrep '(:80|:443|:3000|:8080|:5000|genmini)' | sed -n '1,200p' >> "$OUTDIR/listeners.txt" || true
netstat -tunlp 2>/dev/null | head -n 200 >> "$OUTDIR/listeners_netstat.txt" 2>&1 || true

echo "5) systemd: buscar unidades relacionadas" > "$OUTDIR/systemd_units.txt"
systemctl list-units --type=service | egrep 'genmini|gen-mini|gen_mini' || true > "$OUTDIR/systemd_units.txt" 2>&1 || true
for u in $(systemctl list-units --type=service --no-legend | awk '{print $1}' | egrep 'genmini|gen-mini|gen_mini' || true); do
  echo "--- $u status ---" >> "$OUTDIR/systemd_units.txt"
  systemctl status "$u" --no-pager >> "$OUTDIR/systemd_units.txt" 2>&1 || true
  journalctl -u "$u" -n 500 --no-pager >> "$OUTDIR/systemd_units.txt" 2>&1 || true
done

echo "6) Docker: contenedores y logs (si aplica)" > "$OUTDIR/docker.txt"
if command -v docker >/dev/null 2>&1; then
  docker ps -a --format '{{.Names}} {{.Image}} {{.Status}}' > "$OUTDIR/docker_ps.txt" 2>&1 || true
  # buscar contenedores por nombre o imagen que contenga genmini
  docker ps -a --format '{{.Names}}' | egrep 'genmini|gen-mini|gen_mini' | while read -r c; do
    echo "--- container: $c ---" >> "$OUTDIR/docker.txt"
    docker inspect "$c" >> "$OUTDIR/docker.txt" 2>&1 || true
    docker logs --tail 500 "$c" >> "$OUTDIR/docker.txt" 2>&1 || true
  done || true
else
  echo "docker no disponible" >> "$OUTDIR/docker.txt"
fi

echo "7) logs del sistema (auth/syslog/journal)" > "$OUTDIR/logs_head_tail.txt"
if [ -f /var/log/auth.log ]; then
  echo '--- /var/log/auth.log (ultimas 200) ---' >> "$OUTDIR/logs_head_tail.txt"
  tail -n 200 /var/log/auth.log >> "$OUTDIR/logs_head_tail.txt" 2>&1 || true
fi
if [ -f /var/log/syslog ]; then
  echo '--- /var/log/syslog (ultimas 200) ---' >> "$OUTDIR/logs_head_tail.txt"
  tail -n 200 /var/log/syslog >> "$OUTDIR/logs_head_tail.txt" 2>&1 || true
fi
echo '--- journalctl (sshd and genmini) last 500 ---' >> "$OUTDIR/logs_head_tail.txt"
journalctl -n 500 -u ssh -u sshd --no-pager >> "$OUTDIR/logs_head_tail.txt" 2>&1 || true
journalctl -n 500 | egrep 'genmini|gen-mini|gen_mini' >> "$OUTDIR/logs_head_tail.txt" 2>&1 || true

echo "8) comprobar puertos locales importantes (intentos de curl si hay servicios en 3000/8080/5000)" > "$OUTDIR/http_checks.txt"
for p in 3000 8080 5000 8000 80 443; do
  if ss -ltn | egrep -q ":$p\b"; then
    echo "puerto $p: abierto localmente, probando http..." >> "$OUTDIR/http_checks.txt"
    curl -sS --connect-timeout 3 "http://127.0.0.1:$p/" >> "$OUTDIR/http_checks.txt" 2>&1 || echo "no-http-response-on-$p" >> "$OUTDIR/http_checks.txt"
  else
    echo "puerto $p: no escuchando" >> "$OUTDIR/http_checks.txt"
  fi
done

echo "9) variables de entorno del proceso (si pm2 o node)" > "$OUTDIR/process_envs.txt"
if command -v pm2 >/dev/null 2>&1; then
  pm2 ls --no-color > "$OUTDIR/pm2_list.txt" 2>&1 || true
  pm2 jlist > "$OUTDIR/pm2_jlist.json" 2>/dev/null || true
fi

echo "10) generar tar.gz con los resultados" 
TARPATH="/tmp/genmini_diagnostics_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$TARPATH" -C /tmp "$(basename "$OUTDIR")" || true

if command -v sha256sum >/dev/null 2>&1; then
  sha="$(sha256sum "$TARPATH" | awk '{print $1}')"
else
  sha="unavailable"
fi

echo
echo "RESULT: tar_path=$TARPATH sha256=$sha"
echo
echo "Puedes descargar $TARPATH desde la máquina (scp/console) o subirlo a Object Storage con el script check_s3_config.sh si lo prefieres."

exit 0
