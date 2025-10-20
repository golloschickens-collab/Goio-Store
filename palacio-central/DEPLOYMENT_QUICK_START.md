# 🚀 QUICK START - DEPLOYMENT CLOUD RUN

**Última actualización:** 16 de octubre de 2025  
**Tiempo estimado:** 15-20 minutos  
**Costo:** $0 (tier gratuito GCP)

---

## 📋 PRE-REQUISITOS

Antes de comenzar, asegúrate de tener:

- [ ] ✅ Cuenta Google Cloud (crear en https://cloud.google.com si no tienes)
- [ ] ✅ Tarjeta de crédito/débito (requerida por GCP, no se cobrará nada)
- [ ] ✅ Acceso SSH al servidor Hetzner
- [ ] ✅ gcloud CLI instalado localmente (opcional pero recomendado)

---

## 🎯 OPCIÓN 1: DEPLOYMENT AUTOMATIZADO (RECOMENDADO)

### Paso 1: Diagnóstico Hetzner

**En tu servidor Hetzner vía SSH:**

```bash
# 1. Ir al directorio del proyecto
cd /ruta/a/palacio-central/

# 2. Ejecutar diagnóstico
bash DIAGNOSTICO_HETZNER_COMANDOS.sh

# 3. Revisar el log generado
cat logs/DIAGNOSTICO_HETZNER_*.log
```

**Resultado esperado:**
- ✅ Contenedores `palacio-central` y `goio-store` corriendo
- ✅ Puertos 80, 3002 activos
- ✅ RAM disponible > 512MB
- ✅ Disco disponible > 5GB

---

### Paso 2: Crear Proyecto GCP

**Opción A: Desde navegador (MÁS FÁCIL)**

1. Ir a https://console.cloud.google.com/projectcreate
2. Nombre: `goio-imperios-prod`
3. Clic en "Crear"
4. Copiar el **Project ID** generado (ej: `goio-imperios-prod-123456`)

**Opción B: Desde terminal local**

```bash
# Instalar gcloud CLI si no lo tienes
# Windows: https://cloud.google.com/sdk/docs/install
# Linux/Mac: curl https://sdk.cloud.google.com | bash

# Autenticar
gcloud auth login

# Crear proyecto
gcloud projects create goio-imperios-prod --set-as-default

# Ver Project ID
gcloud config get-value project
```

---

### Paso 3: Activar APIs (Navegador)

**En GCP Console (https://console.cloud.google.com):**

1. Seleccionar proyecto `goio-imperios-prod`
2. Ir a **APIs & Services** → **Enable APIs and Services**
3. Buscar y activar estas APIs:
   - ✅ Cloud Run API
   - ✅ Cloud Build API
   - ✅ Artifact Registry API
   - ✅ Secret Manager API
   - ✅ Cloud Logging API

**O desde terminal:**

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com
```

---

### Paso 4: Configurar Secrets

**En GCP Console:**

1. Ir a **Security** → **Secret Manager**
2. Crear estos secrets:

| Secret Name | Valor (de tu `.env`) |
|-------------|----------------------|
| `GEMINI_API_KEY` | AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU |
| `SHOPIFY_ADMIN_TOKEN_PROD` | [SHOPIFY_TOKEN_REDACTED] |
| `SHOPIFY_ADMIN_TOKEN_GLOBAL` | [SHOPIFY_TOKEN_REDACTED] |
| `META_ACCESS_TOKEN_GOLLOS` | EAAPnIMcT6W8BPvYgtc3ZCjC... |
| `FACEBOOK_ACCESS_TOKEN` | EAAPnIMcT6W8BPvYgtc3ZCjC... |

**O desde terminal:**

```bash
# Crear secrets desde .env local
echo -n "AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

echo -n "[SHOPIFY_TOKEN_REDACTED]" | \
  gcloud secrets create SHOPIFY_ADMIN_TOKEN_PROD --data-file=-

# Repetir para cada secret...
```

---

### Paso 5: Deploy Automatizado

**En tu servidor Hetzner (o desde local si tienes el código):**

```bash
# 1. Ir al directorio del proyecto
cd /ruta/a/palacio-central/

# 2. Ejecutar deployment
bash gcp_deploy.sh

# 3. Seguir las instrucciones en pantalla
```

**El script hará automáticamente:**
- ✅ Crear Artifact Registry
- ✅ Construir imagen Docker optimizada
- ✅ Subir imagen a GCR
- ✅ Desplegar en Cloud Run
- ✅ Configurar secrets
- ✅ Abrir al público (opción)

---

### Paso 6: Verificar Deployment

**Obtener URL del servicio:**

```bash
gcloud run services describe palacio-central \
  --region=us-central1 \
  --format='value(status.url)'
```

**Resultado esperado:**
```
https://palacio-central-<hash>-uc.a.run.app
```

**Probar endpoints:**

```bash
# Health check
curl https://palacio-central-<hash>-uc.a.run.app/health

# Metrics (con token)
curl -H "Authorization: Bearer local_metrics_token" \
  https://palacio-central-<hash>-uc.a.run.app/metrics
```

---

## 🎯 OPCIÓN 2: DEPLOYMENT MANUAL

### Paso 1: Preparar Docker Localmente

```bash
# Construir imagen
docker build -f Dockerfile.cloudrun -t palacio-central:latest .

# Probar localmente
docker run -p 8080:8080 --env-file .env palacio-central:latest

# Verificar
curl http://localhost:8080/health
```

---

### Paso 2: Subir a GCR

```bash
# Configurar Docker para GCR
gcloud auth configure-docker

# Tag de imagen
docker tag palacio-central:latest \
  gcr.io/goio-imperios-prod/palacio-central:latest

# Push
docker push gcr.io/goio-imperios-prod/palacio-central:latest
```

---

### Paso 3: Deploy Manual

```bash
gcloud run deploy palacio-central \
  --image gcr.io/goio-imperios-prod/palacio-central:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --max-instances 2 \
  --min-instances 0 \
  --cpu 1 \
  --memory 512Mi \
  --timeout 300s \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,SHOPIFY_ADMIN_TOKEN_PROD=SHOPIFY_ADMIN_TOKEN_PROD:latest"
```

---

## 🔍 TROUBLESHOOTING

### Problema: "Permission denied"

**Solución:**
```bash
# Dar permisos al usuario
gcloud projects add-iam-policy-binding goio-imperios-prod \
  --member="user:tu-email@gmail.com" \
  --role="roles/run.admin"
```

---

### Problema: "Build failed"

**Revisar logs:**
```bash
gcloud builds list --limit 5
gcloud builds log <BUILD_ID>
```

**Solución común:**
- Verificar que `Dockerfile.cloudrun` existe
- Verificar que `package.json` tiene scripts correctos
- Revisar que todas las dependencias están en `package.json`

---

### Problema: "Container crashed"

**Ver logs en tiempo real:**
```bash
gcloud run services logs read palacio-central \
  --region=us-central1 \
  --limit=50
```

**Solución común:**
- Puerto debe ser 8080 (no 3002)
- Variables de entorno mal configuradas
- Secrets no creados correctamente

---

### Problema: "Out of memory"

**Aumentar memoria:**
```bash
gcloud run services update palacio-central \
  --region=us-central1 \
  --memory 1Gi
```

**Nota:** 512Mi es suficiente para Node.js básico, 1Gi para IA Engine.

---

## 📊 MONITOREO POST-DEPLOYMENT

### Ver logs en vivo:

```bash
gcloud run services logs tail palacio-central --region=us-central1
```

### Ver métricas:

```bash
# En GCP Console
https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics
```

### Ver costos:

```bash
# En GCP Console
https://console.cloud.google.com/billing
```

**Esperado:** $0.00 (dentro del tier gratuito)

---

## 🔄 ROLLBACK

### Si algo falla, volver a versión anterior:

```bash
# Listar revisiones
gcloud run revisions list --service=palacio-central --region=us-central1

# Rollback a revisión anterior
gcloud run services update-traffic palacio-central \
  --region=us-central1 \
  --to-revisions=<REVISION_NAME>=100
```

### O apuntar de vuelta a Hetzner:

```bash
# Actualizar DNS para apuntar a IP de Hetzner
# (dependiendo de tu proveedor DNS)
```

---

## 🎯 CI/CD AUTOMÁTICO (OPCIONAL)

### Conectar GitHub para auto-deploy:

1. En GCP Console → Cloud Build → Triggers
2. Conectar repositorio GitHub
3. Crear trigger con estos parámetros:
   - Event: Push to branch
   - Branch: `^main$` o `^master$`
   - Build configuration: `cloudbuild.yaml`

**Resultado:** Cada push a `main` desplegará automáticamente.

---

## 📚 RECURSOS ADICIONALES

- **GCP Free Tier:** https://cloud.google.com/free
- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Cloud Build Docs:** https://cloud.google.com/build/docs
- **Troubleshooting:** https://cloud.google.com/run/docs/troubleshooting

---

## ✅ CHECKLIST FINAL

Después del deployment, confirmar:

- [ ] ✅ URL pública funciona: `https://palacio-central-*.run.app/health`
- [ ] ✅ Logs visibles en GCP Console
- [ ] ✅ CPU y RAM dentro de límites (ver métricas)
- [ ] ✅ Costo = $0.00 (verificar en Billing)
- [ ] ✅ Secrets configurados correctamente
- [ ] ✅ Endpoints protegidos con tokens funcionan
- [ ] ✅ Integraciones API (Gemini, Shopify, Meta) operacionales

---

## 🆘 SOPORTE

Si encuentras problemas:

1. Revisar logs: `gcloud run services logs read palacio-central --region=us-central1 --limit=100`
2. Verificar secrets: `gcloud secrets list`
3. Ver estado del servicio: `gcloud run services describe palacio-central --region=us-central1`
4. Consultar documentación: `docs/CLOUD_SETUP_PLAN.md`

---

**¡Listo para producción!** 🚀

Una vez verificado todo, actualizar DNS para apuntar a Cloud Run y disfrutar de la escalabilidad automática gratuita de Google Cloud.
