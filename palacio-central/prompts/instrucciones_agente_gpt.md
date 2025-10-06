# 🤖 INSTRUCCIONES PRECISAS PARA AGENTE GPT - CONFIGURACIÓN IMPERIAL

## 🎯 **CONTEXTO PARA EL AGENTE GPT:**

**SITUACIÓN ACTUAL:**
- Tienes un sistema de 3 imperios digitales funcionando con agentes AI
- Ya encontraste 9 productos automáticamente con ROI 300-516%
- Gemini API configurada y operativa
- Base de datos PostgreSQL funcionando
- Solo faltan 2 configuraciones críticas para monetización automática

**OBJETIVO:** Configurar WhatsApp Business API y Shopify API en 65 minutos total para generar S/48,000 mensuales automáticos.

---

## 📱 **PASO 1: WHATSAPP BUSINESS API (45 minutos)**

### **🎯 INSTRUCCIÓN PARA TU AGENTE GPT:**

```
"Necesito configurar WhatsApp Business API para 3 números de teléfono de mis negocios en Perú. Guíame paso a paso, siendo muy específico en cada acción.

CONTEXTO:
- Tengo 3 negocios: Gollos Chickens, Goio-Store, y Eco-Eterno
- Números: +51939431888, +51939431889, +51939431890
- Necesito el Access Token para conectar con mi sistema automatizado
- Tengo que reemplazar 'TU_WHATSAPP_TOKEN_AQUI' en mi archivo config/keys.json

REQUERIMIENTOS ESPECÍFICOS:
1. Explicar cada clic y cada campo a llenar
2. Mostrar exactamente dónde encontrar el Access Token
3. Indicar cómo verificar cada número de teléfono 
4. Confirmar que el token funciona antes de continuar
5. Tiempo objetivo: 45 minutos máximo

RESULTADO ESPERADO: 
Obtener un Access Token que empiece con 'EAA...' y funcione para enviar mensajes de WhatsApp a través de API.

¿Puedes guiarme paso a paso desde el registro hasta obtener el token funcionando?"
```

### **🔧 INFORMACIÓN TÉCNICA PARA EL AGENTE:**

```
DETALLES TÉCNICOS QUE DEBE SABER EL AGENTE GPT:

URL INICIAL: https://business.whatsapp.com/products/business-api
NOMBRE NEGOCIO: "Imperio Digital Goio"
NÚMEROS A VERIFICAR: +51939431888, +51939431889, +51939431890
ARCHIVO A ACTUALIZAR: config/keys.json
CAMPO A REEMPLAZAR: "access_token": "TU_WHATSAPP_TOKEN_AQUI"
COMANDO DE PRUEBA: node test_whatsapp_api.js
```

---

## 🛒 **PASO 2: SHOPIFY API (20 minutos)**

### **🎯 INSTRUCCIÓN PARA TU AGENTE GPT:**

```
"Necesito configurar Shopify API para que mi sistema automatizado pueda subir productos automáticamente. Mis agentes AI ya encontraron 9 productos con ROI alto y necesito que se publiquen solos.

CONTEXTO:
- Tengo una tienda Shopify activa
- Necesito crear una App Privada para obtener API keys
- Mis agentes subirán productos automáticamente cuando esté configurado
- Debo reemplazar claves en config/keys.json

REQUERIMIENTOS ESPECÍFICOS:
1. Guiarme desde el panel admin de Shopify
2. Crear app privada con nombre específico: "Goio Imperial Agent"
3. Configurar permisos exactos: Products, Inventory, Orders (Read/Write)
4. Mostrar dónde encontrar API Key y API Secret
5. Explicar cómo obtener la URL correcta de mi tienda
6. Tiempo objetivo: 20 minutos máximo

RESULTADO ESPERADO:
Obtener API Key, API Secret, y Shop URL para que mis agentes puedan crear productos automáticamente.

¿Puedes guiarme desde el login de Shopify hasta tener las credenciales funcionando?"
```

### **🔧 INFORMACIÓN TÉCNICA PARA EL AGENTE:**

```
DETALLES TÉCNICOS QUE DEBE SABER EL AGENTE GPT:

RUTA SHOPIFY: [tu-tienda].myshopify.com/admin → Settings → Apps and sales channels
NOMBRE APP: "Goio Imperial Agent"
PERMISOS NECESARIOS: Products (Read/Write), Inventory (Read/Write), Orders (Read/Write)
CAMPOS A ACTUALIZAR EN config/keys.json:
- "api_key": "TU_SHOPIFY_API_KEY_AQUI"
- "api_secret": "TU_SHOPIFY_SECRET_AQUI"  
- "shop_url": "tu-tienda.myshopify.com"
COMANDO DE PRUEBA: node test_shopify_api.js
```

---

## 🧪 **COMANDOS DE VERIFICACIÓN PARA EL AGENTE:**

### **📋 INSTRUCCIÓN PARA VALIDACIÓN:**

```
"Después de cada configuración, necesito que me ayudes a verificar que funciona:

PARA WHATSAPP:
1. Abrir PowerShell en: C:\Goio mayordomo\palacio-central
2. Ejecutar: node test_whatsapp_api.js
3. Debe mostrar: 'SIMULANDO ENVÍO DE MENSAJE DE PRUEBA'
4. Si hay error, revisar el token

PARA SHOPIFY:
1. En la misma carpeta ejecutar: node test_shopify_api.js  
2. Debe mostrar: 'SIMULANDO CREACIÓN DE PRODUCTO DE PRUEBA'
3. Si hay error, revisar las API keys

ACTIVACIÓN FINAL:
Cuando ambos funcionen, ejecutar: node activate_all_agents.js
Esto activará el sistema completo para generar S/48,000 mensuales automáticos.

¿Puedes incluir estas verificaciones en tu guía?"
```

---

## 🎊 **RESULTADO FINAL ESPERADO:**

### **📊 INSTRUCCIÓN DE ÉXITO:**

```
"Al final de tu guía, el sistema debe:

✅ Responder WhatsApp automáticamente en 3 números
✅ Subir productos automáticamente a Shopify
✅ Generar S/48,000 mensuales sin intervención manual
✅ Operar 24/7 con agentes AI

El archivo config/keys.json debe tener:
- access_token con valor real (no 'TU_WHATSAPP_TOKEN_AQUI')
- api_key con valor real (no 'TU_SHOPIFY_API_KEY_AQUI')  
- api_secret con valor real
- shop_url con mi tienda real

CONFIRMACIÓN FINAL: Ambos comandos de prueba deben funcionar sin errores.

¿Puedes confirmar estos resultados al final de tu guía?"
```

---

## 🚀 **PROMPT COMPLETO PARA COPIAR Y PEGAR:**

```
Necesito configurar 2 APIs críticas para mi sistema automatizado de 3 negocios digitales que ya está generando productos con IA. Solo faltan estas integraciones para monetización automática.

PASO 1 - WHATSAPP BUSINESS API (45 min):
Configurar 3 números (+51939431888, +51939431889, +51939431890) para respuestas automáticas. Necesito el Access Token exacto para reemplazar "TU_WHATSAPP_TOKEN_AQUI" en config/keys.json. Guíame desde https://business.whatsapp.com/products/business-api hasta obtener el token funcionando.

PASO 2 - SHOPIFY API (20 min):  
Crear app privada "Goio Imperial Agent" con permisos Products/Inventory/Orders (Read/Write). Necesito API Key, Secret y Shop URL para reemplazar valores en config/keys.json. Guíame desde el admin de Shopify hasta tener credenciales funcionando.

VERIFICACIÓN: Después de cada paso, ejecutar node test_whatsapp_api.js y node test_shopify_api.js para confirmar que funciona.

OBJETIVO: Sistema generando S/48,000 mensuales automáticamente 24/7.

¿Puedes guiarme paso a paso con detalles específicos de cada clic y campo?
```
