#!/bin/bash
# 🚀 DEPLOY AGENTES ELITE A GOOGLE CLOUD SHELL

echo "================================================================================================"
echo "🤖 DEPLOY: Agentes ELITE a Cloud Shell"
echo "================================================================================================"
echo ""

# Verificar que estamos en Cloud Shell
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "⚠️  No estás en Google Cloud Shell"
    echo "   Ejecuta este script EN Cloud Shell, no en local"
    exit 1
fi

echo "✅ Cloud Shell detectado"
echo "📦 Proyecto: $GOOGLE_CLOUD_PROJECT"
echo ""

# Clonar repositorio
echo "📥 Clonando repositorio..."
cd ~
if [ -d "Goio-Store" ]; then
    echo "   Repositorio ya existe, actualizando..."
    cd Goio-Store
    git pull origin master
else
    git clone https://github.com/golloschickens-collab/Goio-Store.git
    cd Goio-Store
fi

# Navegar a palacio-central
if [ ! -d "palacio-central" ]; then
    echo "❌ Error: No se encuentra palacio-central/"
    exit 1
fi

cd palacio-central
echo "✅ En palacio-central/"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias Node.js..."
npm install

echo ""
echo "================================================================================================"
echo "✅ AGENTES INSTALADOS"
echo "================================================================================================"
echo ""
echo "Ahora configura las variables de entorno:"
echo ""
echo "  nano .env"
echo ""
echo "Agrega:"
echo "  SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com"
echo "  SHOPIFY_ACCESS_TOKEN=shpat_xxxxx"
echo "  GEMINI_API_KEY=AIzaSyxxxxx"
echo ""
echo "Luego ejecuta:"
echo "  npm run elite:audit        # Auditoría"
echo "  npm run elite:fix-all      # Fix automático"
echo ""
echo "================================================================================================"
