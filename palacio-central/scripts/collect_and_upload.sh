#!/usr/bin/env bash
set -euo pipefail

# collect_and_upload.sh
# Busca o genera un bundle mínimo en /tmp y opcionalmente lo sube a Hetzner Object Storage
# Imprime un JSON con: tar_path, sha_local, sha_remote (si se verificó), s3_uri (si se subió) y upload_status

found="$(find / -type f -name 'hetzner_minimal*.tar.gz' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -n1 || true)"
if [ -n "$found" ]; then
  FILE="$(echo "$found" | awk '{ $1=""; sub(/^ /,""); print }')"
fi

if [ -z "${FILE:-}" ] || [ ! -f "$FILE" ]; then
  OUT="/tmp/hetzner_minimal_$(date +%Y%m%d_%H%M%S).tar.gz"
  TMPDIR="$(mktemp -d)"
  trap 'rm -rf "$TMPDIR"' EXIT

  uname -a > "$TMPDIR/uname.txt" 2>/dev/null || true
  cat /etc/os-release > "$TMPDIR/etc_os_release.txt" 2>/dev/null || true
  ps aux > "$TMPDIR/ps.txt" 2>/dev/null || true
  if command -v ss >/dev/null 2>&1; then ss -tunlp > "$TMPDIR/ss.txt" 2>/dev/null || true; fi
  if command -v netstat >/dev/null 2>&1; then netstat -tunlp > "$TMPDIR/netstat.txt" 2>/dev/null || true; fi
  df -h > "$TMPDIR/df.txt" 2>/dev/null || true
  mount > "$TMPDIR/mounts.txt" 2>/dev/null || true
  cp /etc/hosts "$TMPDIR/hosts" 2>/dev/null || true
  cp /etc/passwd "$TMPDIR/passwd" 2>/dev/null || true
  cp /etc/group "$TMPDIR/group" 2>/dev/null || true
  if command -v docker >/dev/null 2>&1; then docker ps --no-trunc > "$TMPDIR/docker_ps.txt" 2>/dev/null || true; fi

  tar -czf "$OUT" -C "$TMPDIR" ./
  FILE="$OUT"
fi

# calcular sha local
if command -v sha256sum >/dev/null 2>&1; then
  sha_local="$(sha256sum "$FILE" | awk '{print $1}')"
else
  sha_local="$(python3 - <<'PY'
import hashlib,sys
h=hashlib.sha256()
with open(sys.argv[1],'rb') as f:
    while True:
        b=f.read(8192)
        if not b:
            break
        h.update(b)
print(h.hexdigest())
PY
"$FILE")"
fi

s3_uri=null
sha_remote=null
upload_status="skipped"

# Si en la sesión están exportadas ENDPOINT, ACCESS_KEY, SECRET_KEY, BUCKET -> intentar subir con mc
if [ -n "${ENDPOINT:-}" ] && [ -n "${ACCESS_KEY:-}" ] && [ -n "${SECRET_KEY:-}" ] && [ -n "${BUCKET:-}" ]; then
  MC_BIN="/tmp/mc"
  if [ ! -x "$MC_BIN" ]; then
    curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o "$MC_BIN"
    chmod +x "$MC_BIN"
  fi
  MC="$MC_BIN"

  # configurar alias y crear bucket si hace falta (no falla si ya existe)
  $MC alias set hetzner "$ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" --api S3v4 >/dev/null 2>&1 || true
  $MC mb "hetzner/$BUCKET" >/dev/null 2>&1 || true

  # subir
  if $MC cp "$FILE" "hetzner/$BUCKET/" >/dev/null 2>&1; then
    upload_status="uploaded"
    s3_uri="s3://$BUCKET/$(basename "$FILE")"
    tmpd="$(mktemp -d)"
    trap 'rm -rf "$tmpd"' EXIT
    if $MC cp "hetzner/$BUCKET/$(basename "$FILE")" "$tmpd/" >/dev/null 2>&1; then
      if command -v sha256sum >/dev/null 2>&1; then
        sha_remote="$(sha256sum "$tmpd/$(basename "$FILE")" | awk '{print $1}')"
      else
        sha_remote="$(python3 - <<'PY'
import hashlib,sys
h=hashlib.sha256()
with open(sys.argv[1],'rb') as f:
    while True:
        b=f.read(8192)
        if not b:
            break
        h.update(b)
print(h.hexdigest())
PY
"$tmpd/$(basename "$FILE")")"
      fi
    else
      upload_status="download_verify_failed"
    fi
  else
    upload_status="upload_failed"
  fi
fi

# Imprimir JSON final (no incluir secretos)
if command -v jq >/dev/null 2>&1; then
  jq -n \
    --arg tar_path "$FILE" \
    --arg sha_local "$sha_local" \
    --arg sha_remote "${sha_remote:-}" \
    --arg s3_uri "${s3_uri:-}" \
    --arg upload_status "$upload_status" \
    '{tar_path:$tar_path, sha_local:$sha_local, sha_remote:($sha_remote==""?null:$sha_remote), s3_uri:($s3_uri==""?null:$s3_uri), upload_status:$upload_status}'
else
  # plain JSON; sha_remote can be null
  if [ "${sha_remote:-}" = "" ]; then
    printf '%s\n' "{\"tar_path\":\"$FILE\",\"sha_local\":\"$sha_local\",\"sha_remote\":null,\"s3_uri\":null,\"upload_status\":\"$upload_status\"}"
  else
    printf '%s\n' "{\"tar_path\":\"$FILE\",\"sha_local\":\"$sha_local\",\"sha_remote\":\"$sha_remote\",\"s3_uri\":\"$s3_uri\",\"upload_status\":\"$upload_status\"}"
  fi
fi

exit 0
