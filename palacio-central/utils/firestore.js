// utils/firestore.js
// Firestore database operations for Goio Store
// Professional-grade data persistence and analytics

import { Firestore, FieldValue } from '@google-cloud/firestore';

const db = new Firestore({
  projectId: 'goio-imperios-prod'
});

// Collection references
const COLLECTIONS = {
  products: 'products',
  metrics: 'metrics',
  winners: 'winners',
  campaigns: 'campaigns',
  sales: 'sales'
};

/**
 * Save product to Firestore
 * @param {Object} product - Product data
 * @returns {Promise<string>} - Document ID
 */
export async function saveProduct(product) {
  try {
    const productRef = db.collection(COLLECTIONS.products).doc(product.id || product.product_name);
    
    const productData = {
      ...product,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: product.status || 'testing', // testing | winner | archived
      source: product.source || 'research-agent',
      shopifyId: product.shopifyId || null
    };
    
    await productRef.set(productData, { merge: true });
    
    console.log(`💾 [Firestore] Product saved: ${product.product_name}`);
    return productRef.id;
  } catch (error) {
    console.error(`❌ [Firestore] Error saving product:`, error.message);
    throw error;
  }
}

/**
 * Save daily metrics for a product
 * @param {string} productId - Product ID
 * @param {Object} metrics - Metrics data (views, ctr, sales, etc.)
 * @returns {Promise<string>} - Metrics document ID
 */
export async function saveMetrics(productId, metrics) {
  try {
    const metricsRef = db.collection(COLLECTIONS.metrics).doc();
    
    const metricsData = {
      productId,
      ...metrics,
      timestamp: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
      // Calculate score (0-100)
      score: calculateProductScore(metrics)
    };
    
    await metricsRef.set(metricsData);
    
    // Update product with latest metrics
    await db.collection(COLLECTIONS.products).doc(productId).update({
      lastMetrics: metricsData,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log(`📊 [Firestore] Metrics saved for product: ${productId}, Score: ${metricsData.score}`);
    return metricsRef.id;
  } catch (error) {
    console.error(`❌ [Firestore] Error saving metrics:`, error.message);
    throw error;
  }
}

/**
 * Calculate product performance score (0-100)
 * Based on: CTR, engagement, sales, revenue
 */
function calculateProductScore(metrics) {
  const weights = {
    ctr: 0.3,
    engagement: 0.2,
    sales: 0.3,
    revenue: 0.2
  };
  
  // Normalize metrics to 0-100 scale
  const ctrScore = Math.min((metrics.ctr || 0) * 20, 100); // 5% CTR = 100 points
  const engagementScore = Math.min((metrics.engagement || 0) / 100 * 100, 100);
  const salesScore = Math.min((metrics.sales || 0) * 10, 100); // 10 sales = 100 points
  const revenueScore = Math.min((metrics.revenue || 0) / 500 * 100, 100); // $500 = 100 points
  
  const totalScore = 
    ctrScore * weights.ctr +
    engagementScore * weights.engagement +
    salesScore * weights.sales +
    revenueScore * weights.revenue;
  
  return Math.round(totalScore);
}

/**
 * Promote product to winner status
 * @param {string} productId - Product ID to promote
 * @param {string} reason - Reason for promotion
 * @returns {Promise<void>}
 */
export async function promoteToWinner(productId, reason = 'High performance metrics') {
  try {
    const batch = db.batch();
    
    // Update product status
    const productRef = db.collection(COLLECTIONS.products).doc(productId);
    batch.update(productRef, {
      status: 'winner',
      promotedAt: FieldValue.serverTimestamp(),
      promotionReason: reason
    });
    
    // Create winner record
    const winnerRef = db.collection(COLLECTIONS.winners).doc(productId);
    batch.set(winnerRef, {
      productId,
      promotedAt: FieldValue.serverTimestamp(),
      reason,
      tier: 'gold' // gold | silver | bronze
    });
    
    await batch.commit();
    
    console.log(`🏆 [Firestore] Product promoted to WINNER: ${productId}`);
  } catch (error) {
    console.error(`❌ [Firestore] Error promoting product:`, error.message);
    throw error;
  }
}

/**
 * Get top performing products (last N days)
 * @param {number} days - Number of days to look back
 * @param {number} limit - Max number of products to return
 * @returns {Promise<Array>} - Array of top products
 */
export async function getTopPerformers(days = 30, limit = 10) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const snapshot = await db.collection(COLLECTIONS.metrics)
      .where('timestamp', '>', cutoffDate)
      .orderBy('timestamp', 'desc')
      .orderBy('score', 'desc')
      .limit(limit)
      .get();
    
    const topProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`🎯 [Firestore] Found ${topProducts.length} top performers (last ${days} days)`);
    return topProducts;
  } catch (error) {
    console.error(`❌ [Firestore] Error getting top performers:`, error.message);
    throw error;
  }
}

/**
 * Detect winners based on criteria
 * @returns {Promise<Array>} - Array of product IDs that should be promoted
 */
export async function detectWinners() {
  try {
    const WINNER_CRITERIA = {
      minCTR: 5, // 5%
      minSales: 10,
      minScore: 70
    };
    
    const productsSnapshot = await db.collection(COLLECTIONS.products)
      .where('status', '==', 'testing')
      .get();
    
    const winners = [];
    
    for (const doc of productsSnapshot.docs) {
      const product = doc.data();
      const metrics = product.lastMetrics;
      
      if (metrics && 
          metrics.ctr >= WINNER_CRITERIA.minCTR &&
          metrics.sales >= WINNER_CRITERIA.minSales &&
          metrics.score >= WINNER_CRITERIA.minScore) {
        winners.push({
          id: doc.id,
          name: product.product_name,
          score: metrics.score,
          ctr: metrics.ctr,
          sales: metrics.sales
        });
      }
    }
    
    console.log(`🔍 [Firestore] Detected ${winners.length} potential winners`);
    return winners;
  } catch (error) {
    console.error(`❌ [Firestore] Error detecting winners:`, error.message);
    throw error;
  }
}

/**
 * Record a sale in Firestore
 * @param {Object} sale - Sale data from Shopify webhook
 * @returns {Promise<string>} - Sale document ID
 */
export async function recordSale(sale) {
  try {
    const saleRef = db.collection(COLLECTIONS.sales).doc();
    
    const saleData = {
      ...sale,
      timestamp: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
      processed: false
    };
    
    await saleRef.set(saleData);
    
    // Update product metrics
    if (sale.productId) {
      const productRef = db.collection(COLLECTIONS.products).doc(sale.productId);
      await productRef.update({
        totalSales: FieldValue.increment(1),
        totalRevenue: FieldValue.increment(sale.amount || 0),
        lastSaleAt: FieldValue.serverTimestamp()
      });
    }
    
    console.log(`💰 [Firestore] Sale recorded: $${sale.amount} - Product: ${sale.productId}`);
    return saleRef.id;
  } catch (error) {
    console.error(`❌ [Firestore] Error recording sale:`, error.message);
    throw error;
  }
}

/**
 * Get analytics summary for dashboard
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} - Analytics summary
 */
export async function getAnalyticsSummary(days = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Get products count by status
    const productsSnapshot = await db.collection(COLLECTIONS.products).get();
    const productsByStatus = {
      testing: 0,
      winner: 0,
      archived: 0
    };
    
    productsSnapshot.docs.forEach(doc => {
      const status = doc.data().status || 'testing';
      productsByStatus[status]++;
    });
    
    // Get sales in period
    const salesSnapshot = await db.collection(COLLECTIONS.sales)
      .where('timestamp', '>', cutoffDate)
      .get();
    
    let totalRevenue = 0;
    salesSnapshot.docs.forEach(doc => {
      totalRevenue += doc.data().amount || 0;
    });
    
    // Get top 5 products
    const topProducts = await getTopPerformers(days, 5);
    
    const summary = {
      period: `Last ${days} days`,
      products: {
        total: productsSnapshot.size,
        testing: productsByStatus.testing,
        winners: productsByStatus.winner,
        archived: productsByStatus.archived
      },
      sales: {
        count: salesSnapshot.size,
        revenue: totalRevenue,
        avgOrderValue: salesSnapshot.size > 0 ? totalRevenue / salesSnapshot.size : 0
      },
      topProducts: topProducts.map(p => ({
        name: p.product_name || p.productId,
        score: p.score,
        sales: p.sales
      }))
    };
    
    console.log(`📈 [Firestore] Analytics summary generated for last ${days} days`);
    return summary;
  } catch (error) {
    console.error(`❌ [Firestore] Error getting analytics:`, error.message);
    throw error;
  }
}

export default {
  saveProduct,
  saveMetrics,
  promoteToWinner,
  getTopPerformers,
  detectWinners,
  recordSale,
  getAnalyticsSummary
};
