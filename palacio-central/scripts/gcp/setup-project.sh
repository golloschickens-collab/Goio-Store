#!/bin/bash
# ============================================
# SETUP PROYECTO GCP - FASE 0
# ============================================
# Crea proyecto, habilita billing y servicios
# Ejecutar desde Cloud Shell

set -e

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"

echo "🏛️ SETUP GOIO IMPERIOS - GOOGLE CLOUD PLATFORM"
echo "================================================"
echo ""

# 1. Crear proyecto
echo "📦 Creando proyecto $PROJECT_ID..."
if gcloud projects describe $PROJECT_ID &>/dev/null; then
  echo "✅ Proyecto ya existe"
else
  gcloud projects create $PROJECT_ID --name="Goio Imperios Prod"
  echo "✅ Proyecto creado"
fi

# 2. Configurar proyecto por defecto
echo ""
echo "⚙️  Configurando proyecto por defecto..."
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION
gcloud config set compute/region $REGION

# 3. Vincular billing (requiere cuenta con billing activa)
echo ""
echo "💳 Vinculando billing..."
BILLING_ACCOUNT=$(gcloud billing accounts list --format='value(ACCOUNT_ID)' | head -1)

if [ -z "$BILLING_ACCOUNT" ]; then
  echo "⚠️  No se encontró cuenta de billing"
  echo "   Configura billing manualmente en:"
  echo "   https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
else
  gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
  echo "✅ Billing vinculado: $BILLING_ACCOUNT"
fi

# 4. Habilitar servicios
echo ""
echo "🚀 Habilitando servicios GCP..."
bash $(dirname $0)/enable-all-services.sh

# 5. Crear Artifact Registry
echo ""
echo "📦 Creando Artifact Registry..."
if gcloud artifacts repositories describe goio-images --location=$REGION &>/dev/null; then
  echo "✅ Artifact Registry ya existe"
else
  gcloud artifacts repositories create goio-images \
    --repository-format=docker \
    --location=$REGION \
    --description="Imágenes Docker de Goio Imperios"
  echo "✅ Artifact Registry creado"
fi

# 6. Configurar autenticación Docker
echo ""
echo "🐳 Configurando Docker..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# 7. Crear bucket para backups
echo ""
echo "💾 Creando Cloud Storage buckets..."
gsutil mb -l $REGION -c STANDARD gs://goio-backups-prod 2>/dev/null || echo "✅ Bucket backups ya existe"
gsutil mb -l $REGION -c COLDLINE gs://goio-logs-archive 2>/dev/null || echo "✅ Bucket logs ya existe"

echo ""
echo "================================================"
echo "✅ SETUP COMPLETADO"
echo "================================================"
echo ""
echo "📊 Información del proyecto:"
echo "   Project ID: $PROJECT_ID"
echo "   Región: $REGION"
echo "   Artifact Registry: $REGION-docker.pkg.dev/$PROJECT_ID/goio-images"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Subir archivo palacio-central.env a Cloud Shell"
echo "   2. Ejecutar: bash scripts/gcp/migrate-secrets.sh"
echo "   3. Ejecutar: bash scripts/gcp/deploy-palacio.sh"
echo ""
echo "📖 Ver documentación completa en:"
echo "   cat MIGRACION_IMPERIAL_GCP.md"
