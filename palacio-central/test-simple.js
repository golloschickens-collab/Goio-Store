import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

// Cargar variables de entorno
config();

console.log('=== TESTING ENV VARS ===');
console.log('Domain:', process.env.SHOPIFY_DOMAIN_PROD);
console.log('Token exists:', !!process.env.SHOPIFY_ADMIN_TOKEN_PROD);
console.log('Token preview:', process.env.SHOPIFY_ADMIN_TOKEN_PROD?.substring(0, 10) + '...');

async function testAPI() {
  const shopifyConfig = {
    domain: process.env.SHOPIFY_DOMAIN_PROD,
    token: process.env.SHOPIFY_ADMIN_TOKEN_PROD
  };

  if (!shopifyConfig.domain || !shopifyConfig.token) {
    console.error('❌ Missing credentials');
    return;
  }

  console.log('✅ Testing API connection...');
  
  try {
    const response = await fetch(`https://${shopifyConfig.domain}/admin/api/2024-10/products.json?limit=1`, {
      headers: {
        'X-Shopify-Access-Token': shopifyConfig.token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API working! Products found:', data.products?.length || 0);
      
      // Ahora probemos crear un producto
      await testCreateProduct(shopifyConfig);
    } else {
      console.error('❌ API failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testCreateProduct(shopifyConfig) {
  console.log('🧪 Testing product creation...');
  
  const testProduct = {
    title: "Test Product " + Date.now(),
    body_html: "This is a test product created by the listing agent.",
    vendor: "Goio",
    product_type: "Test",
    status: "draft",
    variants: [{
      price: "29.99",
      inventory_quantity: 10,
      weight: 0.5,
      weight_unit: "kg"
    }]
  };

  try {
    const response = await fetch(`https://${shopifyConfig.domain}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyConfig.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product: testProduct })
    });

    console.log('Create response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Product created successfully!');
      console.log('Product ID:', data.product.id);
      console.log('Product title:', data.product.title);
    } else {
      const errorText = await response.text();
      console.error('❌ Create failed:', errorText);
    }
  } catch (error) {
    console.error('❌ Create error:', error.message);
  }
}

testAPI();