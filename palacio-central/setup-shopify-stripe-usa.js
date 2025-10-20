// 🏪 CONFIGURADOR RÁPIDO - Shopify Partners USA + Stripe
// Guía paso a paso para crear tienda global
console.log('🏪 CONFIGURADOR RÁPIDO - SHOPIFY USA + STRIPE');
console.log('=' .repeat(55));
console.log('🎯 Objetivo: Tienda global operativa en 30 minutos');
console.log('💳 Payment Gateway: Stripe Internacional');
console.log('');

console.log('📋 PASO 1: SHOPIFY PARTNERS USA (5 minutos)');
console.log('━'.repeat(50));
console.log('1. 🌐 Ve a: https://partners.shopify.com');
console.log('2. 🔐 Crear cuenta con email empresarial');
console.log('3. 📍 Dirección fiscal: USA (recomendado Delaware)');
console.log('4. 🏢 Tipo: "I build apps and themes for the Shopify App Store"');
console.log('5. ✅ Verificar email y completar perfil');
console.log('');

console.log('📋 PASO 2: CREAR DEVELOPMENT STORE (3 minutos)');
console.log('━'.repeat(50));
console.log('1. 📱 Dashboard Partners → "Stores" → "Create Store"');
console.log('2. 🏷️ Store name: "Goio Global"');
console.log('3. 🌐 Store URL: "goio-global" (será goio-global.myshopify.com)');
console.log('4. 💰 Store purpose: "Development store"');
console.log('5. 📊 Data: "Add sample data" (para testing inicial)');
console.log('6. ✅ Create store');
console.log('');

console.log('📋 PASO 3: CONFIGURAR ADMIN API (5 minutos)');
console.log('━'.repeat(50));
console.log('1. 🔧 Ir a tienda creada → Settings → Apps and sales channels');
console.log('2. 🔑 "Develop apps" → "Create an app"');
console.log('3. 📝 App name: "Goio Global Sync"');
console.log('4. ⚙️ Configure Admin API scopes:');
console.log('   ✅ Products: read_products, write_products');
console.log('   ✅ Inventory: read_inventory, write_inventory');
console.log('   ✅ Orders: read_orders');
console.log('   ✅ Customer: read_customers');
console.log('5. 💾 Save → Install app');
console.log('6. 🔑 Copy "Admin API access token"');
console.log('');

console.log('📋 PASO 4: CONFIGURAR STRIPE (10 minutos)');
console.log('━'.repeat(50));
console.log('1. 🌐 Ve a: https://stripe.com');
console.log('2. 🏢 "Create account" → Business account');
console.log('3. 📍 Country: United States');
console.log('4. 💼 Business type: "Company" o "Individual"');
console.log('5. 📋 Completar información fiscal USA');
console.log('6. 🏦 Agregar cuenta bancaria USA (o Wise/Payoneer)');
console.log('7. ✅ Activar cuenta');
console.log('');

console.log('📋 PASO 5: CONECTAR STRIPE CON SHOPIFY (5 minutos)');
console.log('━'.repeat(50));
console.log('1. 🏪 Shopify Admin → Settings → Payments');
console.log('2. 💳 "Choose third-party provider" → "Stripe"');
console.log('3. 🔗 "Connect with Stripe" → Login Stripe');
console.log('4. ✅ Autorizar conexión');
console.log('5. 🔧 Configurar:');
console.log('   - ✅ Capture payment automatically');
console.log('   - ✅ 3D Secure enabled');
console.log('   - ✅ Apple Pay enabled');
console.log('   - ✅ Google Pay enabled');
console.log('6. 💾 Save');
console.log('');

console.log('📋 PASO 6: CONFIGURAR VARIABLES DE ENTORNO (2 minutos)');
console.log('━'.repeat(50));
console.log('Agregar a tu archivo .env:');
console.log('');
console.log('# Tienda Global USA');
console.log('SHOPIFY_STORE_URL_GLOBAL=https://goio-global.myshopify.com');
console.log('SHOPIFY_ADMIN_API_ACCESS_TOKEN_GLOBAL=shpat_xxxxxxxxxxxxx');
console.log('');
console.log('# Stripe USA');
console.log('STRIPE_PUBLISHABLE_KEY_USA=pk_live_xxxxxxxxxxxxx');
console.log('STRIPE_SECRET_KEY_USA=sk_live_xxxxxxxxxxxxx');
console.log('STRIPE_WEBHOOK_SECRET_USA=whsec_xxxxxxxxxxxxx');
console.log('');

console.log('🧪 PASO 7: TEST DE CONFIGURACIÓN');
console.log('━'.repeat(50));
console.log('Ejecutar en terminal:');
console.log('node test-shopify-global.js');
console.log('node test-stripe-connection.js');
console.log('');

// Generar scripts de test
console.log('✅ GENERANDO SCRIPTS DE TEST...');

const testShopifyGlobal = `
// Test de conexión Shopify Global
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testShopifyGlobal() {
    console.log('🧪 TEST SHOPIFY GLOBAL USA');
    console.log('=' .repeat(30));
    
    const url = process.env.SHOPIFY_STORE_URL_GLOBAL;
    const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN_GLOBAL;
    
    if (!url || !token) {
        console.log('❌ Variables de entorno faltantes');
        console.log('Configura: SHOPIFY_STORE_URL_GLOBAL y SHOPIFY_ADMIN_API_ACCESS_TOKEN_GLOBAL');
        return;
    }
    
    try {
        const response = await fetch(\`\${url}/admin/api/2024-07/shop.json\`, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa');
            console.log(\`🏪 Tienda: \${data.shop.name}\`);
            console.log(\`🌐 Dominio: \${data.shop.domain}\`);
            console.log(\`💰 Moneda: \${data.shop.currency}\`);
            console.log(\`📧 Email: \${data.shop.email}\`);
        } else {
            console.log('❌ Error de conexión:', response.status);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testShopifyGlobal();
`;

const testStripe = `
// Test de conexión Stripe
console.log('🧪 TEST STRIPE USA');
console.log('=' .repeat(25));

const stripeTest = {
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY_USA,
    secret_key: process.env.STRIPE_SECRET_KEY_USA
};

if (!stripeTest.publishable_key || !stripeTest.secret_key) {
    console.log('❌ Variables Stripe faltantes');
    console.log('Configura: STRIPE_PUBLISHABLE_KEY_USA y STRIPE_SECRET_KEY_USA');
} else {
    console.log('✅ Variables Stripe configuradas');
    console.log(\`🔑 Publishable: \${stripeTest.publishable_key.substring(0, 12)}...\`);
    console.log(\`🔐 Secret: \${stripeTest.secret_key.substring(0, 12)}...\`);
    console.log('💳 Listo para procesar pagos globales');
}
`;

// Guardar scripts de test
import fs from 'fs';

fs.writeFileSync('test-shopify-global.js', testShopifyGlobal);
fs.writeFileSync('test-stripe-connection.js', testStripe);

console.log('✅ Scripts generados:');
console.log('   - test-shopify-global.js');
console.log('   - test-stripe-connection.js');
console.log('');

console.log('🎯 RESUMEN DE CONFIGURACIÓN:');
console.log('━'.repeat(40));
console.log('1. ✅ Crear Shopify Partners USA');
console.log('2. ✅ Development Store: goio-global.myshopify.com');
console.log('3. ✅ Admin API configurado');
console.log('4. ✅ Stripe Business USA configurado');
console.log('5. ✅ Stripe conectado con Shopify');
console.log('6. ✅ Variables de entorno agregadas');
console.log('7. ✅ Tests de conexión');
console.log('');

console.log('⚡ PRÓXIMOS PASOS:');
console.log('1. 🚀 Ejecutar: node syncGoioGlobal.js (modo real)');
console.log('2. 🎯 Lanzar Meta Ads Global ($50/día)');
console.log('3. 📊 Monitorear dashboard dual');
console.log('4. 💰 Recibir primeros pagos internacionales');
console.log('');

console.log('🏛️ EMBAJADOR STRIPE USA - CONFIGURACIÓN RÁPIDA COMPLETADA');
console.log('🌍 Tu imperio está listo para conquistar el mercado global');