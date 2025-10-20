import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testMultipleEndpoints() {
  const domain = process.env.SHOPIFY_DOMAIN_PROD;
  const token = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
  
  console.log('🔍 Probando múltiples endpoints de Shopify...');
  
  const testUrls = [
    `https://${domain}/admin/api/2024-10/shop.json`,
    `https://${domain}/admin/api/2024-07/shop.json`,
    `https://${domain}/admin/api/2024-04/shop.json`,
    `https://${domain}/admin/api/2023-10/shop.json`
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      
      const version = url.match(/api\/([^\/]+)\//)[1];
      console.log(`API ${version}: Status ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with API ${version}!`);
        console.log(`Tienda: ${data.shop.name}`);
        console.log(`Plan: ${data.shop.plan_name}`);
        break;
      } else {
        const errorText = await response.text();
        console.log(`❌ ${version}: ${errorText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.error(`Error with ${url}:`, error.message);
    }
  }
}

testMultipleEndpoints();