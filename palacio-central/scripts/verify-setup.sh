#!/bin/bash
# scripts/verify-setup.sh - Verificar que todo esté listo para el deploy V2.0

set -e

echo "🔍 VERIFICACIÓN PRE-DEPLOY - Sistema Avanzado V2.0"
echo "===================================================="
echo ""

PROJECT_ID="goio-imperios-prod"
ERRORS=0
WARNINGS=0

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 1. VERIFICAR ARCHIVOS DE AGENTES
echo "📁 1/6 - Verificando archivos de agentes..."

REQUIRED_AGENTS=(
  "agents/trendhunter.js"
  "agents/research.js"
  "agents/imagegenerator.js"
  "agents/shopifysync.js"
  "agents/creative.js"
  "agents/publisher.js"
  "agents/groupmarketer.js"
  "agents/engagement.js"
)

for agent in "${REQUIRED_AGENTS[@]}"; do
  if [ -f "$agent" ]; then
    echo -e "  ${GREEN}✅${NC} $agent"
  else
    echo -e "  ${RED}❌${NC} $agent FALTA"
    ERRORS=$((ERRORS + 1))
  fi
done
echo ""

# 2. VERIFICAR SECRETOS EN GCP
echo "🔐 2/6 - Verificando secretos en Secret Manager..."

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
    # Verificar que tenga al menos 1 versión
    VERSIONS=$(gcloud secrets versions list "$secret" --project="$PROJECT_ID" --format="value(name)" --limit=1)
    if [ -n "$VERSIONS" ]; then
      echo -e "  ${GREEN}✅${NC} $secret (versión: $VERSIONS)"
    else
      echo -e "  ${YELLOW}⚠️${NC}  $secret existe pero sin versiones"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo -e "  ${RED}❌${NC} $secret NO EXISTE"
    ERRORS=$((ERRORS + 1))
    
    # Mostrar comando para crear
    if [ "$secret" = "OPENAI_API_KEY" ]; then
      echo "     Crear: gcloud secrets create $secret --replication-policy='automatic' --project=$PROJECT_ID"
      echo "     Valor: echo 'sk-proj-XXXXX' | gcloud secrets versions add $secret --data-file=- --project=$PROJECT_ID"
      echo "     Get key: https://platform.openai.com/api-keys"
    fi
  fi
done
echo ""

# 3. VERIFICAR DOCKERFILE
echo "🐳 3/6 - Verificando Dockerfile.cloudrun..."

if [ -f "Dockerfile.cloudrun" ]; then
  # Verificar que tenga Python3 y pytrends
  if grep -q "python3" Dockerfile.cloudrun && grep -q "pytrends" Dockerfile.cloudrun; then
    echo -e "  ${GREEN}✅${NC} Dockerfile.cloudrun con Python3 + pytrends"
  else
    echo -e "  ${YELLOW}⚠️${NC}  Dockerfile sin Python3 o pytrends"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "  ${RED}❌${NC} Dockerfile.cloudrun NO EXISTE"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. VERIFICAR package.json
echo "📦 4/6 - Verificando package.json..."

if [ -f "package.json" ]; then
  # Verificar dependencias críticas
  DEPS_OK=true
  
  if ! grep -q "\"@google/generative-ai\"" package.json; then
    echo -e "  ${YELLOW}⚠️${NC}  Falta @google/generative-ai"
    WARNINGS=$((WARNINGS + 1))
    DEPS_OK=false
  fi
  
  if ! grep -q "\"node-fetch\"" package.json; then
    echo -e "  ${YELLOW}⚠️${NC}  Falta node-fetch"
    WARNINGS=$((WARNINGS + 1))
    DEPS_OK=false
  fi
  
  if [ "$DEPS_OK" = true ]; then
    echo -e "  ${GREEN}✅${NC} package.json con dependencias correctas"
  fi
else
  echo -e "  ${RED}❌${NC} package.json NO EXISTE"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. VERIFICAR CONEXIÓN A GCP
echo "🌐 5/6 - Verificando conexión a GCP..."

if gcloud projects describe "$PROJECT_ID" &> /dev/null; then
  echo -e "  ${GREEN}✅${NC} Proyecto $PROJECT_ID accesible"
  
  # Verificar servicio Cloud Run
  if gcloud run services describe palacio-central --region=us-central1 --project="$PROJECT_ID" &> /dev/null; then
    echo -e "  ${GREEN}✅${NC} Servicio Cloud Run existe"
  else
    echo -e "  ${YELLOW}⚠️${NC}  Servicio Cloud Run no existe (se creará en deploy)"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "  ${RED}❌${NC} No se puede acceder al proyecto $PROJECT_ID"
  echo "     Ejecutar: gcloud config set project $PROJECT_ID"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. VERIFICAR CONFIG.JS
echo "⚙️  6/6 - Verificando scripts/config.js..."

if [ -f "scripts/config.js" ]; then
  # Verificar que tenga Facebook config
  if grep -q "facebook:" scripts/config.js && grep -q "META_ACCESS_TOKEN" scripts/config.js; then
    echo -e "  ${GREEN}✅${NC} config.js con credenciales de Facebook"
  else
    echo -e "  ${YELLOW}⚠️${NC}  config.js sin credenciales completas de Facebook"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # Verificar que tenga Shopify config
  if grep -q "shopify:" scripts/config.js; then
    echo -e "  ${GREEN}✅${NC} config.js con configuración de Shopify"
  else
    echo -e "  ${YELLOW}⚠️${NC}  config.js sin configuración de Shopify"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "  ${RED}❌${NC} scripts/config.js NO EXISTE"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# RESUMEN FINAL
echo "===================================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "===================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ TODO LISTO PARA DEPLOY${NC}"
  echo ""
  echo "Siguiente paso:"
  echo "  ./scripts/deploy-v2-advanced.sh"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  ADVERTENCIAS: $WARNINGS${NC}"
  echo ""
  echo "Puedes continuar pero revisa las advertencias arriba."
  echo ""
  echo "Para continuar:"
  echo "  ./scripts/deploy-v2-advanced.sh"
  echo ""
  exit 0
else
  echo -e "${RED}❌ ERRORES CRÍTICOS: $ERRORS${NC}"
  echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
  echo ""
  echo "Corrige los errores antes de hacer deploy."
  echo ""
  
  # Resumen de errores críticos
  if [ $ERRORS -gt 0 ]; then
    echo "ERRORES DETECTADOS:"
    
    # Verificar si falta OPENAI_API_KEY
    if ! gcloud secrets describe "OPENAI_API_KEY" --project="$PROJECT_ID" &> /dev/null; then
      echo ""
      echo "🔑 OPENAI_API_KEY faltante:"
      echo "   1. Crear cuenta: https://platform.openai.com/signup"
      echo "   2. Generar API key: https://platform.openai.com/api-keys"
      echo "   3. Ejecutar:"
      echo "      gcloud secrets create OPENAI_API_KEY --replication-policy='automatic' --project=$PROJECT_ID"
      echo "      echo 'sk-proj-XXXXX' | gcloud secrets versions add OPENAI_API_KEY --data-file=- --project=$PROJECT_ID"
      echo ""
      echo "   💡 Alternativa: Sistema funciona sin OPENAI_API_KEY (usa placeholders)"
    fi
    
    # Verificar si faltan agentes
    for agent in "${REQUIRED_AGENTS[@]}"; do
      if [ ! -f "$agent" ]; then
        echo ""
        echo "📁 Falta archivo: $agent"
        echo "   Ejecutar desde Cloud Shell o VS Code local"
      fi
    done
  fi
  
  exit 1
fi
