# 🎯 GUÍA VISUAL - Deploy Sistema V2.0 en 5 Pasos

**Tiempo total:** 15 minutos  
**Nivel:** Principiante OK  
**Requisitos:** Cloud Shell acceso

---

## 📍 PASO 1: Abrir Cloud Shell (30 segundos)

```
1. Ir a: https://console.cloud.google.com
2. Click en el ícono de terminal (arriba derecha) >_
3. Esperar a que cargue
```

**Verificar proyecto correcto:**
```bash
gcloud config get-value project
# Debe mostrar: goio-imperios-prod
```

Si no es correcto:
```bash
gcloud config set project goio-imperios-prod
```

---

## 📍 PASO 2: Preparar archivos (2 minutos)

```bash
# Ir al directorio del proyecto
cd ~/Goio-Store/palacio-central

# Ver archivos actuales
ls -la agents/
```

**⚠️ SI FALTAN ARCHIVOS:**

Los nuevos agentes están en tu **VS Code local** (Windows). Hay 2 opciones:

### Opción A: Git Push (recomendado si tienes git configurado)
```bash
# En tu máquina local (PowerShell):
cd "c:\Goio mayordomo\palacio-central"
git add .
git commit -m "feat: Add V2.0 advanced agents with images and Shopify sync"
git push origin master

# Luego en Cloud Shell:
cd ~/Goio-Store/palacio-central
git pull origin master
```

### Opción B: Recrear archivos directamente (si git da problemas)

Los archivos ya están en tu **VS Code local**. Cópialos uno por uno:

```bash
# En Cloud Shell, crear los archivos manualmente
# (Usa los contenidos de tu VS Code local)

# 1. ImageGenerator
cat > agents/imagegenerator.js << 'EOF'
[COPIAR TODO EL CONTENIDO DE TU ARCHIVO LOCAL]
EOF

# 2. ShopifySync
cat > agents/shopifysync.js << 'EOF'
[COPIAR TODO EL CONTENIDO DE TU ARCHIVO LOCAL]
EOF

# ... repetir para los demás archivos
```

**Archivos a verificar:**
- ✅ `agents/imagegenerator.js`
- ✅ `agents/shopifysync.js`
- ✅ `agents/groupmarketer.js`
- ✅ `agents/engagement.js`
- ✅ `scripts/generate-store-banner.js`
- ✅ `scripts/deploy-v2-advanced.sh`
- ✅ `scripts/verify-setup.sh`

---

## 📍 PASO 3: Crear OPENAI_API_KEY (5 minutos)

**IMPORTANTE:** Este secreto es NUEVO y necesario para imágenes profesionales.

### 3.1. Obtener API Key de OpenAI

```
1. Ir a: https://platform.openai.com/signup
2. Crear cuenta (si no tienes)
3. Ir a: https://platform.openai.com/api-keys
4. Click en "Create new secret key"
5. Nombre: "Goio Store Images"
6. Permisos: Seleccionar "Images" (DALL-E)
7. Click "Create"
8. COPIAR la key (empieza con sk-proj-...)
   ⚠️ Solo se muestra una vez!
```

### 3.2. Agregar a Secret Manager

```bash
# Crear el secreto
gcloud secrets create OPENAI_API_KEY \
  --replication-policy='automatic' \
  --project=goio-imperios-prod

# Agregar la versión (pegar tu API key)
echo 'sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXX' | \
  gcloud secrets versions add OPENAI_API_KEY \
  --data-file=- \
  --project=goio-imperios-prod
```

**Verificar:**
```bash
gcloud secrets describe OPENAI_API_KEY --project=goio-imperios-prod
# Debe mostrar: name: projects/416927190535/secrets/OPENAI_API_KEY
```

**💡 ALTERNATIVA:** Si no quieres pagar OpenAI, el sistema funciona sin este secreto (usa placeholders de alta calidad en lugar de DALL-E 3).

---

## 📍 PASO 4: Verificar Setup (1 minuto)

```bash
# Dar permisos de ejecución
chmod +x scripts/verify-setup.sh

# Ejecutar verificación
./scripts/verify-setup.sh
```

**Resultado esperado:**
```
✅ TODO LISTO PARA DEPLOY

Siguiente paso:
  ./scripts/deploy-v2-advanced.sh
```

**Si hay errores:**
- ❌ Archivos faltantes → Volver a PASO 2
- ❌ OPENAI_API_KEY → Volver a PASO 3
- ❌ Otros secretos → Ver `scripts/deploy-v2-advanced.sh` línea 18

---

## 📍 PASO 5: Deploy! (5 minutos)

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy-v2-advanced.sh

# EJECUTAR DEPLOY
./scripts/deploy-v2-advanced.sh
```

**Progreso esperado:**
```
🚀 GOIO STORE - DEPLOY SISTEMA AVANZADO V2.0
==============================================

🔐 1/7 - Verificando secretos en Secret Manager...
  ✅ GEMINI_API_KEY existe
  ✅ META_ACCESS_TOKEN existe
  ✅ FACEBOOK_PAGE_1_ID existe
  ✅ OPENAI_API_KEY existe
  ✅ SHOPIFY_STORE_1_NAME existe
  ✅ SHOPIFY_STORE_1_ADMIN_API_KEY existe

🔨 2/7 - Construyendo imagen Docker...
  ✅ Imagen construida: v2.0-advanced-20251019-043000

📤 3/7 - Subiendo imagen a Artifact Registry...
  ✅ Imagen subida exitosamente

🚀 4/7 - Desplegando a Cloud Run...
  ✅ Deploy completado

🏥 5/7 - Verificando health del servicio...
  URL: https://palacio-central-416927190535.us-central1.run.app
  ✅ Servicio saludable

⏰ 6/7 - Verificando Cloud Scheduler...
  ✅ Scheduler actualizado

📊 7/7 - Resumen del deploy
==========================================

✅ DEPLOY COMPLETADO EXITOSAMENTE
```

**Duración:** 3-5 minutos (Docker build + push + deploy)

---

## ✅ VERIFICACIÓN FINAL (2 minutos)

### 1. Ver logs en tiempo real

```bash
gcloud run services logs read palacio-central \
  --region=us-central1 \
  --project=goio-imperios-prod \
  --limit=50
```

**Buscar:**
- ✅ `[ImageGenerator] 🎨 Agente iniciado.`
- ✅ `[ShopifySync] 🛍️ Agente iniciado.`
- ✅ `[Publisher] 📸 Publicando con IMAGEN para...`
- ✅ `[Engagement] 💬 Agente iniciado.`

### 2. Ver posts en Facebook

```
Ir a: https://facebook.com/839862345874909
```

**Verificar:**
- ✅ Posts tienen **IMAGEN profesional**
- ✅ Posts tienen **URL de Shopify** en el texto
- ✅ Posts tienen **copy persuasivo** (Hook → Beneficios → CTA)
- ✅ Precio visible (ej: S/ 49.90)

### 3. Ver productos en Shopify

```
Ir a: https://skhqgs-2j.myshopify.com/admin/products
```

**Verificar:**
- ✅ Productos nuevos con estado **ACTIVE** (no DRAFT)
- ✅ Productos tienen **imagen subida**
- ✅ Precio configurado (ej: S/ 49.90, S/ 89.90)
- ✅ Descripción completa

---

## 🎨 BONUS: Portada de Tienda (5 minutos)

```bash
# Ejecutar generador
node scripts/generate-store-banner.js
```

**Output:**
```
🎨 GENERADOR DE PORTADA PROFESIONAL - Goio Store Peru
============================================================

🖼️  Generando banner con DALL-E 3...
⏳ Esto puede tomar 30-60 segundos...

✅ Imagen generada exitosamente!
🔗 URL temporal (24h): https://oaidalleapiprodscus.blob.core...
📥 Descargando banner...
✅ Banner guardado: assets/store-branding/goio-store-banner.png

============================================================
📋 SIGUIENTE PASO: Subir a Shopify
============================================================

1️⃣  Abre Shopify Admin:
   https://skhqgs-2j.myshopify.com/admin

2️⃣  Ve a: Online Store → Themes → Customize

3️⃣  Sección "Banner" o "Hero Image":
   - Click en "Upload image"
   - Selecciona: assets/store-branding/goio-store-banner.png
   - Ajusta posición si es necesario

4️⃣  Guarda cambios y publica
```

**Descargar banner a tu PC:**
1. En Cloud Shell: Click en **⋮** (menú) → Download file
2. Path: `assets/store-branding/goio-store-banner.png`
3. Guardar en tu PC
4. Subir a Shopify desde Shopify Admin

---

## 🎉 ¡COMPLETADO!

**Tu sistema ahora:**
- ✅ Genera imágenes profesionales automáticamente
- ✅ Crea productos en Shopify con imagen + precio
- ✅ Publica en Facebook con imagen + URL + copy persuasivo
- ✅ Distribuye orgánicamente en grupos (manual por ahora)
- ✅ Responde comentarios 24/7 con IA
- ✅ Ejecuta cada 6 horas sin intervención

---

## 📊 Monitoreo Continuo

### Ver ejecuciones del Scheduler

```bash
gcloud scheduler jobs describe trendhunter-scheduler \
  --location=us-central1 \
  --project=goio-imperios-prod
```

### Ver logs por fecha

```bash
# Hoy
gcloud run services logs read palacio-central \
  --region=us-central1 \
  --project=goio-imperios-prod \
  --limit=100

# Por tiempo específico (últimas 2 horas)
gcloud run services logs read palacio-central \
  --region=us-central1 \
  --project=goio-imperios-prod \
  --limit=200 \
  --log-filter='timestamp>="2025-10-19T02:00:00Z"'
```

### Dashboard de métricas

```
Ir a: https://console.cloud.google.com/run/detail/us-central1/palacio-central/metrics?project=goio-imperios-prod
```

---

## 🆘 Troubleshooting Común

### Error: "OPENAI_API_KEY not found"

**Solución 1:** Verificar que existe
```bash
gcloud secrets describe OPENAI_API_KEY --project=goio-imperios-prod
```

**Solución 2:** El sistema funciona sin él (usa placeholders)
```bash
# No hacer nada, el sistema auto-fallback a placeholders
```

### Error: "Shopify API 401 Unauthorized"

**Solución:**
```bash
# Verificar token
gcloud secrets versions access latest --secret=SHOPIFY_STORE_1_ADMIN_API_KEY --project=goio-imperios-prod

# Si expiró, renovar en:
# https://skhqgs-2j.myshopify.com/admin/settings/apps/development
```

### Error: "Facebook API Error 190"

**Solución:**
```bash
# Token expirado, renovar en:
# https://developers.facebook.com/tools/explorer/

# Actualizar:
echo 'NUEVO_TOKEN_AQUI' | gcloud secrets versions add META_ACCESS_TOKEN --data-file=- --project=goio-imperios-prod
```

### Posts sin imagen

**Diagnóstico:**
```bash
# Ver logs de ImageGenerator
gcloud run services logs read palacio-central \
  --region=us-central1 \
  --project=goio-imperios-prod \
  --limit=100 | grep ImageGenerator
```

**Causas comunes:**
- OPENAI_API_KEY inválida → Usar placeholder (automático)
- Sin créditos en OpenAI → Agregar créditos o usar placeholder
- Timeout de DALL-E → Reintentar, sistema auto-retry

---

## 📞 Contacto

**¿Aún con problemas?**

1. Ver logs completos:
   ```bash
   gcloud run services logs read palacio-central --region=us-central1 --project=goio-imperios-prod --limit=500 > debug.log
   ```

2. Buscar "ERROR" o "❌" en `debug.log`

3. Leer documentación detallada: `README-SISTEMA-AVANZADO-V2.md`

---

**¡Felicitaciones! Tu sistema de ventas orgánicas está 100% operativo! 🚀🇵🇪**
