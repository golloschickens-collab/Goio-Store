#!/usr/bin/env bash
set -euo pipefail

# add_key_to_root_authorized.sh
# Uso: sudo ./add_key_to_root_authorized.sh "ssh-ed25519 AAAA... user@host"
# Añade la clave pública pasada como primer argumento a /root/.ssh/authorized_keys
# Realiza backup previo, evita duplicados y corrige permisos.

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 'PUBLIC_KEY'"
  exit 2
fi

PUBKEY="$1"
ROOT_AK=/root/.ssh/authorized_keys

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: This script must be run as root (sudo)." >&2
  exit 3
fi

mkdir -p /root/.ssh
chmod 700 /root/.ssh

if [ -f "$ROOT_AK" ]; then
  # Check if identical key already exists
  if grep -qxF -- "$PUBKEY" "$ROOT_AK"; then
    echo "The given public key is already present in $ROOT_AK. No changes made."
    exit 0
  fi
  # Make a timestamped backup
  bak="${ROOT_AK}.bak.$(date +%Y%m%d_%H%M%S)"
  cp -p "$ROOT_AK" "$bak"
  echo "Backup of existing authorized_keys saved to: $bak"
else
  touch "$ROOT_AK"
fi

echo "$PUBKEY" >> "$ROOT_AK"
chown root:root "$ROOT_AK"
chmod 600 "$ROOT_AK"

echo "Added key to $ROOT_AK"
echo "Current tail of $ROOT_AK:"
tail -n 10 "$ROOT_AK"

exit 0
