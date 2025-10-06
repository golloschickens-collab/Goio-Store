import { api, headers } from './_shopify.js';
import fetch from 'node-fetch';

async function listProducts() {
  console.log('Listando productos de Shopify...');
  const url = api('products.json');
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (response.ok) {
      if (data.products && data.products.length > 0) {
        console.log('Productos encontrados:');
        data.products.forEach(product => {
          console.log(`- ${product.title} (ID: ${product.id})`);
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach(variant => {
              console.log(`  Variant: ${variant.title} (ID: ${variant.id}, SKU: ${variant.sku || 'N/A'}, Price: ${variant.price})`);
            });
          }
        });
        return data.products;
      } else {
        console.log('No se encontraron productos.');
        return [];
      }
    } else {
      console.error('❌ Error al listar productos:', data.errors ? JSON.stringify(data.errors) : response.statusText);
      return null;
    }
  } catch (error) {
    console.error('❌ Excepción al listar productos:', error.message);
    return null;
  }
}

listProducts();