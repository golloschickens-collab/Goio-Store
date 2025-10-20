import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

async function testShopifyConnection() {
  const domain = process.env.SHOPIFY_DOMAIN_PROD;
  const token = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
  
  console.log('🔍 Probando conexión con Shopify...');
  console.log(`Domain: ${domain}`);
  console.log(`Token: ${token?.substring(0, 10)}...`);
  
  if (!domain || !token) {
    console.error('❌ Faltan credenciales');
    return;
  }
  
  try {
    const url = `https://${domain}/admin/api/2023-10/shop.json`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error HTTP ${response.status}:`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Conexión exitosa!');
    console.log(`Tienda: ${data.shop.name}`);
    console.log(`Plan: ${data.shop.plan_name}`);
    console.log(`Domain: ${data.shop.domain}`);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testShopifyConnection();