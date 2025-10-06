#!/usr/bin/env bash
# bootstrap_hetzner_server.sh
# Bootstrap helper to prepare a Hetzner (Debian/Ubuntu) server to run the Goio-Store services.
# Intended to be run as root from the Hetzner console or as sudo. It is conservative and idempotent.
# It will:
#  - update apt and install basic packages (git, curl, ufw, python3, tar)
#  - install Docker and enable service
#  - clone the GitHub repo into /opt/Goio-Store if not present
#  - create a backups folder and a systemd timer template (optional)
#  - attempt to create a limited `auditor` user via existing setup_auditor_user.sh in the repo (if present)
#  - configure a minimal UFW policy allowing ssh/http/https and blocking 873/8888
#
# USAGE:
#   As root: bash /path/to/bootstrap_hetzner_server.sh
#
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: This script must be run as root. Use sudo or the Hetzner console." >&2
  exit 2
fi

REPO_URL="https://github.com/golloschickens-collab/Goio-Store.git"
TARGET_DIR="/opt/Goio-Store"

echo "== Bootstrap Hetzner server: starting =="

echo "[1/9] Updating packages and installing prerequisites..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release git ufw python3 python3-venv python3-pip tar

echo "[2/9] Installing Docker (if missing)..."
if ! command -v docker >/dev/null 2>&1; then
  # Install Docker using the official repository
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
else
  echo "Docker already installed; skipping." 
fi

echo "[3/9] Ensuring Docker is running..."
systemctl enable docker || true
systemctl start docker || true

echo "[4/9] Cloning repo into ${TARGET_DIR} (if not present)..."
if [ ! -d "${TARGET_DIR}" ]; then
  git clone --depth 1 "$REPO_URL" "$TARGET_DIR" || {
    echo "WARNING: git clone failed. Please ensure this host can reach GitHub or place the repo files in ${TARGET_DIR}." >&2
  }
else
  echo "${TARGET_DIR} already exists — updating (git pull)..."
  (cd "$TARGET_DIR" && git pull --ff-only) || true
fi

echo "[5/9] Create backups folder /var/backups/goio and set permissions..."
mkdir -p /var/backups/goio
chown root:root /var/backups/goio
chmod 700 /var/backups/goio

echo "[6/9] Configure UFW: allow SSH (22), HTTP (80), HTTPS (443); block 873 and 8888 by default"
if command -v ufw >/dev/null 2>&1; then
  ufw default deny incoming || true
  ufw default allow outgoing || true
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  # block ports we discovered previously
  ufw deny 873/tcp || true
  ufw deny 8888/tcp || true
  # enable if not enabled
  ufw --force enable || true
else
  echo "ufw not installed; skipping firewall configuration (ufw)." >&2
fi

echo "[7/9] Attempt to create auditor user via repository script (if present)..."
SETUP_SCRIPT="${TARGET_DIR}/palacio-central/scripts/setup_auditor_user.sh"
if [ -f "$SETUP_SCRIPT" ]; then
  echo "Found $SETUP_SCRIPT — running to create auditor user (requires PUBKEY env)"
  # This will not set a PUBKEY — instruct admin to run again with PUBKEY set if desired.
  bash "$SETUP_SCRIPT" || echo "Note: setup_auditor_user.sh ran but may have required PUBKEY to be set." 
else
  echo "No setup_auditor_user.sh at $SETUP_SCRIPT — skipping user creation." 
fi

echo "[8/9] Prepare optional systemd timer template for periodic minimal audit (user can enable)
We created /usr/local/bin/collect_hetzner_minimal.sh to run the minimal collector if desired."
cat > /usr/local/bin/collect_hetzner_minimal.sh <<'EOF'
#!/usr/bin/env bash
# Small wrapper to run the minimal collector included in the repo (if present)
OUTDIR=/tmp/hetzner_minimal_manual_$(date +%Y%m%d_%H%M%S)
mkdir -p "$OUTDIR"
if [ -f "${TARGET_DIR}/palacio-central/scripts/minimal_collect.sh" ]; then
  bash "${TARGET_DIR}/palacio-central/scripts/minimal_collect.sh"
else
  echo "No minimal_collect.sh found in repo; create or run the manual collector as needed." >&2
fi
EOF
chmod +x /usr/local/bin/collect_hetzner_minimal.sh || true

echo "[9/9] Summary and next steps"
echo "Bootstrap finished (best-effort). Actions completed (or attempted): apt packages, docker, clone repo, backups dir, ufw rules."
echo "If you want the agent to perform an scp push of the collector archive to a destination you control, provide the destination in the format user@IP:/path and I will generate the exact command for the agent to run." 
echo "To create the auditor user with a public key, run:"
echo "  USERNAME=auditor PUBKEY=\"ssh-ed25519 AAAA...\" COLLECTOR_PATH=/opt/Goio-Store/palacio-central/scripts/collect_hetzner_audit.sh bash ${TARGET_DIR}/palacio-central/scripts/setup_auditor_user.sh"
echo "To enable periodic minimal collection, create a systemd timer that calls /usr/local/bin/collect_hetzner_minimal.sh as root once daily (I can prepare that file on request)."

echo "Done. Please review the output; if you want I can now produce the exact scp command for the agent to push the audit bundle to your destination (provide user@IP:/path)."

exit 0
