#!/bin/bash
# 🚀 DEPLOY AGENTES ELITE A GOOGLE CLOUD RUN

echo "================================================================================"
echo "🤖 DEPLOY: Agentes ELITE + Palacio Central a Cloud Run"
echo "================================================================================"
echo ""

# Verificar Cloud Shell
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "⚠️  No estás en Google Cloud Shell"
    echo "   Abre: https://console.cloud.google.com/cloudshell"
    exit 1
fi

echo "✅ Cloud Shell detectado"
echo "📦 Proyecto: $GOOGLE_CLOUD_PROJECT"
echo ""

# Configurar proyecto
PROJECT_ID="goio-imperios-prod"
REGION="us-central1"
SERVICE_NAME="palacio-central"

echo "🔧 Configurando proyecto..."
gcloud config set project $PROJECT_ID

# Clonar/actualizar repositorio
echo ""
echo "📥 Clonando/actualizando repositorio..."
cd ~
if [ -d "Goio-Store" ]; then
    echo "   Repositorio existe, actualizando..."
    cd Goio-Store
    git pull origin master
else
    echo "   Clonando repositorio..."
    git clone https://github.com/golloschickens-collab/Goio-Store.git
    cd Goio-Store
fi

cd palacio-central

# Verificar que los agentes están presentes
echo ""
echo "🔍 Verificando agentes ELITE..."
if [ -d "agents" ]; then
    AGENT_COUNT=$(ls -1 agents/*.js 2>/dev/null | wc -l)
    echo "   ✅ Encontrados $AGENT_COUNT agentes"
else
    echo "   ❌ No se encuentra carpeta agents/"
    exit 1
fi

# Crear Dockerfile.cloudrun si no existe
echo ""
echo "📦 Creando Dockerfile para Cloud Run..."
cat > Dockerfile.cloudrun << 'DOCKERFILE'
# Dockerfile para Cloud Run - Palacio Central + Agentes ELITE
FROM node:18-slim

# Variables de entorno básicas
ENV NODE_ENV=production
ENV PORT=8080

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias Node.js
RUN npm ci --only=production

# Copiar código de la aplicación
COPY . .

# Crear directorios para reportes
RUN mkdir -p reports/store-perfection reports/copywriting reports/images reports/trust reports/auto-fix

# Exponer puerto
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicio
CMD ["node", "start.js"]
DOCKERFILE

echo "   ✅ Dockerfile.cloudrun creado"

# Crear .gcloudignore
echo ""
echo "📝 Creando .gcloudignore..."
cat > .gcloudignore << 'IGNORE'
node_modules/
.git/
.env
.env.local
*.log
.DS_Store
reports/
generated/
IGNORE

echo "   ✅ .gcloudignore creado"

# Construir y subir imagen
echo ""
echo "🏗️  Construyendo imagen Docker..."
echo "   (Esto puede tardar 3-5 minutos)"
echo ""

gcloud builds submit \
    --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
    --timeout=15m \
    --machine-type=e2-highcpu-8 \
    .

if [ $? -ne 0 ]; then
    echo "❌ Error en construcción de imagen"
    exit 1
fi

echo ""
echo "✅ Imagen construida exitosamente"

# Desplegar a Cloud Run
echo ""
echo "🚀 Desplegando a Cloud Run..."
echo ""

gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 3600 \
    --max-instances 3 \
    --min-instances 0 \
    --concurrency 10 \
    --port 8080

if [ $? -ne 0 ]; then
    echo "❌ Error en deploy"
    exit 1
fi

echo ""
echo "✅ Deploy completado"

# Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --format 'value(status.url)')

echo ""
echo "================================================================================"
echo "🎉 DEPLOY EXITOSO"
echo "================================================================================"
echo ""
echo "📍 URL del servicio:"
echo "   $SERVICE_URL"
echo ""
echo "🔑 SIGUIENTE PASO: Configurar secrets"
echo ""
echo "   Ejecuta estos comandos para configurar las credenciales:"
echo ""
echo "   # 1. Crear secret para Shopify"
echo "   echo -n 'shpat_TU_TOKEN' | gcloud secrets create shopify-token --data-file=-"
echo ""
echo "   # 2. Crear secret para Gemini"
echo "   echo -n 'AIzaSy_TU_KEY' | gcloud secrets create gemini-api-key --data-file=-"
echo ""
echo "   # 3. Configurar variables en Cloud Run"
echo "   gcloud run services update $SERVICE_NAME \\"
echo "     --region $REGION \\"
echo "     --set-env-vars SHOPIFY_STORE_URL=https://goiostore.com \\"
echo "     --update-secrets SHOPIFY_ACCESS_TOKEN=shopify-token:latest \\"
echo "     --update-secrets GEMINI_API_KEY=gemini-api-key:latest"
echo ""
echo "================================================================================"
echo ""
echo "📊 Ver logs:"
echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
echo ""
echo "🔄 Actualizar código:"
echo "   cd ~/Goio-Store/palacio-central"
echo "   git pull"
echo "   bash scripts/deploy-agentes-elite.sh"
echo ""
echo "================================================================================"
