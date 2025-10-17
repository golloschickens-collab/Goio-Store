# ☁️ DEPLOYMENT CLOUD RUN - GOIO IMPERIOS+

**Estado:** ✅ Listo para deployment  
**Fecha:** 16 de octubre de 2025  
**Costo:** $0 (tier gratuito GCP)  
**Tiempo estimado:** 15-20 minutos

---

## 🎯 ¿QUÉ ES ESTO?

Este paquete contiene **todo lo necesario** para desplegar el backend completo de **Goio Imperios** (palacio-central) en **Google Cloud Run** sin costo inicial, aprovechando el tier gratuito de GCP.

### ✨ Características del deployment:

- ✅ **Autoescalado:** De 0 a N instancias según demanda
- ✅ **Sin servidor:** No administras máquinas virtuales
- ✅ **HTTPS automático:** Certificado SSL gratis de Google
- ✅ **Logs centralizados:** Google Cloud Logging
- ✅ **Monitoreo 24/7:** Métricas automáticas
- ✅ **CI/CD integrado:** Deploy automático desde GitHub (opcional)
- ✅ **Rollback instantáneo:** Volver a versión anterior en 1 click
- ✅ **Costo $0:** Dentro del tier gratuito (2M requests/mes)

---

## 📦 ARCHIVOS INCLUIDOS

### 🚀 Deployment

| Archivo | Descripción |
|---------|-------------|
| **`Dockerfile.cloudrun`** | Dockerfile multi-stage optimizado para Cloud Run (Alpine, <200MB) |
| **`cloudbuild.yaml`** | Configuración CI/CD para Cloud Build (120 min gratis/día) |
| **`gcp_deploy.sh`** | Script bash all-in-one para deployment automatizado |
| **`.gcloudignore`** | Excluir archivos innecesarios del build (optimización) |
| **`service.yaml`** | Configuración Knative de Cloud Run (CPU, RAM, scaling) |

### 📚 Documentación

| Archivo | Descripción |
|---------|-------------|
| **`DEPLOYMENT_QUICK_START.md`** | Guía rápida 5 pasos (15 minutos) |
| **`CLOUD_SETUP_PLAN.md`** | Plan técnico completo con 5 fases |
| **`docs/DIAGNOSTICO_CLOUD_ACTUAL.md`** | Inventario de 42 credenciales (21 activas) |
| **`docs/INFORME_TECNICO_MIGRACION_CLOUD.md`** | Informe completo arquitectura + migración |

### 🔧 Utilidades

| Archivo | Descripción |
|---------|-------------|
| **`DIAGNOSTICO_HETZNER_COMANDOS.sh`** | Script SSH para diagnosticar servidor Hetzner actual |

---

## 🚀 INICIO RÁPIDO (5 PASOS)

### 1️⃣ Diagnóstico Hetzner (Opcional pero recomendado)

**En tu servidor vía SSH:**
```bash
cd /ruta/a/palacio-central
bash DIAGNOSTICO_HETZNER_COMANDOS.sh
cat logs/DIAGNOSTICO_HETZNER_*.log
```

---

### 2️⃣ Crear Proyecto GCP

**Opción A - Navegador (más fácil):**
1. Ir a https://console.cloud.google.com/projectcreate
2. Nombre: `goio-imperios-prod`
3. Copiar Project ID generado

**Opción B - Terminal:**
```bash
gcloud projects create goio-imperios-prod --set-as-default
```

---

### 3️⃣ Activar APIs

**Desde terminal:**
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

**O desde consola:** https://console.cloud.google.com/apis/library

---

### 4️⃣ Configurar Secrets

**Crear secrets desde tu `.env`:**
```bash
echo -n "AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

echo -n "shpat_YOUR_SHOPIFY_ADMIN_TOKEN" | \
  gcloud secrets create SHOPIFY_ADMIN_TOKEN_PROD --data-file=-

# Agregar otros secrets según necesites...
```

---

### 5️⃣ Deploy Automatizado

```bash
bash gcp_deploy.sh
```

**El script hará:**
- ✅ Construir imagen Docker optimizada
- ✅ Subir a Artifact Registry
- ✅ Desplegar en Cloud Run (región us-central1)
- ✅ Configurar autoescalado (0-2 instancias)
- ✅ Exponer endpoint público HTTPS

**Resultado:**
```
✅ Deployment exitoso!
🌐 URL: https://palacio-central-<hash>-uc.a.run.app
```

---

## 📊 TIER GRATUITO GCP

| Servicio | Cuota Mensual Gratis | Goio Usage Estimado |
|----------|----------------------|---------------------|
| **Cloud Run** | 2M requests, 360K GB-seg | ~50K requests (✅ OK) |
| **Cloud Build** | 120 build-minutos/día | ~5 min/build (✅ OK) |
| **Artifact Registry** | 500 MB storage | ~200 MB (✅ OK) |
| **Secret Manager** | 10K accesos/mes | ~1K accesos (✅ OK) |
| **Cloud Logging** | 50 GB/mes | ~5 GB (✅ OK) |

**Costo total esperado:** **$0.00/mes** (dentro del tier gratuito)

---

## 🔍 VERIFICACIÓN POST-DEPLOYMENT

### Health Check:
```bash
curl https://palacio-central-<hash>-uc.a.run.app/health
```

**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2025-10-16T..."}
```

### Metrics Endpoint:
```bash
curl -H "Authorization: Bearer local_metrics_token" \
  https://palacio-central-<hash>-uc.a.run.app/metrics
```

### Ver logs:
```bash
gcloud run services logs read palacio-central --region=us-central1 --limit=50
```

---

## 📈 MONITOREO

### GCP Console:

- **Logs:** https://console.cloud.google.com/logs/query
- **Métricas:** https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics
- **Costos:** https://console.cloud.google.com/billing

### Comandos útiles:

```bash
# Ver logs en tiempo real
gcloud run services logs tail palacio-central --region=us-central1

# Ver estado del servicio
gcloud run services describe palacio-central --region=us-central1

# Ver revisiones (para rollback)
gcloud run revisions list --service=palacio-central --region=us-central1
```

---

## 🔄 ROLLBACK

Si algo falla, volver a versión anterior:

```bash
# Listar revisiones
gcloud run revisions list --service=palacio-central --region=us-central1

# Rollback a revisión específica
gcloud run services update-traffic palacio-central \
  --region=us-central1 \
  --to-revisions=palacio-central-00001-abc=100
```

---

## 🎯 CI/CD AUTOMÁTICO

### Conectar GitHub (opcional):

1. Ir a **Cloud Build → Triggers** en GCP Console
2. Conectar tu repositorio GitHub
3. Crear trigger:
   - Event: Push to branch
   - Branch: `^main$`
   - Build config: `cloudbuild.yaml`

**Resultado:** Cada push a `main` desplegará automáticamente a Cloud Run.

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, consultar:

1. **Guía rápida:** `DEPLOYMENT_QUICK_START.md` (paso a paso ilustrado)
2. **Plan técnico:** `CLOUD_SETUP_PLAN.md` (arquitectura completa)
3. **Diagnóstico:** `docs/DIAGNOSTICO_CLOUD_ACTUAL.md` (estado actual)
4. **Informe técnico:** `docs/INFORME_TECNICO_MIGRACION_CLOUD.md` (completo)

---

## 🛠️ TROUBLESHOOTING

### Build falla:

```bash
# Ver logs del último build
gcloud builds list --limit 1
gcloud builds log <BUILD_ID>
```

**Solución común:** Verificar que `package.json` tiene todas las dependencias.

---

### Container crashea:

```bash
# Ver logs del servicio
gcloud run services logs read palacio-central --region=us-central1 --limit=100
```

**Solución común:**
- Puerto debe ser 8080 (no 3002)
- Secrets mal configurados
- RAM insuficiente (aumentar a 1Gi)

---

### Out of memory:

```bash
# Aumentar memoria a 1GB
gcloud run services update palacio-central \
  --region=us-central1 \
  --memory 1Gi
```

---

### Permission denied:

```bash
# Dar permisos de administrador
gcloud projects add-iam-policy-binding goio-imperios-prod \
  --member="user:tu-email@gmail.com" \
  --role="roles/run.admin"
```

---

## 🌐 ARQUITECTURA FINAL

### Antes (Hetzner):

```
Internet → Hetzner VPS → Nginx → palacio-central:3002
                               → goio-store:3000
```

### Después (Cloud Run):

```
Internet → Cloud Run (palacio-central)
                 ↓
         [Autoescalado 0-2 instancias]
                 ↓
         [HTTPS automático]
                 ↓
         [Logs centralizados]
```

**Frontend (goio-store):** Puede seguir en Hetzner o migrarse después.

---

## ✅ CHECKLIST FINAL

Después del deployment, confirmar:

- [ ] ✅ URL pública responde: `curl https://palacio-central-*.run.app/health`
- [ ] ✅ Logs visibles en GCP Console
- [ ] ✅ CPU < 1 core, RAM < 512Mi (ver métricas)
- [ ] ✅ Costo = $0.00 en Billing
- [ ] ✅ Secrets configurados (verificar con `gcloud secrets list`)
- [ ] ✅ Integraciones API funcionan (Gemini, Shopify, Meta)
- [ ] ✅ Endpoint `/metrics` protegido con token

---

## 🆘 SOPORTE

Si encuentras problemas:

1. **Revisar logs:** `gcloud run services logs read palacio-central --region=us-central1`
2. **Estado del servicio:** `gcloud run services describe palacio-central --region=us-central1`
3. **Verificar secrets:** `gcloud secrets list`
4. **Consultar docs:** `DEPLOYMENT_QUICK_START.md`
5. **Rollback si es crítico:** Ver sección de rollback arriba

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Una vez verificado todo:

1. Actualizar DNS para apuntar a Cloud Run (si tienes dominio custom)
2. Configurar CI/CD para deploys automáticos
3. Monitorear costos semanalmente (debería ser $0)
4. Disfrutar del autoescalado y SSL gratis

---

**Proyecto:** Goio Imperios+  
**Backend:** palacio-central  
**Cloud Provider:** Google Cloud Run  
**Región:** us-central1  
**Costo:** $0/mes (tier gratuito)  
**Status:** ✅ Listo para deployment

---

**Próximos pasos:**
- Ejecutar `bash gcp_deploy.sh`
- Verificar URL pública funciona
- Actualizar DNS (opcional)
- Monitorear métricas en GCP Console
