// agents/shopifysync.js - Crea productos automáticamente en Shopify con imagen
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js';

const CWD = process.cwd();

console.log('[ShopifySync] 🛍️ Agente iniciado.');

/**
 * Crea un producto en Shopify usando Admin API
 */
async function createShopifyProduct(productData, imagePath) {
  const shopifyConfig = globalConfig.shopify?.stores?.[0]; // Primera tienda (skhqgs-2j)
  
  if (!shopifyConfig || !shopifyConfig.adminApiKey) {
    console.error('[ShopifySync] ❌ Credenciales de Shopify no encontradas en config.js');
    return null;
  }
  
  const { storeName, adminApiKey } = shopifyConfig;
  const shopUrl = `https://${storeName}.myshopify.com/admin/api/2024-01/products.json`;
  
  console.log(`[ShopifySync] 🔨 Creando producto: ${productData.productName}`);
  
  try {
    // 1. Subir imagen a Shopify (si existe)
    let imageUrl = null;
    if (imagePath && await fs.access(imagePath).then(() => true).catch(() => false)) {
      // Leer imagen como base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      imageUrl = `data:image/png;base64,${base64Image}`;
    }
    
    // 2. Preparar datos del producto
    const productPayload = {
      product: {
        title: productData.productName,
        body_html: `<p>${productData.description}</p>`,
        vendor: 'Goio Store Peru',
        product_type: 'Innovación',
        status: 'active', // ✅ ACTIVO desde el inicio
        tags: ['tendencia', 'innovador', 'goio'],
        variants: [
          {
            price: calculateSmartPrice(productData.productName),
            inventory_management: null, // Sin stock tracking por ahora
            requires_shipping: true
          }
        ]
      }
    };
    
    // Agregar imagen si existe
    if (imageUrl) {
      productPayload.product.images = [
        {
          src: imageUrl
        }
      ];
    }
    
    // 3. Crear producto en Shopify
    const response = await fetch(shopUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminApiKey
      },
      body: JSON.stringify(productPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[ShopifySync] ❌ Error Shopify API:`, errorData.errors || errorData);
      return null;
    }
    
    const createdProduct = await response.json();
    const productUrl = `https://${storeName}.myshopify.com/products/${createdProduct.product.handle}`;
    
    console.log(`[ShopifySync] ✅ Producto creado exitosamente!`);
    console.log(`[ShopifySync] 🔗 URL: ${productUrl}`);
    console.log(`[ShopifySync] 💰 Precio: S/ ${createdProduct.product.variants[0].price}`);
    
    return {
      shopifyId: createdProduct.product.id,
      handle: createdProduct.product.handle,
      url: productUrl,
      price: createdProduct.product.variants[0].price,
      status: createdProduct.product.status,
      imageUrl: createdProduct.product.images?.[0]?.src || null
    };
    
  } catch (error) {
    console.error(`[ShopifySync] ❌ Error al crear producto:`, error.message);
    return null;
  }
}

/**
 * Calcula precio inteligente basado en el tipo de producto
 */
function calculateSmartPrice(productName) {
  const name = productName.toLowerCase();
  
  // Categorías de precios (en Soles peruanos)
  if (name.includes('auricular') || name.includes('headphone')) return '89.90';
  if (name.includes('botella') || name.includes('bottle')) return '49.90';
  if (name.includes('organizador') || name.includes('organizer')) return '39.90';
  if (name.includes('luz') || name.includes('light') || name.includes('lámpara')) return '59.90';
  if (name.includes('soporte') || name.includes('stand')) return '44.90';
  if (name.includes('proyector') || name.includes('projector')) return '299.90';
  if (name.includes('freidora') || name.includes('fryer')) return '249.90';
  if (name.includes('cama') || name.includes('bed') || name.includes('mascota')) return '129.90';
  if (name.includes('smartwatch') || name.includes('reloj')) return '149.90';
  
  // Precio por defecto
  return '79.90';
}

/**
 * Proceso principal: Lee imágenes y crea productos en Shopify
 */
async function syncProducts() {
  console.log('[ShopifySync] 🛍️ Iniciando sincronización con Shopify...');
  
  try {
    // 1. Leer reporte de imágenes generadas
    const imagesDir = path.join(CWD, 'reports', 'images');
    const imageFiles = (await fs.readdir(imagesDir).catch(() => []))
      .filter(file => file.startsWith('product-images-'))
      .sort()
      .reverse();
    
    if (imageFiles.length === 0) {
      console.log('[ShopifySync] ⚠️ No se encontraron reportes de imágenes. Terminando.');
      return;
    }
    
    const latestImageReport = path.join(imagesDir, imageFiles[0]);
    const imageData = JSON.parse(await fs.readFile(latestImageReport, 'utf8'));
    console.log(`[ShopifySync] 📂 Cargados ${imageData.length} productos con imágenes desde: ${imageFiles[0]}`);
    
    // 2. Crear cada producto en Shopify
    const shopifyProducts = [];
    
    for (const item of imageData) {
      console.log(`[ShopifySync] 🛒 Procesando: ${item.productName}`);
      
      const shopifyResult = await createShopifyProduct(
        {
          productName: item.productName,
          description: item.description
        },
        item.imagePath
      );
      
      if (shopifyResult) {
        shopifyProducts.push({
          productName: item.productName,
          shopifyId: shopifyResult.shopifyId,
          handle: shopifyResult.handle,
          url: shopifyResult.url,
          price: shopifyResult.price,
          status: shopifyResult.status,
          imageUrl: shopifyResult.imageUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      // Rate limiting (Shopify API: 2 req/s)
      await new Promise(resolve => setTimeout(resolve, 600)); // 0.6s entre requests
    }
    
    // 3. Guardar reporte de productos creados
    const reportDir = path.join(CWD, 'reports', 'shopify');
    await fs.mkdir(reportDir, { recursive: true });
    
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `shopify-products-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(shopifyProducts, null, 2));
    
    console.log(`[ShopifySync] ✅ Sincronización completada!`);
    console.log(`[ShopifySync] 📊 Total de productos creados: ${shopifyProducts.length}`);
    console.log(`[ShopifySync] 💾 Reporte guardado: ${reportPath}`);
    
  } catch (error) {
    console.error('[ShopifySync] ❌ Error fatal:', error);
  }
}

// Ejecutar
syncProducts();
