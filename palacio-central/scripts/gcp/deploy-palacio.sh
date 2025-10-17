#!/bin/bash
# ============================================
# DEPLOY PALACIO-CENTRAL A CLOUD RUN
# ============================================
# Deploy del backend principal con todos los agentes
# Ejecutar desde Cloud Shell en carpeta palacio-central/

set -e

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"
SERVICE_NAME="palacio-central"
IMAGE_TAG="v1.0.0"
IMAGE_PATH="$REGION-docker.pkg.dev/$PROJECT_ID/goio-images/$SERVICE_NAME"

echo "🏛️ DEPLOYING PALACIO-CENTRAL A CLOUD RUN"
echo "=========================================="
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
  echo "❌ Error: Ejecutar desde carpeta palacio-central/"
  exit 1
fi

# 1. Build de la imagen Docker
echo "🐳 Building Docker image..."
echo "   Imagen: $IMAGE_PATH:$IMAGE_TAG"
echo ""

docker build \
  -f Dockerfile.cloudrun \
  -t $IMAGE_PATH:$IMAGE_TAG \
  -t $IMAGE_PATH:latest \
  .

echo ""
echo "✅ Build completado"

# 2. Push a Artifact Registry
echo ""
echo "📦 Pushing image to Artifact Registry..."

docker push $IMAGE_PATH:$IMAGE_TAG
docker push $IMAGE_PATH:latest

echo ""
echo "✅ Push completado"

# 3. Deploy a Cloud Run
echo ""
echo "🚀 Deploying to Cloud Run..."
echo "   Servicio: $SERVICE_NAME"
echo "   Región: $REGION"
echo ""

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_PATH:$IMAGE_TAG \
  --region $REGION \
  --platform managed \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,SHOPIFY_ADMIN_TOKEN_PROD=SHOPIFY_ADMIN_TOKEN_PROD:latest,SHOPIFY_STORE_PROD=SHOPIFY_STORE_PROD:latest,SHOPIFY_DOMAIN_PROD=SHOPIFY_DOMAIN_PROD:latest,SHOPIFY_ADMIN_TOKEN_DEV=SHOPIFY_ADMIN_TOKEN_DEV:latest,SHOPIFY_DOMAIN_DEV=SHOPIFY_DOMAIN_DEV:latest,SHOPIFY_ADMIN_TOKEN_GLOBAL=SHOPIFY_ADMIN_TOKEN_GLOBAL:latest,SHOPIFY_STORE_GLOBAL=SHOPIFY_STORE_GLOBAL:latest,SHOPIFY_DOMAIN_GLOBAL=SHOPIFY_DOMAIN_GLOBAL:latest,META_ACCESS_TOKEN=META_ACCESS_TOKEN:latest,FACEBOOK_PAGE_1_ID=FACEBOOK_PAGE_1_ID:latest,FACEBOOK_PAGE_2_ID=FACEBOOK_PAGE_2_ID:latest,INSTAGRAM_ACCOUNT_ID=INSTAGRAM_ACCOUNT_ID:latest,INSTAGRAM_TOKEN=INSTAGRAM_TOKEN:latest" \
  --set-env-vars="NODE_ENV=production,LOG_LEVEL=info,TRACE_ENABLED=true"

# 4. Obtener URL del servicio
echo ""
echo "🌐 Obteniendo URL del servicio..."

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format='value(status.url)')

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT EXITOSO"
echo "=========================================="
echo ""
echo "🌐 URL del servicio:"
echo "   $SERVICE_URL"
echo ""
echo "🔍 Health check:"
echo "   curl $SERVICE_URL/health"
echo ""
echo "📊 Ver logs:"
echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
echo ""
echo "📈 Ver métricas:"
echo "   https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics"
echo ""

# 5. Verificar health check
echo "🩺 Verificando health check..."
sleep 5

if curl -f -s $SERVICE_URL/health > /dev/null; then
  echo "✅ Health check OK"
else
  echo "⚠️  Health check falló - revisar logs:"
  echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20"
fi

echo ""
echo "🎉 Deploy completado exitosamente"
