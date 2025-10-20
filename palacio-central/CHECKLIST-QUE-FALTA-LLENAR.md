# ✅ CHECKLIST: LO QUE FALTA LLENAR PARA VENDER HOY

**Fecha:** 12 de Octubre, 2025  
**Objetivo:** 3 tiendas listas para venta + Agentes en todas las redes sociales

---

## 🏪 TIENDA 1: PERU (skhqgs-2j.myshopify.com)

### **CONFIGURACIÓN TÉCNICA**

#### ✅ **YA COMPLETADO:**
- [x] Tienda Shopify creada
- [x] Token de admin configurado
- [x] 13 productos cargados
- [x] 64 imágenes profesionales subidas
- [x] Descripciones optimizadas con IA
- [x] PayPal configurado como método de pago
- [x] 52 posts de redes sociales generados

#### ⏳ **PENDIENTE (CRÍTICO PARA HOY):**

**1. Verificación de Pago (15 min):**
```
□ Hacer test de compra
□ Verificar que PayPal recibe el pago
□ Confirmar email de confirmación
□ Revisar que aparezca en Admin de Shopify
```

**2. Configuración de Envío (10 min):**
```
□ Abrir Shopify Admin → Settings → Shipping
□ Configurar zona "Peru"
□ Establecer precio de envío gratis para pedidos +$25
□ Configurar envío estándar: $5-10
□ Guardar cambios
```

**3. Política de Devoluciones (5 min):**
```
□ Shopify Admin → Settings → Policies
□ Agregar política de devoluciones (30 días)
□ Agregar política de privacidad
□ Agregar términos y condiciones
□ Publicar
```

**4. Dominio goio.store (OPCIONAL - puede esperar):**
```
□ Ir a Shopify Admin → Settings → Domains
□ Conectar dominio goio.store
□ Esperar propagación DNS (24-48h)
□ O usar por ahora: skhqgs-2j.myshopify.com
```

---

### **REDES SOCIALES - TIENDA 1**

#### ✅ **YA CONFIGURADO:**
- [x] Facebook Page ID: 377626045425378
- [x] Facebook Access Token
- [x] Meta App configurada

#### ⚠️ **FALTA CONFIGURAR (30 min total):**

**5. Instagram Business (15 min):**
```
□ Paso 1: Ve a Facebook Business Suite
   URL: https://business.facebook.com

□ Paso 2: Conectar Instagram
   - Settings → Instagram accounts → Connect account
   - Inicia sesión en tu Instagram
   - Autoriza conexión

□ Paso 3: Obtener Instagram Access Token
   - Ve a developers.facebook.com
   - Selecciona tu app (ID: 1098552895072623)
   - Tools → Access Token Tool
   - Genera token para Instagram
   - Copia el token

□ Paso 4: Agregar a .env
   INSTAGRAM_BUSINESS_ACCOUNT_ID=[ID_AQUI]
   INSTAGRAM_ACCESS_TOKEN=[TOKEN_AQUI]

□ Paso 5: Agregar link en bio de Instagram
   - Abre Instagram → Perfil → Edit Profile
   - Website: https://skhqgs-2j.myshopify.com
   - Guardar
```

**6. WhatsApp Business (10 min - OPCIONAL):**
```
□ Descargar WhatsApp Business app
□ Registrar número de negocio
□ Configurar catálogo de productos
□ Agregar link: https://skhqgs-2j.myshopify.com
□ Mensaje automático de bienvenida
```

**7. TikTok Business (20 min - OPCIONAL):**
```
□ Crear cuenta TikTok (si no tienes)
□ Convertir a Business Account
   - Settings → Account → Switch to Business Account
□ Aplicar para TikTok Shop (si disponible en Peru)
□ Agregar link en bio: skhqgs-2j.myshopify.com
```

---

### **CONTENIDO Y PUBLICACIÓN**

**8. Publicar Primer Post (15 min):**
```
□ Abrir archivo: c:\Goio mayordomo\palacio-central\reports\redes-sociales\contenido-redes-1760254554545.md

□ Instagram:
   - Copiar copy del primer "Instagram Feed"
   - Descargar imagen del link
   - Publicar en Instagram
   - Pegar hashtags

□ Facebook:
   - Copiar copy del primer "Facebook Post"
   - Descargar imagen
   - Publicar en Facebook Page
   - Compartir en tu perfil personal

□ Story Instagram:
   - Descargar imagen de "Instagram Story"
   - Subir a Stories
   - Añadir texto del copy
   - Publicar
```

**9. Tráfico Inmediato (30 min):**
```
□ WhatsApp: Enviar mensaje a 20 contactos
   Plantilla en: PLAN-PRIMERA-VENTA-48H.md

□ Facebook: Compartir en 3 grupos locales
   Plantilla en: PLAN-PRIMERA-VENTA-48H.md

□ Email (opcional): Enviar a lista de contactos
```

---

## 🌍 TIENDA 2: GLOBAL (goio-global.myshopify.com)

### **CONFIGURACIÓN TÉCNICA**

#### ✅ **YA COMPLETADO:**
- [x] Tienda Shopify creada
- [x] Token de admin configurado
- [x] Preparada para mercado USA/Internacional

#### ❌ **FALTA COMPLETAR (2-3 horas):**

**10. Sincronizar Productos desde Peru (30 min):**
```
□ Opción A: Manual
   - Exportar productos desde Peru (CSV)
   - Importar en tienda Global
   - Ajustar precios a USD

□ Opción B: Automático (con script)
   - Ejecutar: node sincronizar-tiendas.js
   - (Te lo creo si eliges esta opción)
```

**11. Configurar Stripe USA (45 min):**
```
□ Paso 1: Crear cuenta Stripe
   URL: https://stripe.com

□ Paso 2: Verificar identidad
   - Subir ID
   - Agregar información bancaria USA
   - Esperar aprobación (puede tomar 1-2 días)

□ Paso 3: Obtener credenciales
   - API Keys → Publishable key
   - API Keys → Secret key
   - Webhooks → Create webhook

□ Paso 4: Conectar con Shopify
   - Shopify Admin → Settings → Payments
   - Activate Stripe
   - Ingresar credenciales
   - Guardar

□ Paso 5: Agregar a .env
   STRIPE_PUBLISHABLE_KEY_USA=[KEY_AQUI]
   STRIPE_SECRET_KEY_USA=[SECRET_AQUI]
   STRIPE_WEBHOOK_SECRET_USA=[WEBHOOK_AQUI]
```

**12. Configurar Envíos Internacionales (30 min):**
```
□ Shopify Admin → Settings → Shipping
□ Configurar zonas:
   - USA (envío gratis +$50)
   - Canada (envío gratis +$75)
   - Europa (envío gratis +$100)
   - Australia (envío gratis +$100)
□ Establecer precios de envío por zona
□ Guardar
```

**13. Ajustar Precios a USD (15 min):**
```
□ Productos en Peru: $29.99 → USA: $34.99
□ Considerar:
   - Costos de envío internacional
   - Impuestos USA
   - Competencia en mercado USA
□ Actualizar todos los precios
```

**14. Generar Contenido para Mercado USA (30 min):**
```
□ Ejecutar agente de redes sociales para tienda Global
□ Adaptar copy al inglés
□ Hashtags en inglés
□ Referencias a mercado USA
```

---

### **REDES SOCIALES - TIENDA 2**

**15. Cuentas Separadas o Compartidas (DECISIÓN):**
```
□ Opción A: Mismas cuentas (Facebook/Instagram)
   - Publicar contenido en ambos idiomas
   - Alternar entre mercados

□ Opción B: Cuentas separadas
   - @goiostore.peru (español)
   - @goiostore.global (inglés)
   - Más trabajo pero mejor segmentación
```

**16. Configurar según decisión:**
```
Si separadas:
□ Crear nueva Facebook Page (inglés)
□ Crear nueva Instagram (inglés)
□ Obtener nuevos tokens
□ Configurar en .env con sufijo _GLOBAL
```

---

## 🏗️ TIENDA 3: DESARROLLO (goio-store.env)

### **ESTADO: NO CONFIGURADA**

**17. Decisión Crítica:**
```
□ Opción A: CREAR TIENDA 3
   Tiempo: 1 día completo
   Beneficio: Tercera fuente de ingresos
   Riesgo: Dispersión, retrasa ventas

□ Opción B: CANCELAR/APLAZAR
   Enfoque: 2 tiendas operativas primero
   Beneficio: Ventas más rápido
   Decisión: Crear después de validar modelo
```

**SI DECIDES CREAR (1 día):**
```
□ Crear nueva tienda en Shopify
□ Configurar dominio (¿cuál?)
□ Cargar productos
□ Subir imágenes
□ Configurar pagos
□ Generar contenido
□ Publicar en redes
```

**RECOMENDACIÓN:**
```
❌ NO CREAR HOY si quieres vender hoy
✅ APLAZAR hasta tener ventas en las 2 primeras
```

---

## 🤖 AGENTES PARA REDES SOCIALES

### **LO QUE NECESITAS LLENAR:**

**18. Credenciales de Redes Sociales (.env):**

```bash
# === INSTAGRAM ===
INSTAGRAM_BUSINESS_ACCOUNT_ID=          # ⚠️ LLENAR
INSTAGRAM_ACCESS_TOKEN=                 # ⚠️ LLENAR

# === TIKTOK (OPCIONAL) ===
TIKTOK_ACCESS_TOKEN=                    # ⏳ Opcional
TIKTOK_ACCOUNT_ID=                      # ⏳ Opcional

# === TWITTER/X (OPCIONAL) ===
TWITTER_API_KEY=                        # ⏳ Opcional
TWITTER_API_SECRET=                     # ⏳ Opcional
TWITTER_ACCESS_TOKEN=                   # ⏳ Opcional
TWITTER_ACCESS_SECRET=                  # ⏳ Opcional

# === LINKEDIN (OPCIONAL) ===
LINKEDIN_ACCESS_TOKEN=                  # ⏳ Opcional
LINKEDIN_ORGANIZATION_ID=               # ⏳ Opcional

# === PINTEREST (OPCIONAL) ===
PINTEREST_ACCESS_TOKEN=                 # ⏳ Opcional
PINTEREST_BOARD_ID=                     # ⏳ Opcional

# === YOUTUBE (OPCIONAL) ===
YOUTUBE_API_KEY=                        # ⏳ Opcional
YOUTUBE_CHANNEL_ID=                     # ⏳ Opcional

# === WHATSAPP BUSINESS API (OPCIONAL) ===
WHATSAPP_PHONE_NUMBER_ID=               # ⏳ Opcional
WHATSAPP_ACCESS_TOKEN=                  # ⏳ Opcional
```

---

## 📊 RESUMEN: QUÉ FALTA LLENAR

### **CRÍTICO PARA VENDER HOY (Tienda Peru):**

```
1. ⚠️ Instagram Access Token (15 min)
2. ⚠️ Instagram Business Account ID (15 min)
3. ⚠️ Hacer test de compra (15 min)
4. ⚠️ Configurar envíos (10 min)
5. ⚠️ Publicar primer post (15 min)
6. ⚠️ Enviar WhatsApp a contactos (30 min)

TOTAL: 1 hora 40 minutos
```

---

### **IMPORTANTE PARA TIENDA GLOBAL (Próxima semana):**

```
7. ⏳ Stripe USA credenciales (1-2 días aprobación)
8. ⏳ Sincronizar productos Peru → Global (30 min)
9. ⏳ Configurar envíos internacionales (30 min)
10. ⏳ Traducir contenido a inglés (30 min)

TOTAL: 2-3 días (por aprobación Stripe)
```

---

### **OPCIONAL (Redes adicionales):**

```
11. □ TikTok Business credentials (20 min)
12. □ Twitter/X API keys (20 min)
13. □ LinkedIn access token (20 min)
14. □ Pinterest access token (25 min)
15. □ YouTube API key (30 min)

TOTAL: 2 horas (si quieres todas)
```

---

## 🎯 MI RECOMENDACIÓN EJECUTIVA

### **PARA VENDER HOY - PRIORIDAD ABSOLUTA:**

**SOLO LLENA ESTO (1 hora 40 min):**
```
✅ Instagram credentials (30 min)
✅ Test de compra PayPal (15 min)
✅ Configurar envíos (10 min)
✅ Publicar contenido (15 min)
✅ WhatsApp tráfico (30 min)

= PRIMERA VENTA EN 24 HORAS
```

---

### **PRÓXIMA SEMANA (Después de validar):**

**ENTONCES LLENA:**
```
✅ Stripe USA para tienda Global
✅ TikTok credentials
✅ Otras redes sociales
✅ Tienda 3 (si decides crearla)

= ESCALAR A MÚLTIPLES MERCADOS
```

---

## 🚀 ACCIÓN INMEDIATA

**Te voy a ayudar paso a paso con:**

**Opción 1: "Configurar Instagram AHORA" (15 min)**
→ Te doy guía paso a paso con screenshots

**Opción 2: "Crear agente multi-red completo" (30 min)**
→ Te creo script que publica en todas las redes automáticamente

**Opción 3: "Sincronizar tienda Global" (30 min)**
→ Te creo script que copia productos Peru → Global

**Opción 4: "Darme checklist interactivo ejecutable"**
→ Te creo script que te va preguntando y llenando automáticamente

---

## ❓ **¿QUÉ ELIGES?**

**A) "Instagram + Vender HOY"**  
→ Te guío para llenar Instagram credentials y publicar

**B) "Sistema completo multi-red"**  
→ Te creo agentes para TODAS las redes sociales

**C) "Las 3 tiendas operativas"**  
→ Te ayudo a llenar TODO lo que falta

**D) "Script automático que llene todo"**  
→ Te creo wizard interactivo

---

**Dime cuál eliges (A, B, C o D) y lo hacemos AHORA.** 🚀
