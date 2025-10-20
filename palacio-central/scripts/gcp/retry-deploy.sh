#!/bin/bash

# ============================================
# REINTENTAR DEPLOY SISTEMA ELITE V3.0
# Con fix del Dockerfile
# ============================================

echo "🔄 Actualizando código con fix del Dockerfile..."

# Actualizar código
cd ~/Goio-Store
git fetch origin
git reset --hard origin/master

echo "✅ Código actualizado a commit $(git rev-parse --short HEAD)"
echo ""

# Ir a palacio-central
cd palacio-central

# Re-ejecutar deploy
echo "🚀 Re-ejecutando deploy con fix..."
./scripts/gcp/deploy-elite-24-7.sh
