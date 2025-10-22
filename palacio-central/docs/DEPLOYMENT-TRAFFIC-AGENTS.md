# 🚀 DEPLOYMENT: AGENTES DE TRÁFICO Y VENTAS

## 📦 Agentes Creados

1. **seo-traffic-master.js** - Tráfico orgánico Google
2. **fb-ads-master.js** - Campañas Facebook automatizadas  
3. **social-organic-master.js** - Instagram/TikTok automation
4. **email-funnel-master.js** - Email marketing automation
5. **retargeting-master.js** - Recuperar ventas perdidas
6. **traffic-sales-orchestrator.js** - Orquestador maestro

---

## ⚡ DEPLOYMENT RÁPIDO (5 minutos)

### 1️⃣ Copiar Agentes a Cloud Shell

```bash
# En Cloud Shell
cd ~/Goio-Store/palacio-central/agents

# Copiar los 6 archivos (usa Cloud Shell Editor o upload)
# O ejecuta estos comandos para crearlos directamente:
```

### 2️⃣ Configurar Secrets (APIs necesarias)

```bash
# Facebook Business API (para FB Ads y Retargeting)
gcloud secrets create fb-access-token \
  --data-file=<(echo "TU_FB_ACCESS_TOKEN") \
  --replication-policy=automatic

gcloud secrets create fb-ad-account-id \
  --data-file=<(echo "act_XXXXXXXXXX") \
  --replication-policy=automatic

gcloud secrets create fb-page-id \
  --data-file=<(echo "TU_PAGE_ID") \
  --replication-policy=automatic

gcloud secrets create fb-pixel-id \
  --data-file=<(echo "TU_PIXEL_ID") \
  --replication-policy=automatic

# Instagram API (para Social Organic)
gcloud secrets create instagram-access-token \
  --data-file=<(echo "TU_INSTAGRAM_TOKEN") \
  --replication-policy=automatic

# Google Ads (para Retargeting Google)
gcloud secrets create google-ads-id \
  --data-file=<(echo "TU_GOOGLE_ADS_ID") \
  --replication-policy=automatic
```

### 3️⃣ Actualizar Cloud Run con Nuevos Secrets

```bash
cd ~/Goio-Store/palacio-central

# Editar Dockerfile para incluir nuevos agentes (ya lo hace automáticamente)

# Rebuild y deploy
gcloud builds submit --tag gcr.io/goio-imperios-prod/agentes-elite .

gcloud run deploy agentes-elite \
  --image gcr.io/goio-imperios-prod/agentes-elite \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="SHOPIFY_STORE_URL=shopify-store-url:latest,SHOPIFY_ACCESS_TOKEN=shopify-token:latest,GEMINI_API_KEY=gemini-api-key:latest,FB_ACCESS_TOKEN=fb-access-token:latest,FB_AD_ACCOUNT_ID=fb-ad-account-id:latest,FB_PAGE_ID=fb-page-id:latest,FB_PIXEL_ID=fb-pixel-id:latest,INSTAGRAM_ACCESS_TOKEN=instagram-access-token:latest,GOOGLE_ADS_ID=google-ads-id:latest"
```

---

## 🎯 EJECUCIÓN

### Opción A: Ejecutar TODO (organico + pagado)

```bash
# En Cloud Shell
cd ~/Goio-Store/palacio-central
node agents/traffic-sales-orchestrator.js completo
```

### Opción B: Solo estrategias ORGÁNICAS (gratis)

```bash
node agents/traffic-sales-orchestrator.js organico
```

### Opción C: Solo estrategias PAGADAS

```bash
node agents/traffic-sales-orchestrator.js pagado
```

### Opción D: Ejecutar agentes individuales

```bash
# Solo SEO
node agents/seo-traffic-master.js

# Solo Facebook Ads
node agents/fb-ads-master.js

# Solo Redes Sociales
node agents/social-organic-master.js

# Solo Email
node agents/email-funnel-master.js

# Solo Retargeting
node agents/retargeting-master.js
```

---

## 🔄 AUTOMATIZACIÓN (Cloud Scheduler)

### Setup 1: SEO automático cada semana

```bash
gcloud scheduler jobs create http seo-semanal \
  --schedule="0 9 * * 1" \
  --uri="https://agentes-elite-416927190535.us-central1.run.app/traffic/seo" \
  --location=us-central1 \
  --time-zone="America/Lima"
```

### Setup 2: Social posts diarios

```bash
gcloud scheduler jobs create http social-diario \
  --schedule="0 9,15,21 * * *" \
  --uri="https://agentes-elite-416927190535.us-central1.run.app/traffic/social" \
  --location=us-central1 \
  --time-zone="America/Lima"
```

### Setup 3: Reporte semanal completo

```bash
gcloud scheduler jobs create http reporte-semanal \
  --schedule="0 10 * * 1" \
  --uri="https://agentes-elite-416927190535.us-central1.run.app/traffic/report" \
  --location=us-central1 \
  --time-zone="America/Lima"
```

---

## 📊 OBTENER APIS NECESARIAS

### 1. Facebook Business API

1. Ve a: https://developers.facebook.com/
2. Crea una app
3. Agrega "Marketing API"
4. Genera token de acceso (User Token)
5. Convierte a Long-lived token:
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=TU_APP_ID&client_secret=TU_APP_SECRET&fb_exchange_token=TU_SHORT_TOKEN"
```

**IDs necesarios:**
- Ad Account ID: En Ads Manager > Settings
- Page ID: En Page Settings > About
- Pixel ID: En Events Manager > Pixels

### 2. Instagram Access Token

1. Conecta tu Instagram Business al Facebook Page
2. Usa el mismo token de Facebook Business API
3. Asegúrate de tener permisos: `instagram_basic`, `instagram_content_publish`

### 3. Google Ads ID

1. Ve a: https://ads.google.com/
2. Crea cuenta de Google Ads
3. Copia tu Customer ID (formato: 123-456-7890)

---

## 💰 PRESUPUESTOS SUGERIDOS

### Inicio (Mes 1-2):
- **FB Ads:** $10/día = $300/mes
- **Retargeting:** $5/día = $150/mes
- **Total:** $450/mes

### Crecimiento (Mes 3-6):
- **FB Ads:** $20/día = $600/mes
- **Retargeting:** $10/día = $300/mes
- **Total:** $900/mes

### Escala (Mes 6+):
- **FB Ads:** $50/día = $1,500/mes
- **Retargeting:** $20/día = $600/mes
- **Total:** $2,100/mes

**ROI Esperado:** 3-5x (mes 1), 5-8x (mes 3+)

---

## 🎯 ENDPOINTS NUEVOS

Agrega estos a tu `server.js`:

```javascript
// Ejecutar orquestador completo
app.get('/traffic/all', async (req, res) => {
  const TrafficOrchestrator = require('./agents/traffic-sales-orchestrator');
  const orchestrator = new TrafficOrchestrator();
  const result = await orchestrator.ejecutarEstrategiaCompleta();
  res.json(result);
});

// Solo SEO
app.get('/traffic/seo', async (req, res) => {
  const SEOMaster = require('./agents/seo-traffic-master');
  const agente = new SEOMaster();
  const result = await agente.ejecutarOptimizacionSEO();
  res.json(result);
});

// Solo FB Ads
app.get('/traffic/fb-ads', async (req, res) => {
  const FBAdsMaster = require('./agents/fb-ads-master');
  const agente = new FBAdsMaster();
  const result = await agente.ejecutarCampañaAutomatica();
  res.json(result);
});

// Solo Social
app.get('/traffic/social', async (req, res) => {
  const SocialMaster = require('./agents/social-organic-master');
  const agente = new SocialMaster();
  const result = await agente.ejecutarEstrategiaOrganica();
  res.json(result);
});

// Solo Email
app.get('/traffic/email', async (req, res) => {
  const EmailMaster = require('./agents/email-funnel-master');
  const agente = new EmailMaster();
  const result = await agente.ejecutarFunnelAutomatico();
  res.json(result);
});

// Solo Retargeting
app.get('/traffic/retargeting', async (req, res) => {
  const RetargetingMaster = require('./agents/retargeting-master');
  const agente = new RetargetingMaster();
  const result = await agente.ejecutarRetargetingInteligente();
  res.json(result);
});
```

---

## ✅ CHECKLIST DE ACTIVACIÓN

- [ ] Agentes copiados a Cloud Shell
- [ ] Secrets configurados (FB, Instagram, Google Ads)
- [ ] Cloud Run actualizado con nuevos secrets
- [ ] Endpoints agregados a server.js
- [ ] Build y deploy exitoso
- [ ] Test manual: `curl https://agentes-elite.../traffic/seo`
- [ ] Cloud Scheduler configurado
- [ ] Presupuesto de ads definido
- [ ] Cuentas de FB Business/Ads creadas
- [ ] Píxel de Facebook instalado en Shopify
- [ ] Monitoreo configurado (dashboards)

---

## 🆘 TROUBLESHOOTING

### Error: "FB_ACCESS_TOKEN undefined"
```bash
# Verificar que el secret existe
gcloud secrets describe fb-access-token

# Re-deploy con secrets actualizados
gcloud run services update agentes-elite \
  --set-secrets="FB_ACCESS_TOKEN=fb-access-token:latest" \
  --region us-central1
```

### Error: "Rate limit exceeded" (Facebook API)
- Espera 1 hora o usa un token diferente
- Reduce frecuencia de llamadas en el código

### Error: "Insufficient permissions" (Instagram)
- Ve a Facebook App > App Review
- Solicita permisos: `instagram_basic`, `instagram_content_publish`

---

## 📈 MÉTRICAS A MONITOREAR

### Dashboard sugerido (Google Data Studio / Looker):

**Tráfico:**
- Visitas orgánicas (Google Analytics)
- Impresiones social media
- Email open rate / click rate

**Conversión:**
- Tasa de conversión por fuente
- Carritos abandonados recuperados
- ROI por canal

**Financiero:**
- CPA (Cost Per Acquisition)
- ROAS (Return On Ad Spend)
- LTV (Lifetime Value)

---

## 🎓 RECURSOS ADICIONALES

- [Facebook Marketing API Docs](https://developers.facebook.com/docs/marketing-apis/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Google Ads API](https://developers.google.com/google-ads/api/docs/start)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-rest)

---

**Creado:** $(date)  
**Autor:** Traffic Sales Orchestrator  
**Versión:** 1.0
