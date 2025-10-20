import { GraphQLClient, gql } from 'graphql-request';
import slugify from 'slugify';
import { promises as fs } from 'fs';
import path from 'path';
import { optimizarProducto } from '../utils/optimizador.cjs';
import { config as globalConfig } from '../scripts/config.js'; // Importar la configuración global

// --- Configuración y Validación Inicial ---
let agentConfig;
if (process.argv[2]) {
  try {
    agentConfig = JSON.parse(process.argv[2]);
    console.log('[Listing] Órdenes recibidas del supervisor:', agentConfig.tareas);
  } catch (error) {
    console.error('[Listing] Error parseando configuración CLI:', error.message);
    agentConfig = { tareas: ['subir productos'], tiendas: ['principal'] };
  }
} else {
  console.log('[Listing] Modo directo activado - usando configuración por defecto');
  agentConfig = { tareas: ['subir productos'], tiendas: ['principal'] };
}

// --- Funciones de Lógica de Negocio (sin cambios) ---
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

function toHandle(title) {
  return slugify(title, { lower: true, strict: true });
}

async function upsertListing(product, client) {
  const handle = toHandle(product.title);
  const baseInput = {
    title: product.title,
    handle,
    descriptionHtml: product.body_html,
    tags: product.tags || [],
    vendor: 'Goio',
    status: 'DRAFT' // Siempre se crean como borrador
  };

  const found = await client.request(Q_BY_HANDLE, { handle }).catch(() => null);
  const exists = !!found?.productByHandle?.id;

  console.log(`[Listing] ${exists ? 'Actualizando' : 'Creando'} producto: ${product.title}`);
  const mutation = exists ? M_UPDATE : M_CREATE;
  const input = exists ? { ...baseInput, id: found.productByHandle.id } : baseInput;
  
  const res = await client.request(mutation, { input });

  const userErrors = (exists ? res.productUpdate?.userErrors : res.productCreate?.userErrors) || [];
  if (userErrors.length) {
    console.error(`[Listing] Error al procesar "${product.title}":`, userErrors);
    return null;
  }
  
  const productId = exists ? res.productUpdate.product.id : res.productCreate.product.id;
  console.log(`[Listing] ✨ ${exists ? 'Actualizado' : 'Creado'} → ${handle} (ID: ${productId})`);
  
  return productId;
}

// --- Bucle Principal de Ejecución ---
async function run() {
  console.log('[Listing] Iniciando agente de listings...');

  // Determinar en qué tienda operar basado en la configuración recibida
  // Por ahora, priorizamos la tienda 'principal' si está asignada, según la tarea.
  const targetStoreName = agentConfig.tiendas.includes('principal') ? 'principal' : agentConfig.tiendas[0];
  if (!targetStoreName) {
    console.error('[Listing] Error: No se ha asignado ninguna tienda a este agente en config.js');
    return;
  }

  const storeDetails = globalConfig.entorno.tiendas.find(t => t.nombre === targetStoreName);
  if (!storeDetails) {
    console.error(`[Listing] Error: No se encontraron los detalles para la tienda '${targetStoreName}' en la configuración global.`);
    return;
  }

  console.log(`[Listing] ✅ Operando en la tienda: ${storeDetails.dominio} (Entorno: ${storeDetails.entorno})`);

  // Crear el cliente de GraphQL con las credenciales correctas
  const endpoint = `https://${storeDetails.dominio}/admin/api/2024-10/graphql.json`;
  const client = new GraphQLClient(endpoint, {
    headers: { 'X-Shopify-Access-Token': storeDetails.api_key }
  });
  
  // El resto de la lógica para encontrar y procesar productos sigue igual
  const researchDir = path.resolve(process.cwd(), 'reports', 'research');
  const trendFiles = (await fs.readdir(researchDir))
      .filter(file => file.startsWith('found_trends-'))
      .sort()
      .reverse();

  if (trendFiles.length === 0) {
      console.log('[Listing] No se encontraron reportes de tendencias para procesar. Terminando.');
      return;
  }

  const latestTrendReportPath = path.join(researchDir, trendFiles[0]);
  const productsToProcess = JSON.parse(await fs.readFile(latestTrendReportPath, 'utf-8'));

  console.log(`[Listing] Se encontraron ${productsToProcess.length} nuevas oportunidades en: ${trendFiles[0]}`);

  for (const product of productsToProcess) {
    console.log(`[Listing] Optimizando "${product.product_name}" con IA...`);
    const optimizedProduct = await optimizarProducto(product);

    if (!optimizedProduct || !optimizedProduct.body_html) {
        console.warn(`[Listing] La optimización no generó una nueva descripción para "${product.product_name}". Saltando subida a Shopify.`);
        continue;
    }

    const productId = await upsertListing(optimizedProduct, client);

    if (productId) {
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
