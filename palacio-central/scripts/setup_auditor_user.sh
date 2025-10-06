#!/usr/bin/env bash
# setup_auditor_user.sh
# Usage:
#   As root: 
#     USERNAME=auditor PUBKEY="ssh-rsa AAAA... user@host" \
#     COLLECTOR_PATH=/full/path/to/palacio-central/scripts/collect_hetzner_audit.sh \
#     bash setup_auditor_user.sh
#
# This script creates a system user with a locked password and a sudoers file
# that permits running only a small set of commands WITHOUT password. It is
# intended to be run as root (for example from the Hetzner console or Rescue).
#
# SECURITY: Review the generated sudoers file before running. The script will
# validate sudoers syntax with visudo -cf and will abort if invalid.

set -euo pipefail

USERNAME=${USERNAME:-auditor}
PUBKEY=${PUBKEY:-}
COLLECTOR_PATH=${COLLECTOR_PATH:-/path/to/palacio-central/scripts/collect_hetzner_audit.sh}
SUDOERS_FILE=/etc/sudoers.d/${USERNAME}

usage(){
  cat <<EOF
Usage (run as root):
  USERNAME=auditor \
  PUBKEY="<your-ssh-public-key>" \
  COLLECTOR_PATH=/full/path/to/collect_hetzner_audit.sh \
  bash setup_auditor_user.sh

This will create user '$USERNAME', add the public key, and drop a sudoers file
that allows only running the collector, tar and sha256sum (no general sudo).
EOF
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: This script must be run as root. Use the Hetzner Console / Rescue or run with sudo." >&2
  exit 2
fi

if [ -z "$PUBKEY" ]; then
  echo "ERROR: PUBKEY environment variable is empty. Provide the SSH public key via PUBKEY env var." >&2
  usage
  exit 3
fi

if [ ! -f "$COLLECTOR_PATH" ]; then
  echo "WARNING: collector script not found at $COLLECTOR_PATH" >&2
  echo "Please adjust COLLECTOR_PATH to the actual path in the repo before running the auditor user." >&2
fi

echo "Creating user: $USERNAME"
if id "$USERNAME" >/dev/null 2>&1; then
  echo "User $USERNAME already exists — skipping useradd." 
else
  useradd -m -s /bin/bash "$USERNAME"
  # lock password to avoid password-based authentication
  passwd -l "$USERNAME" 2>/dev/null || true
fi

SSH_DIR="/home/$USERNAME/.ssh"
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"
chown $USERNAME:$USERNAME "$SSH_DIR"

echo "$PUBKEY" > "$SSH_DIR/authorized_keys"
chmod 600 "$SSH_DIR/authorized_keys"
chown $USERNAME:$USERNAME "$SSH_DIR/authorized_keys"

echo "Setting up sudoers file: $SUDOERS_FILE"
# Define the allowed commands. Adjust paths if your system uses different locations.
COLLECTOR_BIN="$COLLECTOR_PATH"
TAR_BIN="/bin/tar"
SHA_BIN="/usr/bin/sha256sum"
SCP_BIN="/usr/bin/scp"
CURL_BIN="/usr/bin/curl"

cat > "$SUDOERS_FILE" <<EOF
# Sudoers file created by setup_auditor_user.sh
Cmnd_Alias AUDIT_CMDS = \
  $COLLECTOR_BIN, \
  $TAR_BIN, \
  $SHA_BIN, \
  $SCP_BIN, \
  $CURL_BIN

$USERNAME ALL=(root) NOPASSWD: AUDIT_CMDS
EOF

chmod 440 "$SUDOERS_FILE"

echo "Validating sudoers syntax..."
if visudo -cf "$SUDOERS_FILE" >/dev/null 2>&1; then
  echo "Sudoers file OK."
else
  echo "ERROR: sudoers validation failed, removing $SUDOERS_FILE" >&2
  rm -f "$SUDOERS_FILE"
  exit 4
fi

echo
echo "DONE. The user '$USERNAME' was created (or already existed)."
echo "They can run the collector like this (as $USERNAME):"
echo "  sudo /bin/bash $COLLECTOR_BIN"
echo
echo "If the collector path in the sudoers file is incorrect, update $SUDOERS_FILE and re-run visudo -cf <file> to validate."
echo
echo "To revoke access later, on the host run as root:"
echo "  userdel -r $USERNAME && rm -f $SUDOERS_FILE"

exit 0
