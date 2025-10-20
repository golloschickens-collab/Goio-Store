# 🗂️ Roadmap Kanban Imperial

> Última actualización: 2025-10-09

## 🟥 Pendiente

### Credenciales
- Generar y cargar `SHOPIFY_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_STOREFRONT_TOKEN`.
- Validar `FACEBOOK_ACCESS_TOKEN`, `META_ACCESS_TOKEN_GOIO/GOLLOS`, `META_APP_ID`, `META_APP_SECRET`.
- Añadir `META_WHATSAPP_PHONE_ID` y `META_WHATSAPP_TOKEN`.
- Crear app TikTok y guardar `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_ACCESS_TOKEN`.

### Catálogo
- Sustituir `config/products.json` por catálogo real (primer lote de 10 SKUs Goio Store).
- Subir imágenes a CDN estable y referenciarlas en cada SKU.

### Infraestructura
- Desplegar webhook de WhatsApp (puerto **3003**).
- Configurar Pixel de Meta y GA4 directamente en Shopify.

## 🟨 En curso

### Creative (Gemini)
- Migrar prompts al modelo `gemini-1.5-flash`.
- Ajustar prompts con CTAs y assets definitivos.

### Publisher
- Completar integraciones reales en `clients/whatsapp.js` y `clients/tiktok.js`.
- Probar `npm run publish:plan -- plan.json` en staging sin `DRY_RUN`.

### Supervisor / Métricas
- Exponer métricas detalladas en puerto **3002** (Prometheus friendly).
- Añadir contadores de ejecuciones, latencias y errores por agente.

## 🟩 Hecho
- Supervisor básico operativo en puerto **3002**.
- Cliente Gemini con API key real (modo fallback ya implementado).
- Content Strategist generando planes heurísticos.
- Cliente Shopify implementado (a la espera de catálogo real).
