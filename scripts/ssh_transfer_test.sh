#!/usr/bin/env bash
# Función alternativa para transferir archivos sin SCP

transfer_file_ssh() {
  local local_file="$1"
  local remote_path="$2"
  local target="$3"
  
  echo "Transferring $local_file to $target:$remote_path via SSH+base64"
  
  # Encode file in base64 and transfer via SSH
  base64_content=$(base64 -w 0 "$local_file" 2>/dev/null || base64 "$local_file")
  
  ssh "${SSH_OPTS[@]}" "$target" bash -s <<EOF
set -euo pipefail
echo '$base64_content' | base64 -d > '$remote_path'
chmod 755 '$remote_path' 2>/dev/null || true
EOF
}

# Test function
echo "Testing SSH+base64 transfer method..."