// scripts/seed-products.js
// Crea 3 productos piloto (o los que encuentre en ./data/seed.json)
// Usa helper _shopify.js para API base y headers

import { readFileSync, existsSync } from 'fs';
import fetch from 'node-fetch';
import { api, headersJSON } from './_shopify.js';

// 1) Cargar datos de semilla desde la configuración principal
function loadSeed() {
  const path = './config/products.json'; // RUTA CORREGIDA
  if (existsSync(path)) {
    try {
      const raw = readFileSync(path, 'utf8');
      const json = JSON.parse(raw);
      if (Array.isArray(json) && json.length) {
        console.log(`Cargados ${json.length} productos desde ${path}`);
        return json;
      }
    } catch (e) {
      console.error(`Error al cargar o parsear ${path}:`, e);
      return []; // Devuelve vacío si hay error
    }
  }
  console.log(`Archivo de productos no encontrado en ${path}. No se crearán productos.`);
  return []; // Devuelve vacío si no existe
}

// 2) Crear producto en Shopify
async function createProduct(p) {
  const body = { product: p };
  const res = await fetch(api('products.json'), {
    method: 'POST',
    headers: headersJSON,
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  if (!res.ok) {
    console.error('❌ Seed product error', res.status, txt.slice(0, 400));
    return null;
  }
  try {
    const j = JSON.parse(txt);
    return j.product;
  } catch {
    console.error('❌ JSON parse error:', txt.slice(0, 200));
    return null;
  }
}

// 3) Main
(async () => {
  const items = loadSeed();
  console.log(`▶️ Sembrando ${items.length} productos…`);

  const created = [];
  for (const p of items) {
    const prod = await createProduct(p);
    if (prod) {
      const v = prod.variants?.[0];
      created.push({
        id: prod.id,
        title: prod.title,
        price: v?.price,
        variant_id: v?.id,
        handle: prod.handle
      });
      console.log(`✅ ${prod.title} | precio S/ ${v?.price} | variant_id=${v?.id}`);
    }
    // evita rate limit
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n📦 Productos creados:');
  for (const c of created) {
    console.log(`• ${c.title} | S/ ${c.price} | variant_id=${c.variant_id} | /products/${c.handle}`);
  }
})();