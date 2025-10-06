import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Robust path resolution ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve path to .env file located in the parent directory of `scripts`
const envPath = path.resolve(__dirname, '../.env');

// Determine the environment (prod or dev)
const env = process.env.SHOPIFY_ENV || 'prod';

// Load the .env file from the resolved path
dotenv.config({ path: envPath });

let shop, token;

if (env === 'prod') {
  shop = process.env.SHOPIFY_DOMAIN_PROD;
  token = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
  console.log(`[ENV] Using PRODUCTION environment for Shopify: ${shop}`);
} else if (env === 'dev') {
  shop = process.env.SHOPIFY_DOMAIN_DEV;
  token = process.env.SHOPIFY_ADMIN_TOKEN_DEV;
  console.log(`[ENV] Using DEVELOPMENT environment for Shopify: ${shop}`);
} else {
  console.error(`❌ SHOPIFY_ENV '${env}' no es válido. Usa 'prod' o 'dev'.`);
  process.exit(1);
}

if (!shop || !token) {
  console.error(`❌ No se encontraron las credenciales para el entorno '${env}' en tu archivo .env en la ruta ${envPath}`);
  console.error(`Asegúrate de que las variables SHOPIFY_DOMAIN_${env.toUpperCase()} y SHOPIFY_ADMIN_TOKEN_${env.toUpperCase()} existan.`);
  process.exit(1);
}

export const API = process.env.SHOPIFY_API_VERSION || '2024-07';

export const api = (p) => `https://${shop}/admin/api/${API}/${p}`;
export const headers = { 'X-Shopify-Access-Token': token };
export const headersJSON = { ...headers, 'Content-Type': 'application/json' };