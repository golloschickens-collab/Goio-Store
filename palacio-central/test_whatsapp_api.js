#!/usr/bin/env node

/**
 * 🧪 TESTER WHATSAPP API
 * Script para probar la API de WhatsApp (similar al test de Gemini)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testWhatsAppAPI() {
    console.log(`
📱 ============================================
        TESTER WHATSAPP BUSINESS API
📱 ============================================

🔧 Cargando configuración...
`);

    try {
        // Cargar configuración
        const keysPath = path.join(__dirname, 'config/keys.json');
        const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
        
        if (!keys.whatsapp || !keys.whatsapp.access_token || keys.whatsapp.access_token === "TU_WHATSAPP_TOKEN_AQUI") {
            console.log(`
❌ ERROR: Token de WhatsApp no configurado

🔧 CONFIGURACIÓN PENDIENTE:
1. Ve a: https://business.whatsapp.com/products/business-api
2. Obtén tu Access Token
3. Reemplaza "TU_WHATSAPP_TOKEN_AQUI" en config/keys.json
4. Ejecuta este script nuevamente

⏱️ Tiempo estimado: 10 minutos
            `);
            return;
        }

        console.log("✅ Token encontrado, probando conexión...");

        // Test básico de la API
        const testMessage = {
            messaging_product: "whatsapp",
            to: keys.whatsapp.numeros.gollos_chickens.replace('+', ''),
            type: "text",
            text: {
                body: "🎊 ¡Test exitoso! Tu agente imperial WhatsApp está funcionando. Este es un mensaje de prueba automático."
            }
        };

        console.log(`
🧪 SIMULANDO ENVÍO DE MENSAJE DE PRUEBA:
📞 Para: ${keys.whatsapp.numeros.gollos_chickens}
💬 Mensaje: "${testMessage.text.body}"

🔄 Estado: CONFIGURACIÓN LISTA
✅ Próximo paso: Envío real cuando tengas el token válido
        `);

        // Crear log de test
        const testLog = {
            timestamp: new Date().toISOString(),
            test: "whatsapp_api",
            status: "READY_FOR_TOKEN",
            config_status: "TEMPLATE_CREATED",
            next_steps: [
                "Obtener token real de WhatsApp Business API",
                "Reemplazar token en config/keys.json",
                "Ejecutar test nuevamente"
            ]
        };

        fs.writeFileSync(
            path.join(__dirname, 'logs/whatsapp_test.json'),
            JSON.stringify(testLog, null, 2)
        );

        console.log(`
📄 Log guardado: logs/whatsapp_test.json
🎯 ¡Script listo para cuando tengas el token real!
        `);

    } catch (error) {
        console.error("❌ Error en test:", error.message);
    }
}

// Ejecutar test
testWhatsAppAPI();