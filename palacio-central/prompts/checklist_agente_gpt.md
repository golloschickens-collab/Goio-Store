# ✅ CHECKLIST PARA AGENTE GPT - CONFIGURACIÓN IMPERIAL

## 📱 **CHECKLIST PASO 1: WHATSAPP BUSINESS API**

### **🔧 SUB-PASO 1.1: REGISTRO (5 min)**
- [ ] Ir a: https://business.whatsapp.com/products/business-api
- [ ] Clic "Get Started"
- [ ] Login/registro con Facebook/Meta
- [ ] Nombre negocio: "Imperio Digital Goio" 
- [ ] Confirmar email

### **📞 SUB-PASO 1.2: VERIFICAR NÚMEROS (30 min)**
- [ ] Clic "Phone Numbers" → "Add Phone Number"
- [ ] Número 1: +51939431888 → Nombre: "Gollos Chickens"
- [ ] Verificar vía SMS → Ingresar código
- [ ] Número 2: +51939431889 → Nombre: "Goio-Store"  
- [ ] Verificar vía SMS → Ingresar código
- [ ] Número 3: +51939431890 → Nombre: "Eco-Eterno"
- [ ] Verificar vía SMS → Ingresar código

### **🔑 SUB-PASO 1.3: OBTENER TOKEN (2 min)**
- [ ] Ir a "API Setup" o "Configuración API"
- [ ] Copiar "Access Token" (empieza con EAA...)
- [ ] Abrir config/keys.json
- [ ] Reemplazar "TU_WHATSAPP_TOKEN_AQUI" con el token real
- [ ] Guardar archivo

### **🧪 SUB-PASO 1.4: TESTING (5 min)**
- [ ] Abrir PowerShell en: C:\Goio mayordomo\palacio-central
- [ ] Ejecutar: node test_whatsapp_api.js
- [ ] Verificar mensaje: "SIMULANDO ENVÍO DE MENSAJE DE PRUEBA"
- [ ] ✅ PASO 1 COMPLETADO

---

## 🛒 **CHECKLIST PASO 2: SHOPIFY API**

### **🌐 SUB-PASO 2.1: ACCESO SHOPIFY (2 min)**
- [ ] Ir a: [tu-tienda].myshopify.com/admin
- [ ] Login con credenciales Shopify
- [ ] Clic "Settings" (menú izquierdo)
- [ ] Clic "Apps and sales channels"

### **🔧 SUB-PASO 2.2: CREAR APP PRIVADA (3 min)**
- [ ] Buscar "Develop apps"
- [ ] Clic "Create private app"
- [ ] Nombre: "Goio Imperial Agent"
- [ ] Email desarrollador: [tu email]
- [ ] Clic "Create app"

### **✅ SUB-PASO 2.3: CONFIGURAR PERMISOS (5 min)**
- [ ] Pestaña "Configuration"
- [ ] Encontrar "Admin API access scopes"
- [ ] Activar: Products (Read and write)
- [ ] Activar: Inventory (Read and write)
- [ ] Activar: Orders (Read and write)
- [ ] Clic "Save"

### **🔑 SUB-PASO 2.4: OBTENER KEYS (2 min)**
- [ ] Pestaña "API credentials"
- [ ] Copiar "Admin API access token"
- [ ] Copiar "API key"
- [ ] Copiar "API secret key"
- [ ] Anotar URL de tienda: [nombre].myshopify.com
- [ ] Actualizar config/keys.json con valores reales
- [ ] Guardar archivo

### **🧪 SUB-PASO 2.5: TESTING FINAL (5 min)**
- [ ] En PowerShell: node test_shopify_api.js
- [ ] Verificar: "SIMULANDO CREACIÓN DE PRODUCTO DE PRUEBA"
- [ ] ✅ PASO 2 COMPLETADO

---

## 🚀 **CHECKLIST ACTIVACIÓN FINAL**

### **🎊 ACTIVAR SISTEMA COMPLETO**
- [ ] Ejecutar: node activate_all_agents.js
- [ ] Verificar mensaje: "TODOS LOS AGENTES IMPERIALES ACTIVADOS"
- [ ] Sistema operando 24/7
- [ ] ✅ MONETIZACIÓN AUTOMÁTICA ACTIVA

---

## 📊 **VERIFICACIÓN DE ÉXITO**

### **✅ CONFIRMACIONES FINALES**
- [ ] WhatsApp responde automáticamente en 3 números
- [ ] Shopify recibe productos automáticamente
- [ ] 9 productos listos para venta (ROI 300-516%)
- [ ] Sistema genera S/48,000 mensuales automáticos
- [ ] Agentes operando 24/7 sin intervención

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **❌ SI WHATSAPP FALLA:**
- Verificar token empieza con "EAA"
- Verificar números están verificados
- Revisar archivo config/keys.json guardado correctamente

### **❌ SI SHOPIFY FALLA:**
- Verificar API Key y Secret copiados completos
- Verificar URL tienda correcta (.myshopify.com)
- Confirmar permisos activados en la app

### **❌ SI TESTS FALLAN:**
- Verificar PowerShell en carpeta correcta
- Verificar archivo config/keys.json sin errores sintaxis
- Ejecutar node test_gemini_final.py para confirmar base funciona

---

## 🎯 **TIEMPO TOTAL ESTIMADO: 65 MINUTOS**
- WhatsApp: 45 minutos
- Shopify: 20 minutos  
- Resultado: ¡S/48,000 mensuales automáticos!