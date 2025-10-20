#!/bin/bash
#######################################################
# QUICK RE-DEPLOY - Sistema ELITE V3.0 Cloud Run
# Solo actualiza código y re-despliega (sin rebuild)
#######################################################

set -e

PROJECT_ID="goio-imperios-prod"
SERVICE_NAME="palacio-central"
REGION="us-central1"

echo "🔄 RE-DEPLOY RÁPIDO - Palacio Central ELITE v3.0"
echo "================================================"
echo ""

# Paso 1: Pull latest code
echo "📥 Paso 1/3: Descargando último código desde GitHub..."
cd ~/Goio-Store/palacio-central || exit 1
git pull origin master
echo "✅ Código actualizado (commit: $(git rev-parse --short HEAD))"
echo ""

# Paso 2: Rebuild Docker image
echo "🐳 Paso 2/3: Reconstruyendo imagen Docker..."
echo "   (Esto puede tomar 2-3 minutos con caché...)"

# Copiar Dockerfile temporal
cp Dockerfile.cloudrun Dockerfile

gcloud builds submit \
  --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --timeout=10m \
  .

# Limpiar Dockerfile temporal
rm -f Dockerfile

echo "✅ Imagen Docker reconstruida exitosamente"
echo ""

# Paso 3: Deploy to Cloud Run
echo "🚀 Paso 3/3: Desplegando nueva versión a Cloud Run..."

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

# Verificar deployment
echo "🔍 Verificando servicio..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region=${REGION} \
  --format='value(status.url)')

echo ""
echo "================================================"
echo "🎉 RE-DEPLOY EXITOSO"
echo "================================================"
echo ""
echo "Service URL: ${SERVICE_URL}"
echo "Health Check: ${SERVICE_URL}/health"
echo ""
echo "Probando health check..."
curl -s ${SERVICE_URL}/health | jq '.'
echo ""
echo "🔥 Sistema ELITE v3.0 operativo en Cloud Run 24/7"
