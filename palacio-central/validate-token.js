import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function validateToken() {
  const token = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
  
  console.log('🔍 Validando formato del token...');
  console.log(`Token completo: ${token}`);
  console.log(`Longitud: ${token?.length || 0} caracteres`);
  console.log(`Prefijo válido: ${token?.startsWith('shpat_')}`);
  console.log(`Solo caracteres válidos: ${/^[a-zA-Z0-9_]+$/.test(token || '')}`);
  
  // Intentar diferentes dominios
  const domains = [
    'goio-store.myshopify.com',
    'goio-dev.myshopify.com',
    'skhqgs-e7.myshopify.com'  // El dominio mencionado anteriormente
  ];
  
  for (const domain of domains) {
    console.log(`\n🔍 Probando dominio: ${domain}`);
    try {
      const url = `https://${domain}/admin/api/2024-10/shop.json`;
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('❌ Token no autorizado para este dominio');
      } else if (response.status === 404) {
        console.log('❌ Dominio no existe');
      } else if (response.ok) {
        const data = await response.json();
        console.log(`✅ ¡ÉXITO! Tienda encontrada: ${data.shop.name}`);
        console.log(`Plan: ${data.shop.plan_name}`);
        console.log(`Dominio correcto: ${domain}`);
        return;
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🚨 CONCLUSIÓN: Token inválido para todos los dominios probados');
}

validateToken();