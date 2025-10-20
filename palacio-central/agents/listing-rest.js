import { promises as fs } from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { optimizarProducto } from '../utils/optimizador.cjs';
import { config as globalConfig } from '../scripts/config.js';

// Cargar variables de entorno
config();

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

function toHandle(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createProductREST(product, shopifyConfig) {
  const productData = {
    title: product.title,
    handle: toHandle(product.title),
    body_html: product.description,
    vendor: "Goio",
    product_type: product.category || "General",
    status: "draft",
    tags: product.tags ? product.tags.join(', ') : '',
    variants: [{
      price: product.price,
      inventory_quantity: product.inventory || 100,
      weight: 0.5,
      weight_unit: "kg",
      requires_shipping: true,
      taxable: true,
      sku: product.sku
    }],
    images: product.images ? product.images.map(img => ({ src: img.url })) : []
  };

  const response = await fetch(`https://${shopifyConfig.domain}/admin/api/2024-10/products.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': shopifyConfig.token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product: productData })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function checkProductExists(handle, shopifyConfig) {
  const response = await fetch(`https://${shopifyConfig.domain}/admin/api/2024-10/products.json?handle=${handle}`, {
    headers: {
      'X-Shopify-Access-Token': shopifyConfig.token,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.products.length > 0 ? data.products[0] : null;
}

async function upsertListing(product, shopifyConfig) {
  const handle = toHandle(product.title);
  
  console.log(`[Listing] Verificando producto: ${product.title}`);
  
  try {
    const existingProduct = await checkProductExists(handle, shopifyConfig);
    
    if (existingProduct) {
      console.log(`[Listing] ⚠️  Producto ya existe: ${product.title} (${existingProduct.id})`);
      return { status: 'exists', id: existingProduct.id, title: product.title };
    }

    console.log(`[Listing] Creando producto: ${product.title}`);
    const result = await createProductREST(product, shopifyConfig);
    
    console.log(`[Listing] ✅ Producto creado: ${result.product.title} (ID: ${result.product.id})`);
    return { status: 'created', id: result.product.id, title: result.product.title };

  } catch (error) {
    console.error(`[Listing] ❌ Error con ${product.title}:`, error.message);
    return { status: 'error', title: product.title, error: error.message };
  }
}

async function cargarOportunidades() {
  const directoryPath = path.join(process.cwd(), 'temp');
  try {
    const files = await fs.readdir(directoryPath);
    const latestTrendFile = files
      .filter(file => file.startsWith('found_trends-') && file.endsWith('.json'))
      .sort()
      .pop();

    if (latestTrendFile) {
      const data = await fs.readFile(path.join(directoryPath, latestTrendFile), 'utf8');
      console.log(`[Listing] Se encontraron ${JSON.parse(data).length} nuevas oportunidades en: ${latestTrendFile}`);
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('[Listing] No se encontraron tendencias, usando catálogo por defecto');
  }

  // Fallback: usar products.json
  try {
    const productsPath = path.join(process.cwd(), 'config', 'products.json');
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    console.log(`[Listing] Usando catálogo por defecto: ${products.length} productos`);
    return products;
  } catch (error) {
    console.error('[Listing] ❌ Error cargando catálogo:', error.message);
    return [];
  }
}

async function run() {
  console.log('[Listing] Iniciando agente de listings...');

  const shopifyConfig = {
    domain: process.env.SHOPIFY_DOMAIN_PROD,
    token: process.env.SHOPIFY_ADMIN_TOKEN_PROD
  };

  console.log('[Listing] Debug - Domain:', shopifyConfig.domain);
  console.log('[Listing] Debug - Token existe:', !!shopifyConfig.token);

  if (!shopifyConfig.domain || !shopifyConfig.token) {
    console.error('[Listing] ❌ Faltan credenciales de Shopify');
    console.error('[Listing] Domain:', shopifyConfig.domain);
    console.error('[Listing] Token:', shopifyConfig.token ? 'SET' : 'NOT SET');
    return;
  }

  console.log(`[Listing] ✅ Operando en la tienda: ${shopifyConfig.domain} (Entorno: producción)`);

  const opportunities = await cargarOportunidades();
  
  if (opportunities.length === 0) {
    console.log('[Listing] ❌ No hay productos para procesar');
    return;
  }

  const results = [];
  const trace_id = `listing_${Date.now()}`;

  for (const product of opportunities.slice(0, 10)) { // Limitamos a 10 productos
    try {
      console.log(`[Listing] Optimizando "${product.title}" con IA...`);
      
      // Intentar optimización con IA, pero continuar sin ella si falla
      let optimizedProduct = product;
      try {
        optimizedProduct = await optimizarProducto(product);
      } catch (error) {
        console.log(`[Listing] ⚠️  Optimización IA falló para "${product.title}", usando producto original`);
      }

      const result = await upsertListing(optimizedProduct, shopifyConfig);
      results.push(result);

      // Pequeña pausa entre productos para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`[Listing] Error fatal procesando ${product.title}:`, error.message);
      results.push({ status: 'error', title: product.title, error: error.message });
    }
  }

  // Reporte final
  const successful = results.filter(r => r.status === 'created').length;
  const existing = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log('\n--- REPORTE FINAL ---');
  console.log(`Agente: Listing | Acción: Subir catálogo | Estado: Completado | trace_id: ${trace_id}`);
  console.log(`✅ Productos creados: ${successful}`);
  console.log(`⚠️  Productos existentes: ${existing}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📊 Total procesados: ${results.length}`);

  if (successful > 0) {
    console.log(`🎉 ¡Catálogo actualizado exitosamente! ${successful} productos listos para vender.`);
  }

  return {
    status: 'completed',
    created: successful,
    existing: existing,
    errors: errors,
    total: results.length,
    trace_id: trace_id
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(console.error);
}

export { run };