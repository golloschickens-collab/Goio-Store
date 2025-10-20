#!/bin/bash

# ============================================================================
# SCRIPT: Configurar Tokens de Meta (Facebook/Instagram) en Secret Manager
# ============================================================================

set -e

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"

echo "🔐 CONFIGURADOR DE TOKENS META - GOIO IMPERIOS"
echo "=============================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para crear/actualizar secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe $secret_name --project=$PROJECT_ID &>/dev/null; then
        echo -e "${YELLOW}Secret $secret_name ya existe. Actualizando...${NC}"
        echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=- --project=$PROJECT_ID
    else
        echo -e "${GREEN}Creando secret $secret_name...${NC}"
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- --project=$PROJECT_ID
    fi
}

echo "📋 MÉTODO 1: Ingreso Manual (Recomendado)"
echo "=========================================="
echo ""
echo "Si ya tienes los tokens, ingrésalos ahora:"
echo ""

read -p "¿Tienes el FACEBOOK_ACCESS_TOKEN? (s/n): " has_fb_token

if [ "$has_fb_token" = "s" ] || [ "$has_fb_token" = "S" ]; then
    echo ""
    read -sp "Pega tu FACEBOOK_ACCESS_TOKEN (no se mostrará): " fb_token
    echo ""
    read -p "Pega tu FACEBOOK_PAGE_ID: " fb_page_id
    read -p "Pega tu INSTAGRAM_ACCOUNT_ID: " ig_account_id
    read -sp "Pega tu INSTAGRAM_ACCESS_TOKEN (generalmente es el mismo que Facebook): " ig_token
    echo ""
    echo ""
    
    echo "🔒 Guardando tokens en Secret Manager..."
    create_or_update_secret "META_ACCESS_TOKEN" "$fb_token"
    create_or_update_secret "FACEBOOK_PAGE_1_ID" "$fb_page_id"
    create_or_update_secret "INSTAGRAM_ACCOUNT_ID" "$ig_account_id"
    create_or_update_secret "INSTAGRAM_TOKEN" "$ig_token"
    
    echo ""
    echo -e "${GREEN}✅ Tokens guardados exitosamente!${NC}"
    echo ""
    echo "🔄 Actualizando deployment de Cloud Run..."
    cd ~/Goio-Store/palacio-central
    bash scripts/gcp/deploy-palacio.sh
    
    echo ""
    echo -e "${GREEN}🎉 ¡COMPLETADO! Facebook/Instagram configurados${NC}"
    
elif [ "$has_fb_token" = "n" ] || [ "$has_fb_token" = "N" ]; then
    echo ""
    echo "📖 MÉTODO 2: Guía Paso a Paso"
    echo "=============================="
    echo ""
    echo "Sigue estos pasos en tu navegador:"
    echo ""
    echo "1️⃣  Abre: https://developers.facebook.com/tools/explorer/"
    echo ""
    echo "2️⃣  En 'Meta App' → Selecciona tu app (o crea una nueva)"
    echo ""
    echo "3️⃣  Click en 'Generate Access Token' → Selecciona tu página"
    echo ""
    echo "4️⃣  Marca estos permisos:"
    echo "    ☑️  pages_show_list"
    echo "    ☑️  pages_manage_posts"
    echo "    ☑️  pages_read_engagement"
    echo "    ☑️  instagram_basic"
    echo "    ☑️  instagram_content_publish"
    echo ""
    echo "5️⃣  Copia el token generado (empieza con EAAA...)"
    echo ""
    echo "6️⃣  Obtén tu PAGE_ID ejecutando:"
    echo "    curl \"https://graph.facebook.com/v18.0/me/accounts?access_token=TU_TOKEN\""
    echo ""
    echo "7️⃣  Obtén tu INSTAGRAM_ID ejecutando:"
    echo "    curl \"https://graph.facebook.com/v18.0/PAGE_ID?fields=instagram_business_account&access_token=TU_TOKEN\""
    echo ""
    echo "8️⃣  Ejecuta este script nuevamente con los tokens"
    echo ""
fi

echo ""
echo "📊 MÉTODO 3: Verificar Tokens Actuales"
echo "======================================"
echo ""
gcloud secrets list --project=$PROJECT_ID --filter="name~META OR name~FACEBOOK OR name~INSTAGRAM" --format="table(name,createTime)" || true

echo ""
echo "💡 TIP: Si necesitas ayuda, lee: docs/META_TOKENS_GUIDE.md"
echo ""
