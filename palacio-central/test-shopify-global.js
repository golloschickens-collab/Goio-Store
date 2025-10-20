
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
        const response = await fetch(`${url}/admin/api/2024-07/shop.json`, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa');
            console.log(`🏪 Tienda: ${data.shop.name}`);
            console.log(`🌐 Dominio: ${data.shop.domain}`);
            console.log(`💰 Moneda: ${data.shop.currency}`);
            console.log(`📧 Email: ${data.shop.email}`);
        } else {
            console.log('❌ Error de conexión:', response.status);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testShopifyGlobal();
