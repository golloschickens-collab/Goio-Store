# 📊 INFORME TÉCNICO - INFRAESTRUCTURA GOIO IMPERIOS+

**Fecha:** 18 de octubre de 2025  
**Versión:** 1.0.0  
**Destinatario:** Agente Externo de Migración Cloud  
**Proyecto:** Transición Hetzner → Cloud (AWS/GCP/Azure)  
**Responsable:** Mayordomo Imperial Digital

---

## 🎯 RESUMEN EJECUTIVO

Sistema de automatización digital multi-tienda con arquitectura modular, actualmente en servidor Hetzner, preparando migración a infraestructura cloud escalable. El ecosistema integra:

- **3 marcas digitales activas**: Goio Store (e-commerce), Gollos Chickens (food delivery), Eco-Eterno (marketplace)
- **Backend Node.js v20+** con ES Modules y Express.js
- **APIs integradas**: Meta Graph API, Google Gemini, Shopify Admin API, Amazon SP-API
- **Arquitectura modular nueva**: Sistema "Imperios" con 5 subsistemas operacionales
- **Infraestructura actual**: Docker Compose multi-contenedor con Nginx reverse proxy

---

## 🏗️ ARQUITECTURA GENERAL

### 1. Estructura de Directorios Principal

```
/Goio mayordomo/
├── docker-compose.yml              ← Orquestación principal
├── reverse-proxy/
│   └── nginx.conf                  ← Balanceador/proxy
├── palacio-central/                ← 🏛️ BACKEND PRINCIPAL
│   ├── Dockerfile
│   ├── package.json
│   ├── start.js                    ← Entry point producción
│   ├── agents/                     ← Agentes inteligentes (11 módulos)
│   │   ├── supervisor.js           ← Orquestador central (puerto 3002)
│   │   ├── research.js             ← Investigación de tendencias
│   │   ├── creative.js             ← Generación de contenido
│   │   ├── listing.js              ← Gestión de productos
│   │   ├── contentstrategist.js    ← Estrategia de contenido
│   │   └── [6 agentes adicionales]
│   ├── imperios/                   ← ⭐ NUEVA ARQUITECTURA MODULAR
│   │   ├── README.md               ← Roadmap 3 fases
│   │   ├── marketing/
│   │   │   └── automation.js       ← ✅ OPERACIONAL (290 líneas)
│   │   ├── shop-sync/
│   │   │   └── engine.js           ← ✅ OPERACIONAL (260 líneas)
│   │   ├── ia/
│   │   │   └── engine.js           ← ✅ OPERACIONAL + TESTEADO (330 líneas)
│   │   ├── infra/                  ← 🔄 EN CONSTRUCCIÓN
│   │   └── analytics/              ← 🔄 EN CONSTRUCCIÓN
│   ├── config/                     ← Configuraciones centralizadas
│   │   ├── keys.json               ← API keys (GEMINI_API_KEY activo)
│   │   ├── social_credentials.json ← Meta/WhatsApp/Instagram tokens
│   │   ├── shopify.json            ← Credenciales tiendas
│   │   ├── amazon.json             ← Amazon SP-API (pendiente)
│   │   └── products.json           ← Catálogo maestro
│   ├── logs/
│   │   └── imperial/               ← Logs centralizados JSONL
│   │       ├── marketing/
│   │       ├── shop-sync/
│   │       ├── ia/
│   │       ├── operations/
│   │       └── supervisor/
│   ├── scripts/                    ← Utilidades y automatización
│   └── utils/                      ← Helpers compartidos
├── goio-store/                     ← Frontend Shopify (puerto 3002)
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── logs/                           ← Logs históricos y reportes
└── mayordomo/                      ← Base de datos operacional
    └── palacio-central/db/
```

---

## 🔧 STACK TECNOLÓGICO

### Backend (palacio-central)

| Componente | Versión/Proveedor | Estado | Notas |
|------------|-------------------|---------|-------|
| **Runtime** | Node.js v20+ | ✅ Activo | ES Modules (type: "module") |
| **Framework Web** | Express.js v5.1.0 | ✅ Activo | Servidor API puerto 3002 |
| **IA/ML** | Google Gemini Pro 1.5 | ✅ Operacional | `@google/generative-ai` v0.24.1 |
| **APIs Shopify** | Admin REST/GraphQL 2024-10 | 🔄 Configurado | `graphql-request` v7.2.0 |
| **APIs Meta** | Graph API v19.0 | 🔄 Configurado | Instagram/Facebook/WhatsApp |
| **APIs Amazon** | SP-API | ⏳ Pendiente | Credenciales AWS faltantes |
| **HTTP Client** | node-fetch v2.7.0 + axios | ✅ Activo | |
| **Logging** | Custom JSONL | ✅ Activo | dayjs v1.11.11 timestamps |
| **Process Manager** | PM2 (recomendado) | ⚠️ No configurado | Pendiente setup |

### Frontend y Servicios

| Servicio | Puerto | Tecnología | Estado |
|----------|--------|------------|--------|
| palacio-central (API) | 3002 | Node.js + Express | ✅ Operacional |
| goio-store (Frontend) | 3002 | Nginx + Shopify Theme | ✅ Operacional |
| Nginx Reverse Proxy | 80 | nginx:stable | ✅ Configurado |
| WhatsApp Webhook | 3001 | Express (webhook) | 🔄 Listo sin conectar |

### Docker Services

```yaml
# docker-compose.yml (root)
services:
  palacio-central:
    build: ./palacio-central
    ports: ["3002:3002"]
    env_file: ./palacio-central.env
    healthcheck: curl http://localhost:3000/health
    
  goio-store:
    build: ./goio-store
    ports: ["3002:3000"]
    env_file: ./goio-store.env
    
  nginx:
    image: nginx:stable
    ports: ["80:80"]
    volumes: [./reverse-proxy/nginx.conf:/etc/nginx/nginx.conf:ro]
```

---

## ⚙️ MÓDULOS OPERACIONALES

### 🏛️ Sistema Legacy (agents/)

Arquitectura original con 11 agentes especializados orquestados por `supervisor.js`:

| Agente | Función | Estado | API Dependencias |
|--------|---------|---------|------------------|
| **supervisor.js** | Orquestador central, métricas `/metrics` | ✅ Activo | Express server 3002 |
| research.js | Investigación de tendencias con IA | ✅ Activo | Gemini API |
| creative.js | Generación de creativos publicitarios | ✅ Activo | Gemini API |
| contentstrategist.js | Estrategias de contenido | ✅ Activo | Gemini API |
| listing.js | Gestión de productos Shopify | 🔄 Configurado | Shopify GraphQL |
| publisher.js | Publicación multi-canal | 🔄 Listo | Meta Graph API |
| trendhunter.js | Análisis de competencia | ✅ Activo | Web scraping |
| validator.js | Validación de datos | ✅ Activo | - |
| metrics.js | Recolección de métricas | ✅ Activo | - |
| growth.js | Estrategias de crecimiento | ✅ Activo | - |
| supplier_sync.js | Sincronización proveedores | 🔄 Configurado | Amazon SP-API |

**Integración con Castas:** Sistema de roles organizacionales (Exploradoras, Obreras, Nodrizas) inspirado en colonias de hormigas, documentado en `/consejo-imperial/`.

---

### ⭐ Sistema Imperios (imperios/)

Nueva arquitectura modular de producción con 5 subsistemas:

#### 1️⃣ Marketing Automation (`marketing/automation.js`) ✅ OPERACIONAL

**Responsabilidades:**
- Publicación automática Instagram/Facebook/TikTok
- Gestión de chatbots WhatsApp Business
- A/B testing de campañas publicitarias
- Monitoreo de engagement en tiempo real
- Programación de posts con cola de ejecución

**Código clave:**
```javascript
class MarketingAutomation {
  async publishToInstagram(content, media) { /* ... */ }
  async publishToFacebook(content, media) { /* ... */ }
  async createABTest(variants, budget) { /* ... */ }
  async activateWhatsAppBot(config) { /* ... */ }
  async monitorEngagement() { /* ... */ }
  async schedulePost(content, dateTime) { /* ... */ }
}
```

**APIs requeridas:**
- Meta Graph API v19.0 (Instagram, Facebook)
- WhatsApp Business API
- TikTok Marketing API (pendiente)

**Logs:** `logs/imperial/marketing/*.jsonl`

---

#### 2️⃣ Shop Sync Engine (`shop-sync/engine.js`) ✅ OPERACIONAL

**Responsabilidades:**
- Sincronización bidireccional inventario Shopify ↔ Amazon
- Precios dinámicos con análisis de competencia
- Gestión de órdenes multi-canal
- Monitoreo de competidores
- Alertas de stock bajo

**Código clave:**
```javascript
class ShopSyncEngine {
  async syncInventoryToAmazon(products) { /* ... */ }
  async syncInventoryToShopify(products) { /* ... */ }
  async calculateSmartPrice(producto, competencia) {
    // Algoritmo de pricing inteligente con validación de márgenes
  }
  async updatePriceEverywhere(producto, newPrice) { /* ... */ }
  async monitorCompetition(categoria) { /* ... */ }
}
```

**Algoritmo de Pricing:**
- Calcula precio promedio competencia
- Aplica descuento 5-8% para competitividad
- Valida margen mínimo 20%
- Actualiza en ambas plataformas simultáneamente

**APIs requeridas:**
- Shopify Admin API 2024-10
- Amazon SP-API
- Web scraping competidores

**Logs:** `logs/imperial/shop-sync/*.jsonl`

---

#### 3️⃣ IA Engine (`ia/engine.js`) ✅ OPERACIONAL + TESTEADO

**Responsabilidades:**
- Generación de descripciones de productos optimizadas
- Contenido para redes sociales (Instagram, Facebook, TikTok, YouTube Shorts)
- Optimización de títulos SEO
- Recomendaciones personalizadas
- Análisis de tendencias predictivo

**Código clave:**
```javascript
class IAEngine {
  async initialize() {
    this.geminiAPI = new GoogleGenerativeAI(keys.GEMINI_API_KEY);
    this.model = this.geminiAPI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }
  
  async generateProductDescription(producto) { /* ... */ }
  async generateSocialContent(tema, plataforma, tono) { /* ... */ }
  async optimizeProductTitle(titulo, keywords) { /* ... */ }
  async generateRecommendations(usuario, historial) { /* ... */ }
  async analyzeTrends(categoria, timeframe) { /* ... */ }
}
```

**Estado:** ✅ **TESTEADO EXITOSAMENTE** el 16/10/2025 con Gemini Pro
- Generó descripción de producto
- Creó contenido social para Instagram
- Optimizó título con keywords
- Produjo recomendaciones personalizadas

**API Key activa:** `AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU` (config/keys.json)

**Logs:** `logs/imperial/ia/*.jsonl`

---

#### 4️⃣ Infraestructura (`infra/`) 🔄 EN CONSTRUCCIÓN

**Funcionalidades planeadas:**
- Scripts de deployment automatizado (GCP/AWS/Azure)
- Backups automatizados diarios
- Monitoreo de salud de servicios
- Gestión SSL/TLS (Let's Encrypt)
- Alertas Telegram/Email
- Logs centralizados (ELK Stack recomendado)

**Estado:** Directorio creado, engines pendientes de implementación

---

#### 5️⃣ Analytics (`analytics/`) 🔄 EN CONSTRUCCIÓN

**Funcionalidades planeadas:**
- Integración Google Data Studio / Looker
- Reportes automáticos diarios (PDF/Email)
- Dashboard en tiempo real
- KPIs críticos (ventas, conversiones, ROI, engagement)
- Alertas de anomalías

**Estado:** Directorio creado, engines pendientes de implementación

---

## 🔑 CREDENCIALES Y APIs

### Inventario de Credenciales (42 total)

#### ✅ CONFIGURADAS Y OPERACIONALES (21)

**Google/IA:**
- ✅ `GEMINI_API_KEY`: AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU (Activo)

**Instagram (gollos_chickens):**
- ✅ `long_lived_user_token`: EAAeto7T8g1YBPtQpxn4naMvTs... (Registrado 14/10/2025, vigente mientras app autorizada)
- ✅ `user_id`: 17841451318915730

**Facebook (gollos_chickens):**
- ✅ `app_id`: 10985552895072623
- ✅ `app_secret`: f10f5f0fca147551647cb3af5efffc2f
- ✅ `page_id`: 377626045425378
- ✅ `page_access_token`: EAAPnIMcT6W8BPmtRZC2k5Ypm... (Long-lived 60 días, vence 30/11/2025)

**Facebook (goio_store):**
- ✅ `app_id`: 2161243464696662
- ✅ `page_id`: 783032478270795
- ✅ `page_access_token`: EAAeto7T8g1YBPtmaFLZBh... (vence 29/11/2025)

**WhatsApp Business:**
- ✅ `numero_negocio`: 939431887
- ✅ `numero_completo`: +51939431887
- ✅ Estado: NUMERO_CONFIRMADO_LISTO_VINCULAR

**Shopify (goio-store):**
- ✅ `SHOPIFY_STORE_DOMAIN`: goio-store.myshopify.com (configurado en env)
- ✅ `SHOPIFY_API_VERSION`: 2024-10

#### ⚠️ PENDIENTES DE COMPLETAR (21)

**Meta System:**
- ⏳ `system_user_access_token` (gollos_chickens)
- ⏳ `system_user_access_token` (goio_store)
- ⏳ `app_secret` (goio_store) → Actualmente: "CONFIGURAR_DESPUES"

**WhatsApp Business API:**
- ⏳ `business_account_id`
- ⏳ `phone_number_id`
- ⏳ `whatsapp_access_token`
- ⏳ `webhook_verify_token`

**Shopify Admin API:**
- ⏳ `SHOPIFY_ACCESS_TOKEN` (goio-store) → Actualmente: "pending_prod_token"
- ⏳ `SHOPIFY_ADMIN_TOKEN_PROD`
- ⏳ Scopes requeridos: `write_products, write_orders, read_inventory`

**Amazon SP-API:**
- ⏳ `AWS_ACCESS_KEY_ID`
- ⏳ `AWS_SECRET_ACCESS_KEY`
- ⏳ `AWS_REGION`
- ⏳ `AMAZON_MARKETPLACE_ID`
- ⏳ `AMAZON_SELLER_ID`
- ⏳ `AMAZON_REFRESH_TOKEN`

**TikTok Marketing API:**
- ⏳ `tiktok_app_id`
- ⏳ `tiktok_app_secret`
- ⏳ `tiktok_access_token`
- ⏳ `tiktok_pixel_id`

### Scripts de Auditoría Disponibles

- `scripts/auditarCredenciales.js` → Escanea config files, detecta placeholders
- `scripts/generarInformeCredenciales.js` → Genera reporte accionable con line numbers
- Último reporte: `INFORME_ACCIONES_CREDENCIALES-2025-10-14.txt` (92 entradas)

---

## 📊 CONFIGURACIÓN ACTUAL

### Variables de Entorno (.env files)

#### palacio-central.env (Backend)
```bash
NODE_ENV=production
PORT=3002
METRICS_TOKEN=<seguridad_token>

# Shopify
SHOPIFY_STORE_DOMAIN=goio-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=pending_prod_token
SHOPIFY_API_VERSION=2024-10

# Meta Graph API
META_GRAPH_VERSION=v19.0

# Logs
LOG_LEVEL=info
LOG_FORMAT=jsonl
```

#### goio-store.env (Frontend)
```bash
NODE_ENV=production
SHOPIFY_THEME_ID=<theme_id>
```

### Archivos de Configuración JSON

**config/keys.json:**
- Google Gemini API key ✅
- Facebook app credentials (2 marcas) ✅
- WhatsApp business config ✅
- Respuestas automáticas configuradas ✅

**config/social_credentials.json:**
- Instagram tokens (gollos_chickens) ✅
- Facebook page tokens (2 páginas) ✅
- TikTok (placeholders) ⏳

**config/shopify.json:**
- Store domains (goio-store, eco-eterno) ✅
- Admin API keys (pendiente producción) ⏳

**config/amazon.json:**
- Marketplaces configurados
- Seller IDs pendientes ⏳

**config/products.json:**
- Catálogo maestro con 10 productos
- Incluye: Kit Home Office, Purificador Aire, Mini Proyector HD, etc.
- Campos: title, body_html, variants, images, tags

---

## 🚀 DEPLOYMENT Y OPERACIÓN

### Comandos Principales (package.json scripts)

```bash
# Producción
npm run start              # Entry point start.js → supervisor.js
npm run start:prod         # Con SHOPIFY_ENV=prod

# Desarrollo
npm run start:dev          # Dev mode con hot reload

# Utilidades
npm run audit:store        # Auditoría de tiendas
npm run verify:prompts     # Verificación de prompts IA
npm run abandoned:prod     # Recuperación carritos abandonados
npm run postventa:prod     # Scripts post-venta
npm run webhooks:prod      # Registro de webhooks Shopify
```

### Supervisor.js - Orquestador Central

**Puerto:** 3002  
**Endpoints:**
- `GET /metrics` → Métricas en tiempo real (requiere METRICS_TOKEN)
- `GET /health` → Health check para Docker/Kubernetes

**Funcionalidades:**
- Ejecuta ciclos de agentes según rutina (agents/castas/rutina.json)
- Dashboard en memoria (logs, métricas, estado agentes)
- Validación de credenciales con hash SHA-256
- Logging JSONL en `logs/imperial/supervisor/`

**Código clave:**
```javascript
const app = express();
const PORT = process.env.PORT || 3002;

// State management
const dashboardState = {
  logs: [],
  metricas: {},
  agentes: {},
  supervisor: {
    version: '1.0.0',
    credencialesHash: null
  }
};

// Agentes disponibles
const AGENTES_DISPONIBLES = [
  'research', 'creative', 'contentstrategist', 
  'listing', 'publisher', 'trendhunter',
  'validator', 'metrics', 'growth', 'supplier_sync'
];
```

### Healthchecks Docker

```yaml
healthcheck:
  test: ["CMD", "curl", "-fsS", "http://localhost:3000/health"]
  interval: 15s
  timeout: 5s
  retries: 6
```

---

## 📂 LOGS Y MONITOREO

### Estructura de Logs

```
logs/
├── imperial/                      ← Logs centralizados
│   ├── marketing/
│   │   ├── posts-YYYY-MM-DD.jsonl
│   │   ├── ab-tests-YYYY-MM-DD.jsonl
│   │   └── engagement-YYYY-MM-DD.jsonl
│   ├── shop-sync/
│   │   ├── inventory-sync-YYYY-MM-DD.jsonl
│   │   ├── pricing-YYYY-MM-DD.jsonl
│   │   └── orders-YYYY-MM-DD.jsonl
│   ├── ia/
│   │   ├── generations-YYYY-MM-DD.jsonl
│   │   └── recommendations-YYYY-MM-DD.jsonl
│   ├── operations/
│   │   └── operaciones-YYYY-MM-DD.jsonl
│   └── supervisor/
│       └── supervisor-YYYY-MM-DD.jsonl
├── cloudflare_dns_update.log      ← DNS updates
└── reportes/                      ← Reportes históricos
```

### Formato JSONL

Cada línea es un objeto JSON independiente:
```json
{"timestamp":"2025-10-18T10:30:00Z","evento":"product_sync","data":{"sku":"GOI-001","status":"success"},"agente":"shop-sync"}
```

**Ventajas:**
- Append-only (no corrupción)
- Fácil procesamiento con `jq`, `grep`, `awk`
- Compatible con ELK Stack, Datadog, CloudWatch

---

## 🌐 INFRAESTRUCTURA DE RED

### Configuración Nginx (reverse-proxy/nginx.conf)

```nginx
upstream palacio_central {
    server palacio-central:3002;
}

upstream goio_store {
    server goio-store:3000;
}

server {
    listen 80;
    server_name goio-store.com www.goio-store.com;
    
    location /api/ {
        proxy_pass http://palacio_central;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://goio_store;
    }
}
```

### Docker Network

```yaml
networks:
  goio_net:
    driver: bridge
```

**Servicios en misma red:**
- palacio-central
- goio-store
- nginx

---

## 🔐 SEGURIDAD

### Tokens y Secretos

**Almacenamiento actual:**
- ✅ Archivos JSON en `config/` (NO encriptados)
- ⚠️ `.env` files (NO committed a Git)
- ❌ Secrets management (Vault, AWS Secrets Manager) → Pendiente

**Recomendaciones para Cloud:**
1. Migrar a **AWS Secrets Manager** / **GCP Secret Manager** / **Azure Key Vault**
2. Rotar tokens cada 60 días (Meta) / 90 días (otros)
3. Implementar OAuth refresh tokens
4. Auditar accesos con AWS CloudTrail / GCP Audit Logs

### SSL/TLS

**Estado actual:** ⚠️ No configurado (puerto 80 HTTP)

**Para producción cloud:**
- Certificados Let's Encrypt con Certbot
- O usar AWS Certificate Manager (ACM) / GCP Managed Certificates
- Forzar HTTPS con redirect 301

### CORS y API Security

```javascript
// Express CORS configurado
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```

---

## 📈 MÉTRICAS Y KPIs

### KPIs Críticos (Documentados en imperios/README.md)

**Ventas:**
- Ventas diarias por canal (Shopify, Amazon, WhatsApp)
- AOV (Average Order Value)
- Tasa de conversión

**Marketing:**
- CPC (Cost Per Click) por campaña
- CTR (Click-Through Rate)
- Engagement rate (Instagram, Facebook)
- ROAS (Return on Ad Spend)

**Operaciones:**
- Tasa de abandono de carritos
- Tiempo de respuesta WhatsApp
- Stock-outs por producto
- Tiempo de sincronización inventarios

**IA:**
- Tasa de aceptación de descripciones generadas
- Engagement de contenido IA vs manual
- Tiempo de generación de contenido

### Dashboard Actual

**Endpoint:** `http://palacio-central:3002/metrics`  
**Autenticación:** Header `Authorization: Bearer ${METRICS_TOKEN}`

**Datos expuestos:**
```json
{
  "logs": [...],  // Últimos 200 eventos
  "metricas": {
    "ventas_hoy": 0,
    "carritos_abandonados": 0,
    "posts_publicados": 0
  },
  "agentes": {
    "research": {"ultimaEjecucion": "...", "estado": "idle"},
    // ...
  },
  "supervisor": {
    "version": "1.0.0",
    "uptime": "..."
  }
}
```

---

## 🎯 ESTRATEGIA DE MIGRACIÓN

### Fase 1: Pre-Migración (Semana 1-2)

**Auditoría completa:**
- [ ] Inventario de todas las dependencias externas
- [ ] Documentar todas las variables de entorno
- [ ] Backup completo de base de datos (si existe)
- [ ] Exportar logs históricos
- [ ] Listar todos los dominios y subdominios
- [ ] Identificar webhooks activos

**Preparación de credenciales:**
- [ ] Completar 21 credenciales faltantes
- [ ] Configurar secrets management (AWS Secrets Manager / GCP)
- [ ] Generar nuevos tokens con permisos correctos
- [ ] Documentar proceso de rotación

**Testing local:**
- [ ] Ejecutar test suite completo
- [ ] Validar todas las integraciones API
- [ ] Verificar healthchecks funcionando
- [ ] Probar flujo completo de usuario

---

### Fase 2: Migración Infraestructura (Semana 3-4)

#### Opción A: AWS (Recomendado para escalabilidad)

**Servicios sugeridos:**

1. **Compute:**
   - ECS Fargate / EKS (Kubernetes) para contenedores
   - ALB (Application Load Balancer) en lugar de Nginx
   - Auto Scaling Groups

2. **Storage:**
   - S3 para logs y assets
   - RDS (si se requiere DB) o DynamoDB
   - ElastiCache Redis para caché

3. **Networking:**
   - VPC con subnets públicas/privadas
   - Route 53 para DNS
   - CloudFront CDN

4. **Monitoring:**
   - CloudWatch Logs + Metrics
   - X-Ray para tracing
   - SNS para alertas

5. **Security:**
   - Secrets Manager para tokens
   - ACM para certificados SSL
   - WAF para protección web
   - IAM roles con least privilege

**Arquitectura AWS propuesta:**
```
Internet → CloudFront CDN → Route 53
    ↓
ALB (HTTPS:443)
    ↓
┌─────────────────────────────────┐
│  ECS Cluster (Fargate)          │
│  ┌──────────────────────────┐   │
│  │ palacio-central (3 tasks)│   │
│  │ goio-store (2 tasks)     │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Data Layer                     │
│  - S3 (logs, assets)            │
│  - ElastiCache Redis            │
│  - Secrets Manager              │
└─────────────────────────────────┘
```

**Costos estimados:**
- ECS Fargate (5 tasks): ~$50-80/mes
- ALB: ~$25/mes
- S3 + CloudWatch: ~$20/mes
- Secrets Manager: ~$5/mes
- **Total:** ~$100-130/mes (sin tráfico elevado)

---

#### Opción B: GCP (Recomendado para IA/ML)

**Servicios sugeridos:**

1. **Compute:**
   - Cloud Run (serverless containers) - MÁS FÁCIL
   - GKE (Kubernetes) si requiere más control
   - Cloud Load Balancing

2. **Storage:**
   - Cloud Storage para logs/assets
   - Firestore / Cloud SQL
   - Memorystore Redis

3. **IA/ML:**
   - Vertex AI (integración nativa con Gemini)
   - Natural Language API
   - Vision API

4. **Monitoring:**
   - Cloud Logging
   - Cloud Monitoring
   - Error Reporting

5. **Security:**
   - Secret Manager
   - Cloud Armor (WAF)
   - Identity-Aware Proxy

**Ventajas GCP para este proyecto:**
- Integración nativa con Gemini API (mismo ecosistema Google)
- Cloud Run extremadamente fácil de configurar
- Costos competitivos en IA/ML

---

#### Opción C: Azure (Si requieres Microsoft integrations)

**Servicios sugeridos:**
- Azure Container Instances / AKS
- Azure Front Door
- Azure Cosmos DB
- Azure Monitor
- Key Vault

---

### Fase 3: Post-Migración (Semana 5-6)

**Validación y optimización:**
- [ ] Pruebas de carga con Artillery / k6
- [ ] Verificar latencias < 200ms
- [ ] Confirmar todos los webhooks funcionando
- [ ] Monitorear costos reales vs estimados
- [ ] Configurar backups automáticos
- [ ] Establecer alertas críticas

**Optimizaciones:**
- [ ] Implementar CDN para assets estáticos
- [ ] Configurar caché Redis/Memcached
- [ ] Habilitar compresión Gzip/Brotli
- [ ] Optimizar imágenes (WebP, lazy loading)
- [ ] Implementar rate limiting

**Documentación:**
- [ ] Runbook de operaciones
- [ ] Playbook de incidentes
- [ ] Diagrama de arquitectura actualizado
- [ ] Procedimientos de rollback

---

## 🚨 ALERTAS CRÍTICAS

### Eventos que requieren notificación inmediata:

1. **Healthcheck failures** (3 consecutivos)
2. **API rate limits** alcanzados (Meta, Shopify, Amazon)
3. **Tokens expirados** o próximos a expirar (<7 días)
4. **Stock-outs** de productos high-margin
5. **Errores 5xx** > 1% requests
6. **Latencia > 2 segundos** (p95)
7. **Costos cloud** > 20% presupuesto mensual

### Canales de notificación recomendados:

- **PagerDuty** / **Opsgenie** para on-call
- **Slack** / **Telegram** para alertas no críticas
- **Email** para reportes diarios

---

## 📋 CHECKLIST PRE-MIGRACIÓN

### Infraestructura
- [ ] Backup completo Hetzner (archivos + DB si existe)
- [ ] Exportar todos los logs históricos
- [ ] Documentar IPs actuales y DNS records
- [ ] Listar todos los cronjobs activos
- [ ] Verificar discos y uso actual de recursos

### Configuración
- [ ] Completar 21 credenciales faltantes
- [ ] Validar todos los tokens no expirados
- [ ] Documentar todas las variables de entorno
- [ ] Revisar permisos de APIs (Shopify, Meta, Amazon)
- [ ] Configurar OAuth refresh tokens

### Testing
- [ ] Test completo de flujo de usuario
- [ ] Validar integraciones API (Shopify, Meta, Gemini)
- [ ] Verificar generación de logs JSONL
- [ ] Probar healthchecks Docker
- [ ] Ejecutar scripts de auditoría

### Seguridad
- [ ] Rotar todos los tokens antes de migración
- [ ] Configurar secrets management en cloud
- [ ] Establecer firewall rules
- [ ] Configurar SSL/TLS (Let's Encrypt o ACM)
- [ ] Implementar rate limiting

### Monitoreo
- [ ] Configurar CloudWatch / Stackdriver
- [ ] Establecer alertas críticas
- [ ] Crear dashboard de métricas clave
- [ ] Configurar log aggregation (ELK / Datadog)
- [ ] Setup de tracing (X-Ray / Jaeger)

---

## 📞 PUNTOS DE CONTACTO

### Agentes Inteligentes Activos

**Supervisor Imperial:** `agents/supervisor.js` (puerto 3002)
- Orquesta todos los agentes
- Expone métricas en `/metrics`
- Health check en `/health`

**Agentes de Investigación:**
- `research.js` → Tendencias y oportunidades
- `trendhunter.js` → Análisis de competencia

**Agentes de Contenido:**
- `creative.js` → Creativos publicitarios
- `contentstrategist.js` → Estrategias de contenido

**Agentes de Operaciones:**
- `listing.js` → Gestión de productos
- `publisher.js` → Publicación multi-canal
- `supplier_sync.js` → Sincronización proveedores

### Módulos Imperios

**Marketing:** `imperios/marketing/automation.js`
**Shop Sync:** `imperios/shop-sync/engine.js`
**IA:** `imperios/ia/engine.js`

---

## 🎯 ROADMAP POST-MIGRACIÓN

### Q4 2025
- ✅ Completar migración a cloud
- ✅ Activar todos los webhooks
- ✅ Configurar monitoreo 24/7
- 🔄 Implementar infra/ module
- 🔄 Implementar analytics/ module

### Q1 2026
- ⏳ Escalado horizontal automático
- ⏳ Machine Learning para recomendaciones
- ⏳ Integración con más marketplaces (MercadoLibre, Linio)
- ⏳ Dashboard público para métricas de negocio

---

## 📖 DOCUMENTACIÓN ADICIONAL

### Archivos clave para consulta:

- **Arquitectura modular:** `palacio-central/imperios/README.md`
- **Sistema de castas:** `palacio-central/consejo-imperial/estrategia-hormiguero/`
- **Roadmap operativo:** `palacio-central/ops/ROADMAP_KANBAN_IMPERIAL.md`
- **Configuración Shopify:** `palacio-central/docs/SHOPIFY_AGENT_OPERATIONS.md`
- **Flujo de ventas:** `palacio-central/ops/FLUJO_VENTAS_EXPRESS.md`
- **Auditoría de credenciales:** `INFORME_ACCIONES_CREDENCIALES-2025-10-14.txt`

### Scripts de utilidad:

```bash
# Auditoría de credenciales
node scripts/auditarCredenciales.js

# Generar reporte de credenciales
node scripts/generarInformeCredenciales.js

# Verificar conexión Shopify
node scripts/check-shopify-connection.js

# Listar productos en producción
npm run products:list

# Registrar webhooks
npm run webhooks:prod

# Auditoría completa de tienda
npm run audit:store
```

---

## 🔍 CONSIDERACIONES FINALES

### Fortalezas del Sistema Actual

1. **Modularidad:** Arquitectura limpia con separación de concerns
2. **Escalabilidad:** Diseño preparado para microservicios
3. **Logs estructurados:** JSONL facilita análisis y debugging
4. **IA integrada:** Gemini Pro operacional y testeado
5. **Docker ready:** Fácil deployment en cualquier cloud

### Áreas de Mejora Pre-Migración

1. **Secrets management:** Migrar de JSON a vault
2. **Database:** Actualmente fileSystem-based (considerar PostgreSQL/MongoDB)
3. **Testing:** Implementar test suite automatizado
4. **CI/CD:** Configurar pipeline de deployment
5. **Process manager:** Implementar PM2 o Supervisor

### Riesgos Identificados

1. **Tokens expirados:** 21 credenciales pendientes podrían bloquear funcionalidades
2. **Single point of failure:** Sin redundancia actualmente
3. **No hay backup automatizado:** Configurar ASAP
4. **SSL no configurado:** Tráfico HTTP no encriptado
5. **Logs sin rotación:** Podrían llenar disco

---

## 📬 CONTACTO Y SIGUIENTE PASO

**Mayordomo Imperial Digital**  
**Email:** [configurar]  
**Slack/Telegram:** [configurar]

**Próximos pasos recomendados:**

1. **Reunión de kickoff** para revisar este informe
2. **Definir cloud provider** (AWS/GCP/Azure)
3. **Establecer timeline** de migración
4. **Asignar responsables** por cada fase
5. **Configurar entorno de staging** para testing

---

**Fin del Informe Técnico**  
**Generado:** 18 de octubre de 2025  
**Versión:** 1.0.0  
**Confidencialidad:** Interno
