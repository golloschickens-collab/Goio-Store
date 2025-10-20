import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js';

const PRODUCTS_CONFIG = path.join(process.cwd(), 'config', 'products.json');

class ShopifyListingAgent {
  constructor() {
    this.results = [];
    this.errors = [];
    this.shopifyConfig = null;
  }

  async initialize() {
    // Load Shopify configuration
    this.shopifyConfig = {
      domain: globalConfig.entorno.tiendas.find(t => t.entorno === 'producción')?.dominio,
      adminToken: globalConfig.entorno.tiendas.find(t => t.entorno === 'producción')?.admin_token,
      apiVersion: '2023-10'
    };

    if (!this.shopifyConfig.domain || !this.shopifyConfig.adminToken) {
      throw new Error('Credenciales de Shopify no configuradas correctamente');
    }

    console.log(`🔗 Conectando a Shopify: ${this.shopifyConfig.domain}`);
  }

  async createProductInShopify(product, index) {
    const traceId = `trace_listing_${Date.now()}_${index}`;
    console.log(`[${traceId}] Subiendo producto: ${product.title}`);

    try {
      const shopifyProduct = {
        product: {
          title: product.title,
          body_html: product.body_html,
          vendor: product.vendor,
          product_type: product.product_type,
          status: 'active', // Cambiar de draft a active
          tags: product.tags.join(', '),
          variants: product.variants.map(variant => ({
            sku: variant.sku,
            price: variant.price,
            compare_at_price: variant.compare_at_price,
            inventory_management: variant.inventory_management,
            inventory_policy: variant.inventory_policy,
            inventory_quantity: variant.inventory_quantity,
            fulfillment_service: variant.fulfillment_service,
            requires_shipping: variant.requires_shipping,
            barcode: variant.barcode,
            weight: variant.weight,
            weight_unit: variant.weight_unit
          })),
          images: product.images.map(image => ({
            src: image.src,
            alt: image.alt
          }))
        }
      };

      const url = `https://${this.shopifyConfig.domain}/admin/api/${this.shopifyConfig.apiVersion}/products.json`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.shopifyConfig.adminToken
        },
        body: JSON.stringify(shopifyProduct)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      const createdProduct = responseData.product;

      this.results.push({
        sku: product.variants[0].sku,
        productName: product.title,
        shopifyId: createdProduct.id,
        status: 'CREADO',
        shopifyUrl: `https://${this.shopifyConfig.domain.replace('.myshopify.com', '')}.myshopify.com/products/${createdProduct.handle}`,
        traceId
      });

      console.log(`[${traceId}] ✅ Producto creado - ID: ${createdProduct.id}`);

    } catch (error) {
      console.error(`[${traceId}] ❌ Error: ${error.message}`);
      this.errors.push({
        sku: product.variants[0].sku,
        productName: product.title,
        error: error.message,
        traceId
      });
    }
  }

  generateReport() {
    console.log('\n📋 REPORTE DE CARGA DE PRODUCTOS A SHOPIFY\n');
    
    console.log('| SKU | Producto | Shopify ID | Estado | URL Tienda | trace_id |');
    console.log('|-----|----------|------------|--------|------------|----------|');
    
    for (const result of this.results) {
      console.log(`| ${result.sku} | ${result.productName} | ${result.shopifyId} | ${result.status} | ${result.shopifyUrl} | ${result.traceId} |`);
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORES:\n');
      for (const error of this.errors) {
        console.log(`- ${error.sku} (${error.productName}): ${error.error}`);
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`- Productos procesados: ${this.results.length}`);
    console.log(`- Errores: ${this.errors.length}`);
    console.log(`- Productos activos en Shopify: ${this.results.length}`);
    console.log(`- Tienda: ${this.shopifyConfig.domain}`);
    
    return {
      success: this.results.length,
      errors: this.errors.length,
      total: this.results.length + this.errors.length
    };
  }
}

async function main() {
  console.log('🛒 INICIANDO AGENTE DE LISTING - CARGA A SHOPIFY');
  
  const agent = new ShopifyListingAgent();
  
  try {
    await agent.initialize();

    // Load products from config
    const products = JSON.parse(fs.readFileSync(PRODUCTS_CONFIG, 'utf8'));
    console.log(`📦 Cargados ${products.length} productos del catálogo actualizado`);

    // Process each product
    for (let i = 0; i < products.length; i++) {
      await agent.createProductInShopify(products[i], i + 1);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate final report
    const summary = agent.generateReport();
    
    if (summary.success > 0) {
      console.log('\n🎯 CATÁLOGO LISTO PARA VENTAS');
      console.log('Próximo paso: Activar Publisher para campañas express');
    }

  } catch (error) {
    console.error('❌ Error fatal en Agent.Listing:', error.message);
    process.exit(1);
  }
}

// Check if this script is being run directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('listing-agent.js');
if (isMainModule) {
  main().catch(console.error);
}

export { ShopifyListingAgent };