// agents/pricinggenius.js - Precio dinámico que maximiza ganancia (no volumen)
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js';

const CWD = process.cwd();

console.log('[PricingGenius] 💰 AGENTE ÉLITE ACTIVADO - Pricing dinámico para máxima ganancia');

/**
 * NIVEL ÉLITE: No precio fijo, sino OPTIMIZACIÓN CONTINUA
 * Cada 6 horas ajusta precios para maximizar ROI
 */

/**
 * Calcula precio óptimo basado en inteligencia de mercado
 */
function calculateOptimalPrice(intelligence) {
  const { marketData, demandData, prediction } = intelligence;
  
  // Factores de pricing
  const competitionFactor = marketData?.priceAvg || 100;
  const demandFactor = demandData.currentInterest / 100;
  const trendFactor = demandData.trend === 'rising' ? 1.15 : 
                      demandData.trend === 'falling' ? 0.85 : 1.0;
  
  // Estrategia: Precio dinámico basado en demanda
  let basePrice = prediction.optimalPrice || competitionFactor * 0.85;
  
  // Ajustar por demanda
  if (demandData.currentInterest > 70) {
    // Alta demanda = puedo subir precio 10-20%
    basePrice *= 1.15;
  } else if (demandData.currentInterest < 30) {
    // Baja demanda = debo bajar precio 10-15%
    basePrice *= 0.85;
  }
  
  // Ajustar por tendencia
  basePrice *= trendFactor;
  
  // Aplicar psicología de precios (terminación en .90, .95, .99)
  basePrice = Math.floor(basePrice / 10) * 10 + 9.90;
  
  return {
    price: parseFloat(basePrice.toFixed(2)),
    compareAtPrice: parseFloat((basePrice * 1.3).toFixed(2)), // "Precio antes"
    strategy: demandData.currentInterest > 70 ? 'premium' : 
              demandData.currentInterest < 30 ? 'aggressive' : 'balanced'
  };
}

/**
 * Actualiza precio en Shopify
 */
async function updateShopifyPrice(productId, newPrice, compareAtPrice) {
  const shopifyConfig = globalConfig.shopify?.stores?.[0];
  
  if (!shopifyConfig) {
    console.error('[PricingGenius] ❌ Configuración de Shopify no encontrada');
    return false;
  }
  
  const { storeName, adminApiKey } = shopifyConfig;
  const url = `https://${storeName}.myshopify.com/admin/api/2024-01/products/${productId}.json`;
  
  console.log(`[PricingGenius] 🔄 Actualizando precio producto ${productId}: S/ ${newPrice}`);
  
  try {
    // Obtener producto actual
    const getResponse = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': adminApiKey
      }
    });
    
    if (!getResponse.ok) {
      console.error('[PricingGenius] ❌ Error obteniendo producto');
      return false;
    }
    
    const productData = await getResponse.json();
    const variants = productData.product.variants;
    
    // Actualizar cada variante
    for (const variant of variants) {
      const variantUrl = `https://${storeName}.myshopify.com/admin/api/2024-01/variants/${variant.id}.json`;
      
      const updateResponse = await fetch(variantUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminApiKey
        },
        body: JSON.stringify({
          variant: {
            id: variant.id,
            price: newPrice.toString(),
            compare_at_price: compareAtPrice.toString()
          }
        })
      });
      
      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.error('[PricingGenius] ❌ Error actualizando variante:', error);
        return false;
      }
      
      console.log(`[PricingGenius] ✅ Variante ${variant.id} actualizada: S/ ${newPrice} (antes: S/ ${compareAtPrice})`);
    }
    
    return true;
    
  } catch (error) {
    console.error('[PricingGenius] ❌ Error actualizando precio:', error.message);
    return false;
  }
}

/**
 * Proceso principal: Optimización de precios
 */
async function optimizePricing() {
  console.log('[PricingGenius] 💰 Iniciando optimización de precios...');
  
  try {
    // 1. Leer inteligencia de mercado
    const intelligenceDir = path.join(CWD, 'reports', 'intelligence');
    const intelligenceFiles = (await fs.readdir(intelligenceDir).catch(() => []))
      .filter(file => file.startsWith('market-intelligence-'))
      .sort()
      .reverse();
    
    if (intelligenceFiles.length === 0) {
      console.log('[PricingGenius] ⚠️ No hay inteligencia de mercado. Ejecuta MarketIntelligence primero.');
      return;
    }
    
    const latestIntelligence = path.join(intelligenceDir, intelligenceFiles[0]);
    const intelligence = JSON.parse(await fs.readFile(latestIntelligence, 'utf8'));
    console.log(`[PricingGenius] 📂 Cargados ${intelligence.length} productos con inteligencia de mercado.`);
    
    // 2. Leer productos de Shopify (para obtener IDs)
    const shopifyDir = path.join(CWD, 'reports', 'shopify');
    const shopifyFiles = (await fs.readdir(shopifyDir).catch(() => []))
      .filter(file => file.startsWith('shopify-products-'))
      .sort()
      .reverse();
    
    if (shopifyFiles.length === 0) {
      console.log('[PricingGenius] ⚠️ No hay productos en Shopify. Ejecuta ShopifySync primero.');
      return;
    }
    
    const shopifyProducts = JSON.parse(await fs.readFile(path.join(shopifyDir, shopifyFiles[0]), 'utf8'));
    
    // 3. Mapear productos con inteligencia
    const pricingUpdates = [];
    
    for (const intel of intelligence) {
      // Buscar producto en Shopify
      const shopifyProduct = shopifyProducts.find(p => 
        p.productName.toLowerCase().includes(intel.productName.toLowerCase()) ||
        intel.productName.toLowerCase().includes(p.productName.toLowerCase())
      );
      
      if (!shopifyProduct) {
        console.log(`[PricingGenius] ⏭️ Producto no encontrado en Shopify: ${intel.productName}`);
        continue;
      }
      
      // Calcular precio óptimo
      const pricing = calculateOptimalPrice(intel);
      
      console.log(`\n[PricingGenius] 🎯 ${intel.productName}`);
      console.log(`   Probabilidad de venta: ${intel.prediction.salesProbability}%`);
      console.log(`   Precio actual: S/ ${shopifyProduct.price}`);
      console.log(`   Precio óptimo: S/ ${pricing.price}`);
      console.log(`   Estrategia: ${pricing.strategy}`);
      
      // Actualizar en Shopify
      const updated = await updateShopifyPrice(
        shopifyProduct.shopifyId,
        pricing.price,
        pricing.compareAtPrice
      );
      
      pricingUpdates.push({
        productName: intel.productName,
        shopifyId: shopifyProduct.shopifyId,
        oldPrice: shopifyProduct.price,
        newPrice: pricing.price,
        compareAtPrice: pricing.compareAtPrice,
        strategy: pricing.strategy,
        updated: updated,
        salesProbability: intel.prediction.salesProbability,
        timestamp: new Date().toISOString()
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 4. Guardar reporte
    const reportDir = path.join(CWD, 'reports', 'pricing');
    await fs.mkdir(reportDir, { recursive: true });
    
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `pricing-updates-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(pricingUpdates, null, 2));
    
    // 5. Resumen
    const successful = pricingUpdates.filter(p => p.updated).length;
    const avgPriceIncrease = pricingUpdates.reduce((sum, p) => {
      const change = ((p.newPrice - parseFloat(p.oldPrice)) / parseFloat(p.oldPrice)) * 100;
      return sum + change;
    }, 0) / pricingUpdates.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('[PricingGenius] 📊 RESUMEN DE OPTIMIZACIÓN');
    console.log('='.repeat(60));
    console.log(`Total productos procesados: ${pricingUpdates.length}`);
    console.log(`Actualizaciones exitosas: ${successful}`);
    console.log(`Cambio promedio de precio: ${avgPriceIncrease > 0 ? '+' : ''}${avgPriceIncrease.toFixed(2)}%`);
    console.log('\nESTRATEGIAS APLICADAS:');
    const strategies = pricingUpdates.reduce((acc, p) => {
      acc[p.strategy] = (acc[p.strategy] || 0) + 1;
      return acc;
    }, {});
    Object.entries(strategies).forEach(([strategy, count]) => {
      console.log(`  ${strategy}: ${count} productos`);
    });
    console.log('='.repeat(60));
    
    console.log(`\n[PricingGenius] 💾 Reporte guardado: ${reportPath}`);
    
  } catch (error) {
    console.error('[PricingGenius] ❌ Error fatal:', error);
  }
}

// Ejecutar
optimizePricing();
