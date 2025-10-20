#!/bin/bash
#######################################################
# UPDATE & DEPLOY - Solo actualiza código y re-despliega
# (Sin rebuild de Docker - usa imagen existente)
#######################################################

set -e

PROJECT_ID="goio-imperios-prod"
SERVICE_NAME="palacio-central"
REGION="us-central1"

echo "⚡ UPDATE & QUICK DEPLOY - Palacio Central ELITE v3.0"
echo "======================================================"
echo ""

# Paso 1: Pull latest code
echo "📥 Actualizando código desde GitHub..."
git pull origin master
COMMIT=$(git rev-parse --short HEAD)
echo "✅ Código actualizado (commit: $COMMIT)"
echo ""

# Paso 2: Rebuild (rápido con caché)
echo "🐳 Rebuild Docker (con caché)..."
cp Dockerfile.cloudrun Dockerfile
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME} --timeout=5m . --quiet
rm -f Dockerfile
echo "✅ Imagen actualizada"
echo ""

# Paso 3: Deploy
echo "🚀 Desplegando nueva versión..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=3600 \
  --concurrency=1 \
  --max-instances=1 \
  --set-env-vars "NODE_ENV=production,TZ=America/Lima" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,SHOPIFY_STORE_URL=SHOPIFY_STORE_URL:latest,SHOPIFY_ACCESS_TOKEN=SHOPIFY_ACCESS_TOKEN:latest,FACEBOOK_PAGE_ID=FACEBOOK_PAGE_ID:latest,FACEBOOK_ACCESS_TOKEN=FACEBOOK_ACCESS_TOKEN:latest" \
  --quiet

echo ""
echo "✅ DEPLOY COMPLETADO"
echo ""

# Health check
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
echo "🔍 Health Check: ${SERVICE_URL}/health"
curl -s ${SERVICE_URL}/health | jq '.'
echo ""
echo "🔥 Sistema ELITE v3.0 actualizado y operativo"
