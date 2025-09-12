import { api, headers } from './_shopify.js';

const url = api('shop.json');

try {
  const r = await fetch(url, { headers: headers });
  const text = await r.text();
  console.log('HTTP', r.status);
  if (r.ok) {
    console.log('✅ Conexión correcta con Shopify. Resumen:', text.slice(0,200), '...');
    process.exit(0);
  } else {
    console.log('❌ Error de conexión. Respuesta:', text.slice(0,400));
    process.exit(2);
  }
} catch (e) {
  console.error('❌ Excepción al conectar:', e.message);
  process.exit(3);
}