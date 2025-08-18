import fetch from 'node-fetch';
import { api, headers, shop } from './_shopify.js';

async function ping(path) {
  const url = api(path);
  const r = await fetch(url, { headers });
  const t = await r.text();
  console.log(`→ ${path} : HTTP ${r.status}`);
  if (!r.ok) console.log(t.slice(0, 400));
}

console.log(`Tienda: ${shop}`);
await ping('shop.json');                  // prueba básica

// oauth/access_scopes.json is not a versioned endpoint, so we call it directly.
const unversionedUrl = `https://${shop}/admin/oauth/access_scopes.json`;
const r = await fetch(unversionedUrl, { headers });
const t = await r.text();
console.log(`→ oauth/access_scopes.json : HTTP ${r.status}`);
if (!r.ok) console.log(t.slice(0, 400));