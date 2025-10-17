# 🚀 GUÍA EJECUTIVA - MIGRACIÓN DESDE CLOUD SHELL

**Tiempo total:** 20-30 minutos  
**Requisitos:** Cuenta GCP con billing activo

---

## ✅ PASO 1: ABRIR CLOUD SHELL (30 segundos)

1. Ir a: https://console.cloud.google.com
2. Login con tu cuenta Google
3. Clic en icono **Activate Cloud Shell** (terminal, arriba a la derecha)
4. Esperar a que inicie (10-15 segundos)

---

## ✅ PASO 2: CLONAR REPOSITORIO (1 minuto)

```bash
git clone https://github.com/golloschickens-collab/Goio-Store.git
cd Goio-Store/palacio-central
```

---

## ✅ PASO 3: SETUP PROYECTO GCP (5 minutos)

```bash
# Ejecutar script de setup automático
bash scripts/gcp/setup-project.sh
```

**Esto hará:**
- ✅ Crear proyecto `goio-imperios-prod`
- ✅ Vincular billing
- ✅ Habilitar 15+ servicios GCP
- ✅ Crear Artifact Registry
- ✅ Configurar Docker
- ✅ Crear buckets de backup

**Salida esperada:**
```
✅ SETUP COMPLETADO
📊 Project ID: goio-imperios-prod
🚀 Próximos pasos: migrar secrets y deploy
```

---

## ✅ PASO 4: SUBIR ARCHIVO .ENV (2 minutos)

### Opción A - Upload desde PC:

1. En Cloud Shell, clic en **⋮** (menú) → **Upload**
2. Seleccionar `palacio-central.env` desde tu PC
3. Mover a ubicación correcta:
   ```bash
   mv ~/palacio-central.env ./palacio-central.env
   ```

### Opción B - Crear manualmente:

```bash
cat > palacio-central.env << 'EOF'
GEMINI_API_KEY=AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU
SHOPIFY_ADMIN_TOKEN_PROD=shpat_YOUR_TOKEN_HERE
SHOPIFY_STORE_PROD=skhqgs-2j
META_ACCESS_TOKEN=tu_token_meta
FACEBOOK_PAGE_1_ID=127438543758050
FACEBOOK_PAGE_2_ID=579941541858938
INSTAGRAM_ACCOUNT_ID=17841470653421960
INSTAGRAM_TOKEN=tu_token_instagram
EOF
```

---

## ✅ PASO 5: MIGRAR SECRETS (2 minutos)

```bash
# Migrar todos los secrets a Secret Manager
bash scripts/gcp/migrate-secrets.sh
```

**Salida esperada:**
```
✅ Creando GEMINI_API_KEY...
✅ Creando SHOPIFY_ADMIN_TOKEN_PROD...
✅ Creando META_ACCESS_TOKEN...
...
✅ Secrets migrados correctamente
```

**Verificar:**
```bash
gcloud secrets list
```

---

## ✅ PASO 6: DEPLOY PALACIO-CENTRAL (10 minutos)

```bash
# Build + push + deploy automático
bash scripts/gcp/deploy-palacio.sh
```

**Esto hará:**
1. Build Docker image (multi-stage Alpine)
2. Push a Artifact Registry
3. Deploy a Cloud Run
4. Configurar secrets
5. Verificar health check

**Salida esperada:**
```
✅ DEPLOYMENT EXITOSO
🌐 URL del servicio:
   https://palacio-central-xxxxx-uc.a.run.app

✅ Health check OK
```

---

## ✅ PASO 7: VERIFICAR DEPLOYMENT (2 minutos)

```bash
# Verificación completa de todos los componentes
bash scripts/gcp/verify-deployment.sh
```

**Verificará:**
- ✅ Servicio Cloud Run activo
- ✅ Health check responde
- ✅ Secrets configurados
- ✅ Imágenes en registry
- ✅ Logs disponibles

---

## 🎉 DEPLOYMENT COMPLETADO

Tu backend está desplegado en:
```
https://palacio-central-xxxxx-uc.a.run.app
```

### Verificar endpoints:

```bash
# Guardar URL en variable
export PALACIO_URL=$(gcloud run services describe palacio-central \
  --region us-central1 --format='value(status.url)')

# Health check
curl $PALACIO_URL/health

# Status de agentes
curl $PALACIO_URL/api/agents/status

# Test Gemini IA
curl -X POST $PALACIO_URL/api/ia/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Genera título para producto de skincare"}'
```

---

## 📊 MONITOREO

### Ver logs en tiempo real:
```bash
gcloud run services logs tail palacio-central --region us-central1
```

### Ver últimos 50 logs:
```bash
gcloud run services logs read palacio-central --region us-central1 --limit 50
```

### Métricas en consola:
```
https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics
```

---

## 🔄 REDEPLOY (si cambias código)

```bash
# Pull últimos cambios
git pull origin master

# Redeploy
bash scripts/gcp/deploy-palacio.sh
```

---

## ⚠️ ROLLBACK (si algo falla)

```bash
# Volver a versión anterior
bash scripts/gcp/rollback.sh palacio-central
```

---

## 🆘 TROUBLESHOOTING

### Error: "Permission denied"
```bash
# Verificar billing activo
gcloud billing accounts list

# Vincular billing manualmente
gcloud billing projects link goio-imperios-prod \
  --billing-account=BILLING_ACCOUNT_ID
```

### Error: "Build failed"
```bash
# Ver logs del build
gcloud builds list --limit 1
gcloud builds log <BUILD_ID>
```

### Error: "Service not responding"
```bash
# Ver logs del servicio
gcloud run services logs read palacio-central --region us-central1 --limit 100

# Verificar secrets
gcloud secrets list

# Redeploy forzado
bash scripts/gcp/deploy-palacio.sh
```

---

## 💰 COSTOS

**Primeros 3 meses:** $0 (tier gratuito)  
**Después:** $5-10/mes (según tráfico)

**Monitorear costos:**
```
https://console.cloud.google.com/billing?project=goio-imperios-prod
```

---

## 🚀 PRÓXIMOS PASOS

Una vez verificado palacio-central:

1. **Deploy CRM WhatsApp** (FASE 2)
2. **Deploy frontends** (FASE 3)
3. **Configurar Cloud Scheduler** (FASE 5)
4. **Configurar alertas** (FASE 6)

Ver documentación completa en:
```bash
cat MIGRACION_IMPERIAL_GCP.md
```

---

## 📚 COMANDOS ÚTILES

```bash
# Ver todos los servicios Cloud Run
gcloud run services list --region us-central1

# Describir un servicio
gcloud run services describe palacio-central --region us-central1

# Ver revisiones (para rollback)
gcloud run revisions list --service palacio-central --region us-central1

# Eliminar servicio (si necesitas empezar de cero)
gcloud run services delete palacio-central --region us-central1

# Ver uso de cuota gratuita
gcloud run services describe palacio-central --region us-central1 \
  --format='value(status.traffic[0].percent)'
```

---

**¿Problemas?** Consulta el log completo en:
- `MIGRACION_IMPERIAL_GCP.md`
- `DEPLOYMENT_BROWSER_ONLY.md`
- https://cloud.google.com/run/docs
