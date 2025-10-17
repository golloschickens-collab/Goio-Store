#!/bin/bash
# ============================================
# ROLLBACK A VERSIÓN ANTERIOR
# ============================================
# Vuelve a una revisión anterior de Cloud Run
# Ejecutar desde Cloud Shell si algo falla

set -e

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"

if [ -z "$1" ]; then
  echo "❌ Error: Especifica el nombre del servicio"
  echo ""
  echo "Uso: bash rollback.sh <servicio> [revision]"
  echo ""
  echo "Ejemplo:"
  echo "   bash rollback.sh palacio-central"
  echo "   bash rollback.sh palacio-central palacio-central-00002-abc"
  echo ""
  exit 1
fi

SERVICE_NAME=$1
REVISION=$2

echo "🔄 ROLLBACK DE $SERVICE_NAME"
echo "=============================="
echo ""

# Listar revisiones disponibles
echo "📋 Revisiones disponibles:"
echo ""

gcloud run revisions list \
  --service=$SERVICE_NAME \
  --region=$REGION \
  --format="table(metadata.name,status.conditions[0].status,metadata.creationTimestamp)"

echo ""

# Si no se especificó revisión, usar la anterior
if [ -z "$REVISION" ]; then
  echo "🔍 Buscando última revisión estable..."
  
  REVISION=$(gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --format='value(metadata.name)' \
    --limit=2 | tail -1)
  
  if [ -z "$REVISION" ]; then
    echo "❌ Error: No se encontró revisión anterior"
    exit 1
  fi
  
  echo "   Revisión seleccionada: $REVISION"
fi

echo ""
echo "⚠️  ¿Continuar con rollback a $REVISION? (y/N)"
read -r confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "❌ Rollback cancelado"
  exit 0
fi

# Ejecutar rollback
echo ""
echo "🔄 Ejecutando rollback..."

gcloud run services update-traffic $SERVICE_NAME \
  --region=$REGION \
  --to-revisions=$REVISION=100

echo ""
echo "✅ Rollback completado"
echo ""

# Verificar
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format='value(status.url)')

echo "🩺 Verificando servicio..."
sleep 5

if curl -f -s $SERVICE_URL/health > /dev/null; then
  echo "✅ Servicio operacional en: $SERVICE_URL"
else
  echo "⚠️  Health check falló - revisar logs:"
  echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20"
fi

echo ""
echo "📊 Ver estado actual:"
echo "   gcloud run services describe $SERVICE_NAME --region $REGION"
