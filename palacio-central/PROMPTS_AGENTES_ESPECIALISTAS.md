# =============================================
# 🤖 PROMPTS ESPECÍFICOS PARA AGENTES
# =============================================

## 🎯 **AGENTE 1: WHATSAPP BUSINESS SETUP**

### **PROMPT COMPLETO:**
```
ROL: Especialista en WhatsApp Business API
OBJETIVO: Configurar bot automático para Gollos Chickens
URGENCIA: CRÍTICA - Necesario para generar dinero día 2

TAREAS ESPECÍFICAS:
1. INVESTIGAR proceso exacto WhatsApp Business API en Perú
2. DOCUMENTAR requisitos legales/comerciales necesarios
3. OBTENER tokens: Access Token, Phone Number ID, Verify Token
4. CONFIGURAR webhook endpoint: http://localhost:8000/api/webhooks/whatsapp
5. TESTEAR envío/recepción mensajes automáticos

LINKS IMPORTANTES:
- https://developers.facebook.com/apps/
- https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- https://business.whatsapp.com/

DATOS DEL NEGOCIO:
- Nombre: "Gollos Chickens"
- Número: +51939431887
- Tipo: Broastería/Delivery
- Ubicación: Lima, Perú
- RUC: [Solicitar al usuario]

RESULTADO ESPERADO:
- Archivo con todos los tokens obtenidos
- Documentación paso a paso del proceso
- Testing exitoso de mensajes automáticos
- Webhook funcionando 100%

TIEMPO LÍMITE: 4 horas máximo
PRIORIDAD: MÁXIMA
```

---

## 🛒 **AGENTE 2: SHOPIFY + PAYPAL SETUP**

### **PROMPT COMPLETO:**
```
ROL: E-commerce Specialist
OBJETIVO: Crear tienda Shopify + PayPal para dropshipping automático
URGENCIA: ALTA - Día 3-4 debe estar vendiendo

TAREAS ESPECÍFICAS:
1. CREAR cuenta Shopify con plan óptimo
2. CONFIGURAR tema profesional (Dawn recomendado)
3. SETUP PayPal Business + API credentials
4. INTEGRAR apps esenciales: Oberlo/DSers, Judge.me
5. CONFIGURAR políticas legales (términos, privacidad, envíos)
6. TESTEAR flujo completo: producto → carrito → pago → confirmación

CONFIGURACIONES CRÍTICAS:
- Nombre tienda: "goio-store"
- Moneda: USD (para productos internacionales)
- Envíos: Perú + internacional
- Métodos pago: PayPal + tarjetas
- Apps automáticas para importar productos

LINKS ESENCIALES:
- https://www.shopify.com/free-trial
- https://www.paypal.com/pe/business
- https://developer.paypal.com/
- https://apps.shopify.com/oberlo

RESULTADO ESPERADO:
- Tienda Shopify 100% operativa
- PayPal procesando pagos automáticamente
- APIs configuradas para agentes automáticos
- Primera venta de prueba exitosa

TIEMPO LÍMITE: 5 horas total
ENTREGABLE: URLs + credenciales + documentación
```

---

## 🕊️ **AGENTE 3: YOUTUBE MONETIZACIÓN SETUP**

### **PROMPT COMPLETO:**
```
ROL: YouTube Monetization Expert
OBJETIVO: Canal Eco-Eterno monetizado con contenido automático
URGENCIA: MEDIA - Semana 1 debe estar subiendo videos

TAREAS ESPECÍFICAS:
1. CREAR canal "Eco-Eterno - Ministerio Digital"
2. OPTIMIZAR para monetización rápida (1000 subs + 4000 horas)
3. CONFIGURAR YouTube API para uploads automáticos
4. SETUP AdSense para ingresos por publicidad
5. INVESTIGAR mejores prácticas contenido religioso
6. CREAR calendario contenido 30 días

ESTRATEGIA MONETIZACIÓN:
- Contenido: Estudios bíblicos, versículos diarios, oraciones
- Duración: 3-8 minutos (óptimo para ads)
- Frecuencia: 1-2 videos diarios
- SEO: Keywords cristianas/espirituales
- Engagement: Calls to action para suscripción/donación

LINKS CRÍTICOS:
- https://studio.youtube.com/
- https://developers.google.com/youtube/v3
- https://console.cloud.google.com/
- https://www.google.com/adsense/

RESULTADO ESPERADO:
- Canal YouTube optimizado y branded
- YouTube API key para uploads automáticos
- AdSense configurado para monetización
- 30 videos programados automáticamente
- Sistema de donaciones integrado

TIEMPO LÍMITE: 8 horas
MÉTRICA ÉXITO: Primer video subido automáticamente
```

---

## 🔍 **AGENTE 4: RESEARCH AUTOMATION SPECIALIST**

### **PROMPT COMPLETO:**
```
ROL: AI Automation Expert
OBJETIVO: Configurar agentes para encontrar productos trending 24/7
URGENCIA: ALTA - Debe alimentar todo el sistema automático

TAREAS ESPECÍFICAS:
1. CONFIGURAR research.js con APIs actualizadas
2. OPTIMIZAR prompts para encontrar productos virales
3. SETUP creative.js para generar contenido automático
4. CONFIGURAR listing.js para crear productos Shopify
5. INTEGRAR todo el pipeline: Research → Creative → Listing → Venta

FUENTES DE DATOS PARA RESEARCH:
- AliExpress trending products
- Amazon bestsellers
- TikTok viral products
- Google Trends
- Social media monitoring

CONFIGURACIÓN TÉCNICA:
- Gemini API para análisis inteligente
- Shopify API para creación automática
- Scheduling cada 4-6 horas
- Filtros de calidad y legalidad
- Análisis de competencia automático

ARCHIVOS A CONFIGURAR:
- /agents/research.js
- /agents/creative.js  
- /agents/listing.js
- /config/keys.json
- /prompts/*.txt

RESULTADO ESPERADO:
- Pipeline 100% automático funcionando
- 5-10 productos nuevos diariamente
- Contenido marketing generado automáticamente
- Sistema que se autoalimenta 24/7

TIEMPO LÍMITE: 4 horas
VALIDACIÓN: Un producto de principio a fin automáticamente
```

---

## 💰 **AGENTE 5: PAYMENT SYSTEMS INTEGRATION**

### **PROMPT COMPLETO:**
```
ROL: Payment Systems Specialist
OBJETIVO: Integrar Yape/Plin/PayPal para confirmaciones automáticas
URGENCIA: CRÍTICA - Sin esto no hay dinero real

TAREAS ESPECÍFICAS:
1. INVESTIGAR APIs bancarias Perú (BCP, Interbank, BBVA)
2. CONFIGURAR webhooks Yape/Plin si existen
3. IMPLEMENTAR parsing SMS como backup
4. INTEGRAR PayPal Instant Payment Notifications
5. CREAR sistema de confirmación automática pedidos

MÉTODOS DE INTEGRACIÓN:
- Opción 1: APIs oficiales bancarias
- Opción 2: Webhooks Yape/Plin (si disponibles)
- Opción 3: SMS parsing automático
- Opción 4: Email parsing confirmaciones
- Opción 5: Scraping seguro apps móviles

LINKS INVESTIGACIÓN:
- https://www.viabcp.com/empresas/canales-digitales/api-bcp
- https://www.yape.com.pe/comercios
- https://www.plin.pe/empresas
- https://developer.paypal.com/docs/api/webhooks/

CÓDIGO NECESARIO:
- Webhook endpoints para confirmaciones
- Base de datos para tracking pagos
- Sistema de alertas automáticas
- Integración con WhatsApp para confirmar pedidos

RESULTADO ESPERADO:
- Sistema que detecta pagos automáticamente
- Confirmación inmediata a clientes
- Tracking completo de ingresos reales
- Alertas push para pagos recibidos

TIEMPO LÍMITE: 6 horas
PRIORIDAD: CRÍTICA
```

---

## 📊 **AGENTE 6: DASHBOARD REAL-TIME**

### **PROMPT COMPLETO:**
```
ROL: Data Analytics Developer
OBJETIVO: Dashboard tiempo real con métricas de todos los imperios
URGENCIA: MEDIA - Necesario para monitoreo 24/7

TAREAS ESPECÍFICAS:
1. CONECTAR todas las fuentes de datos reales
2. CREAR visualizaciones en tiempo real
3. CONFIGURAR alertas automáticas
4. IMPLEMENTAR métricas de performance agentes
5. SETUP reportes automáticos diarios/semanales

FUENTES DE DATOS:
- WhatsApp: mensajes, pedidos, conversiones
- Shopify: ventas, productos, inventario
- PayPal: balance, transacciones, fees
- YouTube: views, suscriptores, ingresos
- Agentes: ejecuciones, errores, performance

MÉTRICAS CRÍTICAS:
- Ingresos totales por imperio
- Conversión WhatsApp → venta
- Performance agentes automáticos
- ROI por producto/campaña
- Alertas de errores/fallos

TECNOLOGÍAS:
- Dashboard: Metabase + custom API
- Base datos: PostgreSQL (ya configurado)
- Alertas: Telegram/WhatsApp
- Visualización: Charts.js + real-time updates
- Monitoreo: Prometheus + Grafana

RESULTADO ESPERADO:
- Dashboard accesible 24/7
- Métricas actualizadas cada minuto
- Alertas automáticas por problemas
- Reportes diarios automáticos por WhatsApp
- Visión completa del imperio digital

TIEMPO LÍMITE: 4 horas
ACCESO: http://localhost:3000/dashboard-rey
```

---

## ⚡ **AGENTE 7: AUTOMATION TESTING**

### **PROMPT COMPLETO:**
```
ROL: QA Automation Engineer
OBJETIVO: Validar que todo el sistema funciona 24/7 sin errores
URGENCIA: ALTA - Evitar pérdidas por fallos automáticos

TAREAS ESPECÍFICAS:
1. CREAR tests automáticos para cada imperio
2. VALIDAR flujos completos: lead → venta → confirmación
3. MONITOREAR uptime de todos los servicios
4. SETUP alertas por fallos críticos
5. DOCUMENTAR casos de error y soluciones

TESTS CRÍTICOS:
- WhatsApp: recepción/envío mensajes
- Shopify: creación productos automática
- PayPal: procesamiento pagos
- YouTube: upload videos automático
- Agentes: ejecución sin errores

HERRAMIENTAS:
- Postman/Newman para API testing
- Selenium para UI testing
- Monitoring tools para uptime
- Log analysis para debugging
- Performance testing para carga

ALERTAS CONFIGURAR:
- Sistema caído > 5 minutos
- Error en agente automático
- Pago rechazado/fallido
- WhatsApp sin responder > 10 min
- Servidor con alta carga

RESULTADO ESPERADO:
- Tests automáticos ejecutándose cada hora
- Alertas inmediatas por fallos
- Documentación completa de errores
- Sistema autorreparación básica
- 99.9% uptime garantizado

TIEMPO LÍMITE: 3 horas
ENTREGABLE: Suite de tests + alertas configuradas
```

---

## 🎯 **COORDINACIÓN DE AGENTES**

### **SECUENCIA DE EJECUCIÓN:**
1. **Agente 1 (WhatsApp)** → Día 1, horas 1-4
2. **Agente 5 (Payments)** → Día 1, horas 5-10  
3. **Agente 2 (Shopify)** → Día 3, horas 1-5
4. **Agente 4 (Research)** → Día 3, horas 6-10
5. **Agente 3 (YouTube)** → Día 5, horas 1-8
6. **Agente 6 (Dashboard)** → Día 6, horas 1-4
7. **Agente 7 (Testing)** → Día 7, horas 1-3

### **COMUNICACIÓN ENTRE AGENTES:**
- Slack/Discord para updates en tiempo real
- Documentos compartidos para credenciales
- GitHub para código y configuraciones
- Trello/Notion para tracking de tareas

### **MÉTRICAS DE ÉXITO:**
- Agente completó en tiempo estimado
- Tests de validación pasaron 100%
- Sistema funciona sin intervención manual
- Primeras transacciones reales completadas