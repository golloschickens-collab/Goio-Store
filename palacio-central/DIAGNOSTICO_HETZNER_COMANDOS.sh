#!/bin/bash
# 🔱 DIAGNÓSTICO SERVIDOR HETZNER - GOIO IMPERIOS
# Fecha: 16 de octubre de 2025
# Ejecutar vía SSH: bash DIAGNOSTICO_HETZNER_COMANDOS.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOG_FILE="logs/DIAGNOSTICO_HETZNER_$(date +%F-%H%M%S).log"
mkdir -p logs

echo -e "${BLUE}🔱 INICIANDO DIAGNÓSTICO HETZNER - GOIO IMPERIOS${NC}" | tee -a "$LOG_FILE"
echo -e "${BLUE}Fecha: $(date)${NC}\n" | tee -a "$LOG_FILE"

# 1️⃣ INFORMACIÓN DEL SISTEMA OPERATIVO
echo -e "${YELLOW}=== 1️⃣ SISTEMA OPERATIVO ===${NC}" | tee -a "$LOG_FILE"
cat /etc/os-release | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
uname -a | tee -a "$LOG_FILE"
echo -e "\n" | tee -a "$LOG_FILE"

# 2️⃣ VERSIONES DE RUNTIME
echo -e "${YELLOW}=== 2️⃣ VERSIONES DE RUNTIME ===${NC}" | tee -a "$LOG_FILE"
echo -n "Node.js: " | tee -a "$LOG_FILE"
node -v 2>&1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -n "npm: " | tee -a "$LOG_FILE"
npm -v 2>&1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -n "Docker: " | tee -a "$LOG_FILE"
docker -v 2>&1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -n "Docker Compose: " | tee -a "$LOG_FILE"
docker compose version 2>&1 | tee -a "$LOG_FILE" || docker-compose --version 2>&1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -n "Nginx: " | tee -a "$LOG_FILE"
nginx -v 2>&1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -n "Python: " | tee -a "$LOG_FILE"
python3 --version 2>&1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -n "gcloud CLI: " | tee -a "$LOG_FILE"
gcloud --version 2>&1 | head -1 | tee -a "$LOG_FILE" || echo "❌ No instalado" | tee -a "$LOG_FILE"

echo -e "\n" | tee -a "$LOG_FILE"

# 3️⃣ ESTADO DE CONTENEDORES DOCKER
echo -e "${YELLOW}=== 3️⃣ CONTENEDORES DOCKER ===${NC}" | tee -a "$LOG_FILE"
echo "Contenedores activos:" | tee -a "$LOG_FILE"
docker ps | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "Contenedores Goio (todos los estados):" | tee -a "$LOG_FILE"
docker ps -a | grep -E 'palacio|goio' | tee -a "$LOG_FILE" || echo "No se encontraron contenedores Goio" | tee -a "$LOG_FILE"
echo -e "\n" | tee -a "$LOG_FILE"

# 4️⃣ RECURSOS DEL SISTEMA
echo -e "${YELLOW}=== 4️⃣ RECURSOS DEL SISTEMA ===${NC}" | tee -a "$LOG_FILE"

echo "💾 Disco:" | tee -a "$LOG_FILE"
df -h | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "🧠 RAM:" | tee -a "$LOG_FILE"
free -h | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "⚙️ CPU:" | tee -a "$LOG_FILE"
lscpu | grep -E 'Model name|CPU\(s\)|Thread' | tee -a "$LOG_FILE" || echo "Información de CPU no disponible" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "📊 Load Average:" | tee -a "$LOG_FILE"
uptime | tee -a "$LOG_FILE"
echo -e "\n" | tee -a "$LOG_FILE"

# 5️⃣ PUERTOS EN USO
echo -e "${YELLOW}=== 5️⃣ PUERTOS EN USO ===${NC}" | tee -a "$LOG_FILE"
echo "Buscando puertos 80, 3000, 3001, 3002:" | tee -a "$LOG_FILE"
ss -tuln | grep -E ':80|:3000|:3001|:3002' | tee -a "$LOG_FILE" || netstat -tuln | grep -E ':80|:3000|:3001|:3002' | tee -a "$LOG_FILE" || echo "No se detectaron puertos específicos" | tee -a "$LOG_FILE"
echo -e "\n" | tee -a "$LOG_FILE"

# 6️⃣ PROCESOS NODE.JS ACTIVOS
echo -e "${YELLOW}=== 6️⃣ PROCESOS NODE.JS ===${NC}" | tee -a "$LOG_FILE"
ps aux | grep node | grep -v grep | tee -a "$LOG_FILE" || echo "No hay procesos Node.js activos fuera de Docker" | tee -a "$LOG_FILE"
echo -e "\n" | tee -a "$LOG_FILE"

# 7️⃣ LOGS DE CONTENEDORES (últimas 50 líneas)
echo -e "${YELLOW}=== 7️⃣ LOGS RECIENTES ===${NC}" | tee -a "$LOG_FILE"

if docker ps | grep -q palacio-central; then
    echo -e "${GREEN}📋 Logs palacio-central (últimas 50 líneas):${NC}" | tee -a "$LOG_FILE"
    docker logs palacio-central --tail 50 2>&1 | tee -a "$LOG_FILE"
else
    echo -e "${RED}❌ Contenedor palacio-central no está corriendo${NC}" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

if docker ps | grep -q goio-store; then
    echo -e "${GREEN}📋 Logs goio-store (últimas 50 líneas):${NC}" | tee -a "$LOG_FILE"
    docker logs goio-store --tail 50 2>&1 | tee -a "$LOG_FILE"
else
    echo -e "${RED}❌ Contenedor goio-store no está corriendo${NC}" | tee -a "$LOG_FILE"
fi

echo -e "\n" | tee -a "$LOG_FILE"

# 8️⃣ VARIABLES DE ENTORNO (sin valores sensibles)
echo -e "${YELLOW}=== 8️⃣ VARIABLES DE ENTORNO ===${NC}" | tee -a "$LOG_FILE"
if docker ps | grep -q palacio-central; then
    echo "Variables palacio-central (claves sin valores):" | tee -a "$LOG_FILE"
    docker exec palacio-central env | grep -E 'NODE_ENV|PORT|SHOPIFY|GEMINI|META|FACEBOOK' | sed 's/=.*/=***/' | tee -a "$LOG_FILE"
fi
echo -e "\n" | tee -a "$LOG_FILE"

# 9️⃣ CONFIGURACIÓN NGINX
echo -e "${YELLOW}=== 9️⃣ NGINX CONFIGURACIÓN ===${NC}" | tee -a "$LOG_FILE"
if command -v nginx &> /dev/null; then
    echo "Estado Nginx:" | tee -a "$LOG_FILE"
    systemctl status nginx 2>&1 | head -10 | tee -a "$LOG_FILE" || service nginx status 2>&1 | head -10 | tee -a "$LOG_FILE" || echo "Servicio no disponible" | tee -a "$LOG_FILE"
    
    echo -e "\nArchivos de configuración:" | tee -a "$LOG_FILE"
    ls -lh /etc/nginx/nginx.conf 2>&1 | tee -a "$LOG_FILE" || echo "nginx.conf no encontrado" | tee -a "$LOG_FILE"
    ls -lh /etc/nginx/sites-enabled/ 2>&1 | tee -a "$LOG_FILE" || echo "sites-enabled no encontrado" | tee -a "$LOG_FILE"
else
    echo "Nginx no está instalado en el sistema" | tee -a "$LOG_FILE"
fi
echo -e "\n" | tee -a "$LOG_FILE"

# 🔟 VERIFICACIÓN DE ARCHIVOS CLAVE
echo -e "${YELLOW}=== 🔟 ARCHIVOS DE CONFIGURACIÓN ===${NC}" | tee -a "$LOG_FILE"
WORKSPACE_ROOT="$(pwd)"
echo "Directorio actual: $WORKSPACE_ROOT" | tee -a "$LOG_FILE"

echo -e "\nArchivos clave existentes:" | tee -a "$LOG_FILE"
for file in "docker-compose.yml" "palacio-central/.env" "palacio-central/package.json" "palacio-central/config/keys.json" "goio-store/package.json"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}" | tee -a "$LOG_FILE"
        ls -lh "$file" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}❌ $file NO ENCONTRADO${NC}" | tee -a "$LOG_FILE"
    fi
done
echo -e "\n" | tee -a "$LOG_FILE"

# 1️⃣1️⃣ INTENTO DE REINICIO DE CONTENEDORES
echo -e "${YELLOW}=== 1️⃣1️⃣ REINICIO DE CONTENEDORES ===${NC}" | tee -a "$LOG_FILE"

if docker ps -a | grep -q palacio-central; then
    echo -e "${BLUE}Reiniciando palacio-central...${NC}" | tee -a "$LOG_FILE"
    docker restart palacio-central 2>&1 | tee -a "$LOG_FILE" || echo "Error al reiniciar" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}palacio-central no existe, intentando levantar con docker-compose...${NC}" | tee -a "$LOG_FILE"
    docker compose up -d palacio-central 2>&1 | tee -a "$LOG_FILE" || docker-compose up -d palacio-central 2>&1 | tee -a "$LOG_FILE" || echo "No se pudo levantar" | tee -a "$LOG_FILE"
fi

if docker ps -a | grep -q goio-store; then
    echo -e "${BLUE}Reiniciando goio-store...${NC}" | tee -a "$LOG_FILE"
    docker restart goio-store 2>&1 | tee -a "$LOG_FILE" || echo "Error al reiniciar" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}goio-store no existe, intentando levantar con docker-compose...${NC}" | tee -a "$LOG_FILE"
    docker compose up -d goio-store 2>&1 | tee -a "$LOG_FILE" || docker-compose up -d goio-store 2>&1 | tee -a "$LOG_FILE" || echo "No se pudo levantar" | tee -a "$LOG_FILE"
fi

echo -e "\nEsperando 5 segundos..." | tee -a "$LOG_FILE"
sleep 5

echo "Estado después del reinicio:" | tee -a "$LOG_FILE"
docker ps | grep -E 'palacio|goio' | tee -a "$LOG_FILE"
echo -e "\n" | tee -a "$LOG_FILE"

# 1️⃣2️⃣ CONECTIVIDAD
echo -e "${YELLOW}=== 1️⃣2️⃣ CONECTIVIDAD ===${NC}" | tee -a "$LOG_FILE"

echo "Test de conectividad a servicios:" | tee -a "$LOG_FILE"

# Localhost
echo -n "localhost:3002 (palacio-central): " | tee -a "$LOG_FILE"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health 2>&1 | tee -a "$LOG_FILE" || echo "NO RESPONDE" | tee -a "$LOG_FILE"

echo -n "localhost:3000 (goio-store): " | tee -a "$LOG_FILE"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 | tee -a "$LOG_FILE" || echo "NO RESPONDE" | tee -a "$LOG_FILE"

echo -n "localhost:80 (nginx): " | tee -a "$LOG_FILE"
curl -s -o /dev/null -w "%{http_code}" http://localhost 2>&1 | tee -a "$LOG_FILE" || echo "NO RESPONDE" | tee -a "$LOG_FILE"

# IPs públicas
echo -e "\n🌐 IPs del servidor:" | tee -a "$LOG_FILE"
hostname -I 2>&1 | tee -a "$LOG_FILE" || ip addr show | grep "inet " | grep -v 127.0.0.1 | tee -a "$LOG_FILE"

echo -e "\n" | tee -a "$LOG_FILE"

# 1️⃣3️⃣ RESUMEN FINAL
echo -e "${GREEN}=== 🎯 RESUMEN DIAGNÓSTICO ===${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js instalado: $(node -v)${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}❌ Node.js NO instalado${NC}" | tee -a "$LOG_FILE"
fi

# Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker instalado: $(docker -v | head -1)${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}❌ Docker NO instalado${NC}" | tee -a "$LOG_FILE"
fi

# Contenedores
if docker ps | grep -q palacio-central; then
    echo -e "${GREEN}✅ palacio-central CORRIENDO${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}❌ palacio-central NO está corriendo${NC}" | tee -a "$LOG_FILE"
fi

if docker ps | grep -q goio-store; then
    echo -e "${GREEN}✅ goio-store CORRIENDO${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}❌ goio-store NO está corriendo${NC}" | tee -a "$LOG_FILE"
fi

# RAM disponible
RAM_FREE=$(free -m | awk 'NR==2{print $7}')
if [ "$RAM_FREE" -gt 512 ]; then
    echo -e "${GREEN}✅ RAM disponible: ${RAM_FREE}MB${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}⚠️ RAM limitada: ${RAM_FREE}MB${NC}" | tee -a "$LOG_FILE"
fi

# Disco disponible
DISK_FREE=$(df -h / | awk 'NR==2{print $4}')
echo -e "${GREEN}✅ Disco disponible: ${DISK_FREE}${NC}" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo -e "${BLUE}📁 Log completo guardado en: $LOG_FILE${NC}"
echo -e "${GREEN}✅ DIAGNÓSTICO COMPLETADO${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Revisar el archivo de log: cat $LOG_FILE"
echo "2. Copiar el contenido del log a tu equipo local"
echo "3. Actualizar docs/DIAGNOSTICO_CLOUD_ACTUAL.md con los valores reales"
echo "4. Proceder con el deployment a Cloud Run si todo está OK"
echo ""
echo -e "${BLUE}Para deployment Cloud Run, ejecutar:${NC}"
echo "bash gcp_deploy.sh"
