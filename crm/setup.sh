#!/usr/bin/env bash
# =============================================
# CRM AUTÓNOMO - SCRIPT DE INICIALIZACIÓN
# =============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRM_DIR="$SCRIPT_DIR"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[CRM-SETUP]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

check_requirements() {
    log "Verificando requisitos del sistema..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado. Instálalo desde: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose no está instalado"
        exit 1
    fi
    
    success "Requisitos verificados"
}

setup_environment() {
    log "Configurando variables de entorno..."
    
    if [[ ! -f "$CRM_DIR/.env" ]]; then
        if [[ -f "$CRM_DIR/.env.example" ]]; then
            cp "$CRM_DIR/.env.example" "$CRM_DIR/.env"
            warn "Archivo .env creado desde .env.example"
            warn "IMPORTANTE: Edita .env con tus credenciales reales antes de continuar"
        else
            error "No se encontró .env.example"
            exit 1
        fi
    else
        log ".env ya existe, usando configuración existente"
    fi
    
    success "Configuración de entorno lista"
}

build_services() {
    log "Construyendo servicios Docker..."
    
    cd "$CRM_DIR"
    
    # Build de la API
    docker-compose build crm-api
    
    success "Servicios construidos"
}

start_database() {
    log "Iniciando base de datos PostgreSQL..."
    
    cd "$CRM_DIR"
    
    # Solo iniciar la BD primero para que se ejecute el schema
    docker-compose up -d crm-db
    
    # Esperar que la BD esté lista
    log "Esperando que PostgreSQL esté disponible..."
    for i in {1..30}; do
        if docker-compose exec -T crm-db pg_isready -U crm_user -d crm_autonomo &>/dev/null; then
            success "PostgreSQL está listo"
            break
        fi
        if [[ $i -eq 30 ]]; then
            error "Timeout esperando PostgreSQL"
            exit 1
        fi
        sleep 2
    done
}

start_all_services() {
    log "Iniciando todos los servicios..."
    
    cd "$CRM_DIR"
    docker-compose up -d
    
    # Esperar que todos los servicios estén listos
    log "Esperando que los servicios estén disponibles..."
    sleep 10
    
    success "Todos los servicios están corriendo"
}

verify_installation() {
    log "Verificando instalación..."
    
    # Verificar API
    if curl -f -s "http://localhost:8000/health" &>/dev/null; then
        success "✓ API CRM disponible en http://localhost:8000"
    else
        warn "⚠ API CRM no responde en puerto 8000"
    fi
    
    # Verificar NocoDB
    if curl -f -s "http://localhost:8080" &>/dev/null; then
        success "✓ NocoDB disponible en http://localhost:8080"
    else
        warn "⚠ NocoDB no responde en puerto 8080"
    fi
    
    # Verificar Metabase
    if curl -f -s "http://localhost:3000" &>/dev/null; then
        success "✓ Metabase disponible en http://localhost:3000"
    else
        warn "⚠ Metabase no responde en puerto 3000"
    fi
    
    # Estado de contenedores
    log "Estado de los contenedores:"
    docker-compose ps
}

show_next_steps() {
    echo ""
    success "=================== CRM AUTÓNOMO INSTALADO ==================="
    echo ""
    echo -e "${GREEN}🎯 URLs de Acceso:${NC}"
    echo "  • API CRM:    http://localhost:8000"
    echo "  • Docs API:   http://localhost:8000/docs"
    echo "  • NocoDB:     http://localhost:8080"
    echo "  • Metabase:   http://localhost:3000"
    echo ""
    echo -e "${GREEN}📊 Primeros Pasos:${NC}"
    echo "  1. Configurar NocoDB:"
    echo "     - Ir a http://localhost:8080"
    echo "     - Crear proyecto conectando a PostgreSQL"
    echo "     - Host: crm-db, Puerto: 5432"
    echo "     - Usuario: crm_user, BD: crm_autonomo"
    echo ""
    echo "  2. Configurar Metabase:"
    echo "     - Ir a http://localhost:3000"
    echo "     - Crear cuenta admin"
    echo "     - Configurar dashboard con métricas"
    echo ""
    echo "  3. Probar API:"
    echo "     - curl http://localhost:8000/api/marcas"
    echo "     - Ver documentación en /docs"
    echo ""
    echo -e "${GREEN}🔧 Comandos Útiles:${NC}"
    echo "  • Ver logs:        docker-compose logs -f [servicio]"
    echo "  • Parar todo:      docker-compose down"
    echo "  • Reiniciar:       docker-compose restart"
    echo "  • Actualizar:      docker-compose pull && docker-compose up -d"
    echo ""
    echo -e "${YELLOW}⚠️  Configuración Pendiente:${NC}"
    echo "  • Editar .env con credenciales de producción"
    echo "  • Configurar WhatsApp Business API"
    echo "  • Configurar backup automático"
    echo ""
    success "=================== SETUP COMPLETADO ==================="
}

main() {
    echo -e "${BLUE}"
    echo "  ______ ____   __  __       _         _   __"
    echo " /  ___// __ \ /  |/  /     / |  ___  | | /  |"
    echo "| /    / /_/ //      /     /  | |   | |/ /   |"
    echo "| |   /   _ // /|/  /     / @ | |   |   /  @ |"
    echo "| \__/\  __// / | /      /    | |___| |/     |"
    echo " \____/\_/ /_/  |/      /_/|__|         /_/|__|"
    echo ""
    echo "         CRM Autónomo Multi-Tenant"
    echo "    Gollos • Goio™ • Eco Eterno"
    echo -e "${NC}"
    
    case "${1:-setup}" in
        "setup"|"install")
            check_requirements
            setup_environment
            build_services
            start_database
            start_all_services
            verify_installation
            show_next_steps
            ;;
        "start")
            log "Iniciando servicios existentes..."
            cd "$CRM_DIR"
            docker-compose up -d
            verify_installation
            ;;
        "stop")
            log "Deteniendo servicios..."
            cd "$CRM_DIR"
            docker-compose down
            success "Servicios detenidos"
            ;;
        "restart")
            log "Reiniciando servicios..."
            cd "$CRM_DIR"
            docker-compose restart
            verify_installation
            ;;
        "logs")
            cd "$CRM_DIR"
            docker-compose logs -f "${2:-}"
            ;;
        "status")
            cd "$CRM_DIR"
            docker-compose ps
            verify_installation
            ;;
        "update")
            log "Actualizando servicios..."
            cd "$CRM_DIR"
            docker-compose pull
            docker-compose up -d --build
            verify_installation
            ;;
        "reset")
            warn "⚠️  PELIGRO: Esto eliminará TODOS los datos del CRM"
            read -p "¿Estás seguro? (escribe 'DELETE' para confirmar): " confirm
            if [[ "$confirm" == "DELETE" ]]; then
                cd "$CRM_DIR"
                docker-compose down -v
                docker system prune -f
                success "Sistema reseteado"
            else
                log "Reset cancelado"
            fi
            ;;
        *)
            echo "Uso: $0 {setup|start|stop|restart|logs|status|update|reset}"
            echo ""
            echo "Comandos:"
            echo "  setup    - Instalación inicial completa"
            echo "  start    - Iniciar servicios"
            echo "  stop     - Detener servicios"  
            echo "  restart  - Reiniciar servicios"
            echo "  logs     - Ver logs (opcional: nombre del servicio)"
            echo "  status   - Estado de servicios"
            echo "  update   - Actualizar servicios"
            echo "  reset    - PELIGRO: Eliminar todos los datos"
            exit 1
            ;;
    esac
}

main "$@"