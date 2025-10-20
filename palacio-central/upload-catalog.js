import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

// Cargar variables de entorno
config();

function toHandle(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createProduct(product, shopifyConfig) {
  const productData = {
    title: product.title,
    handle: toHandle(product.title),
    body_html: product.description || "Producto de alta calidad disponible en nuestra tienda.",
    vendor: "Goio",
    product_type: product.category || "General",
    status: "draft",
    tags: product.tags ? product.tags.join(', ') : '',
    variants: [{
      price: product.price || "29.99",
      inventory_quantity: product.inventory || 100,
      weight: 0.5,
      weight_unit: "kg",
      requires_shipping: true,
      taxable: true,
      sku: product.sku || toHandle(product.title)
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

async function processProduct(product, shopifyConfig) {
  const handle = toHandle(product.title);
  
  console.log(`[Listing] Verificando producto: ${product.title}`);
  
  try {
    const existingProduct = await checkProductExists(handle, shopifyConfig);
    
    if (existingProduct) {
      console.log(`[Listing] ⚠️  Producto ya existe: ${product.title} (${existingProduct.id})`);
      return { status: 'exists', id: existingProduct.id, title: product.title };
    }

    console.log(`[Listing] Creando producto: ${product.title}`);
    const result = await createProduct(product, shopifyConfig);
    
    console.log(`[Listing] ✅ Producto creado: ${result.product.title} (ID: ${result.product.id})`);
    return { status: 'created', id: result.product.id, title: result.product.title };

  } catch (error) {
    console.error(`[Listing] ❌ Error con ${product.title}:`, error.message);
    return { status: 'error', title: product.title, error: error.message };
  }
}

async function loadProducts() {
  try {
    const productsPath = path.join(process.cwd(), 'config', 'products.json');
    const data = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(data);
    console.log(`[Listing] Catálogo cargado: ${products.length} productos`);
    return products;
  } catch (error) {
    console.error('[Listing] ❌ Error cargando catálogo:', error.message);
    return [];
  }
}

async function runCatalog() {
  console.log('[Listing] 🚀 Iniciando subida de catálogo...');

  const shopifyConfig = {
    domain: process.env.SHOPIFY_DOMAIN_PROD,
    token: process.env.SHOPIFY_ADMIN_TOKEN_PROD
  };

  if (!shopifyConfig.domain || !shopifyConfig.token) {
    console.error('[Listing] ❌ Faltan credenciales de Shopify');
    return;
  }

  console.log(`[Listing] ✅ Tienda: ${shopifyConfig.domain}`);

  const products = await loadProducts();
  
  if (products.length === 0) {
    console.log('[Listing] ❌ No hay productos para procesar');
    return;
  }

  const results = [];
  const trace_id = `catalog_${Date.now()}`;

  for (const product of products) {
    const result = await processProduct(product, shopifyConfig);
    results.push(result);

    // Pausa entre productos para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Reporte final
  const successful = results.filter(r => r.status === 'created').length;
  const existing = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log('\n🎯 === REPORTE FINAL CATÁLOGO ===');
  console.log(`Agente: Listing | Acción: Subir catálogo | Estado: Completado | trace_id: ${trace_id}`);
  console.log(`✅ Productos creados: ${successful}`);
  console.log(`⚠️  Productos existentes: ${existing}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📊 Total procesados: ${results.length}`);

  if (successful > 0) {
    console.log(`🎉 ¡CATÁLOGO ACTUALIZADO EXITOSAMENTE! ${successful} productos listos para vender.`);
    console.log(`💰 Potencial de ventas activado - inventario listo para campañas.`);
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

runCatalog().catch(console.error);