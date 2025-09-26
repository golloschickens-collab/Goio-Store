#!/usr/bin/env bash
# Despliegue automatizado de mÃ©tricas (host + docker) en mÃºltiples servidores
#  # Copia de artefactos usando tar+ssh (más compatible que SCP)
  log "Transferring files via tar+ssh..."
  tar -czf - "$COLLECT_SH" "$SERVICE_UNIT" "$TIMER_UNIT" "$PARSER_PY" | ssh "${SSH_OPTS[@]}" "$target" "cd /tmp && tar -xzf - --strip-components=2" || { err "transfer falló ($host)"; return 1; }equisitos en el equipo de control: ssh, scp, acceso por llave a los hosts

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

COLLECT_SH="$SCRIPT_DIR/collect_metrics.sh"
SERVICE_UNIT="$SCRIPT_DIR/systemd/goio-metrics.service"
TIMER_UNIT="$SCRIPT_DIR/systemd/goio-metrics.timer"
PARSER_PY="$SCRIPT_DIR/parse_metrics.py"

# Mapa host -> RandomizedDelaySec para distribuir carga (por defecto)
HOSTS=(
  "ai-masterkernel:2m"
  "goio-store:5m"
  "eco-eterno:7m"
  "gollos-server-1:9m"
)

# Config SSH
SSH_USER="${SSH_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
SSH_PROXYJUMP="${SSH_PROXYJUMP:-}"
SSH_OPTS=("-o" "BatchMode=yes" "-o" "StrictHostKeyChecking=accept-new" "-o" "ConnectTimeout=10" "-p" "$SSH_PORT")
SCP_OPTS=("-q" "-P" "$SSH_PORT")
if [[ -n "$SSH_PROXYJUMP" ]]; then
  SSH_OPTS+=("-J" "$SSH_PROXYJUMP")
  SCP_OPTS+=("-o" "ProxyJump=$SSH_PROXYJUMP")
fi
if [[ "${DEBUG_SSH:-}" == "1" ]]; then
  SSH_OPTS=("-v" "${SSH_OPTS[@]}")
  SCP_OPTS=("-v" "${SCP_OPTS[@]}")
fi

# Flags
ACTION="deploy"  # deploy | undeploy | parse
PURGE=false
DOWNLOAD_DIR=""

usage() {
  cat <<USAGE
Uso: $0 [opciones]

Acciones:
  (por defecto)    Despliega collector + systemd timer y arranca mediciÃ³n
  --undeploy, -u   Detiene timer/servicio y los deshabilita (con --purge elimina binarios y units)
  --parse          Ejecuta el parser en cada host y (opcional) descarga artefactos

Opciones:
  --hosts "h1:2m,h2:5m"   Lista de hosts (con delay) a operar
  --user <ssh_user>        Usuario SSH (por defecto: \$SSH_USER o root)
  --download <dir>         Directorio local al que descargar summary (sÃ³lo con --parse)
  --purge                  Con --undeploy, elimina /usr/local/bin/collect_metrics.sh, parser y units

Ejemplos:
  $0                              # despliegue
  $0 --undeploy                   # detener y deshabilitar en todos
  $0 --parse --download ./art     # consolidar y traer artefactos
USAGE
}

log() { printf "\033[1;34m[deploy]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[error]\033[0m %s\n" "$*"; }

need() {
  command -v "$1" >/dev/null 2>&1 || { err "Falta '$1' en el equipo de control"; exit 1; }
}

parse_hosts_arg() {
  local list="$1"; HOSTS=()
  IFS="," read -ra parts <<<"$list"
  for p in "${parts[@]}"; do
    [[ -n "$p" ]] && HOSTS+=("$p")
  done
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --undeploy|-u) ACTION="undeploy"; shift ;;
    --parse) ACTION="parse"; shift ;;
    --purge) PURGE=true; shift ;;
    --hosts) parse_hosts_arg "$2"; shift 2 ;;
    --user) SSH_USER="$2"; shift 2 ;;
    --download) DOWNLOAD_DIR="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) warn "OpciÃ³n desconocida: $1"; usage; exit 1 ;;
  esac
done

need ssh; need scp

if [[ ! -f "$COLLECT_SH" || ! -f "$SERVICE_UNIT" || ! -f "$TIMER_UNIT" ]]; then
  err "No se encuentran los archivos requeridos en $SCRIPT_DIR"; exit 1
fi

deploy_host() {
  local host="$1" delay="$2" target="$SSH_USER@$1"
  log "[deploy] Host=$host delay=$delay"

  # Copia de artefactos
  scp "${SCP_OPTS[@]}" "$COLLECT_SH" "$SERVICE_UNIT" "$TIMER_UNIT" "$PARSER_PY" "$target:/tmp/" || { err "scp fallÃ³ ($host)"; return 1; }

  # InstalaciÃ³n remota
  ssh "${SSH_OPTS[@]}" "$target" bash -s <<EOF || { err "ssh/instalaciÃ³n fallÃ³ ($host)"; return 1; }
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update -y >/dev/null 2>&1 || true
apt-get install -y sysstat >/dev/null 2>&1 || true

install -d -m 0755 /var/log/goio-metrics
install -m 0755 /tmp/collect_metrics.sh /usr/local/bin/collect_metrics.sh
install -m 0755 /tmp/parse_metrics.py /usr/local/bin/goio-parse-metrics.py || true
install -D -m 0644 /tmp/goio-metrics.service /etc/systemd/system/goio-metrics.service
install -D -m 0644 /tmp/goio-metrics.timer /etc/systemd/system/goio-metrics.timer

# Ajuste de RandomizedDelaySec
sed -i "s/^RandomizedDelaySec=.*/RandomizedDelaySec=$delay/" /etc/systemd/system/goio-metrics.timer || true
grep -q '^RandomizedDelaySec=' /etc/systemd/system/goio-metrics.timer || \
  sed -i "/\\[Timer\\]/a RandomizedDelaySec=$delay" /etc/systemd/system/goio-metrics.timer

systemctl daemon-reload
systemctl enable --now goio-metrics.timer
# EjecuciÃ³n inicial para validar
systemctl start goio-metrics.service || true

echo "STATUS(timer):"
systemctl status --no-pager goio-metrics.timer | sed -n '1,12p' || true
echo "STATUS(service):"
systemctl status --no-pager goio-metrics.service | sed -n '1,12p' || true
echo "LAST LOG:"
ls -1 /var/log/goio-metrics | tail -1 || true
EOF

  log "OK $host"
}

undeploy_host() {
  local host="$1" target="$SSH_USER@$1"
  log "[undeploy] Host=$host (purge=$PURGE)"
  ssh "${SSH_OPTS[@]}" "$target" bash -s <<EOF || { err "ssh/undeploy fallÃ³ ($host)"; return 1; }
set -euo pipefail
systemctl disable --now goio-metrics.timer || true
systemctl stop goio-metrics.service || true
if $PURGE; then
  rm -f /usr/local/bin/collect_metrics.sh /usr/local/bin/goio-parse-metrics.py || true
  rm -f /etc/systemd/system/goio-metrics.service /etc/systemd/system/goio-metrics.timer || true
  systemctl daemon-reload || true
fi
echo "OK"
EOF
}

parse_host() {
  local host="$1" target="$SSH_USER@$1"
  log "[parse] Host=$host"
  ssh "${SSH_OPTS[@]}" "$target" bash -s <<'EOF' || { err "ssh/parse fallÃ³ ($host)"; return 1; }
set -euo pipefail
if ! command -v python3 >/dev/null 2>&1; then echo "python3 no encontrado"; exit 1; fi
python3 /usr/local/bin/goio-parse-metrics.py --logs /var/log/goio-metrics --out /var/log/goio-metrics/summary
tar -C /var/log/goio-metrics -czf /tmp/goio-metrics-summary.tgz summary || true
echo "/tmp/goio-metrics-summary.tgz"
EOF
  if [[ -n "$DOWNLOAD_DIR" ]]; then
    mkdir -p "$DOWNLOAD_DIR/$host"
    scp "${SCP_OPTS[@]}" "$target:/tmp/goio-metrics-summary.tgz" "$DOWNLOAD_DIR/$host/" || warn "No se pudo descargar summary ($host)"
  fi
}

main() {
  local ok=0 fail=0
  log "OperaciÃ³n=${ACTION} hosts=${#HOSTS[@]} (SSH_USER=$SSH_USER)"
  for entry in "${HOSTS[@]}"; do
    IFS=":" read -r host delay <<<"$entry"
    case "$ACTION" in
      deploy)
        if deploy_host "$host" "$delay"; then ok=$((ok+1)); else fail=$((fail+1)); fi ;;
      undeploy)
        if undeploy_host "$host"; then ok=$((ok+1)); else fail=$((fail+1)); fi ;;
      parse)
        if parse_host "$host"; then ok=$((ok+1)); else fail=$((fail+1)); fi ;;
    esac
    echo
  done
  log "Resumen: OK=$ok FAIL=$fail"
  if (( fail > 0 )); then exit 1; fi
}

main "$@"
 
