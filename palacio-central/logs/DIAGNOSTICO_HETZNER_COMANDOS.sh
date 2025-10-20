#!/bin/bash
# 🔱 IMPERIO GOIO - DIAGNÓSTICO HETZNER
# Fecha: 16 de octubre de 2025
# Ejecutar en servidor Hetzner vía SSH

OUTPUT_FILE="logs/DIAGNOSTICO_HETZNER_$(date +%F).log"

echo "🔍 === DIAGNÓSTICO SERVIDOR HETZNER ===" | tee -a $OUTPUT_FILE
echo "Fecha: $(date)" | tee -a $OUTPUT_FILE
echo "---" | tee -a $OUTPUT_FILE

# 1️⃣ Sistema Operativo
echo "" | tee -a $OUTPUT_FILE
echo "📋 SISTEMA OPERATIVO:" | tee -a $OUTPUT_FILE
cat /etc/os-release | tee -a $OUTPUT_FILE

echo "" | tee -a $OUTPUT_FILE
echo "---" | tee -a $OUTPUT_FILE

# 2️⃣ Versiones de Software
echo "" | tee -a $OUTPUT_FILE
echo "⚙️ VERSIONES DE SOFTWARE:" | tee -a $OUTPUT_FILE
echo "Node.js: $(node -v)" | tee -a $OUTPUT_FILE
echo "npm: $(npm -v)" | tee -a $OUTPUT_FILE
echo "Docker: $(docker -v)" | tee -a $OUTPUT_FILE
echo "Docker Compose: $(docker compose version)" | tee -a $OUTPUT_FILE

# 3️⃣ Contenedores Docker
echo "" | tee -a $OUTPUT_FILE
echo "🐳 CONTENEDORES DOCKER:" | tee -a $OUTPUT_FILE
docker ps | tee -a $OUTPUT_FILE

echo "" | tee -a $OUTPUT_FILE
echo "Contenedores detenidos:" | tee -a $OUTPUT_FILE
docker ps -a | grep -E 'Exited|Created' | tee -a $OUTPUT_FILE

# 4️⃣ Recursos del Sistema
echo "" | tee -a $OUTPUT_FILE
echo "💾 DISCO:" | tee -a $OUTPUT_FILE
df -h | tee -a $OUTPUT_FILE

echo "" | tee -a $OUTPUT_FILE
echo "🧠 MEMORIA RAM:" | tee -a $OUTPUT_FILE
free -h | tee -a $OUTPUT_FILE

echo "" | tee -a $OUTPUT_FILE
echo "⚡ CPU INFO:" | tee -a $OUTPUT_FILE
lscpu | grep -E 'Model name|CPU\(s\)|Thread' | tee -a $OUTPUT_FILE

# 5️⃣ Puertos en Uso
echo "" | tee -a $OUTPUT_FILE
echo "🌐 PUERTOS EN USO:" | tee -a $OUTPUT_FILE
ss -tuln | grep -E ':80|:443|:3000|:3001|:3002|:8080' | tee -a $OUTPUT_FILE

# 6️⃣ Procesos Node.js
echo "" | tee -a $OUTPUT_FILE
echo "📊 PROCESOS NODE.JS:" | tee -a $OUTPUT_FILE
ps aux | grep node | grep -v grep | tee -a $OUTPUT_FILE

# 7️⃣ Logs de Contenedores
echo "" | tee -a $OUTPUT_FILE
echo "📜 LOGS PALACIO-CENTRAL (últimas 50 líneas):" | tee -a $OUTPUT_FILE
docker logs palacio-central --tail 50 2>&1 | tee -a $OUTPUT_FILE

echo "" | tee -a $OUTPUT_FILE
echo "📜 LOGS GOIO-STORE (últimas 50 líneas):" | tee -a $OUTPUT_FILE
docker logs goio-store --tail 50 2>&1 | tee -a $OUTPUT_FILE

# 8️⃣ Estado de Red
echo "" | tee -a $OUTPUT_FILE
echo "🌍 CONECTIVIDAD:" | tee -a $OUTPUT_FILE
echo "IP pública:" | tee -a $OUTPUT_FILE
curl -s ifconfig.me | tee -a $OUTPUT_FILE
echo "" | tee -a $OUTPUT_FILE

echo "Ping a Google:" | tee -a $OUTPUT_FILE
ping -c 3 8.8.8.8 | tee -a $OUTPUT_FILE

# 9️⃣ Variables de Entorno (filtradas)
echo "" | tee -a $OUTPUT_FILE
echo "🔐 VARIABLES DE ENTORNO (palacio-central):" | tee -a $OUTPUT_FILE
docker exec palacio-central env 2>&1 | grep -E 'NODE_ENV|PORT|SHOPIFY|GEMINI' | tee -a $OUTPUT_FILE

echo "" | tee -a $OUTPUT_FILE
echo "✅ === DIAGNÓSTICO COMPLETADO ===" | tee -a $OUTPUT_FILE
echo "Resultado guardado en: $OUTPUT_FILE" | tee -a $OUTPUT_FILE

# 🔄 Reiniciar contenedores si están detenidos
echo "" | tee -a $OUTPUT_FILE
echo "🔄 VERIFICANDO Y REINICIANDO CONTENEDORES..." | tee -a $OUTPUT_FILE

if ! docker ps | grep -q palacio-central; then
    echo "⚠️ palacio-central no está corriendo, intentando reiniciar..." | tee -a $OUTPUT_FILE
    docker restart palacio-central 2>&1 | tee -a $OUTPUT_FILE
else
    echo "✅ palacio-central está activo" | tee -a $OUTPUT_FILE
fi

if ! docker ps | grep -q goio-store; then
    echo "⚠️ goio-store no está corriendo, intentando reiniciar..." | tee -a $OUTPUT_FILE
    docker restart goio-store 2>&1 | tee -a $OUTPUT_FILE
else
    echo "✅ goio-store está activo" | tee -a $OUTPUT_FILE
fi

echo "" | tee -a $OUTPUT_FILE
echo "🎯 Estado final de contenedores:" | tee -a $OUTPUT_FILE
docker ps | grep -E 'palacio|goio' | tee -a $OUTPUT_FILE
