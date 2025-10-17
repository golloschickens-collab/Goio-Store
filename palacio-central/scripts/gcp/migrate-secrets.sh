#!/bin/bash
# ============================================
# MIGRAR SECRETS A SECRET MANAGER
# ============================================
# Migra credenciales desde .env a GCP Secret Manager
# Ejecutar desde Cloud Shell después de subir .env

set -e

echo "🔐 Migrando secrets a GCP Secret Manager..."

# Verificar que existe el archivo .env
if [ ! -f "../../palacio-central.env" ]; then
  echo "❌ Error: No se encuentra palacio-central.env"
  echo "   Sube el archivo a Cloud Shell primero"
  exit 1
fi

# Cargar variables desde .env
source ../../palacio-central.env

# Función para crear secret
create_secret() {
  local name=$1
  local value=$2
  
  if [ -z "$value" ]; then
    echo "⚠️  Omitiendo $name (valor vacío)"
    return
  fi
  
  # Verificar si el secret ya existe
  if gcloud secrets describe $name &>/dev/null; then
    echo "📝 Actualizando $name..."
    echo -n "$value" | gcloud secrets versions add $name --data-file=-
  else
    echo "✅ Creando $name..."
    echo -n "$value" | gcloud secrets create $name --data-file=-
  fi
}

# Secrets principales
echo ""
echo "🔑 Secrets de APIs..."
create_secret "GEMINI_API_KEY" "$GEMINI_API_KEY"
create_secret "SHOPIFY_ADMIN_TOKEN_PROD" "$SHOPIFY_ADMIN_TOKEN_PROD"
create_secret "SHOPIFY_STORE_PROD" "$SHOPIFY_STORE_PROD"

echo ""
echo "📱 Secrets de Social Media..."
create_secret "META_ACCESS_TOKEN" "$META_ACCESS_TOKEN"
create_secret "FACEBOOK_PAGE_1_ID" "$FACEBOOK_PAGE_1_ID"
create_secret "FACEBOOK_PAGE_2_ID" "$FACEBOOK_PAGE_2_ID"
create_secret "INSTAGRAM_ACCOUNT_ID" "$INSTAGRAM_ACCOUNT_ID"
create_secret "INSTAGRAM_TOKEN" "$INSTAGRAM_TOKEN"

echo ""
echo "💬 Secrets de WhatsApp..."
create_secret "WHATSAPP_ACCESS_TOKEN" "$WHATSAPP_ACCESS_TOKEN"
create_secret "WHATSAPP_PHONE_NUMBER_ID" "$WHATSAPP_PHONE_NUMBER_ID"
create_secret "WHATSAPP_VERIFY_TOKEN" "$WHATSAPP_VERIFY_TOKEN"

echo ""
echo "🗄️  Secrets de Base de Datos..."
create_secret "DB_PASSWORD" "$DB_PASSWORD"
create_secret "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"

echo ""
echo "✅ Secrets migrados correctamente"
echo ""
echo "📊 Verificar secrets creados:"
echo "   gcloud secrets list"
echo ""
echo "🔍 Ver valor de un secret:"
echo "   gcloud secrets versions access latest --secret=GEMINI_API_KEY"
