#!/bin/bash
# 🔱 SCRIPT DE DEPLOYMENT AUTOMÁTICO - GOOGLE CLOUD RUN
# Proyecto: Goio Imperios - Palacio Central
# Fecha: 16 de octubre de 2025
# Uso: ./gcp_deploy.sh

set -e  # Exit on error

# ============================================
# CONFIGURACIÓN
# ============================================
PROJECT_ID="goio-imperios-prod"
REGION="us-central1"
SERVICE_NAME="palacio-central"
REPOSITORY="goio-repo"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "manual")

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES AUXILIARES
# ============================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 no está instalado. Por favor instalar antes de continuar."
        exit 1
    fi
}

# ============================================
# PASO 0: VALIDACIONES PRE-DEPLOYMENT
# ============================================
log_info "🔍 Validando pre-requisitos..."

# Verificar comandos necesarios
check_command "gcloud"
check_command "docker"
check_command "git"

# Verificar autenticación gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    log_error "No estás autenticado en gcloud. Ejecuta: gcloud auth login"
    exit 1
fi

log_success "Autenticación verificada"

# Verificar proyecto configurado
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    log_warning "Proyecto actual: $CURRENT_PROJECT"
    log_info "Configurando proyecto: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi

log_success "Proyecto configurado: $PROJECT_ID"

# ============================================
# PASO 1: CREAR REPOSITORIO ARTIFACT REGISTRY (SI NO EXISTE)
# ============================================
log_info "📦 Verificando Artifact Registry..."

if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &> /dev/null; then
    log_info "Creando repositorio $REPOSITORY..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Goio Imperios Docker Images"
    log_success "Repositorio creado"
else
    log_success "Repositorio ya existe"
fi

# ============================================
# PASO 2: CONFIGURAR DOCKER AUTHENTICATION
# ============================================
log_info "🔐 Configurando autenticación Docker..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
log_success "Docker configurado"

# ============================================
# PASO 3: BUILD DE IMAGEN DOCKER
# ============================================
log_info "🔨 Construyendo imagen Docker..."
log_info "Commit SHA: $COMMIT_SHA"

docker build \
    -f Dockerfile.cloudrun \
    -t ${IMAGE_NAME}:${COMMIT_SHA} \
    -t ${IMAGE_NAME}:latest \
    --build-arg NODE_ENV=production \
    .

log_success "Imagen construida exitosamente"

# ============================================
# PASO 4: PUSH A ARTIFACT REGISTRY
# ============================================
log_info "⬆️  Subiendo imagen a Artifact Registry..."

docker push ${IMAGE_NAME}:${COMMIT_SHA}
docker push ${IMAGE_NAME}:latest

log_success "Imagen subida: ${IMAGE_NAME}:${COMMIT_SHA}"

# ============================================
# PASO 5: CREAR/ACTUALIZAR SECRETS (SI NO EXISTEN)
# ============================================
log_info "🔒 Verificando secrets..."

create_secret_if_not_exists() {
    local secret_name=$1
    local secret_value=$2
    
    if ! gcloud secrets describe $secret_name &> /dev/null; then
        log_info "Creando secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
        log_success "Secret $secret_name creado"
    else
        log_info "Secret $secret_name ya existe"
    fi
}

# Leer valores de .env si existe
if [ -f .env ]; then
    source .env
    
    # Crear secrets necesarios
    [ ! -z "$GEMINI_API_KEY" ] && create_secret_if_not_exists "GEMINI_API_KEY" "$GEMINI_API_KEY"
    [ ! -z "$SHOPIFY_ADMIN_TOKEN_PROD" ] && create_secret_if_not_exists "SHOPIFY_ADMIN_TOKEN_PROD" "$SHOPIFY_ADMIN_TOKEN_PROD"
    [ ! -z "$SHOPIFY_ADMIN_TOKEN_GLOBAL" ] && create_secret_if_not_exists "SHOPIFY_ADMIN_TOKEN_GLOBAL" "$SHOPIFY_ADMIN_TOKEN_GLOBAL"
    [ ! -z "$META_ACCESS_TOKEN_GOLLOS" ] && create_secret_if_not_exists "META_ACCESS_TOKEN_GOLLOS" "$META_ACCESS_TOKEN_GOLLOS"
    [ ! -z "$METRICS_TOKEN" ] && create_secret_if_not_exists "METRICS_TOKEN" "$METRICS_TOKEN"
else
    log_warning "Archivo .env no encontrado, usando secrets existentes"
fi

# ============================================
# PASO 6: DEPLOY A CLOUD RUN
# ============================================
log_info "🚀 Desplegando a Cloud Run..."

gcloud run deploy $SERVICE_NAME \
    --image=${IMAGE_NAME}:${COMMIT_SHA} \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=8080 \
    --cpu=1 \
    --memory=512Mi \
    --min-instances=0 \
    --max-instances=3 \
    --timeout=300s \
    --concurrency=80 \
    --set-env-vars="NODE_ENV=production,PORT=8080,LOG_LEVEL=info" \
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,SHOPIFY_ADMIN_TOKEN_PROD=SHOPIFY_ADMIN_TOKEN_PROD:latest,SHOPIFY_ADMIN_TOKEN_GLOBAL=SHOPIFY_ADMIN_TOKEN_GLOBAL:latest,META_ACCESS_TOKEN_GOLLOS=META_ACCESS_TOKEN_GOLLOS:latest,METRICS_TOKEN=METRICS_TOKEN:latest" \
    --quiet

log_success "Deployment completado"

# ============================================
# PASO 7: OBTENER URL DEL SERVICIO
# ============================================
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

log_success "🌍 Servicio desplegado en: $SERVICE_URL"

# ============================================
# PASO 8: VERIFICAR HEALTHCHECK
# ============================================
log_info "🏥 Verificando healthcheck..."

sleep 5  # Esperar que el servicio esté listo

if curl -f -s "${SERVICE_URL}/health" > /dev/null; then
    log_success "✅ Healthcheck OK"
else
    log_error "❌ Healthcheck falló"
    log_info "Logs del servicio:"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=20 --format=json
    exit 1
fi

# ============================================
# PASO 9: VERIFICAR ENDPOINT METRICS
# ============================================
log_info "📊 Verificando endpoint /metrics..."

METRICS_TOKEN_VALUE=$(gcloud secrets versions access latest --secret="METRICS_TOKEN" 2>/dev/null || echo "")

if [ ! -z "$METRICS_TOKEN_VALUE" ]; then
    if curl -f -s -H "Authorization: Bearer $METRICS_TOKEN_VALUE" "${SERVICE_URL}/metrics" > /dev/null; then
        log_success "✅ Endpoint /metrics OK"
    else
        log_warning "⚠️ Endpoint /metrics no accesible (puede ser normal si no está implementado)"
    fi
else
    log_warning "⚠️ METRICS_TOKEN no encontrado, saltando verificación"
fi

# ============================================
# PASO 10: RESUMEN FINAL
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Información del Deployment:"
echo "   Proyecto: $PROJECT_ID"
echo "   Región: $REGION"
echo "   Servicio: $SERVICE_NAME"
echo "   Imagen: ${IMAGE_NAME}:${COMMIT_SHA}"
echo "   URL: $SERVICE_URL"
echo ""
echo "🔗 Enlaces útiles:"
echo "   Cloud Run Console: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}"
echo "   Logs: https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_revision%22"
echo "   Métricas: https://console.cloud.google.com/monitoring"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: gcloud logging tail 'resource.type=cloud_run_revision'"
echo "   Ver métricas: gcloud run services describe $SERVICE_NAME --region=$REGION"
echo "   Rollback: gcloud run services update-traffic $SERVICE_NAME --to-revisions=PREVIOUS=100"
echo ""
log_info "✅ Deployment finalizado correctamente"
