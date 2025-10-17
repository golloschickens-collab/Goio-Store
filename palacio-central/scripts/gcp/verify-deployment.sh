#!/bin/bash
# ============================================
# VERIFICAR DEPLOYMENT COMPLETO
# ============================================
# Verifica que todos los servicios estén operacionales
# Ejecutar desde Cloud Shell

set -e

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"

echo "🔍 VERIFICACIÓN DE DEPLOYMENT - GOIO IMPERIOS"
echo "=============================================="
echo ""

# Función para verificar servicio
check_service() {
  local service=$1
  local endpoint=$2
  
  echo "📦 Verificando $service..."
  
  if ! gcloud run services describe $service --region $REGION &>/dev/null; then
    echo "   ❌ Servicio no encontrado"
    return 1
  fi
  
  local url=$(gcloud run services describe $service --region $REGION --format='value(status.url)')
  echo "   🌐 URL: $url"
  
  # Health check
  if curl -f -s $url$endpoint > /dev/null 2>&1; then
    echo "   ✅ Health check OK"
  else
    echo "   ⚠️  Health check falló"
    echo "   🔍 Ver logs: gcloud run services logs read $service --region $REGION --limit 20"
  fi
  
  # Métricas
  local replicas=$(gcloud run services describe $service --region $REGION --format='value(status.traffic[0].percent)')
  echo "   📊 Tráfico activo: ${replicas:-100}%"
  
  echo ""
}

# Verificar servicios
echo "🚀 Servicios Cloud Run:"
echo ""

check_service "palacio-central" "/health"
# check_service "whatsapp-crm" "/health"
# check_service "goio-store" "/health"
# check_service "gollos-landing" "/"
# check_service "eco-eterno" "/"

# Verificar secrets
echo "🔐 Secrets Manager:"
echo ""

SECRETS_COUNT=$(gcloud secrets list --format='value(name)' | wc -l)
echo "   📊 Secrets configurados: $SECRETS_COUNT"

if [ $SECRETS_COUNT -lt 5 ]; then
  echo "   ⚠️  Faltan secrets - ejecutar: bash scripts/gcp/migrate-secrets.sh"
else
  echo "   ✅ Secrets OK"
fi

echo ""

# Verificar Artifact Registry
echo "📦 Artifact Registry:"
echo ""

IMAGES_COUNT=$(gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/goio-images --format='value(package)' | sort -u | wc -l)
echo "   📊 Imágenes en registry: $IMAGES_COUNT"

if [ $IMAGES_COUNT -lt 1 ]; then
  echo "   ⚠️  No hay imágenes - ejecutar: bash scripts/gcp/deploy-palacio.sh"
else
  echo "   ✅ Registry OK"
fi

echo ""

# Verificar Cloud SQL (si existe)
echo "🗄️  Cloud SQL:"
echo ""

if gcloud sql instances list --format='value(name)' | grep -q "crm-gollos-prod"; then
  echo "   ✅ Instancia crm-gollos-prod activa"
else
  echo "   ⏳ No configurado (opcional)"
fi

echo ""

# Verificar Cloud Storage
echo "💾 Cloud Storage:"
echo ""

if gsutil ls gs://goio-backups-prod &>/dev/null; then
  echo "   ✅ Bucket backups configurado"
else
  echo "   ⚠️  Bucket backups no existe"
fi

echo ""

# Verificar Cloud Scheduler
echo "⏰ Cloud Scheduler:"
echo ""

JOBS_COUNT=$(gcloud scheduler jobs list --format='value(name)' | wc -l)
echo "   📊 Jobs configurados: $JOBS_COUNT"

if [ $JOBS_COUNT -lt 1 ]; then
  echo "   ⏳ No configurado (FASE 5)"
else
  echo "   ✅ Scheduler OK"
fi

echo ""

# Logs recientes
echo "📋 Logs recientes (últimos 10):"
echo ""

gcloud logging read "resource.type=cloud_run_revision" \
  --limit 10 \
  --format="table(timestamp,resource.labels.service_name,severity,jsonPayload.message)" \
  2>/dev/null || echo "   ⏳ No hay logs aún"

echo ""
echo "=============================================="
echo "✅ VERIFICACIÓN COMPLETADA"
echo "=============================================="
echo ""
echo "📊 Dashboard completo:"
echo "   https://console.cloud.google.com/run?project=$PROJECT_ID"
echo ""
echo "📈 Métricas y logs:"
echo "   https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo ""
echo "💰 Costos actuales:"
echo "   https://console.cloud.google.com/billing?project=$PROJECT_ID"
