# 🔱 PLAN DE MIGRACIÓN CLOUD - GOIO IMPERIOS+

**Fecha:** 16 de octubre de 2025  
**Versión:** 1.0  
**Proyecto GCP:** goio-imperios-prod  
**Región:** us-central1  
**Objetivo:** Migración híbrida Hetzner → Cloud Run (Tier Gratuito)

---

## 📊 ESTADO ACTUAL DE HETZNER (ESPERADO)

### Sistema Operativo
```
SO: Ubuntu 20.04/22.04 LTS o Debian 11 (por confirmar)
Kernel: Linux 5.x+
Arquitectura: x86_64
```

### Software Instalado (Esperado)
| Componente | Versión Esperada | Estado |
|------------|------------------|--------|
| Node.js | v20.x o v18.x | ⚠️ Verificar con `node -v` |
| npm | 9.x+ | ⚠️ Verificar con `npm -v` |
| Docker | 24.x o 20.10+ | ⚠️ Verificar con `docker -v` |
| Docker Compose | v2.x | ⚠️ Verificar con `docker compose version` |
| Nginx | 1.18+ | ⚠️ Verificar con `nginx -v` |

### Recursos Disponibles (Estimado)
```
RAM: 4-8 GB (típico VPS Hetzner CX21/CX31)
CPU: 2-4 vCPUs
Disco: 40-80 GB SSD
Ancho de banda: 20 TB/mes
```

**Nota:** Ejecutar script `logs/DIAGNOSTICO_HETZNER_COMANDOS.sh` para confirmar valores reales.

---

## 🐳 CONTENEDORES DOCKER ACTIVOS

### Configuración Actual (docker-compose.yml)

#### palacio-central
```yaml
service: palacio-central
puerto_interno: 3002
puerto_externo: 3002
build: ./palacio-central
env_file: ./palacio-central.env
healthcheck: curl http://localhost:3000/health (cada 15s)
restart: unless-stopped
```

**Estado esperado:** ✅ RUNNING  
**Verificar con:** `docker ps | grep palacio`

#### goio-store
```yaml
service: goio-store
puerto_interno: 3000
puerto_externo: 3002
build: ./goio-store
env_file: ./goio-store.env
healthcheck: curl http://localhost:3000/health (cada 15s)
restart: unless-stopped
```

**Estado esperado:** ✅ RUNNING  
**Verificar con:** `docker ps | grep goio`

#### nginx (Reverse Proxy)
```yaml
service: nginx
image: nginx:stable
puerto: 80
config: ./reverse-proxy/nginx.conf
depends_on: palacio-central, goio-store
restart: unless-stopped
```

**Configuración:**
```nginx
/api/ → palacio-central:3002
/ → goio-store:3000
```

---

## 🔐 TOKENS Y CREDENCIALES ACTIVAS

### ✅ CONFIRMADAS (100% Operacionales)

#### Google Gemini AI
```
API Key: AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU
Estado: ✅ ACTIVA (testeada Oct 16, 2025)
Modelo: gemini-1.5-pro
Uso: IA Engine operacional (descripciones, contenido, SEO)
```

#### Shopify Admin API
**Tienda Perú (skhqgs-2j.myshopify.com):**
```
Token: shpat_[PROD_TOKEN_REDACTED]
API Version: 2024-10
Estado: ✅ ACTIVA
Scopes: read_products, write_products, read_orders, write_orders
```

**Tienda Global (goio-global.myshopify.com):**
```
Token: shpat_[GLOBAL_TOKEN_REDACTED]
API Version: 2024-10
Estado: ✅ ACTIVA
Scopes: read_products, write_products, read_orders, write_orders
```

#### Instagram (gollos_chickens)
```
Long-lived User Token: EAAeto7T8g1YBPtQpxn4naMvTs[...truncado...]
User ID: 17841451318915730
Vencimiento: No expira (mientras app autorizada)
Estado: ✅ ACTIVA
Scopes: instagram_basic, instagram_content_publish
```

#### Facebook (GollosChickens)
```
App ID: 10985552895072623
App Secret: f10f5f0fca147551647cb3af5efffc2f
Page ID: 377626045425378
Page Token: EAAPnIMcT6W8BPmtRZC2k5Ypm[...truncado...]
Vencimiento: 2025-11-30
Estado: ✅ ACTIVA
Permisos: pages_manage_posts, pages_manage_ads, pages_read_engagement
```

#### Facebook (GoioStore)
```
App ID: 2161243464696662
Page ID: 783032478270795
Page Token: EAAeto7T8g1YBPtmaFLZBh[...truncado...]
Vencimiento: 2025-11-29
Estado: ⚠️ PARCIAL (app_secret pendiente)
```

### ⏳ PENDIENTES (Configurar antes de producción completa)

#### WhatsApp Business API
- WABA ID: TO_FILL
- Phone Number ID: TO_FILL
- API Key: TO_FILL
- Número: +51939431887 (confirmado)

#### Amazon SP-API (6 credenciales)
- AWS Access Key ID
- AWS Secret Access Key
- AWS Region (default: us-east-1)
- Marketplace ID
- Seller ID
- Refresh Token

#### TikTok Marketing API (4 credenciales)
- App ID
- App Secret
- Access Token
- Pixel ID

---

## 🌐 PUERTOS Y RED

### Puertos Esperados Abiertos en Hetzner
```
:80    → Nginx (HTTP público)
:443   → Nginx (HTTPS, si configurado)
:3002  → palacio-central (API interna)
:3000  → goio-store (frontend interno)
```

### Verificación de Conectividad
```bash
# Desde Hetzner
curl http://localhost:80          # Debería responder nginx
curl http://localhost:3002/health # Debería responder palacio-central
curl http://localhost:3000/health # Debería responder goio-store

# Desde exterior (reemplazar IP_PUBLICA)
curl http://IP_PUBLICA:80
```

---

## ☁️ ARQUITECTURA CLOUD RUN (PROPUESTA)

### Estrategia: Migración Híbrida Gradual

#### FASE 1: Backend a Cloud Run (Sin Costo)
```
Backend (palacio-central) → Cloud Run
├── URL: https://palacio-central-[hash]-uc.a.run.app
├── CPU: 1 vCPU
├── Memoria: 512 MB
├── Min instances: 0 (escala a 0 = $0 en idle)
├── Max instances: 3 (limitar costo)
├── Timeout: 300s
└── Puerto: 8080 (Cloud Run standard)
```

**Ventajas:**
- ✅ Autoescalado automático
- ✅ $0 cuando no hay tráfico
- ✅ HTTPS gratuito incluido
- ✅ Integración nativa Gemini API
- ✅ Logs centralizados en GCP

#### FASE 2: Frontend en Hetzner (Costo fijo bajo)
```
Frontend (goio-store) → Hetzner + Nginx
├── Servidor estático optimizado
├── CDN Cloudflare (gratis)
├── Proxy reverso a Cloud Run
└── Costo: ~$5-10/mes (VPS básico)
```

**Ventajas:**
- ✅ Bajo costo mensual fijo
- ✅ Nginx optimizado para estáticos
- ✅ Cloudflare CDN gratuito
- ✅ Backup sencillo

#### FASE 3 (Opcional): Full Cloud
```
Todo en GCP Cloud Run + Cloud Storage
└── Costo estimado: $15-30/mes con optimización
```

---

## 🚀 PLAN DE DEPLOYMENT CLOUD RUN

### Pre-requisitos

#### En GCP Console (navegador)
1. **Crear proyecto:**
   - ID: `goio-imperios-prod`
   - Nombre: Goio Imperios Prod
   - Facturación: Activar (tarjeta, pero sin cargos en tier gratuito)

2. **Activar APIs (click "Enable"):**
   ```
   ✅ Cloud Run API
   ✅ Cloud Build API
   ✅ Artifact Registry API
   ✅ Secret Manager API
   ✅ Cloud Logging API
   ✅ Cloud Monitoring API
   ```

3. **Crear Service Account:**
   - Nombre: `cloud-run-deployer`
   - Roles:
     - Cloud Run Admin
     - Storage Admin
     - Logging Writer
     - Secret Manager Accessor
   - Generar JSON key → Descargar

#### En Hetzner (vía SSH)
```bash
# Instalar gcloud CLI (si no existe)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Autenticar
gcloud auth login

# Configurar proyecto
gcloud config set project goio-imperios-prod
gcloud config set run/region us-central1

# Autenticar Docker
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## 📦 ARCHIVOS DE DEPLOYMENT GENERADOS

### 1. Dockerfile.cloudrun
Dockerfile optimizado para Cloud Run con multi-stage build y compresión.

### 2. cloudbuild.yaml
Pipeline de CI/CD automático con Google Cloud Build (120 min/día gratis).

### 3. gcp_deploy.sh
Script bash unificado para deployment completo con validaciones.

### 4. .gcloudignore
Excluir archivos innecesarios del build (node_modules, logs, etc.).

### 5. service.yaml
Configuración declarativa del servicio Cloud Run.

---

## 🔒 GESTIÓN DE SECRETS

### Migrar de .env a Secret Manager

#### Secrets a crear en GCP:
```bash
# Shopify
# Shopify Admin Token
echo -n "shpat_YOUR_SHOPIFY_ADMIN_TOKEN" | \
  gcloud secrets create SHOPIFY_ADMIN_TOKEN_PROD --data-file=-
gcloud secrets create SHOPIFY_ADMIN_TOKEN_GLOBAL --data-file=-

# Meta/Facebook
gcloud secrets create META_ACCESS_TOKEN_GOLLOS --data-file=-
gcloud secrets create META_APP_SECRET_GOLLOS --data-file=-

# Gemini
gcloud secrets create GEMINI_API_KEY --data-file=-

# Métricas
gcloud secrets create METRICS_TOKEN --data-file=-
```

#### Acceso desde Cloud Run:
```yaml
env:
  - name: GEMINI_API_KEY
    valueFrom:
      secretKeyRef:
        name: GEMINI_API_KEY
        key: latest
```

---

## 📊 MONITOREO Y LOGS

### Cloud Logging (Gratuito)
```bash
# Ver logs en tiempo real
gcloud logging tail "resource.type=cloud_run_revision"

# Filtrar por servicio
gcloud logging read "resource.labels.service_name=palacio-central" --limit=50

# Dashboard web
https://console.cloud.google.com/logs/query
```

### Cloud Monitoring (Gratuito)
- CPU usage
- Memory usage
- Request count
- Response time (p50, p95, p99)
- Error rate

### Alertas
```yaml
Configurar alertas para:
- Error rate > 5%
- Response time p95 > 2s
- Memory usage > 80%
- Request count > 1000/min
```

---

## 💰 ESTIMACIÓN DE COSTOS

### Tier Gratuito Mensual (GCP)
```
Cloud Run:
  - Requests: 2,000,000 gratis
  - CPU: 180,000 vCPU-seconds gratis
  - Memory: 360,000 GB-seconds gratis
  - Networking: 1 GB egress gratis

Cloud Build:
  - Build time: 120 minutos/día gratis

Artifact Registry:
  - Storage: 500 MB gratis

Secret Manager:
  - Access operations: 10,000 gratis

Cloud Logging:
  - Logs: 50 GB/mes gratis

Cloud Storage:
  - Standard storage: 5 GB gratis
```

### Estimación Goio (Mes 1)
```
Requests esperados: ~100,000/mes ← DENTRO TIER GRATUITO
CPU usage: ~10,000 vCPU-sec/mes ← DENTRO TIER GRATUITO
Memory: ~20,000 GB-sec/mes ← DENTRO TIER GRATUITO
Builds: 1-2/día = ~40 min/mes ← DENTRO TIER GRATUITO

COSTO TOTAL ESTIMADO: $0.00
```

### Mes 2-3 (Con Tráfico Real)
```
Si excede tier gratuito:
- Requests adicionales: $0.40 por 1M
- vCPU-seconds: $0.00002400 por second
- Memory: $0.00000250 por GB-second

Costo probable Mes 2: $0-5
Costo probable Mes 3: $5-15
```

---

## 🔄 ROLLBACK PLAN

### Si Cloud Run falla:

1. **Revertir DNS a Hetzner (5 minutos)**
```bash
# Cambiar A record a IP Hetzner
dig +short goiostore.com  # Ver IP actual
```

2. **Contenedores en Hetzner siguen corriendo**
```bash
docker ps  # Verificar estado
docker restart palacio-central goio-store nginx
```

3. **Logs de error en Cloud Run**
```bash
gcloud logging read "resource.type=cloud_run_revision AND severity=ERROR" --limit=100
```

4. **Rollback a versión anterior**
```bash
gcloud run services update-traffic palacio-central \
  --to-revisions=palacio-central-00001-abc=100
```

---

## ✅ CHECKLIST DE MIGRACIÓN

### Pre-Deployment
- [ ] Ejecutar `logs/DIAGNOSTICO_HETZNER_COMANDOS.sh` en Hetzner
- [ ] Verificar contenedores activos (`docker ps`)
- [ ] Backup completo Hetzner (`tar -czf backup-goio.tar.gz ...`)
- [ ] Crear proyecto GCP `goio-imperios-prod`
- [ ] Activar APIs requeridas en GCP
- [ ] Crear Service Account con permisos
- [ ] Instalar gcloud CLI en Hetzner
- [ ] Crear secrets en Secret Manager

### Deployment
- [ ] Build Dockerfile.cloudrun localmente
- [ ] Subir imagen a Artifact Registry
- [ ] Deploy a Cloud Run con `gcp_deploy.sh`
- [ ] Verificar endpoint `/health` funciona
- [ ] Verificar endpoint `/metrics` responde
- [ ] Test integraciones API (Gemini, Shopify, Meta)

### Post-Deployment
- [ ] Monitorear logs por 24h
- [ ] Verificar costos en GCP Console
- [ ] Configurar alertas de monitoring
- [ ] Actualizar DNS si todo OK
- [ ] Documentar nueva arquitectura
- [ ] Comunicar a equipo

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### 1️⃣ Ejecutar en Hetzner (SSH):
```bash
cd /ruta/a/palacio-central
chmod +x logs/DIAGNOSTICO_HETZNER_COMANDOS.sh
./logs/DIAGNOSTICO_HETZNER_COMANDOS.sh
```

### 2️⃣ Crear proyecto GCP (navegador):
```
https://console.cloud.google.com/projectcreate
Nombre: goio-imperios-prod
```

### 3️⃣ Build y test local:
```bash
cd palacio-central
docker build -f Dockerfile.cloudrun -t palacio-test .
docker run -p 8080:8080 --env-file .env palacio-test
curl http://localhost:8080/health
```

### 4️⃣ Deploy a Cloud Run:
```bash
chmod +x gcp_deploy.sh
./gcp_deploy.sh
```

---

## 📚 REFERENCIAS

- **Informe Técnico Completo:** `docs/INFORME_TECNICO_MIGRACION_CLOUD.md`
- **Diagnóstico Cloud:** `docs/DIAGNOSTICO_CLOUD_ACTUAL.md`
- **Auditoría Credenciales:** `INFORME_ACCIONES_CREDENCIALES-2025-10-14.txt`
- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **GCP Free Tier:** https://cloud.google.com/free

---

**Última actualización:** 16 de octubre de 2025  
**Responsable:** Mayordomo Imperial Digital  
**Estado:** ✅ Plan completo y listo para ejecución
