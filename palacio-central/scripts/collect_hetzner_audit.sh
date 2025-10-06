#!/usr/bin/env bash
# collect_hetzner_audit.sh
# Recolecta información de diagnóstico y auditoría en un servidor Hetzner
# Genera un tar.gz en /tmp listo para descargar y analizar.

set -euo pipefail
OUTDIR="/tmp/hetzner_audit_$(date +%F_%H%M%S)"
mkdir -p "$OUTDIR"
cd "$OUTDIR"

echo "Recolectando información del sistema..."
uname -a > system_uname.txt 2>&1 || true
cat /etc/os-release > os_release.txt 2>&1 || true
hostnamectl > hostnamectl.txt 2>&1 || true
uptime > uptime.txt 2>&1 || true
whoami > whoami.txt 2>&1 || true
id > id.txt 2>&1 || true

echo "Recursos y hardware..."
nproc > nproc.txt 2>&1 || true
free -h > free.txt 2>&1 || true
vmstat 1 5 > vmstat.txt 2>&1 || true
lscpu > lscpu.txt 2>&1 || true
lsblk > lsblk.txt 2>&1 || true
cat /proc/meminfo > proc_meminfo.txt 2>&1 || true

# GPU check
if command -v lspci >/dev/null 2>&1; then
  lspci | grep -i nvidia > lspci_nvidia.txt 2>&1 || true
fi
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi > nvidia_smi.txt 2>&1 || true
fi

echo "Procesos y contenedores..."
ps aux --sort=-%mem | head -n 200 > top_processes.txt 2>&1 || true
if command -v docker >/dev/null 2>&1; then
  docker ps --no-trunc --format '{{.Names}} {{.Image}} {{.Status}}' > docker_ps.txt 2>&1 || true
  docker images --format '{{.Repository}}:{{.Tag}} {{.Size}}' > docker_images.txt 2>&1 || true
  # collect docker logs for likely containers
  for cname in $(docker ps --format '{{.Names}}' || true); do
    if [[ "$cname" =~ openhands || "$cname" =~ ollama || "$cname" =~ openhands-server ]]; then
      echo "Collecting logs for $cname"
      docker logs --tail 500 "$cname" > "docker_log_${cname}.txt" 2>&1 || true
    fi
  done
else
  echo "docker not found" > docker_ps.txt
fi

if command -v podman >/dev/null 2>&1; then
  podman ps --no-trunc > podman_ps.txt 2>&1 || true
fi

# crontabs
echo "Crontabs (root and current user)..." > crontabs.txt
if [ "$(id -u)" -eq 0 ]; then
  crontab -l -u root 2>/dev/null >> crontabs.txt || true
fi
crontab -l 2>/dev/null >> crontabs.txt || true

echo "Red y exposición..."
ss -tulpn > listening_ports.txt 2>&1 || netstat -tulpn > listening_ports.txt 2>&1 || true
ip a > ip_addr.txt 2>&1 || true
ip route > ip_route.txt 2>&1 || true

# Firewall status
if command -v ufw >/dev/null 2>&1; then
  ufw status verbose > ufw_status.txt 2>&1 || true
else
  iptables -L -n -v > iptables_status.txt 2>&1 || true
fi

# Check common local services (Ollama default port 11434, OpenHands port 3000)
echo "Verificando endpoints locales..." > local_endpoints_check.txt
curl -sS -I http://127.0.0.1:11434/api/tags >> local_endpoints_check.txt 2>&1 || echo "ollama unreachable" >> local_endpoints_check.txt
curl -sS -I http://127.0.0.1:3000/ >> local_endpoints_check.txt 2>&1 || echo "openhands unreachable" >> local_endpoints_check.txt

echo "Logs del sistema y servicios..."
if [ -f /var/log/syslog ]; then
  tail -n 500 /var/log/syslog > syslog_tail_500.txt 2>&1 || true
elif [ -f /var/log/messages ]; then
  tail -n 500 /var/log/messages > messages_tail_500.txt 2>&1 || true
fi

if command -v journalctl >/dev/null 2>&1; then
  journalctl -n 500 > journal_last_500.txt 2>&1 || true
fi

# Application-specific paths (try common locations)
POSSIBLE_OPENHANDS_LOGS=(/var/log/openhands /var/lib/openhands/logs /opt/openhands/logs)
for p in "${POSSIBLE_OPENHANDS_LOGS[@]}"; do
  if [ -d "$p" ]; then
    tar -czf "openhands_logs_$(basename $p).tgz" -C "$p" . || true
  fi
done

# Ollama: dump models list if reachable
if command -v curl >/dev/null 2>&1; then
  curl -sS http://127.0.0.1:11434/api/tags -o ollama_tags.json || echo '{}' > ollama_tags.json
fi

# Paquetes y actualizaciones
if command -v dpkg >/dev/null 2>&1; then
  dpkg -l | head -n 200 > packages_dpkg_head.txt 2>&1 || true
elif command -v rpm >/dev/null 2>&1; then
  rpm -qa | head -n 200 > packages_rpm_head.txt 2>&1 || true
fi

# SSH and users
sshd_config="/etc/ssh/sshd_config"
if [ -f "$sshd_config" ]; then
  grep -i permitrootlogin "$sshd_config" > sshd_permitroot.txt 2>&1 || true
  grep -i passwordauthentication "$sshd_config" > sshd_password_auth.txt 2>&1 || true
fi
cat /etc/passwd | egrep -v '(/nologin|/false)' > passwd_users.txt 2>&1 || true
lastlog | head -n 50 > lastlog_head.txt 2>&1 || true

# Backups and monitoring
ls -la /var/backups > var_backups.txt 2>&1 || true
systemctl --type=service --state=running | head -n 200 > running_services.txt 2>&1 || true

# Collect certs (list) - do not pack private keys
find /etc/letsencrypt -maxdepth 3 -type f -name 'fullchain.pem' -o -name 'cert.pem' -o -name 'privkey.pem' > letsencrypt_files.txt 2>&1 || true

# Save list of commands run
cat <<'CMDS' > commands_ran.txt
uname -a
cat /etc/os-release
uptime
whoami
id
nproc
free -h
ps aux --sort=-%mem | head -n 200
docker ps --no-trunc --format '{{.Names}} {{.Image}} {{.Status}}'
ss -tulpn
curl -sS http://127.0.0.1:11434/api/tags
curl -sS http://127.0.0.1:3000/
CMDS

# Create the archive
ARCHIVE="/tmp/hetzner_audit_$(date +%F_%H%M%S).tar.gz"
cd /tmp
# Use --absolute-names to avoid relative path issues
tar -czf "$ARCHIVE" -C "$OUTDIR" . || true
SHA256SUM=$(sha256sum "$ARCHIVE" | awk '{print $1}' || true)

echo "Audit bundle created: $ARCHIVE"
echo "SHA256: $SHA256SUM"

echo "Contenido del bundle (primeros 200 archivos):"
# list some entries
tar -tzf "$ARCHIVE" | head -n 200 || true

echo "Hecho. Descarga el fichero $ARCHIVE a tu máquina local (scp usuario@server:$ARCHIVE .) y pégalo o subelo para análisis."

exit 0
