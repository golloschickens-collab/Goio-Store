# 🏛️ MIGRACIÓN IMPERIAL A GOOGLE CLOUD PLATFORM

**Fecha:** 17 de octubre de 2025  
**Proyecto:** Goio™ Imperios Digitales  
**Objetivo:** Migración arquitectura modular con trazabilidad total

---

## 📊 INVENTARIO DE IMPERIOS DIGITALES

### 🏪 **Imperio 1: Goio™ Store** (eCommerce Principal)
**Estado actual:** Producción en Hetzner + Shopify  
**Frontend:** Shopify Theme (`goio-theme/`)  
**Backend:** palacio-central (Node.js, puerto 3001)  
**Dominio:** skhqgs-2j.myshopify.com

**Componentes a migrar:**
- ✅ Backend API (palacio-central) → Cloud Run
- ✅ Agentes IA (research, creative, listing, publisher) → Cloud Run
- ✅ Sincronización Shopify ↔ Amazon → Cloud Run + Cloud Scheduler
- ⏳ Assets estáticos → Cloud Storage + CDN
- ⏳ Base de datos tareas → Firestore
- ⏳ Logs imperiales → Cloud Logging

**APIs integradas:**
- Shopify Admin API (GraphQL + REST)
- Shopify Storefront API
- Google Gemini AI API
- Meta Graph API (Facebook/Instagram)
- WhatsApp Business API (pendiente)

---

### 🐔 **Imperio 2: Gollos Chicken's** (Restaurante Digital)
**Estado actual:** Marketing digital + WhatsApp CRM  
**Frontend:** gollos-landing (React, puerto 3003)  
**Backend:** CRM WhatsApp (FastAPI Python, puerto 8000)  
**Dominio:** Pendiente custom domain

**Componentes a migrar:**
- ✅ Landing page → Cloud Run (contenedor Nginx)
- ✅ WhatsApp CRM API → Cloud Run (Python FastAPI)
- ⏳ Base de datos PostgreSQL → Cloud SQL
- ⏳ n8n workflows → Cloud Run (contenedor n8n)
- ⏳ Metabase analytics → Cloud Run

**APIs integradas:**
- WhatsApp Business API (+51939431887)
- Meta Graph API (Facebook Pages: 2 activas)
- Instagram Graph API (gollos_chickens)
- PostgreSQL (clientes, pedidos, interacciones)

---

### 🌱 **Imperio 3: Eco Eterno** (Sostenibilidad)
**Estado actual:** En desarrollo  
**Frontend:** eco-eterno (React, puerto 3004)  
**Backend:** Compartido con palacio-central  
**Dominio:** Pendiente

**Componentes a migrar:**
- ✅ Frontend React → Cloud Run
- ✅ API endpoints → Cloud Run (palacio-central)
- ⏳ Contenido generado por IA → Cloud Storage
- ⏳ Integración cartas digitales + música emocional

---

## 🎯 ARQUITECTURA GCP PROPUESTA

### **Proyecto GCP:** `goio-imperios-prod`
### **Región principal:** `us-central1` (Iowa - Tier gratuito)
### **Región secundaria:** `southamerica-east1` (São Paulo - Latencia Perú)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD LOAD BALANCER                          │
│              (SSL/TLS automático + CDN global)                  │
└──────────────┬──────────────┬──────────────┬───────────────────┘
               │              │              │
        ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
        │  goio-store │ │  gollos  │ │ eco-eterno  │
        │  Cloud Run  │ │Cloud Run │ │ Cloud Run   │
        │  (Node.js)  │ │ (React)  │ │  (React)    │
        └──────┬──────┘ └────┬─────┘ └──────┬──────┘
               │              │              │
        ┌──────▼──────────────▼──────────────▼──────┐
        │         palacio-central API                │
        │         Cloud Run (Node.js 20)             │
        │   - Agentes IA (Gemini)                    │
        │   - Sincronización Shopify/Amazon          │
        │   - Marketing automation                   │
        │   - Supervisor imperial                    │
        └──────┬──────────────┬──────────────┬──────┘
               │              │              │
    ┌──────────▼────┐  ┌─────▼──────┐  ┌───▼─────────┐
    │   Firestore   │  │ Cloud SQL  │  │  Secret     │
    │   (NoSQL)     │  │ PostgreSQL │  │  Manager    │
    │   - Tareas    │  │ - CRM      │  │ - API keys  │
    │   - Logs      │  │ - Pedidos  │  │ - Tokens    │
    └───────────────┘  └────────────┘  └─────────────┘
               │              │              │
        ┌──────▼──────────────▼──────────────▼──────┐
        │         Cloud Logging & Monitoring         │
        │      + Trace ID para cada operación        │
        └────────────────────────────────────────────┘
```

---

## 🔐 SERVICIOS GCP A ACTIVAR

### **Servicios Core (Obligatorios):**
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

### **Servicios IA y ML:**
```bash
gcloud services enable \
  aiplatform.googleapis.com \
  generativelanguage.googleapis.com
```

### **Servicios Storage y Datos:**
```bash
gcloud services enable \
  storage.googleapis.com \
  firestore.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com
```

### **Servicios Networking:**
```bash
gcloud services enable \
  compute.googleapis.com \
  dns.googleapis.com \
  certificatemanager.googleapis.com
```

### **Servicios Scheduler:**
```bash
gcloud services enable \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com
```

---

## 📦 COMPONENTES DETECTADOS PARA MIGRACIÓN

### **Backend APIs:**
| Componente | Puerto Local | Destino GCP | Prioridad |
|------------|--------------|-------------|-----------|
| palacio-central | 3001 | Cloud Run (8080) | 🔴 Alta |
| goio-store (SSR) | 3002 | Cloud Run (8080) | 🟡 Media |
| gollos-landing | 3003 | Cloud Run (8080) | 🟡 Media |
| eco-eterno | 3004 | Cloud Run (8080) | 🟢 Baja |
| WhatsApp CRM API | 8000 | Cloud Run (8080) | 🔴 Alta |
| n8n workflows | 5678 | Cloud Run (8080) | 🟡 Media |

### **Bases de Datos:**
| Base de Datos | Tipo | Local | Destino GCP | Migración |
|---------------|------|-------|-------------|-----------|
| tareas.json | JSON file | `db/tareas.json` | Firestore | Script Python |
| crm_autonomo | PostgreSQL | Docker | Cloud SQL | pg_dump + restore |
| logs imperiales | Archivos | `logs/` | Cloud Logging | Streaming |

### **Secrets y Credenciales:**
| Secret | Uso | Destino |
|--------|-----|---------|
| GEMINI_API_KEY | IA generativa | Secret Manager |
| SHOPIFY_ADMIN_TOKEN_PROD | eCommerce | Secret Manager |
| META_ACCESS_TOKEN | Social media | Secret Manager |
| WHATSAPP_ACCESS_TOKEN | CRM | Secret Manager |
| INSTAGRAM_TOKEN | Marketing | Secret Manager |
| FACEBOOK_PAGE_TOKENS (2) | Marketing | Secret Manager |
| DB_PASSWORD | PostgreSQL | Secret Manager |

### **Flujos n8n (Automatizaciones):**
| Flujo | Descripción | Trigger | Migración |
|-------|-------------|---------|-----------|
| Publicación Instagram | Post automático con IA | Cron diario | Cloud Scheduler → Webhook |
| Sincronización inventario | Shopify ↔ Amazon | Webhook | Cloud Run endpoint |
| Respuesta WhatsApp | Chatbot CRM | Webhook Meta | Cloud Run endpoint |
| Reportes diarios | Métricas consolidadas | Cron 8am | Cloud Scheduler → Firestore |

---

## 🚀 PLAN DE MIGRACIÓN FASE POR FASE

### **FASE 0: Preparación Cloud (Día 1 - 2 horas)**

#### 0.1 Crear proyecto y billing
```bash
# Desde Cloud Shell (https://console.cloud.google.com)
gcloud projects create goio-imperios-prod --set-as-default

# Vincular billing
gcloud billing projects link goio-imperios-prod \
  --billing-account=$(gcloud billing accounts list --format='value(ACCOUNT_ID)' | head -1)

# Configurar región por defecto
gcloud config set run/region us-central1
gcloud config set compute/region us-central1
```

#### 0.2 Habilitar todos los servicios
```bash
# Ejecutar todos los comandos de "Servicios GCP a activar" (arriba)
bash scripts/gcp/enable-all-services.sh
```

#### 0.3 Crear Artifact Registry
```bash
gcloud artifacts repositories create goio-images \
  --repository-format=docker \
  --location=us-central1 \
  --description="Imágenes Docker de Goio Imperios"
```

#### 0.4 Configurar autenticación Docker
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

### **FASE 1: Migrar Backend Principal (Día 1-2 - 4 horas)**

#### 1.1 Migrar secrets a Secret Manager
```bash
# Script automatizado
bash scripts/gcp/migrate-secrets.sh

# O manualmente:
echo -n "AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

echo -n "shpat_YOUR_SHOPIFY_ADMIN_TOKEN" | \
  gcloud secrets create SHOPIFY_ADMIN_TOKEN_PROD --data-file=-

# ... (repetir para todos los secrets del inventario)
```

#### 1.2 Deploy palacio-central a Cloud Run
```bash
cd palacio-central

# Build y push imagen
docker build -f Dockerfile.cloudrun \
  -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:v1.0.0 .

docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:v1.0.0

# Deploy con secrets
gcloud run deploy palacio-central \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:v1.0.0 \
  --region us-central1 \
  --platform managed \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,SHOPIFY_ADMIN_TOKEN_PROD=SHOPIFY_ADMIN_TOKEN_PROD:latest" \
  --set-env-vars="NODE_ENV=production,PORT=8080,TRACE_ENABLED=true"
```

#### 1.3 Verificar deployment
```bash
# Obtener URL
export PALACIO_URL=$(gcloud run services describe palacio-central \
  --region us-central1 --format='value(status.url)')

# Health check
curl $PALACIO_URL/health

# Test endpoint agentes
curl $PALACIO_URL/api/agents/status

# Test Gemini IA
curl -X POST $PALACIO_URL/api/ia/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Genera un título para producto de skincare"}'
```

---

### **FASE 2: Migrar CRM WhatsApp (Día 2 - 3 horas)**

#### 2.1 Crear Cloud SQL PostgreSQL
```bash
gcloud sql instances create crm-gollos-prod \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=4 \
  --database-flags=max_connections=100

# Crear base de datos
gcloud sql databases create crm_autonomo \
  --instance=crm-gollos-prod

# Crear usuario
gcloud sql users create crm_user \
  --instance=crm-gollos-prod \
  --password=$(openssl rand -base64 32)
```

#### 2.2 Migrar datos desde Hetzner
```bash
# En servidor Hetzner (SSH)
docker exec crm-db pg_dump -U crm_user crm_autonomo > backup_crm_$(date +%Y%m%d).sql

# Descargar backup
scp root@hetzner:/ruta/backup_crm_*.sql ./

# Importar a Cloud SQL
gcloud sql import sql crm-gollos-prod gs://goio-backups/backup_crm_20251017.sql \
  --database=crm_autonomo
```

#### 2.3 Deploy WhatsApp CRM API
```bash
cd crm/api

# Build Python FastAPI
docker build -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/whatsapp-crm:v1.0.0 .

docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/whatsapp-crm:v1.0.0

# Deploy con conexión Cloud SQL
gcloud run deploy whatsapp-crm \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/whatsapp-crm:v1.0.0 \
  --region us-central1 \
  --add-cloudsql-instances goio-imperios-prod:us-central1:crm-gollos-prod \
  --set-secrets="DB_PASSWORD=CRM_DB_PASSWORD:latest,WHATSAPP_ACCESS_TOKEN=WHATSAPP_ACCESS_TOKEN:latest" \
  --set-env-vars="DB_HOST=/cloudsql/goio-imperios-prod:us-central1:crm-gollos-prod,DB_USER=crm_user,DB_NAME=crm_autonomo" \
  --allow-unauthenticated
```

#### 2.4 Actualizar webhook en Meta
```bash
# Obtener nueva URL
export CRM_URL=$(gcloud run services describe whatsapp-crm \
  --region us-central1 --format='value(status.url)')

echo "Nueva URL webhook: $CRM_URL/api/webhooks/whatsapp"

# Actualizar en Meta Business Suite:
# 1. Ir a https://business.facebook.com/settings/whatsapp-business-accounts
# 2. Webhook URL: $CRM_URL/api/webhooks/whatsapp
# 3. Verify token: gollos_whatsapp_verify_2025
```

---

### **FASE 3: Migrar Frontends (Día 3 - 2 horas)**

#### 3.1 Deploy goio-store (React SSR)
```bash
cd goio-store

docker build -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/goio-store:v1.0.0 .
docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/goio-store:v1.0.0

gcloud run deploy goio-store \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/goio-store:v1.0.0 \
  --region us-central1 \
  --set-env-vars="BACKEND_URL=$PALACIO_URL" \
  --allow-unauthenticated
```

#### 3.2 Deploy gollos-landing
```bash
cd gollos-landing

docker build -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/gollos-landing:v1.0.0 .
docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/gollos-landing:v1.0.0

gcloud run deploy gollos-landing \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/gollos-landing:v1.0.0 \
  --region us-central1 \
  --set-env-vars="API_URL=$CRM_URL" \
  --allow-unauthenticated
```

#### 3.3 Deploy eco-eterno
```bash
cd eco-eterno

docker build -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/eco-eterno:v1.0.0 .
docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/eco-eterno:v1.0.0

gcloud run deploy eco-eterno \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/eco-eterno:v1.0.0 \
  --region us-central1 \
  --allow-unauthenticated
```

---

### **FASE 4: Migrar Storage y Logs (Día 3-4 - 2 horas)**

#### 4.1 Crear Cloud Storage buckets
```bash
# Assets estáticos
gsutil mb -l us-central1 -c STANDARD gs://goio-assets-prod

# Backups
gsutil mb -l us-central1 -c NEARLINE gs://goio-backups-prod

# Logs imperiales históricos
gsutil mb -l us-central1 -c COLDLINE gs://goio-logs-archive
```

#### 4.2 Migrar logs históricos
```bash
# Subir logs desde Hetzner
cd logs/
gsutil -m cp -r . gs://goio-logs-archive/hetzner-$(date +%Y%m%d)/
```

#### 4.3 Configurar Firestore para tareas
```bash
# Crear base de datos Firestore
gcloud firestore databases create --region=us-central1

# Migrar tareas.json → Firestore
python scripts/gcp/migrate-tareas-to-firestore.py
```

---

### **FASE 5: Automatizaciones y Schedulers (Día 4 - 3 horas)**

#### 5.1 Crear Cloud Scheduler jobs
```bash
# Publicación Instagram diaria 9am
gcloud scheduler jobs create http instagram-daily-post \
  --schedule="0 9 * * *" \
  --time-zone="America/Lima" \
  --uri="$PALACIO_URL/api/marketing/instagram/post" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body='{"action":"daily_post","trace_id":"scheduler-instagram"}' \
  --description="Publicación automática Instagram 9am"

# Sincronización inventario cada 4 horas
gcloud scheduler jobs create http inventory-sync \
  --schedule="0 */4 * * *" \
  --time-zone="America/Lima" \
  --uri="$PALACIO_URL/api/shop-sync/inventory" \
  --http-method=POST \
  --description="Sync inventario Shopify/Amazon"

# Reporte diario 8am
gcloud scheduler jobs create http daily-report \
  --schedule="0 8 * * *" \
  --time-zone="America/Lima" \
  --uri="$PALACIO_URL/api/analytics/daily-report" \
  --http-method=POST \
  --description="Reporte métricas diarias"
```

#### 5.2 Deploy n8n workflows (opcional)
```bash
# Si quieres mantener n8n visual
docker build -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/n8n:v1.0.0 \
  -f n8n.Dockerfile .

gcloud run deploy n8n-workflows \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/n8n:v1.0.0 \
  --region us-central1 \
  --memory 2Gi \
  --set-env-vars="N8N_BASIC_AUTH_ACTIVE=true,N8N_HOST=n8n.goio-imperios.com" \
  --no-allow-unauthenticated
```

---

### **FASE 6: Monitoreo y Trazabilidad (Día 5 - 2 horas)**

#### 6.1 Configurar Cloud Logging
```bash
# Crear sink para logs críticos
gcloud logging sinks create errors-to-bigquery \
  bigquery.googleapis.com/projects/goio-imperios-prod/datasets/logs \
  --log-filter='severity >= ERROR'

# Crear sink para trace IDs
gcloud logging sinks create traces-to-storage \
  storage.googleapis.com/goio-traces-prod \
  --log-filter='jsonPayload.trace_id!=""'
```

#### 6.2 Configurar alertas
```bash
# Alerta: Error rate > 5%
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s

# Alerta: Latency > 2s
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Latency" \
  --condition-display-name="P95 latency > 2s" \
  --condition-threshold-value=2000 \
  --condition-threshold-duration=180s
```

#### 6.3 Dashboard Looker Studio
```bash
# Conectar BigQuery a Looker Studio
# 1. Exportar logs a BigQuery (ya configurado en 6.1)
# 2. Ir a https://lookerstudio.google.com
# 3. Crear dashboard con métricas:
#    - Requests/minute por servicio
#    - Error rate por endpoint
#    - Latency P50/P95/P99
#    - Trace IDs de operaciones críticas
```

---

## 🔍 TRAZABILIDAD CON TRACE ID

### Implementación en código:

```javascript
// palacio-central/middleware/tracing.js
import { v4 as uuidv4 } from 'uuid';

export function tracingMiddleware(req, res, next) {
  const traceId = req.headers['x-trace-id'] || uuidv4();
  req.traceId = traceId;
  
  // Log entrada
  console.log(JSON.stringify({
    trace_id: traceId,
    event: 'request_start',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  }));
  
  // Override console.log para incluir trace_id
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(JSON.stringify({
      trace_id: traceId,
      message: args.join(' '),
      timestamp: new Date().toISOString()
    }));
  };
  
  // Log salida
  res.on('finish', () => {
    console.log(JSON.stringify({
      trace_id: traceId,
      event: 'request_end',
      status: res.statusCode,
      duration_ms: Date.now() - req._startTime,
      timestamp: new Date().toISOString()
    }));
  });
  
  next();
}
```

### Uso en agentes:

```javascript
// agents/research.js
export async function researchProducts(traceId) {
  console.log(`[${traceId}] Iniciando research de productos...`);
  
  try {
    const products = await fetchCompetitorData(traceId);
    console.log(`[${traceId}] Encontrados ${products.length} productos`);
    
    const analysis = await analyzeWithGemini(products, traceId);
    console.log(`[${traceId}] Análisis completado`);
    
    return { traceId, products, analysis };
  } catch (error) {
    console.error(`[${traceId}] ERROR: ${error.message}`);
    throw error;
  }
}
```

### Query logs por trace ID:

```bash
# Buscar todos los logs de una operación específica
gcloud logging read "jsonPayload.trace_id='abc-123-def'" \
  --limit 100 \
  --format json

# Dashboard query en Looker:
SELECT
  jsonPayload.trace_id,
  timestamp,
  jsonPayload.event,
  jsonPayload.duration_ms
FROM `goio-imperios-prod.logs.cloudrun_logs`
WHERE jsonPayload.trace_id = 'abc-123-def'
ORDER BY timestamp ASC
```

---

## 🛡️ DEFENSA DIGITAL Y RESILIENCIA

### Circuit Breaker para APIs externas:

```javascript
// utils/circuit-breaker.js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(fn, traceId) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker OPEN. Retry after ${this.nextAttempt - Date.now()}ms`);
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess(traceId);
      return result;
    } catch (error) {
      this.onFailure(traceId, error);
      throw error;
    }
  }
  
  onSuccess(traceId) {
    this.failureCount = 0;
    this.state = 'CLOSED';
    console.log(`[${traceId}] Circuit breaker: SUCCESS, state=CLOSED`);
  }
  
  onFailure(traceId, error) {
    this.failureCount++;
    console.error(`[${traceId}] Circuit breaker: FAILURE ${this.failureCount}/${this.threshold}`);
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.error(`[${traceId}] Circuit breaker: OPEN until ${new Date(this.nextAttempt).toISOString()}`);
    }
  }
}

// Uso
const shopifyCircuit = new CircuitBreaker();

async function syncInventory(traceId) {
  return shopifyCircuit.call(async () => {
    return await shopifyAPI.getInventory();
  }, traceId);
}
```

### Retry con backoff exponencial:

```javascript
// utils/retry.js
async function retryWithBackoff(fn, traceId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      
      if (attempt === maxRetries) {
        console.error(`[${traceId}] Max retries reached, giving up`);
        throw error;
      }
      
      console.warn(`[${traceId}] Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN POST-MIGRACIÓN

### Backend (palacio-central):
- [ ] Health check responde: `curl $PALACIO_URL/health`
- [ ] Agentes IA operacionales: `curl $PALACIO_URL/api/agents/status`
- [ ] Gemini API funciona: Test generación contenido
- [ ] Shopify sync funciona: Test crear producto draft
- [ ] Logs con trace_id visibles en Cloud Logging
- [ ] Secrets accesibles desde Secret Manager
- [ ] CPU < 80%, RAM < 700Mi en métricas

### CRM WhatsApp:
- [ ] Health check: `curl $CRM_URL/health`
- [ ] Conexión Cloud SQL exitosa
- [ ] Webhook WhatsApp configurado en Meta
- [ ] Test mensaje entrante → respuesta automática
- [ ] Pedidos se crean en PostgreSQL
- [ ] Logs de interacciones visibles

### Frontends:
- [ ] goio-store carga correctamente
- [ ] gollos-landing carga correctamente
- [ ] eco-eterno carga correctamente
- [ ] Llamadas API a backend funcionan
- [ ] Assets estáticos desde Cloud Storage

### Automatizaciones:
- [ ] Cloud Scheduler jobs creados
- [ ] Test manual: `gcloud scheduler jobs run instagram-daily-post`
- [ ] Logs de ejecuciones visibles
- [ ] n8n workflows migrados (si aplica)

### Monitoreo:
- [ ] Dashboard Looker Studio conectado
- [ ] Alertas configuradas (email/Telegram)
- [ ] Trace IDs rastreables en logs
- [ ] Métricas de latency/error disponibles

### Seguridad:
- [ ] Todos los secrets en Secret Manager (no en código)
- [ ] IAM roles configurados correctamente
- [ ] Cloud Run services con autenticación adecuada
- [ ] VPC Connector para Cloud SQL (si aplica)

---

## 💰 ESTIMACIÓN DE COSTOS

### Tier Gratuito (Primeros 3 meses):
- **Cloud Run:** 2M requests, 360K GB-seg (GRATIS)
- **Cloud Build:** 120 min/día (GRATIS)
- **Artifact Registry:** 500 MB (GRATIS)
- **Cloud Logging:** 50 GB/mes (GRATIS)
- **Secret Manager:** 10K accesos (GRATIS)

### Post-Tier Gratuito (Estimado):
| Servicio | Uso mensual | Costo estimado |
|----------|-------------|----------------|
| Cloud Run (5 servicios) | ~500K requests | $3-5 |
| Cloud SQL (f1-micro) | 24/7 + 10GB | $7 |
| Cloud Storage | 50GB + egress | $2-3 |
| Cloud Scheduler | 10 jobs | $1 |
| Cloud Logging | 100GB | $5 |
| **TOTAL** | | **$18-21/mes** |

**Comparación con Hetzner:** $15-20/mes  
**Ventaja GCP:** Autoescalado, resiliencia, monitoreo avanzado

---

## 📚 SCRIPTS DE AUTOMATIZACIÓN

He creado estos scripts para simplificar la migración:

### `scripts/gcp/enable-all-services.sh`
```bash
#!/bin/bash
# Habilita todos los servicios GCP necesarios

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  firestore.googleapis.com \
  sql-component.googleapis.com \
  cloudscheduler.googleapis.com \
  dns.googleapis.com

echo "✅ Todos los servicios habilitados"
```

### `scripts/gcp/migrate-secrets.sh`
```bash
#!/bin/bash
# Migra secrets desde .env a Secret Manager

source ../../palacio-central.env

echo -n "$GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "$SHOPIFY_ADMIN_TOKEN_PROD" | gcloud secrets create SHOPIFY_ADMIN_TOKEN_PROD --data-file=-
echo -n "$META_ACCESS_TOKEN" | gcloud secrets create META_ACCESS_TOKEN --data-file=-
# ... (todos los secrets)

echo "✅ Secrets migrados a Secret Manager"
```

### `scripts/gcp/deploy-all.sh`
```bash
#!/bin/bash
# Deploy completo de todos los servicios

set -e

echo "🚀 Deploying palacio-central..."
cd palacio-central && bash ../scripts/gcp/deploy-palacio.sh

echo "🚀 Deploying whatsapp-crm..."
cd ../crm/api && bash ../../scripts/gcp/deploy-crm.sh

echo "🚀 Deploying frontends..."
cd ../../goio-store && bash ../scripts/gcp/deploy-frontend.sh goio-store
cd ../gollos-landing && bash ../scripts/gcp/deploy-frontend.sh gollos-landing
cd ../eco-eterno && bash ../scripts/gcp/deploy-frontend.sh eco-eterno

echo "✅ Todos los servicios desplegados"
```

### `scripts/gcp/verify-deployment.sh`
```bash
#!/bin/bash
# Verifica que todos los servicios estén operacionales

PALACIO_URL=$(gcloud run services describe palacio-central --region us-central1 --format='value(status.url)')
CRM_URL=$(gcloud run services describe whatsapp-crm --region us-central1 --format='value(status.url)')

echo "🔍 Verificando palacio-central..."
curl -f $PALACIO_URL/health || echo "❌ FAIL"

echo "🔍 Verificando whatsapp-crm..."
curl -f $CRM_URL/health || echo "❌ FAIL"

echo "🔍 Verificando logs..."
gcloud logging read "resource.type=cloud_run_revision" --limit 10

echo "✅ Verificación completa"
```

---

## 📖 DOCUMENTACIÓN CON GEMINI CLI

### Instalación Gemini CLI:
```bash
# Instalar Gemini CLI (beta)
curl -sSL https://dl.google.com/dl/generativelanguage/gemini/install.sh | bash

# Configurar API key
gemini config set api-key AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU
```

### Documentar componentes con Gemini:
```bash
# Generar documentación de un servicio
gemini generate \
  --prompt "Documenta esta arquitectura Cloud Run: $(cat cloudbuild.yaml)" \
  --output docs/cloud-run-architecture.md

# Explicar un endpoint API
gemini generate \
  --prompt "Explica este endpoint de forma técnica: $(cat agents/research.js | head -50)" \
  --output docs/api/research-agent.md

# Generar diagrama de flujo
gemini generate \
  --prompt "Genera diagrama Mermaid del flujo de sincronización Shopify: $(cat imperios/shop-sync/engine.js)" \
  --output docs/diagrams/shop-sync-flow.md
```

---

## 🎯 ESTRUCTURA DE CARPETAS MODULAR EN GCP

```
goio-imperios-prod/
├── services/
│   ├── palacio-central/
│   │   ├── Dockerfile.cloudrun
│   │   ├── cloudbuild.yaml
│   │   └── service.yaml
│   ├── whatsapp-crm/
│   │   ├── Dockerfile
│   │   ├── cloudbuild.yaml
│   │   └── service.yaml
│   ├── goio-store/
│   │   └── ...
│   ├── gollos-landing/
│   │   └── ...
│   └── eco-eterno/
│       └── ...
├── scripts/
│   ├── gcp/
│   │   ├── enable-all-services.sh
│   │   ├── migrate-secrets.sh
│   │   ├── deploy-all.sh
│   │   ├── verify-deployment.sh
│   │   └── rollback.sh
│   └── migration/
│       ├── migrate-tareas-to-firestore.py
│       ├── backup-postgres.sh
│       └── restore-cloud-sql.sh
├── docs/
│   ├── MIGRACION_IMPERIAL_GCP.md (este archivo)
│   ├── CLOUD_SETUP_PLAN.md
│   ├── DEPLOYMENT_QUICK_START.md
│   └── api/
│       ├── research-agent.md
│       ├── shop-sync.md
│       └── marketing-automation.md
└── monitoring/
    ├── alerts.yaml
    ├── dashboards/
    │   ├── looker-kpis.json
    │   └── cloud-monitoring.yaml
    └── trace-configs/
        └── trace-sampling.yaml
```

---

## 🔄 ESTRATEGIA DE ROLLBACK

### Si algo falla, volver a Hetzner:

```bash
# 1. Reactivar servicios en Hetzner
ssh root@hetzner "cd /root/goio && docker-compose up -d"

# 2. Actualizar DNS (si ya cambiaste)
# Revertir CNAME a IP de Hetzner

# 3. Pausar servicios en GCP (no eliminar, para no perder datos)
gcloud run services update palacio-central --region us-central1 --no-traffic
gcloud run services update whatsapp-crm --region us-central1 --no-traffic

# 4. Verificar Hetzner operacional
curl https://tu-dominio-hetzner.com/health

# 5. Analizar causa del fallo en logs GCP
gcloud logging read "severity>=ERROR" --limit 100
```

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

1. **Abrir Cloud Shell:** https://console.cloud.google.com → Click en terminal
2. **Clonar repositorio:**
   ```bash
   git clone https://github.com/golloschickens-collab/Goio-Store.git
   cd Goio-Store/palacio-central
   ```
3. **Ejecutar FASE 0:** Crear proyecto y habilitar servicios
4. **Ejecutar FASE 1:** Deploy palacio-central
5. **Verificar deployment:** Health checks + logs
6. **Continuar con FASE 2-6** según prioridades

---

**Proyecto:** Goio™ Imperios Digitales  
**Cloud Provider:** Google Cloud Platform  
**Región:** us-central1 (Iowa)  
**Costo estimado:** $0-21/mes  
**Tiempo migración:** 3-5 días  
**Estado:** ✅ Listo para ejecutar

---

**Última actualización:** 17 de octubre de 2025  
**Responsable:** Mayordomo Imperial Digital  
**Modo:** Migración con trazabilidad total 🔍
