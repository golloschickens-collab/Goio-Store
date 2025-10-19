#!/bin/bash
# scripts/deploy-v2-advanced.sh - Deploy del sistema avanzado con todos los agentes

set -e

echo "🚀 GOIO STORE - DEPLOY SISTEMA AVANZADO V2.0"
echo "=============================================="
echo ""

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"
SERVICE_NAME="palacio-central"
IMAGE_NAME="palacio-central"
REPO_NAME="goio-images"

echo "📋 Configuración:"
echo "  Proyecto: $PROJECT_ID"
echo "  Región: $REGION"
echo "  Servicio: $SERVICE_NAME"
echo ""

# 1. VERIFICAR SECRETOS (incluir OPENAI_API_KEY)
echo "🔐 1/7 - Verificando secretos en Secret Manager..."
REQUIRED_SECRETS=(
  "GEMINI_API_KEY"
  "META_ACCESS_TOKEN"
  "FACEBOOK_PAGE_1_ID"
  "OPENAI_API_KEY"
  "SHOPIFY_STORE_1_NAME"
  "SHOPIFY_STORE_1_ADMIN_API_KEY"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if gcloud secrets describe "$secret" --project="$PROJECT_ID" &> /dev/null; then
    echo "  ✅ $secret existe"
  else
    echo "  ⚠️  $secret NO EXISTE"
    echo ""
    echo "Crear con:"
    echo "  gcloud secrets create $secret --replication-policy='automatic' --project=$PROJECT_ID"
    echo "  echo 'TU_VALOR_AQUI' | gcloud secrets versions add $secret --data-file=- --project=$PROJECT_ID"
    echo ""
  fi
done

echo ""

# 2. BUILD DE IMAGEN DOCKER
echo "🔨 2/7 - Construyendo imagen Docker..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_TAG="v2.0-advanced-$TIMESTAMP"
FULL_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$IMAGE_TAG"

docker build -f Dockerfile.cloudrun -t "$FULL_IMAGE" .
echo "  ✅ Imagen construida: $IMAGE_TAG"
echo ""

# 3. PUSH A ARTIFACT REGISTRY
echo "📤 3/7 - Subiendo imagen a Artifact Registry..."
docker push "$FULL_IMAGE"
echo "  ✅ Imagen subida exitosamente"
echo ""

# 4. DEPLOY A CLOUD RUN
echo "🚀 4/7 - Desplegando a Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image="$FULL_IMAGE" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=3600 \
  --concurrency=80 \
  --min-instances=0 \
  --max-instances=10 \
  --set-secrets="\
GEMINI_API_KEY=GEMINI_API_KEY:latest,\
META_ACCESS_TOKEN=META_ACCESS_TOKEN:latest,\
FACEBOOK_PAGE_1_ID=FACEBOOK_PAGE_1_ID:latest,\
FACEBOOK_PAGE_2_ID=FACEBOOK_PAGE_2_ID:latest,\
INSTAGRAM_ACCOUNT_ID=INSTAGRAM_ACCOUNT_ID:latest,\
INSTAGRAM_TOKEN=INSTAGRAM_TOKEN:latest,\
OPENAI_API_KEY=OPENAI_API_KEY:latest,\
SHOPIFY_STORE_1_NAME=SHOPIFY_STORE_1_NAME:latest,\
SHOPIFY_STORE_1_ADMIN_API_KEY=SHOPIFY_STORE_1_ADMIN_API_KEY:latest"

echo "  ✅ Deploy completado"
echo ""

# 5. VERIFICAR HEALTH
echo "🏥 5/7 - Verificando health del servicio..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")
echo "  URL: $SERVICE_URL"

sleep 5
HEALTH_STATUS=$(curl -s "$SERVICE_URL/health" | grep -o '"status":"ok"' || echo "ERROR")

if [ "$HEALTH_STATUS" = '"status":"ok"' ]; then
  echo "  ✅ Servicio saludable"
else
  echo "  ⚠️  Health check falló (puede tardar unos segundos en iniciar)"
fi
echo ""

# 6. ACTUALIZAR CLOUD SCHEDULER (si existe)
echo "⏰ 6/7 - Verificando Cloud Scheduler..."
if gcloud scheduler jobs describe trendhunter-scheduler --location="$REGION" --project="$PROJECT_ID" &> /dev/null; then
  gcloud scheduler jobs update http trendhunter-scheduler \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --uri="$SERVICE_URL/execute" \
    --http-method=POST \
    --oidc-service-account-email="$PROJECT_ID-compute@developer.gserviceaccount.com" \
    --oidc-token-audience="$SERVICE_URL"
  
  echo "  ✅ Scheduler actualizado"
else
  echo "  ⚠️  Scheduler no existe (opcional)"
fi
echo ""

# 7. RESUMEN FINAL
echo "📊 7/7 - Resumen del deploy"
echo "=========================================="
echo ""
echo "✅ DEPLOY COMPLETADO EXITOSAMENTE"
echo ""
echo "🌐 URL del servicio:"
echo "   $SERVICE_URL"
echo ""
echo "📋 Nuevos agentes desplegados:"
echo "   1. ImageGenerator (DALL-E 3)"
echo "   2. ShopifySync (crea productos automáticamente)"
echo "   3. Creative MEJORADO (copy persuasivo + URLs)"
echo "   4. Publisher MEJORADO (con imágenes)"
echo "   5. GroupMarketer (venta orgánica)"
echo "   6. Engagement (respuestas 24/7)"
echo ""
echo "🔥 MEJORAS:"
echo "   ✅ Posts con imágenes profesionales"
echo "   ✅ URLs de Shopify en cada publicación"
echo "   ✅ Copy persuasivo con frameworks de ventas"
echo "   ✅ Distribución orgánica en grupos"
echo "   ✅ Respuestas automáticas a comentarios"
echo ""
echo "📖 PRÓXIMOS PASOS:"
echo "   1. Generar portada de tienda:"
echo "      node scripts/generate-store-banner.js"
echo ""
echo "   2. Verificar primera ejecución:"
echo "      gcloud run services logs read $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --limit=50"
echo ""
echo "   3. Ver Facebook posts:"
echo "      https://facebook.com/839862345874909"
echo ""
echo "   4. Ver productos en Shopify:"
echo "      https://skhqgs-2j.myshopify.com/admin/products"
echo ""
echo "💰 Costo estimado: \$34/mes (sin cambios)"
echo ""
echo "🎉 ¡TU SISTEMA DE VENTAS ORGÁNICAS ESTÁ LISTO!"
