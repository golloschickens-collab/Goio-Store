import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function quickValidation() {
  const domain = process.env.SHOPIFY_DOMAIN_PROD;
  const token = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
  
  console.log('🔍 Validación rápida con nuevas credenciales...');
  console.log(`Domain: ${domain}`);
  console.log(`Token: ${token?.substring(0, 10)}...`);
  
  try {
    // Test products endpoint
    const url = `https://${domain}/admin/api/2024-10/products.json`;
    console.log(`Testing: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ¡TOKEN VÁLIDO!');
      console.log(`Productos existentes: ${data.products?.length || 0}`);
      
      // Test shop endpoint for store info
      const shopUrl = `https://${domain}/admin/api/2024-10/shop.json`;
      const shopResponse = await fetch(shopUrl, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        console.log(`Tienda: ${shopData.shop.name}`);
        console.log(`Plan: ${shopData.shop.plan_name}`);
        console.log(`Email: ${shopData.shop.email}`);
      }
      
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Token aún inválido');
      console.log(`Error: ${errorText.substring(0, 200)}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

quickValidation();