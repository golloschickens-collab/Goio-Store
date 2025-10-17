# 🚀 DEPLOYMENT AUTOMÁTICO CON GITHUB ACTIONS

**Sin instalar nada en tu PC - Todo desde el navegador**

---

## 📋 PREREQUISITOS

- ✅ Cuenta de Google Cloud (gratis)
- ✅ Repositorio GitHub (golloschickens-collab/Goio-Store)
- ✅ 10 minutos de tu tiempo

---

## 🎯 PASO 1: CREAR PROYECTO GCP

### 1.1 Crear proyecto

1. Ir a: https://console.cloud.google.com/projectcreate
2. **Nombre:** `goio-imperios-prod`
3. Clic en **Crear**
4. **Copiar el Project ID** (aparece en la notificación)

---

### 1.2 Habilitar APIs

Ir a: https://console.cloud.google.com/flows/enableapi?apiid=run.googleapis.com,cloudbuild.googleapis.com,artifactregistry.googleapis.com,secretmanager.googleapis.com

O manualmente:

1. https://console.cloud.google.com/apis/library/run.googleapis.com → **Habilitar**
2. https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com → **Habilitar**
3. https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com → **Habilitar**
4. https://console.cloud.google.com/apis/library/secretmanager.googleapis.com → **Habilitar**

---

### 1.3 Crear Artifact Registry

1. Ir a: https://console.cloud.google.com/artifacts
2. Clic en **Crear repositorio**
3. Configurar:
   - **Nombre:** `goio-images`
   - **Formato:** Docker
   - **Modo:** Standard
   - **Región:** `us-central1` (Iowa)
4. Clic en **Crear**

---

## 🔐 PASO 2: CREAR SERVICE ACCOUNT

### 2.1 Crear cuenta de servicio

1. Ir a: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Clic en **Crear cuenta de servicio**
3. Configurar:
   - **Nombre:** `github-actions-deploy`
   - **ID:** `github-actions-deploy`
   - **Descripción:** `Service Account para GitHub Actions CI/CD`
4. Clic en **Crear y continuar**

---

### 2.2 Asignar roles

Agregar los siguientes roles:

1. **Cloud Run Admin** (`roles/run.admin`)
2. **Service Account User** (`roles/iam.serviceAccountUser`)
3. **Artifact Registry Writer** (`roles/artifactregistry.writer`)
4. **Secret Manager Secret Accessor** (`roles/secretmanager.secretAccessor`)

Clic en **Continuar** → **Listo**

---

### 2.3 Crear clave JSON

1. En la lista de cuentas de servicio, clic en `github-actions-deploy@goio-imperios-prod.iam.gserviceaccount.com`
2. Ir a la pestaña **Claves**
3. Clic en **Agregar clave** → **Crear clave nueva**
4. Seleccionar **JSON**
5. Clic en **Crear**
6. **Guardar el archivo JSON** (se descarga automáticamente)

**⚠️ IMPORTANTE:** Este archivo contiene credenciales sensibles. Nunca lo subas a GitHub directamente.

---

## 🔑 PASO 3: CONFIGURAR SECRETS EN GCP

### 3.1 Secrets obligatorios

Ir a: https://console.cloud.google.com/security/secret-manager

Crear estos secrets (clic en **Crear secreto** para cada uno):

| Secret Name | Valor | Dónde encontrarlo |
|-------------|-------|-------------------|
| `GEMINI_API_KEY` | `AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU` | Tu archivo `config/keys.json` |
| `SHOPIFY_ADMIN_TOKEN_PROD` | `shpat_[REDACTED]` | Tu archivo `config/credenciales.json` |
| `SHOPIFY_STORE_PROD` | `skhqgs-2j` | Tu archivo `config/shopify.json` |
| `META_ACCESS_TOKEN` | (tu token de Meta) | `config/social_credentials.json` |
| `FACEBOOK_PAGE_1_ID` | `127438543758050` | `config/social_credentials.json` |
| `FACEBOOK_PAGE_2_ID` | `579941541858938` | `config/social_credentials.json` |
| `INSTAGRAM_ACCOUNT_ID` | `17841470653421960` | `config/social_credentials.json` |

**Para cada secret:**
1. Clic en **Crear secreto**
2. Nombre: (nombre de la tabla)
3. Valor del secreto: (pegar el valor)
4. Clic en **Crear secreto**

---

## 🔗 PASO 4: CONFIGURAR GITHUB SECRETS

### 4.1 Agregar Service Account Key

1. Ir a tu repositorio: https://github.com/golloschickens-collab/Goio-Store
2. Clic en **Settings** (Configuración)
3. En el menú izquierdo: **Secrets and variables** → **Actions**
4. Clic en **New repository secret**
5. Configurar:
   - **Name:** `GCP_SA_KEY`
   - **Secret:** Pegar el contenido completo del archivo JSON descargado en el paso 2.3
6. Clic en **Add secret**

---

## ✅ PASO 5: HACER PUSH Y DESPLEGAR

### 5.1 Verificar archivos

Asegúrate de tener estos archivos en tu repo:

- ✅ `.github/workflows/deploy-cloud-run.yml` (creado automáticamente)
- ✅ `Dockerfile.cloudrun`
- ✅ `package.json`

---

### 5.2 Subir cambios a GitHub

```bash
cd "c:\Goio mayordomo\palacio-central"
git add .
git commit -m "🚀 Setup Cloud Run deployment con GitHub Actions"
git push origin master
```

**O desde GitHub Desktop:**
1. Commit de los cambios
2. Push a `origin/master`

---

### 5.3 Monitorear deployment

1. Ir a: https://github.com/golloschickens-collab/Goio-Store/actions
2. Verás el workflow **"Deploy to Cloud Run"** ejecutándose
3. Clic en el workflow para ver logs en tiempo real

**Tiempo estimado:** 3-5 minutos

---

## 🎉 PASO 6: VERIFICAR DEPLOYMENT

### 6.1 Obtener URL

Cuando el workflow termine exitosamente:

1. En la consola de Cloud Run: https://console.cloud.google.com/run
2. Clic en `palacio-central`
3. Copiar la **URL** (algo como `https://palacio-central-xxxxx-uc.a.run.app`)

---

### 6.2 Health check

```bash
curl https://palacio-central-xxxxx-uc.a.run.app/health
```

**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2025-10-16T..."}
```

---

### 6.3 Ver logs

https://console.cloud.google.com/run/detail/us-central1/palacio-central/logs

---

## 🔄 DEPLOYS AUTOMÁTICOS

**Ahora cada vez que hagas push a `master`:**

1. GitHub Actions se ejecuta automáticamente
2. Construye la imagen Docker
3. La sube a Artifact Registry
4. Despliega a Cloud Run
5. Hace health check
6. Te notifica del resultado

**🎯 No necesitas hacer nada más - es 100% automático.**

---

## 🛠️ TROUBLESHOOTING

### Error: "Permission denied"

**Solución:** Verifica que el Service Account tenga todos los roles del paso 2.2.

```bash
# Agregar roles manualmente (en Cloud Shell)
gcloud projects add-iam-policy-binding goio-imperios-prod \
  --member="serviceAccount:github-actions-deploy@goio-imperios-prod.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

---

### Error: "Secret not found"

**Solución:** Verifica que creaste todos los secrets del paso 3.1 en Secret Manager.

---

### Error: "Image not found"

**Solución:** Verifica que creaste el Artifact Registry `goio-images` en el paso 1.3.

---

### Error: "Health check failed"

**Solución:** Verifica logs en Cloud Run:
```
https://console.cloud.google.com/run/detail/us-central1/palacio-central/logs
```

Causas comunes:
- Puerto incorrecto (debe ser 8080)
- Secret mal configurado
- Dependencia faltante en `package.json`

---

## 📊 MONITOREO

### Métricas en tiempo real

https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics

**Verás:**
- Request count
- Request latency
- Container CPU utilization
- Container memory utilization
- Container instance count

---

### Logs centralizados

https://console.cloud.google.com/logs/query

**Query útil:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="palacio-central"
severity="ERROR"
```

---

### Alertas (opcional)

Configura alertas para:
- Error rate > 5%
- Latency > 1s
- Memory usage > 400Mi

https://console.cloud.google.com/monitoring/alerting

---

## 💰 COSTOS

**Con el tier gratuito de GCP:**

| Recurso | Límite gratis | Uso estimado | Costo |
|---------|---------------|--------------|-------|
| Cloud Run requests | 2M/mes | ~50K/mes | $0.00 |
| Cloud Run CPU-time | 180K vCPU-seg | ~20K vCPU-seg | $0.00 |
| Cloud Run RAM-time | 360K GiB-seg | ~40K GiB-seg | $0.00 |
| Artifact Registry | 500 MB | ~200 MB | $0.00 |
| Secret Manager | 10K accesos | ~1K accesos | $0.00 |
| Cloud Build | 120 min/día | ~5 min/día | $0.00 |

**Total estimado:** **$0.00/mes**

---

## 🚀 PRÓXIMOS PASOS

Una vez funcionando:

1. **Custom domain:** Configurar tu propio dominio
2. **CI/CD avanzado:** Agregar tests automáticos
3. **Staging environment:** Crear entorno de pruebas
4. **Monitoring avanzado:** Configurar alertas personalizadas
5. **Backup automático:** Configurar snapshots diarios

---

## 📚 RECURSOS

- **Cloud Run docs:** https://cloud.google.com/run/docs
- **GitHub Actions:** https://docs.github.com/actions
- **Artifact Registry:** https://cloud.google.com/artifact-registry/docs
- **Secret Manager:** https://cloud.google.com/secret-manager/docs

---

**Proyecto:** Goio Imperios+  
**Deployment:** GitHub Actions → Cloud Run  
**Costo:** $0/mes (tier gratuito)  
**Status:** ✅ Listo para configurar

**Tiempo total de setup:** 10-15 minutos  
**Deploys posteriores:** 100% automáticos (3-5 min)
