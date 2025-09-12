
// scripts/update-product.js
// Modifica un producto existente en Shopify, específicamente su body_html.
// Uso: node scripts/update-product.js <product_id> "<nuevo_body_html>"

import fetch from 'node-fetch';
import { api, headersJSON } from './_shopify.js';

async function updateProduct(productId, newBodyHtml) {
  if (!productId || !newBodyHtml) {
    console.error('❌ Error: Se requiere un ID de producto y un contenido HTML.');
    console.log('Uso: node scripts/update-product.js <product_id> "<nuevo_body_html>"');
    return;
  }

  const body = {
    product: {
      id: productId,
      body_html: newBodyHtml,
    },
  };

  const url = api(`products/${productId}.json`);
  console.log(`▶️ Actualizando producto ID: ${productId} en ${url}`);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: headersJSON,
      body: JSON.stringify(body),
    });

    const txt = await res.text();

    if (!res.ok) {
      console.error(`❌ Error al actualizar producto ${productId}. Status: ${res.status}`);
      console.error(txt.slice(0, 500));
      return null;
    }

    const json = JSON.parse(txt);
    console.log(`✅ Producto ${productId} actualizado con éxito. Nuevo título: ${json.product.title}`);
    return json.product;
  } catch (e) {
    console.error('❌ Fallo la ejecución de la actualización:', e);
    return null;
  }
}

// Capturar argumentos de la línea de comandos
const [, , productId, newBodyHtml] = process.argv;

updateProduct(productId, newBodyHtml);
