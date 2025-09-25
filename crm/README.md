# 🎯 **CRM AUTÓNOMO MULTI-TENANT**

Sistema de gestión de clientes y relaciones completamente autónomo para **Gollos Chicken's**, **Goio™ Store** y **Eco Eterno**.

## 🚀 **Características Principales**

- ✅ **Multi-tenant**: Una instalación, múltiples marcas
- ✅ **API REST completa** con FastAPI + PostgreSQL  
- ✅ **Interfaz visual** con NocoDB (low-code)
- ✅ **Analytics avanzado** con Metabase
- ✅ **WhatsApp Business** integración nativa
- ✅ **Cero dependencias externas** - Todo en tu infraestructura
- ✅ **Escalable horizontalmente**

## 📊 **Funcionalidades**

### **Gestión de Clientes**
- Registro automático desde WhatsApp/Web
- Segmentación inteligente (nuevo, recurrente, VIP)
- Historial completo de interacciones
- Valor de vida del cliente (CLV)

### **Pedidos y Transacciones**
- Multi-canal (WhatsApp, Web, Teléfono, Presencial)
- Estados de seguimiento automático
- Cálculo de métricas por producto/categoría
- Integración con sistemas de cocina/almacén

### **Comunicaciones**
- WhatsApp Business API
- Campañas segmentadas automatizadas
- Recordatorios de seguimiento
- Encuestas de satisfacción

### **Analytics Ejecutivo**
- Dashboard en tiempo real
- Métricas por marca/período
- Análisis RFM (Recencia, Frecuencia, Monetario)
- Reportes automáticos vía email/Telegram

## ⚡ **Instalación Rápida**

### **Prerequisitos**
- Docker y Docker Compose
- Puerto 8000, 8080, 3000, 5432 disponibles
- 2GB RAM mínimo, 4GB recomendado

### **Setup Automático**
```bash
# Clonar configuración
cd palacio-central/crm

# Instalación completa (5 minutos)
chmod +x setup.sh
./setup.sh setup

# URLs después de la instalación:
# API CRM:    http://localhost:8000
# NocoDB:     http://localhost:8080  
# Metabase:   http://localhost:3000
```

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │      Web        │    │   Presencial    │
│   Business      │    │     Forms       │    │    (Tablet)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │       CRM API             │
                   │     (FastAPI)             │
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │    PostgreSQL             │
                   │   (Multi-tenant)          │
                   └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│     NocoDB      │    │    Metabase     │    │   WhatsApp      │
│   (Admin UI)    │    │  (Analytics)    │    │   Automation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📚 **Estructura de Datos**

### **Entidades Principales**
- **marcas**: Gollos, Goio, Eco Eterno (configuración independiente)
- **clientes**: Datos, segmentación, valor lifetime
- **productos**: Catálogo por marca, precios, disponibilidad  
- **pedidos**: Transacciones multi-canal con seguimiento
- **interacciones**: Historial completo de comunicaciones
- **campañas**: Marketing automatizado y segmentado

### **Métricas Automáticas**
- Clientes nuevos/activos por día
- Revenue y ticket promedio
- Conversión por canal
- Satisfacción promedio
- Análisis de cohortes

## 🔌 **API Endpoints Principales**

### **Marcas**
```bash
GET    /api/marcas                    # Listar marcas
POST   /api/marcas                    # Crear marca
```

### **Clientes** 
```bash
GET    /api/marcas/{id}/clientes      # Listar clientes de marca
POST   /api/marcas/{id}/clientes      # Crear cliente  
GET    /api/clientes/{id}             # Obtener cliente
PUT    /api/clientes/{id}             # Actualizar cliente
```

### **Pedidos**
```bash
GET    /api/marcas/{id}/pedidos       # Listar pedidos de marca
POST   /api/pedidos                   # Crear pedido
GET    /api/pedidos/{id}              # Obtener pedido
PUT    /api/pedidos/{id}              # Actualizar estado
```

### **Interacciones**
```bash
POST   /api/interacciones             # Registrar interacción
GET    /api/clientes/{id}/interacciones # Historial de cliente
```

### **Métricas**
```bash
GET    /api/marcas/{id}/metricas/dashboard  # Dashboard ejecutivo
GET    /api/marcas/{id}/metricas/reportes   # Reportes detallados
```

## 📱 **Integración WhatsApp**

### **Webhook Configuration**
```python
# En .env
WHATSAPP_TOKEN=your_business_api_token
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### **Flujo Automático**
1. Cliente escribe por WhatsApp
2. Sistema captura mensaje y crea/actualiza cliente
3. Procesa pedido si contiene productos
4. Registra interacción en historial  
5. Dispara respuesta automática o alert para humano
6. Actualiza métricas en tiempo real

## 📊 **Configuración NocoDB**

### **Setup Inicial**
1. Ir a `http://localhost:8080`
2. Crear nuevo proyecto
3. Configurar conexión PostgreSQL:
   - Host: `crm-db`
   - Puerto: `5432`
   - Base de Datos: `crm_autonomo`
   - Usuario: `crm_user`
   - Contraseña: (ver `.env`)

### **Vistas Recomendadas**
- **Dashboard Ejecutivo**: Métricas clave por marca
- **Gestión Clientes**: CRUD completo con filtros
- **Pipeline Pedidos**: Kanban por estados  
- **Centro Interacciones**: Inbox unificado
- **Campañas**: Creador visual de campañas

## 📈 **Configuración Metabase**

### **Setup Inicial**
1. Ir a `http://localhost:3000`
2. Crear cuenta administrador
3. Configurar conexión a PostgreSQL (mismos datos que NocoDB)

### **Dashboards Sugeridos**
- **Revenue Overview**: Ingresos por marca/período
- **Customer Analytics**: Adquisición, retención, CLV
- **Operations**: Pedidos por canal, tiempo promedio
- **Marketing**: Performance de campañas, ROI

## 🔄 **Comandos de Mantenimiento**

```bash
# Ver estado de servicios
./setup.sh status

# Ver logs en tiempo real
./setup.sh logs [servicio]

# Reiniciar todo
./setup.sh restart

# Actualizar sistema
./setup.sh update

# Backup de base de datos
docker-compose exec crm-db pg_dump -U crm_user crm_autonomo > backup_$(date +%Y%m%d).sql

# Restore de backup
docker-compose exec -T crm-db psql -U crm_user crm_autonomo < backup_file.sql
```

## 🚀 **Roadmap de Implementación**

### **Semana 1: Base (ACTUAL)**
- [x] Schema PostgreSQL multi-tenant
- [x] API REST con FastAPI  
- [x] Docker Compose stack
- [x] NocoDB + Metabase integrados

### **Semana 2: Integraciones**
- [ ] WhatsApp Business API
- [ ] Webhooks para pedidos web
- [ ] Sistema de notificaciones
- [ ] Agentes IA básicos (FAQ, confirmaciones)

### **Semana 3: Automatizaciones** 
- [ ] Campañas automáticas por segmento
- [ ] Análisis RFM y re-engagement
- [ ] Reportes automáticos vía Telegram
- [ ] Backup automatizado

### **Semana 4: Optimización**
- [ ] Performance tuning BD
- [ ] Caching con Redis
- [ ] Monitoreo y alertas
- [ ] Documentación completa

## 💡 **Casos de Uso Específicos**

### **Gollos Chicken's**
- Pedidos por WhatsApp con menú interactivo
- Programa de fidelidad por compras recurrentes
- Promociones basadas en historial (ej: "2x1 los martes")
- Encuestas post-entrega automáticas

### **Goio™ Store**
- Catálogo de productos tech con stock en tiempo real
- Seguimiento de garantías y soporte técnico
- Cross-selling inteligente por categorías
- Alertas de restock para productos favoritos

### **Eco Eterno**
- Educación sobre sostenibilidad vía WhatsApp
- Suscripciones mensuales automatizadas  
- Impacto ambiental por cliente (gamificación)
- Comunidad de usuarios eco-conscientes

## 🔐 **Seguridad y Compliance**

- ✅ **Encriptación** de datos sensibles
- ✅ **Backup automático** incremental
- ✅ **Rate limiting** en APIs
- ✅ **Audit trail** completo
- ✅ **GDPR compliance** con derecho al olvido
- ✅ **Ambiente aislado** sin dependencias externas

## 🆘 **Troubleshooting**

### **La API no responde**
```bash
# Ver logs de la API
./setup.sh logs crm-api

# Reiniciar solo la API
docker-compose restart crm-api
```

### **PostgreSQL no inicia**
```bash
# Ver logs de BD
./setup.sh logs crm-db

# Verificar puertos en uso
netstat -tulpn | grep :5432
```

### **NocoDB no conecta a BD**
- Verificar que `crm-db` esté corriendo
- Usar host `crm-db` (no localhost) en configuración
- Verificar credenciales en `.env`

### **Reset completo del sistema**
```bash
# ⚠️ PELIGRO: Elimina todos los datos
./setup.sh reset
```

## 📞 **Soporte**

- **Documentación**: Ver archivos en `/docs`
- **API Docs**: `http://localhost:8000/docs`  
- **Issues**: GitHub Issues en el repositorio
- **Logs**: `./setup.sh logs`

---

**🎯 Desarrollado para maximizar autonomía, escalabilidad y ROI en el ecosistema Gollos-Goio-Eco.**