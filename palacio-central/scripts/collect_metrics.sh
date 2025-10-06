#!/usr/bin/env bash
set -euo pipefail

# Simple collector for host + docker metrics (read-only)
# Usage: sudo bash collect_metrics.sh

TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
HOST="$(hostname)"
OUT_DIR="/var/log/goio-metrics"
LOG_FILE="$OUT_DIR/${HOST}-${TS}.log"

mkdir -p "$OUT_DIR"
{
  echo "==== GOIO METRICS SNAPSHOT ===="
  echo "timestamp: $TS (UTC)"
  echo "host: $HOST"
  echo "uname: $(uname -a)"
  echo

  echo "--- uptime/top ---"
  uptime || true
  top -b -n1 | head -20 || true
  echo

  echo "--- memory/swap ---"
  free -m || true
  swapon --show || true
  echo

  echo "--- disks/usage ---"
  df -h || true
  lsblk || true
  echo

  echo "--- iostat (x3) ---"
  if command -v iostat >/dev/null 2>&1; then
    iostat -x 1 3 || true
  else
    echo "iostat not installed (apt install sysstat)"
  fi
  echo

  echo "--- open ports ---"
  ss -tulpn || true
  echo

  echo "--- journal disk-usage ---"
  journalctl --disk-usage || true
  echo

  echo "--- docker: ps ---"
  if command -v docker >/dev/null 2>&1; then
    docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' || true
    echo

    echo "--- docker: stats (no-stream) ---"
    docker stats --no-stream || true
    echo

    echo "--- docker: system df -v ---"
    docker system df -v || true
  else
    echo "docker not installed"
  fi
} | tee "$LOG_FILE"

echo "Saved: $LOG_FILE"
