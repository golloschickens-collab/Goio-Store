#!/bin/bash
# 🐔 SCRIPT DE INICIO GOLLOS CHICKENS
# Inicia todo el sistema automático de una vez

echo "🚀 INICIANDO GOLLOS CHICKENS EMPIRE..."
echo "======================================"

# Paso 1: Ir al directorio
cd "c:/Goio mayordomo/palacio-central"

# Paso 2: Activar entorno Python
echo "🐍 Activando Python..."
python -m venv venv
source venv/bin/activate  # En Linux
# venv\Scripts\activate  # En Windows

# Paso 3: Instalar dependencias
echo "📦 Instalando dependencias..."
pip install flask requests asyncio python-whatsapp-business

# Paso 4: Iniciar servidor webhook
echo "🔗 Iniciando servidor webhook..."
python agents/webhook_server_gollos.py &

# Paso 5: Iniciar sistema de automatización
echo "🤖 Iniciando automatización..."  
python agents/gollos_automation_24_7.py &

# Paso 6: Mostrar estado
echo ""
echo "✅ GOLLOS CHICKENS EMPIRE INICIADO!"
echo "🐔 Sistema operativo 24/7"
echo "👨‍🍳 Rey disponible: 5:00 PM - 1:00 AM"
echo "🤖 Bot disponible: 24/7"
echo ""
echo "📊 Para ver estado: http://localhost:8000/api/status/gollos"
echo "🛑 Para detener: Ctrl+C"
