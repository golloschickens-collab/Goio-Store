import dotenv from 'dotenv';
import { existsSync } from 'fs';

const env = process.env.SHOPIFY_ENV || 'prod';
const candidates = [`.env.${env}`, '.env.local', '.env'];
const chosen = candidates.find(p => existsSync(p));
dotenv.config({ path: chosen });

// 👇 Log mínimo para diagnóstico (no imprime token)
console.log(`[ENV] SHOPIFY_ENV=${env} | .env usado=${chosen}`);

export const shop  = process.env.SHOPIFY_STORE_DOMAIN;
export const token = process.env.SHOPIFY_ACCESS_TOKEN;
export const API   = process.env.SHOPIFY_API_VERSION || '2024-07';

if (!shop || !token) {
  console.error('❌ Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ACCESS_TOKEN');
  process.exit(1);
}

// Si pides PROD, exige que realmente use .env.prod
if (env === 'prod' && !(chosen && chosen.endsWith('.env.prod'))) {
  throw new Error(`Esperaba .env.prod pero se cargó: ${chosen}. Crea .env.prod o ejecuta con SHOPIFY_ENV=prod`);
}

export const api         = (p) => `https://${shop}/admin/api/${API}/${p}`;
export const headers     = { 'X-Shopify-Access-Token': token };
export const headersJSON = { ...headers, 'Content-Type': 'application/json' };