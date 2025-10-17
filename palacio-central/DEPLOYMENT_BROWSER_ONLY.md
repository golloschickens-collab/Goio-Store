# 🌐 DEPLOYMENT 100% DESDE EL NAVEGADOR

**Sin instalar NADA en tu PC - Todo con clicks**

---

## 🎯 OPCIÓN 1: CLOUD SHELL (MÁS FÁCIL)

### Paso 1: Abrir Cloud Shell

1. Ir a: https://console.cloud.google.com
2. Login con tu cuenta de Google
3. Clic en el icono **Activate Cloud Shell** (terminal, arriba a la derecha)
4. Esperar 10 segundos a que inicie

**✅ Cloud Shell ya tiene:**
- ✅ `gcloud` CLI preinstalado
- ✅ `docker` preinstalado
- ✅ `git` preinstalado
- ✅ 5 GB de almacenamiento persistente

---

### Paso 2: Crear proyecto GCP

**En Cloud Shell, ejecutar:**

```bash
# Crear proyecto
gcloud projects create goio-imperios-prod --set-as-default

# Habilitar billing (necesario para Cloud Run)
# Nota: Aunque es tier gratuito, GCP requiere una tarjeta registrada
gcloud billing projects link goio-imperios-prod \
  --billing-account=$(gcloud billing accounts list --format='value(ACCOUNT_ID)' | head -1)

# Habilitar APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

**Tiempo:** 2 minutos

---

### Paso 3: Crear Artifact Registry

```bash
gcloud artifacts repositories create goio-images \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker images para Goio Imperios"
```

---

### Paso 4: Clonar tu repositorio

**Opción A - HTTPS (más simple):**
```bash
git clone https://github.com/golloschickens-collab/Goio-Store.git
cd Goio-Store/palacio-central
```

**Opción B - SSH:**
```bash
# Configurar SSH key
ssh-keygen -t ed25519 -C "cloudshell@goio-imperios"
cat ~/.ssh/id_ed25519.pub
# Copiar la key y agregarla en GitHub Settings → SSH keys

git clone git@github.com:golloschickens-collab/Goio-Store.git
cd Goio-Store/palacio-central
```

---

### Paso 5: Configurar secrets

```bash
# Gemini API
echo -n "AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

# Shopify Admin Token
echo -n "shpat_YOUR_SHOPIFY_ADMIN_TOKEN" | \
  gcloud secrets create SHOPIFY_ADMIN_TOKEN_PROD --data-file=-

# Shopify Store
echo -n "skhqgs-2j" | \
  gcloud secrets create SHOPIFY_STORE_PROD --data-file=-

# Meta Access Token (reemplaza con tu token real)
echo -n "TU_META_ACCESS_TOKEN_AQUI" | \
  gcloud secrets create META_ACCESS_TOKEN --data-file=-

# Facebook Pages
echo -n "127438543758050" | \
  gcloud secrets create FACEBOOK_PAGE_1_ID --data-file=-

echo -n "579941541858938" | \
  gcloud secrets create FACEBOOK_PAGE_2_ID --data-file=-

# Instagram Account
echo -n "17841470653421960" | \
  gcloud secrets create INSTAGRAM_ACCOUNT_ID --data-file=-
```

---

### Paso 6: Build y Deploy

```bash
# Configurar Docker para Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build de la imagen
docker build \
  -f Dockerfile.cloudrun \
  -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:latest \
  .

# Push a Artifact Registry
docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:latest

# Deploy a Cloud Run
gcloud run deploy palacio-central \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:latest \
  --region us-central1 \
  --platform managed \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --timeout 300 \
  --concurrency 80 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,SHOPIFY_ADMIN_TOKEN_PROD=SHOPIFY_ADMIN_TOKEN_PROD:latest,SHOPIFY_STORE_PROD=SHOPIFY_STORE_PROD:latest,META_ACCESS_TOKEN=META_ACCESS_TOKEN:latest,FACEBOOK_PAGE_1_ID=FACEBOOK_PAGE_1_ID:latest,FACEBOOK_PAGE_2_ID=FACEBOOK_PAGE_2_ID:latest,INSTAGRAM_ACCOUNT_ID=INSTAGRAM_ACCOUNT_ID:latest" \
  --set-env-vars="NODE_ENV=production,PORT=8080,LOG_LEVEL=info"
```

**Tiempo de build:** 3-5 minutos

---

### Paso 7: Obtener URL y verificar

```bash
# Obtener URL del servicio
gcloud run services describe palacio-central \
  --region us-central1 \
  --format='value(status.url)'

# Health check
curl $(gcloud run services describe palacio-central \
  --region us-central1 \
  --format='value(status.url)')/health
```

**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2025-10-16T..."}
```

---

## 🎯 OPCIÓN 2: CLOUD BUILD (CI/CD AUTOMÁTICO)

### Paso 1: Conectar GitHub

1. Ir a: https://console.cloud.google.com/cloud-build/triggers
2. Clic en **Conectar repositorio**
3. Seleccionar **GitHub**
4. Autorizar acceso a tu cuenta
5. Seleccionar repositorio: `golloschickens-collab/Goio-Store`
6. Clic en **Conectar**

---

### Paso 2: Crear trigger

1. En Cloud Build Triggers, clic en **Crear activador**
2. Configurar:
   - **Nombre:** `deploy-palacio-central`
   - **Evento:** Push to a branch
   - **Fuente:** `^master$` (o `^main$`)
   - **Configuración:** Cloud Build configuration file (yaml or json)
   - **Ubicación:** `/palacio-central/cloudbuild.yaml`
3. Clic en **Crear**

---

### Paso 3: Hacer push

Ahora cada push a `master` desplegará automáticamente.

**Desde Cloud Shell:**
```bash
cd ~/Goio-Store/palacio-central

# Hacer un cambio de prueba
echo "# Cloud Build test" >> README.md

git add .
git commit -m "🚀 Test Cloud Build trigger"
git push origin master
```

**Monitorear:**
https://console.cloud.google.com/cloud-build/builds

---

## 🎯 OPCIÓN 3: DEPLOY MANUAL DESDE CONSOLA

### Paso 1: Subir código a Cloud Storage

1. Comprimir `palacio-central`:
   ```bash
   cd "c:\Goio mayordomo\palacio-central"
   tar -czf palacio-central.tar.gz .
   ```

2. Ir a: https://console.cloud.google.com/storage
3. Crear bucket: `goio-deploy-source`
4. Upload `palacio-central.tar.gz`

---

### Paso 2: Deploy desde Cloud Shell

```bash
# Descargar código
gsutil cp gs://goio-deploy-source/palacio-central.tar.gz .
tar -xzf palacio-central.tar.gz

# Build y deploy (mismo paso 6 de Opción 1)
```

---

## 📊 VERIFICACIÓN POST-DEPLOYMENT

### Health check
```bash
curl https://palacio-central-xxxxx-uc.a.run.app/health
```

### Ver logs
```bash
gcloud run services logs read palacio-central \
  --region us-central1 \
  --limit 50
```

### Métricas
https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics

---

## 🔄 REDEPLOYS

### Desde Cloud Shell:

```bash
cd ~/Goio-Store/palacio-central

# Pull últimos cambios
git pull origin master

# Rebuild y redeploy
docker build -f Dockerfile.cloudrun \
  -t us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:latest .

docker push us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:latest

gcloud run services update palacio-central \
  --region us-central1 \
  --image us-central1-docker.pkg.dev/goio-imperios-prod/goio-images/palacio-central:latest
```

**Tiempo:** 2-3 minutos

---

## 🛠️ ROLLBACK

### Ver revisiones:
```bash
gcloud run revisions list \
  --service palacio-central \
  --region us-central1
```

### Volver a revisión anterior:
```bash
gcloud run services update-traffic palacio-central \
  --region us-central1 \
  --to-revisions=palacio-central-00001-abc=100
```

---

## 💡 TIPS

### Cloud Shell shortcuts:

```bash
# Editor integrado
cloudshell edit archivo.js

# Abrir puerto para preview
cloudshell preview --port 8080

# Persistir archivos entre sesiones
# Guardar en ~/Goio-Store (directorio home es persistente)
```

---

### Ver todo el deployment en logs:
```bash
gcloud run services logs tail palacio-central \
  --region us-central1
```

---

### Obtener URL directamente:
```bash
export SERVICE_URL=$(gcloud run services describe palacio-central \
  --region us-central1 \
  --format='value(status.url)')

echo "Service URL: $SERVICE_URL"
```

---

## 🎉 RESUMEN

**Método recomendado:** Cloud Shell (Opción 1)

**Ventajas:**
- ✅ No instalar nada en tu PC
- ✅ CLI preconfigurado
- ✅ Almacenamiento persistente
- ✅ Editor integrado
- ✅ Gratis (5 GB storage)

**Tiempo total:** 10-15 minutos

**Costo:** $0/mes (tier gratuito)

---

**¿Todo listo?** Abre https://console.cloud.google.com y haz clic en **Activate Cloud Shell** 🚀
