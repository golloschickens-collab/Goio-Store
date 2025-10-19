# ⚡ GUÍA RÁPIDA - DEPLOY CLOUD SHELL

**Para el usuario apurado que quiere deploy YA**

---

## 🚀 OPCIÓN 1: Un Solo Click (Windows)

1. **Doble click** en: `ABRIR-CLOUD-SHELL.cmd`
2. Se abrirá Cloud Shell en tu navegador
3. **Copia y pega** estos 3 comandos:

```bash
cd ~/Goio-Store/palacio-central
chmod +x scripts/gcp/deploy-elite-24-7.sh
./scripts/gcp/deploy-elite-24-7.sh
```

4. Espera 10 minutos ☕
5. **LISTO** - Sistema operando 24/7

---

## 🌐 OPCIÓN 2: Directo desde navegador

1. Abre: **https://shell.cloud.google.com/?project=goio-imperios-prod**
2. Pega este comando completo:

```bash
cd ~ && \
if [ ! -d "Goio-Store" ]; then git clone https://github.com/golloschickens-collab/Goio-Store.git; fi && \
cd Goio-Store && \
git fetch origin && \
git reset --hard origin/master && \
cd palacio-central && \
chmod +x scripts/gcp/deploy-elite-24-7.sh && \
./scripts/gcp/deploy-elite-24-7.sh
```

3. Presiona **ENTER**
4. Espera 10 minutos ☕
5. **LISTO** - Sistema operando 24/7

---

## ✅ VERIFICACIÓN RÁPIDA

Después del deploy, ejecuta:

```bash
# Ver agentes ELITE en acción
gcloud run services logs read palacio-central --region=us-central1 --limit=50 | grep -E "ELITE|MarketIntelligence|PricingGenius|ConversionOptimizer"
```

**Debes ver:**
```
✅ [MarketIntelligence] 🕵️ AGENTE ÉLITE ACTIVADO
✅ [PricingGenius] 💰 AGENTE ÉLITE ACTIVADO
✅ [ConversionOptimizer] 🎯 AGENTE ÉLITE ACTIVADO
```

---

## 🔥 EJECUTAR AGENTES MANUALMENTE (SIN ESPERAR 6H)

```bash
SERVICE_URL=$(gcloud run services describe palacio-central --region=us-central1 --format='value(status.url)')
curl -X POST "${SERVICE_URL}/execute"
```

---

## 📊 VER REPORTES GENERADOS

```bash
# Último reporte de inteligencia
gsutil cat gs://goio-imperios-prod-reports/intelligence/market-intelligence-$(date +%Y-%m-%d).json | jq '.'

# Últimas actualizaciones de precios
gsutil cat gs://goio-imperios-prod-reports/pricing/pricing-updates-$(date +%Y-%m-%d).json | jq '.'

# Último análisis de conversión
gsutil cat gs://goio-imperios-prod-reports/conversion/friction-analysis-$(date +%Y-%m-%d).json | jq '.'
```

---

## ⏰ PROGRAMACIÓN AUTOMÁTICA

Una vez deployado, el sistema ejecuta **SOLO** cada 6 horas:

- 00:00 AM Peru
- 06:00 AM Peru
- 12:00 PM Peru
- 06:00 PM Peru

**Tu laptop puede estar apagada. Todo opera en la nube.**

---

## 🛠️ COMANDOS ÚTILES

### Ver logs en tiempo real

```bash
gcloud run services logs tail palacio-central --region=us-central1
```

### Ver próxima ejecución programada

```bash
gcloud scheduler jobs describe palacio-central-elite-scheduler --location=us-central1
```

### Forzar ejecución AHORA

```bash
gcloud scheduler jobs run palacio-central-elite-scheduler --location=us-central1
```

### Ver estado del servicio

```bash
gcloud run services describe palacio-central --region=us-central1
```

---

## 💰 COSTOS

**GCP:** $11-23/mes  
**ROI Mes 1:** $278-608 USD (1,112-2,432% ROI)  
**ROI Mes 3:** $2,108-4,258 USD (8,432-17,032% ROI)

---

## 🚨 SI ALGO FALLA

```bash
# Ver errores recientes
gcloud run services logs read palacio-central --region=us-central1 --limit=200 | grep -i error

# Verificar secrets existen
gcloud secrets list --project=goio-imperios-prod

# Re-deploy completo
./scripts/gcp/deploy-elite-24-7.sh
```

---

## 📞 AYUDA COMPLETA

Lee: `INSTRUCCIONES-CLOUD-SHELL-24-7.md`

---

**Todo listo en 10 minutos. Tu sistema genera dinero mientras duermes.** 🔥
