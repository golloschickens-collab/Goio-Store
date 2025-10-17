# 🚀 GUÍA RÁPIDA DE DEPLOYMENT - CLOUD RUN

**Proyecto:** Goio Imperios - Palacio Central  
**Fecha:** 16 de octubre de 2025  
**Tiempo estimado:** 30-60 minutos  
**Costo:** $0 (tier gratuito)

---

## 📋 PRE-REQUISITOS

### En tu máquina local:
```bash
✅ gcloud CLI instalado
✅ Docker instalado
✅ Git instalado
✅ Cuenta Google Cloud creada
✅ Tarjeta registrada en GCP (no se cobrará con tier gratuito)
```

### Verificar instalaciones:
```bash
gcloud --version
docker --version
git --version
```

---

## 🎯 DEPLOYMENT EN 5 PASOS

### PASO 1: Crear Proyecto GCP (5 minutos)

**En navegador:**
1. Ir a https://console.cloud.google.com/projectcreate
2. Nombre: `goio-imperios-prod`
3. Hacer clic en "CREATE"
4. Esperar confirmación

**Activar APIs necesarias:**
```bash
# Desde terminal local
gcloud config set project goio-imperios-prod

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com
```

---

### PASO 2: Autenticar y Configurar (5 minutos)

```bash
# Autenticar
gcloud auth login

# Configurar proyecto y región
gcloud config set project goio-imperios-prod
gcloud config set run/region us-central1

# Autenticar Docker
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

### PASO 3: Ejecutar Script de Deployment (10-15 minutos)

```bash
# Navegar a palacio-central
cd "c:\Goio mayordomo\palacio-central"

# Dar permisos de ejecución (Linux/Mac)
chmod +x gcp_deploy.sh

# Ejecutar deployment
./gcp_deploy.sh
```

**El script automáticamente:**
- ✅ Crea repositorio Artifact Registry
- ✅ Construye imagen Docker optimizada
- ✅ Sube imagen a GCP
- ✅ Crea secrets desde .env
- ✅ Deploya a Cloud Run
- ✅ Verifica healthcheck
- ✅ Retorna URL pública

---

### PASO 4: Verificar Deployment (5 minutos)

```bash
# Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe palacio-central --region=us-central1 --format='value(status.url)')

echo "🌍 Tu servicio está en: $SERVICE_URL"

# Test healthcheck
curl $SERVICE_URL/health

# Test metrics (necesita METRICS_TOKEN)
curl -H "Authorization: Bearer YOUR_METRICS_TOKEN" $SERVICE_URL/metrics
```

---

### PASO 5: Monitorear Logs (Opcional)

```bash
# Ver logs en tiempo real
gcloud logging tail "resource.type=cloud_run_revision"

# Ver últimos 50 logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=palacio-central" --limit=50

# Abrir Cloud Console
https://console.cloud.google.com/run/detail/us-central1/palacio-central
```

---

## 🐛 TROUBLESHOOTING

### Error: "Permission denied" en gcp_deploy.sh
```bash
# Windows (Git Bash)
bash gcp_deploy.sh

# Linux/Mac
chmod +x gcp_deploy.sh
./gcp_deploy.sh
```

### Error: "Project not found"
```bash
# Verificar proyecto
gcloud config get-value project

# Configurar proyecto correcto
gcloud config set project goio-imperios-prod
```

### Error: "Service account does not exist"
```bash
# Crear service account
gcloud iam service-accounts create cloud-run-deployer \
  --description="Cloud Run Deployer" \
  --display-name="Cloud Run Deployer"

# Asignar roles
gcloud projects add-iam-policy-binding goio-imperios-prod \
  --member="serviceAccount:cloud-run-deployer@goio-imperios-prod.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

### Error: "Secret not found"
```bash
# Crear secret manualmente
echo -n "TU_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Ver secrets existentes
gcloud secrets list
```

### Healthcheck falla
```bash
# Ver logs del servicio
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=20

# Verificar puerto
docker run -p 8080:8080 --env-file .env palacio-central
curl http://localhost:8080/health
```

---

## 🔄 ROLLBACK

### Si algo sale mal:

```bash
# Ver revisiones disponibles
gcloud run revisions list --service=palacio-central --region=us-central1

# Rollback a revisión anterior
gcloud run services update-traffic palacio-central \
  --to-revisions=palacio-central-00001-abc=100 \
  --region=us-central1
```

---

## 💰 MONITOREAR COSTOS

### Verificar uso actual:
```bash
# Abrir billing
https://console.cloud.google.com/billing

# Ver métricas Cloud Run
https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics
```

### Límites tier gratuito:
```
✅ 2M requests/mes
✅ 360K GB-seconds memory/mes
✅ 180K vCPU-seconds/mes
```

**Si superas tier gratuito:**
- Recibirás email de alerta
- Puedes establecer presupuesto con alertas
- Costos adicionales son mínimos (~$0.40 por 1M requests)

---

## 📚 ARCHIVOS INCLUIDOS

```
palacio-central/
├── Dockerfile.cloudrun          ← Multi-stage optimizado
├── cloudbuild.yaml              ← CI/CD automático
├── gcp_deploy.sh                ← Script deployment all-in-one
├── .gcloudignore                ← Excluir archivos del build
├── service.yaml                 ← Configuración declarativa
└── docs/
    ├── CLOUD_SETUP_PLAN.md      ← Plan completo
    ├── DIAGNOSTICO_CLOUD_ACTUAL.md
    └── INFORME_TECNICO_MIGRACION_CLOUD.md
```

---

## 🎉 SIGUIENTE PASOS POST-DEPLOYMENT

1. **Actualizar DNS:**
   ```
   Apuntar dominio a Cloud Run URL
   ```

2. **Configurar dominio personalizado:**
   ```bash
   gcloud run domain-mappings create --service=palacio-central --domain=api.goio.store
   ```

3. **Configurar CI/CD automático:**
   ```bash
   gcloud builds triggers create github \
     --repo-name=Goio-Store \
     --repo-owner=golloschickens-collab \
     --branch-pattern="^master$" \
     --build-config=cloudbuild.yaml
   ```

4. **Configurar alertas:**
   - Error rate > 5%
   - Latency p95 > 2s
   - Costo > $10/mes

---

## 📞 SOPORTE

**Documentación GCP:**
- https://cloud.google.com/run/docs
- https://cloud.google.com/free

**Logs imperiales:**
- `logs/DIAGNOSTICO_HETZNER_COMANDOS.sh` - Diagnóstico servidor
- `docs/CLOUD_SETUP_PLAN.md` - Plan completo
- `docs/DIAGNOSTICO_CLOUD_ACTUAL.md` - Estado actual

---

**✅ ¡Listo para desplegar!** Ejecuta `./gcp_deploy.sh` y en 15 minutos tendrás tu backend en la nube.
