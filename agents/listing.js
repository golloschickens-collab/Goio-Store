import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';
import slugify from 'slugify';
import fs from 'fs/promises';
import path from 'path';
import { optimizarProducto } from '../utils/optimizador.cjs';

const shop = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_ADMIN_TOKEN;
const endpoint = `https://${shop}/admin/api/2024-07/graphql.json`;

if (!shop || !token) {
  console.warn('[Listing] Falta SHOPIFY_STORE o SHOPIFY_ADMIN_TOKEN en .env – se omite el agente.');
  process.exit(1);
}

const client = new GraphQLClient(endpoint, {
  headers: { 'X-Shopify-Access-Token': token }
});

// --- GraphQL Queries and Mutations ---
const Q_BY_HANDLE = gql`
  query ($handle: String!) { productByHandle(handle: $handle) { id handle title } }
`;

const M_CREATE = gql`
  mutation ($input: ProductInput!) {
    productCreate(input: $input) {
      product { id handle title status }
      userErrors { field message }
    }
  }
`;

const M_UPDATE = gql`
  mutation ($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id handle title status }
      userErrors { field message }
    }
  }
`;

const M_CREATE_MEDIA = gql`
  mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
    productCreateMedia(media: $media, productId: $productId) {
      media { alt mediaContentType status }
      mediaUserErrors { field message }
      product { id }
    }
  }
`;

function toHandle(title, id) {
  return slugify(`${title}-${id}`, { lower: true, strict: true });
}

export async function upsertListing(product) {
  // 1) Construye input base
  const handle = toHandle(product.title, product.id);

  // La descripción ahora viene del producto optimizado
  const descriptionHtml = product.body_html;

  const baseInput = {
    title: product.title,
    handle,
    descriptionHtml,
    tags: product.tags || [],
    vendor: 'Gollos',
    status: 'DRAFT'
  };

  // 2) ¿Existe?
  const found = await client.request(Q_BY_HANDLE, { handle }).catch(() => null);
  const exists = !!found?.productByHandle?.id;

  // 3) Crea o actualiza
  console.log(`[Listing] ${exists ? 'Actualizando' : 'Creando'} producto con IA: ${product.title}`);
  const res = exists
    ? await client.request(M_UPDATE, { input: { ...baseInput, id: found.productByHandle.id } })
    : await client.request(M_CREATE, { input: baseInput });

  const userErrors = (exists ? res.productUpdate?.userErrors : res.productCreate?.userErrors) || [];
  if (userErrors.length) {
    console.error(`[Listing] Error al procesar "${product.title}":`, userErrors);
    return null;
  }
  
  const productId = exists ? res.productUpdate.product.id : res.productCreate.product.id;
  console.log(`[Listing] ✨ ${exists ? 'Actualizado' : 'Creado'} → ${handle} (ID: ${productId})`);
  
  return productId;
}

// --- Main execution block ---
async function run() {
  console.log('[Listing] Iniciando agente de listings...');
  
  // 1. Leer productos de la configuración
  const productsPath = path.resolve(process.cwd(), 'config', 'products.json');
  let productsToProcess;
  try {
    const productsFile = await fs.readFile(productsPath, 'utf-8');
    productsToProcess = JSON.parse(productsFile);
    if (!Array.isArray(productsToProcess) || productsToProcess.length === 0) {
      console.log('[Listing] No hay productos en config/products.json para procesar. Terminando.');
      return;
    }
  } catch (error) {
    console.error('[Listing] No se pudo leer o parsear config/products.json:', error);
    return;
  }

  console.log(`[Listing] Se encontraron ${productsToProcess.length} productos para procesar.`);

  // 2. Procesar cada producto
  for (const product of productsToProcess) {
    // 2a. Optimizar con IA
    console.log(`[Listing] Optimizando "${product.title}" con IA...`);
    const optimizedProduct = await optimizarProducto(product);

    if (!optimizedProduct.body_html || optimizedProduct.body_html === product.body_html) {
        console.warn(`[Listing] La optimización no generó una nueva descripción para "${product.title}". Saltando subida a Shopify.`);
        continue;
    }

    // 2b. Crear/Actualizar en Shopify
    const productId = await upsertListing(optimizedProduct);

    // 2c. Lógica de Media y Distritos (si aplica)
    if (productId) {
      // Aquí iría la lógica de media y distritos si fuera necesario
      console.log(`[Listing] Procesamiento completo para el producto ID: ${productId}`);
    }
    console.log('---');
  }

  console.log('[Listing] Agente de listings ha completado su ciclo.');
}

run().catch(error => {
  console.error('[Listing] Error fatal en el agente:', error);
  process.exit(1);
});
