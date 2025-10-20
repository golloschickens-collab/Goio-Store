require('dotenv').config();
const fetch = require('node-fetch');

/**
 * 🧾 TEST DE VERIFICACIÓN SHOPIFY REAL
 * ===================================
 * 
 * Script para verificar si las credenciales Shopify
 * están configuradas correctamente y conectan a una tienda real
 */

console.log(`
🧾 TEST DE VERIFICACIÓN SHOPIFY REAL
====================================

🔍 Verificando credenciales y conexión...
📊 Probando acceso a productos reales...
⚡ Determinando si estás en modo demo o real...
`);

async function verificarShopify() {
    console.log('\n🔍 VERIFICANDO CONFIGURACIÓN .ENV...');
    
    // Verificar variables de entorno
    const config = {
        shopify_domain: process.env.SHOPIFY_DOMAIN_PROD || process.env.SHOPIFY_STORE_URL,
        access_token: process.env.SHOPIFY_ADMIN_TOKEN_PROD || process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        api_key: process.env.SHOPIFY_API_KEY_PROD || process.env.SHOPIFY_API_KEY
    };
    
    console.log(`[Config] 🏪 Dominio Shopify: ${config.shopify_domain || 'NO CONFIGURADO'}`);
    console.log(`[Config] 🔑 Access Token: ${config.access_token ? `${config.access_token.substring(0, 10)}...` : 'NO CONFIGURADO'}`);
    console.log(`[Config] 🔧 API Key: ${config.api_key || 'NO CONFIGURADO'}`);
    
    // Verificar configuración mínima
    if (!config.shopify_domain) {
        console.log('\n❌ ERROR: SHOPIFY_DOMAIN_PROD no está configurado en .env');
        console.log('💡 Agrega: SHOPIFY_DOMAIN_PROD=tutienda.myshopify.com');
        return false;
    }
    
    if (!config.access_token) {
        console.log('\n❌ ERROR: SHOPIFY_ADMIN_TOKEN_PROD no está configurado en .env');
        console.log('💡 Agrega: SHOPIFY_ADMIN_TOKEN_PROD=tu_access_token_real');
        return false;
    }
    
    // Verificar si parece token real o placeholder
    if (config.access_token.includes('pending') || config.access_token.includes('placeholder')) {
        console.log('\n⚠️ WARNING: Access token parece ser un placeholder');
        console.log('🔧 Necesitas obtener token real desde Shopify Admin');
    }
    
    console.log('\n✅ Configuración básica presente');
    
    // Test de conexión real
    console.log('\n🌐 PROBANDO CONEXIÓN A SHOPIFY...');
    
    try {
        const shopDomain = config.shopify_domain.replace('https://', '').replace('http://', '');
        const url = `https://${shopDomain}/admin/api/2024-07/products.json?limit=10`;
        
        console.log(`[Test] 🔗 URL: ${url}`);
        console.log(`[Test] 🔑 Token: ${config.access_token.substring(0, 15)}...`);
        
        const response = await fetch(url, {
            headers: {
                "X-Shopify-Access-Token": config.access_token,
                "Content-Type": "application/json"
            }
        });
        
        console.log(`[Test] 📡 Response Status: ${response.status}`);
        
        if (response.status === 401) {
            console.log('\n❌ ERROR 401: Access token inválido o vencido');
            console.log('🔧 Solución: Genera nuevo token en Shopify Admin');
            console.log('📍 Shopify Admin → Settings → Apps → Create app → Admin API');
            return false;
        }
        
        if (response.status === 403) {
            console.log('\n❌ ERROR 403: Token no tiene permisos suficientes');
            console.log('🔧 Solución: Configura permisos Read/Write para products');
            return false;
        }
        
        if (response.status === 404) {
            console.log('\n❌ ERROR 404: Dominio de tienda incorrecto');
            console.log(`🔧 Verifica que ${shopDomain} sea correcto`);
            return false;
        }
        
        if (!response.ok) {
            console.log(`\n❌ ERROR ${response.status}: ${response.statusText}`);
            const errorText = await response.text();
            console.log(`[Error] ${errorText}`);
            return false;
        }
        
        const data = await response.json();
        
        console.log('\n🎉 CONEXIÓN EXITOSA A SHOPIFY');
        console.log(`[Productos] 📦 Total detectados: ${data.products?.length || 0}`);
        
        if (data.products && data.products.length > 0) {
            console.log('\n📦 PRODUCTOS ENCONTRADOS:');
            data.products.slice(0, 5).forEach((product, index) => {
                console.log(`[${index + 1}] ${product.title} - Status: ${product.status} - ID: ${product.id}`);
            });
            
            const productosActivos = data.products.filter(p => p.status === 'active').length;
            const productosDraft = data.products.filter(p => p.status === 'draft').length;
            
            console.log(`\n📊 ANÁLISIS DE PRODUCTOS:`);
            console.log(`[Status] ✅ Activos (se pueden vender): ${productosActivos}`);
            console.log(`[Status] 📝 Draft (no visibles): ${productosDraft}`);
            
            if (productosActivos === 0) {
                console.log('\n⚠️ WARNING: No hay productos activos');
                console.log('🔧 Necesitas cambiar productos de Draft a Active');
                console.log('📍 Shopify Admin → Products → Edit → Status: Active');
            } else {
                console.log('\n✅ TIENDA LISTA PARA VENDER');
            }
        } else {
            console.log('\n⚠️ TIENDA VACÍA: No hay productos configurados');
            console.log('🔧 Necesitas agregar productos a tu tienda');
        }
        
        // Test adicional: info de la tienda
        console.log('\n🏪 PROBANDO INFO DE TIENDA...');
        const shopUrl = `https://${shopDomain}/admin/api/2024-07/shop.json`;
        const shopResponse = await fetch(shopUrl, {
            headers: {
                "X-Shopify-Access-Token": config.access_token,
                "Content-Type": "application/json"
            }
        });
        
        if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            console.log(`[Tienda] 🏷️ Nombre: ${shopData.shop.name}`);
            console.log(`[Tienda] 🌍 Dominio: ${shopData.shop.domain}`);
            console.log(`[Tienda] 💰 Moneda: ${shopData.shop.currency}`);
            console.log(`[Tienda] 📧 Email: ${shopData.shop.email}`);
            console.log(`[Tienda] 📅 Creada: ${new Date(shopData.shop.created_at).toLocaleDateString()}`);
        }
        
        return true;
        
    } catch (error) {
        console.log('\n❌ ERROR DE CONEXIÓN:');
        console.log(`[Error] ${error.message}`);
        
        if (error.message.includes('fetch')) {
            console.log('🔧 Posible problema de red o URL incorrecta');
        }
        
        return false;
    }
}

async function verificarModoOperacion() {
    console.log('\n🔍 VERIFICANDO MODO DE OPERACIÓN...');
    
    // Buscar archivos que usen datos simulados
    const fs = require('fs');
    const path = require('path');
    
    const archivosParaRevisar = [
        'dashboard-imperial.js',
        'sistema-reacciones-imperial.js',
        'expansion-imperial-multitienda.js'
    ];
    
    let modoDemo = false;
    
    for (const archivo of archivosParaRevisar) {
        const rutaArchivo = path.join(__dirname, archivo);
        if (fs.existsSync(rutaArchivo)) {
            const contenido = fs.readFileSync(rutaArchivo, 'utf8');
            
            // Buscar indicadores de datos simulados
            const indicadoresDemo = [
                'Math.random()',
                'simulado',
                'demo',
                'placeholder',
                'fake',
                'mock'
            ];
            
            let esModoDemo = false;
            indicadoresDemo.forEach(indicador => {
                if (contenido.includes(indicador)) {
                    esModoDemo = true;
                }
            });
            
            console.log(`[Archivo] ${archivo}: ${esModoDemo ? '🟡 MODO DEMO' : '🟢 MODO REAL'}`);
            
            if (esModoDemo) {
                modoDemo = true;
            }
        }
    }
    
    return !modoDemo;
}

async function main() {
    const startTime = Date.now();
    
    try {
        console.log('[Verificación] 🚀 Iniciando verificación Shopify...');
        
        // 1. Verificar configuración y conexión Shopify
        const shopifyOk = await verificarShopify();
        
        // 2. Verificar modo de operación del sistema
        const modoReal = await verificarModoOperacion();
        
        const endTime = Date.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`
🎉 === VERIFICACIÓN SHOPIFY COMPLETADA ===

🔍 === RESULTADOS ===
🔗 Conexión Shopify: ${shopifyOk ? '✅ EXITOSA' : '❌ FALLIDA'}
⚙️ Modo operación: ${modoReal ? '🟢 REAL' : '🟡 DEMO'}
📊 Credenciales: ${shopifyOk ? '✅ VÁLIDAS' : '❌ INVÁLIDAS'}

${shopifyOk ? `
✅ === ESTADO: MODO REAL OPERATIVO ===
🎯 Tu sistema puede conectarse a Shopify
💰 Puedes generar ingresos reales
📦 Productos detectados en tu tienda
🚀 Sistema listo para operación real

📋 PRÓXIMOS PASOS:
1. Verificar que productos estén Active
2. Configurar métodos de pago en Shopify
3. Lanzar campañas de tráfico
4. Monitorear primeras ventas

` : `
⚠️ === ESTADO: CONFIGURACIÓN INCOMPLETA ===
🔧 Necesitas configurar credenciales Shopify reales
📍 Ve a Shopify Admin → Settings → Apps → Create app
🔑 Obtén Admin API access token
📝 Actualiza .env con credenciales reales

🚨 PASOS CRÍTICOS:
1. Crear/acceder tienda Shopify
2. Crear app privada con permisos
3. Copiar access token al .env
4. Ejecutar este test nuevamente
`}

⏱️ Tiempo verificación: ${executionTime}s
🆔 Test ID: verification_${Date.now()}

${shopifyOk ? '🚀 LISTO PARA GENERAR DINERO REAL' : '🔧 CONFIGURACIÓN PENDIENTE'}
`);
        
        return {
            success: shopifyOk,
            shopifyConectado: shopifyOk,
            modoReal: modoReal,
            executionTime
        };
        
    } catch (error) {
        console.error(`[Verificación] ❌ Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar verificación
main().catch(console.error);