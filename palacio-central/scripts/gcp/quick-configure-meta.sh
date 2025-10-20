#!/bin/bash

# ============================================================================
# SCRIPT RÁPIDO: Configurar Meta Tokens en 30 segundos
# App: IA Content Publisher (ID: 2161243464696662)
# ============================================================================

set -e

PROJECT_ID="goio-imperios-prod"
REGION="us-central1"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 CONFIGURACIÓN RÁPIDA DE META TOKENS${NC}"
echo "========================================"
echo ""
echo "App: IA Content Publisher"
echo "App ID: 2161243464696662"
echo ""

# Función para crear o actualizar secret
update_secret() {
    local name=$1
    local value=$2
    
    if gcloud secrets describe $name --project=$PROJECT_ID &>/dev/null; then
        echo -e "${YELLOW}Actualizando $name...${NC}"
        echo -n "$value" | gcloud secrets versions add $name --data-file=- --project=$PROJECT_ID
    else
        echo -e "${GREEN}Creando $name...${NC}"
        echo -n "$value" | gcloud secrets create $name --data-file=- --project=$PROJECT_ID
    fi
}

echo -e "${BLUE}📝 INGRESA LOS TOKENS (uno por uno):${NC}"
echo ""

# 1. Facebook Access Token (long-lived)
echo "1️⃣  FACEBOOK_ACCESS_TOKEN (long-lived, ~60 días)"
echo "   Formato: Empieza con EAAA..."
read -sp "   Pega aquí: " FB_TOKEN
echo ""
echo ""

# 2. Facebook Page ID
echo "2️⃣  FACEBOOK_PAGE_ID"
echo "   Formato: Número largo (ej: 123456789012345)"
read -p "   Pega aquí: " FB_PAGE_ID
echo ""

# 3. Instagram Account ID
echo "3️⃣  INSTAGRAM_ACCOUNT_ID"
echo "   Formato: Número largo (ej: 17841400000000000)"
read -p "   Pega aquí: " IG_ACCOUNT_ID
echo ""

# 4. Instagram Token (generalmente el mismo que Facebook)
echo "4️⃣  INSTAGRAM_ACCESS_TOKEN"
echo "   Formato: Mismo que Facebook o similar (EAAA...)"
read -sp "   Pega aquí (Enter para usar el mismo de Facebook): " IG_TOKEN
echo ""
echo ""

# Si no ingresó Instagram token, usar el de Facebook
if [ -z "$IG_TOKEN" ]; then
    IG_TOKEN="$FB_TOKEN"
    echo -e "${YELLOW}ℹ️  Usando mismo token de Facebook para Instagram${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Guardando en Secret Manager...${NC}"
echo ""

# Guardar secrets
update_secret "META_ACCESS_TOKEN" "$FB_TOKEN"
update_secret "FACEBOOK_PAGE_1_ID" "$FB_PAGE_ID"
update_secret "INSTAGRAM_ACCOUNT_ID" "$IG_ACCOUNT_ID"
update_secret "INSTAGRAM_TOKEN" "$IG_TOKEN"

echo ""
echo -e "${GREEN}✅ Tokens guardados exitosamente!${NC}"
echo ""

# Verificar secrets
echo -e "${BLUE}📊 Verificando secrets creados:${NC}"
gcloud secrets list --project=$PROJECT_ID \
    --filter="name~META OR name~FACEBOOK OR name~INSTAGRAM" \
    --format="table(name,createTime)" 2>/dev/null || true

echo ""
echo -e "${BLUE}🔄 Re-deployando Cloud Run con nuevos tokens...${NC}"
echo ""

cd ~/Goio-Store/palacio-central

# Verificar que deploy-palacio.sh existe
if [ ! -f "scripts/gcp/deploy-palacio.sh" ]; then
    echo -e "${YELLOW}⚠️  Script deploy-palacio.sh no encontrado${NC}"
    echo "Ejecuta manualmente:"
    echo "  bash scripts/gcp/deploy-palacio.sh"
    exit 0
fi

# Ejecutar deployment
bash scripts/gcp/deploy-palacio.sh

echo ""
echo -e "${GREEN}🎉 ¡COMPLETADO!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Verificar logs: gcloud run services logs tail palacio-central --region=us-central1"
echo "2. Ver agentes activos: curl https://palacio-central-416927190535.us-central1.run.app/health"
echo "3. Publicar test: curl -X POST https://palacio-central-416927190535.us-central1.run.app/api/test/publish"
echo ""
