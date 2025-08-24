// scripts/get-product-details.js
// Obtiene y muestra todos los detalles de un producto específico de Shopify.
// Uso: node scripts/get-product-details.js <product_id>

import fetch from 'node-fetch';
import { api, headersJSON } from './_shopify.js';

async function getProductDetails(productId) {
  if (!productId) {
    console.error('❌ Error: Se requiere un ID de producto.');
    console.log('Uso: node scripts/get-product-details.js <product_id>');
    return;
  }

  const url = api(`products/${productId}.json`);
  console.log(`▶️ Obteniendo detalles del producto ID: ${productId} desde ${url}`);

  try {
    const res = await fetch(url, { headers: headersJSON });

    if (!res.ok) {
      console.error(`❌ Error al obtener el producto ${productId}. Status: ${res.status}`);
      const txt = await res.text();
      console.error(txt.slice(0, 500));
      return;
    }

    const json = await res.json();
    console.log('✅ Detalles del producto obtenidos:');
    console.log(JSON.stringify(json, null, 2)); // Imprime el JSON completo y formateado
  } catch (e) {
    console.error('❌ Fallo la ejecución de la obtención:', e);
  }
}

// Capturar argumentos de la línea de comandos
const [, , productId] = process.argv;

getProductDetails(productId);
