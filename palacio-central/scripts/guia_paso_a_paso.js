#!/usr/bin/env node

/**
 * 🏰 GUÍA PASO A PASO - CONFIGURACIÓN IMPERIAL
 * Siguiendo el método exitoso usado con Gemini API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
👑 ============================================
    GUÍA PASO A PASO - CONFIGURACIÓN IMPERIAL
👑 ============================================

🎯 OBJETIVO: Configurar las 2 integraciones críticas para monetización automática

📱 PASO 1: WHATSAPP BUSINESS API
🛒 PASO 2: SHOPIFY INTEGRATION

¡Vamos paso a paso como hicimos con Gemini!

`);

async function mostrarPaso1WhatsApp() {
    console.log(`
📱 ============================================
         PASO 1: WHATSAPP BUSINESS API
📱 ============================================

🔥 MÉTODO PROBADO (Como hicimos con Gemini):

✅ PASO 1.1: REGISTRO
   🌐 Ir a: https://business.whatsapp.com/products/business-api
   📝 Crear cuenta business
   ⏱️ Tiempo: 5 minutos

✅ PASO 1.2: VERIFICACIÓN NÚMEROS
   📞 Registrar números:
      • +51 939431888 (Gollos Chickens)
      • +51 939431889 (Goio-Store)  
      • +51 939431890 (Eco-Eterno)
   ⏱️ Tiempo: 10 minutos c/u

✅ PASO 1.3: OBTENER TOKEN
   🔑 Copiar Access Token (como hicimos con Gemini)
   📄 Guardar en config/keys.json
   ⏱️ Tiempo: 2 minutos

✅ PASO 1.4: TESTING
   🧪 Probar envío de mensaje
   ✅ Validar funcionamiento
   ⏱️ Tiempo: 5 minutos

🎊 TOTAL TIEMPO ESTIMADO: 45 minutos
💰 COSTO: GRATIS primeros 1000 mensajes/mes

`);
}

async function mostrarPaso2Shopify() {
    console.log(`
🛒 ============================================
         PASO 2: SHOPIFY INTEGRATION  
🛒 ============================================

🔥 MÉTODO PROBADO (Igual que Gemini):

✅ PASO 2.1: ACCESO A SHOPIFY
   🌐 Ir a tu panel de Shopify Admin
   ⚙️ Settings → Apps and sales channels
   ⏱️ Tiempo: 2 minutos

✅ PASO 2.2: CREAR APP PRIVADA
   🔧 Develop apps → Create private app
   📝 Nombre: "Goio Imperial Agent"
   ⏱️ Tiempo: 3 minutos

✅ PASO 2.3: PERMISOS API
   ✅ Products: Read/Write
   ✅ Inventory: Read/Write  
   ✅ Orders: Read/Write
   ⏱️ Tiempo: 5 minutos

✅ PASO 2.4: OBTENER KEYS
   🔑 Copiar API Key + Secret (como Gemini)
   📄 Guardar en config/keys.json
   ⏱️ Tiempo: 2 minutos

✅ PASO 2.5: TESTING
   🧪 Probar crear producto de prueba
   ✅ Validar funcionamiento
   ⏱️ Tiempo: 5 minutos

🎊 TOTAL TIEMPO ESTIMADO: 20 minutos
💰 COSTO: GRATIS (incluido en plan Shopify)

`);
}

async function crearArchivoConfiguracion() {
    const configTemplate = {
        "whatsapp": {
            "status": "PENDIENTE",
            "access_token": "TU_WHATSAPP_TOKEN_AQUI",
            "numeros": {
                "gollos_chickens": "+51939431888",
                "goio_store": "+51939431889", 
                "eco_eterno": "+51939431890"
            },
            "webhook_url": "http://localhost:8000/api/webhooks/whatsapp"
        },
        "shopify": {
            "status": "PENDIENTE",
            "api_key": "TU_SHOPIFY_API_KEY_AQUI",
            "api_secret": "TU_SHOPIFY_SECRET_AQUI",
            "shop_url": "tu-tienda.myshopify.com",
            "webhooks": {
                "orders": "http://localhost:8000/api/webhooks/shopify/orders",
                "products": "http://localhost:8000/api/webhooks/shopify/products"
            }
        }
    };

    // Leer keys.json actual
    const keysPath = path.join(__dirname, '../config/keys.json');
    let currentKeys = {};
    
    try {
        const keysContent = fs.readFileSync(keysPath, 'utf8');
        currentKeys = JSON.parse(keysContent);
    } catch (error) {
        console.log("⚠️ Archivo keys.json no encontrado, creando nuevo...");
    }

    // Combinar configuraciones
    const updatedKeys = {
        ...currentKeys,
        ...configTemplate
    };

    // Guardar archivo actualizado
    fs.writeFileSync(keysPath, JSON.stringify(updatedKeys, null, 2));
    
    console.log(`
📄 ============================================
        ARCHIVO DE CONFIGURACIÓN CREADO
📄 ============================================

✅ Archivo actualizado: config/keys.json
📝 Template creado para WhatsApp y Shopify
🔧 Listo para recibir tus API keys

PRÓXIMO PASO: Seguir la guía paso a paso arriba ⬆️

`);
}

// Ejecutar guía completa
mostrarPaso1WhatsApp();
mostrarPaso2Shopify();
crearArchivoConfiguracion();