// scripts/update-variant-price.js
// Modifica el precio y el precio de comparación de una variante de producto específica.
// Uso: node scripts/update-variant-price.js <variant_id> <nuevo_precio> [nuevo_precio_comparacion]

import fetch from 'node-fetch';
import { api, headersJSON } from './_shopify.js';

async function updateVariantPrice(variantId, price, compareAtPrice) {
  if (!variantId || !price) {
    console.error('❌ Error: Se requiere un ID de variante y un precio.');
    console.log('Uso: node scripts/update-variant-price.js <variant_id> <nuevo_precio> [nuevo_precio_comparacion]');
    return;
  }

  const body = {
    variant: {
      id: variantId,
      price: price,
    },
  };

  if (compareAtPrice) {
    body.variant.compare_at_price = compareAtPrice;
  }

  const url = api(`variants/${variantId}.json`);
  console.log(`▶️ Actualizando variante ID: ${variantId} en ${url}`);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: headersJSON,
      body: JSON.stringify(body),
    });

    const txt = await res.text();

    if (!res.ok) {
      console.error(`❌ Error al actualizar la variante ${variantId}. Status: ${res.status}`);
      console.error(txt.slice(0, 500));
      return null;
    }

    const json = JSON.parse(txt);
    console.log(`✅ Variante ${variantId} actualizada con éxito.`);
    return json.variant;
  } catch (e) {
    console.error('❌ Fallo la ejecución de la actualización:', e);
    return null;
  }
}

// Capturar argumentos de la línea de comandos
const [, , variantId, price, compareAtPrice] = process.argv;

updateVariantPrice(variantId, price, compareAtPrice);
