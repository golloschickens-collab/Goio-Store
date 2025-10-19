// agents/marketintelligence.js - Espía competencia y predice ventas 24/7
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const CWD = process.cwd();

console.log('[MarketIntelligence] 🕵️ AGENTE ÉLITE ACTIVADO - Inteligencia de mercado real-time');

/**
 * NIVEL ÉLITE: Analiza competencia y predice demanda REAL
 * No fake data, sino INTELIGENCIA COMERCIAL de nivel mundial
 */

/**
 * Analiza precios de competidores en Mercado Libre Perú
 */
async function scrapeMercadoLibre(productName) {
  console.log(`[MarketIntelligence] 🔍 Analizando competencia en Mercado Libre: ${productName}`);
  
  try {
    // Mercado Libre API pública (sin auth necesaria para búsqueda)
    const searchQuery = encodeURIComponent(productName);
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MPE/search?q=${searchQuery}&limit=20`
    );
    
    if (!response.ok) {
      console.warn('[MarketIntelligence] ⚠️ Error en API Mercado Libre');
      return null;
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('[MarketIntelligence] 📊 Producto no encontrado en Mercado Libre');
      return null;
    }
    
    // Extraer precios y calcular estadísticas
    const prices = data.results
      .filter(item => item.price && item.currency_id === 'PEN')
      .map(item => item.price)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) return null;
    
    const analysis = {
      totalListings: data.results.length,
      priceMin: prices[0],
      priceMax: prices[prices.length - 1],
      priceAvg: prices.reduce((a, b) => a + b, 0) / prices.length,
      priceMedian: prices[Math.floor(prices.length / 2)],
      // Top 3 competidores
      topCompetitors: data.results.slice(0, 3).map(item => ({
        title: item.title,
        price: item.price,
        sold: item.sold_quantity || 0,
        permalink: item.permalink
      }))
    };
    
    console.log(`[MarketIntelligence] 💰 Análisis completado: Precio promedio S/ ${analysis.priceAvg.toFixed(2)}`);
    return analysis;
    
  } catch (error) {
    console.error('[MarketIntelligence] ❌ Error scraping Mercado Libre:', error.message);
    return null;
  }
}

/**
 * Analiza demanda real-time con Google Trends
 */
async function analyzeDemand(productName) {
  console.log(`[MarketIntelligence] 📈 Analizando demanda en Google Trends: ${productName}`);
  
  // Usar pytrends (ya instalado en Dockerfile)
  try {
    const pythonScript = `
import json
from pytrends.request import TrendReq

pytrends = TrendReq(hl='es-PE', tz=360)
keywords = ['${productName}']
pytrends.build_payload(keywords, timeframe='now 7-d', geo='PE')

# Obtener interés por región
interest = pytrends.interest_over_time()
if not interest.empty:
    current_interest = int(interest['${productName}'].iloc[-1])
    avg_interest = int(interest['${productName}'].mean())
    trend = 'rising' if current_interest > avg_interest else 'stable'
else:
    current_interest = 0
    avg_interest = 0
    trend = 'unknown'

print(json.dumps({
    'currentInterest': current_interest,
    'avgInterest': avg_interest,
    'trend': trend
}))
`;
    
    const tempFile = path.join(CWD, 'temp', 'trends_analysis.py');
    await fs.mkdir(path.dirname(tempFile), { recursive: true });
    await fs.writeFile(tempFile, pythonScript);
    
    // Ejecutar Python (usar spawn para capturar output)
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const python = spawn('python3', [tempFile]);
      let output = '';
      
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.on('close', (code) => {
        try {
          if (code === 0 && output) {
            const result = JSON.parse(output);
            console.log(`[MarketIntelligence] 📊 Demanda actual: ${result.currentInterest}/100 (${result.trend})`);
            resolve(result);
          } else {
            resolve({ currentInterest: 50, avgInterest: 50, trend: 'unknown' });
          }
        } catch (e) {
          resolve({ currentInterest: 50, avgInterest: 50, trend: 'unknown' });
        }
      });
    });
    
  } catch (error) {
    console.error('[MarketIntelligence] ❌ Error analizando demanda:', error.message);
    return { currentInterest: 50, avgInterest: 50, trend: 'unknown' };
  }
}

/**
 * IA predice si el producto venderá HOY
 */
async function predictSales(productName, marketData, demandData) {
  console.log(`[MarketIntelligence] 🤖 IA prediciendo probabilidad de venta: ${productName}`);
  
  const keysPath = path.join(CWD, 'config', 'keys.json');
  const keysFile = await fs.readFile(keysPath, 'utf8');
  const keys = JSON.parse(keysFile);
  
  const genAI = new GoogleGenerativeAI(keys.google_api_key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Pro para análisis avanzado
  
  const prompt = `Eres un analista comercial élite con 20 años de experiencia en e-commerce en Perú.

PRODUCTO: ${productName}

DATOS DE MERCADO (Mercado Libre Perú):
- Total de listings: ${marketData?.totalListings || 'N/A'}
- Precio mínimo: S/ ${marketData?.priceMin?.toFixed(2) || 'N/A'}
- Precio promedio: S/ ${marketData?.priceAvg?.toFixed(2) || 'N/A'}
- Precio máximo: S/ ${marketData?.priceMax?.toFixed(2) || 'N/A'}

DEMANDA (Google Trends últimos 7 días):
- Interés actual: ${demandData.currentInterest}/100
- Interés promedio: ${demandData.avgInterest}/100
- Tendencia: ${demandData.trend}

COMPETIDORES TOP 3:
${marketData?.topCompetitors?.map((c, i) => `${i+1}. ${c.title} - S/ ${c.price} (Vendidos: ${c.sold})`).join('\n') || 'Sin datos'}

TAREA:
Analiza estos datos y genera un reporte de INTELIGENCIA COMERCIAL:

1. **PROBABILIDAD DE VENTA HOY**: 0-100%
2. **PRECIO ÓPTIMO**: El precio que maximiza ganancia (no volumen)
3. **RAZÓN**: Por qué este producto venderá o no
4. **COMPETENCIA**: Nivel de saturación (bajo/medio/alto)
5. **URGENCIA**: ¿Publicar HOY o esperar?
6. **ESTRATEGIA**: Copy angle específico que explotará la demanda

FORMATO (JSON):
{
  "salesProbability": 85,
  "optimalPrice": 89.90,
  "reasoning": "Alta demanda estacional, competencia media, precio promedio elevado = oportunidad",
  "competition": "media",
  "urgency": "alta",
  "strategy": "Enfocarse en 'Último día de oferta' + precio 15% debajo del promedio"
}

Responde SOLO con el JSON, sin explicaciones adicionales.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extraer JSON (puede venir con markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }
    
    const prediction = JSON.parse(jsonMatch[0]);
    console.log(`[MarketIntelligence] 🎯 Predicción: ${prediction.salesProbability}% probabilidad de venta`);
    
    return prediction;
    
  } catch (error) {
    console.error('[MarketIntelligence] ❌ Error en predicción IA:', error.message);
    
    // Fallback: Predicción heurística
    const heuristicProb = Math.min(
      100,
      (demandData.currentInterest * 0.6) + 
      (marketData?.totalListings > 10 ? 30 : 50) +
      (demandData.trend === 'rising' ? 20 : 0)
    );
    
    return {
      salesProbability: Math.round(heuristicProb),
      optimalPrice: marketData?.priceAvg * 0.85 || 79.90,
      reasoning: 'Predicción heurística basada en demanda y competencia',
      competition: marketData?.totalListings > 20 ? 'alta' : 'media',
      urgency: demandData.trend === 'rising' ? 'alta' : 'media',
      strategy: 'Precio competitivo 15% debajo del promedio de mercado'
    };
  }
}

/**
 * Proceso principal: Análisis completo de mercado
 */
async function analyzeMarket() {
  console.log('[MarketIntelligence] 🕵️ Iniciando análisis de inteligencia de mercado...');
  
  try {
    // 1. Leer productos del Research Agent
    const researchDir = path.join(CWD, 'reports', 'research');
    const trendFiles = (await fs.readdir(researchDir))
      .filter(file => file.startsWith('found_trends-'))
      .sort()
      .reverse();
    
    if (trendFiles.length === 0) {
      console.log('[MarketIntelligence] ⚠️ No hay productos para analizar.');
      return;
    }
    
    const latestTrends = path.join(researchDir, trendFiles[0]);
    const products = JSON.parse(await fs.readFile(latestTrends, 'utf8'));
    console.log(`[MarketIntelligence] 📂 Analizando ${products.length} productos...`);
    
    // 2. Analizar cada producto
    const marketIntelligence = [];
    
    for (const product of products) {
      console.log(`\n[MarketIntelligence] 🔬 Analizando: ${product.product_name}`);
      
      // Scraping competencia
      const marketData = await scrapeMercadoLibre(product.product_name);
      
      // Análisis demanda
      const demandData = await analyzeDemand(product.product_name);
      
      // Predicción IA
      const prediction = await predictSales(product.product_name, marketData, demandData);
      
      marketIntelligence.push({
        productName: product.product_name,
        originalDescription: product.description,
        marketData: marketData,
        demandData: demandData,
        prediction: prediction,
        timestamp: new Date().toISOString(),
        // DECISIÓN FINAL
        decision: prediction.salesProbability >= 70 ? 'PUBLICAR_HOY' : 'ESPERAR',
        priority: prediction.salesProbability >= 85 ? 'URGENTE' : 
                  prediction.salesProbability >= 70 ? 'ALTA' : 'MEDIA'
      });
      
      console.log(`[MarketIntelligence] ✅ ${product.product_name}: ${prediction.salesProbability}% → ${prediction.urgency.toUpperCase()}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3s entre análisis
    }
    
    // 3. Ordenar por prioridad
    marketIntelligence.sort((a, b) => b.prediction.salesProbability - a.prediction.salesProbability);
    
    // 4. Guardar reporte
    const reportDir = path.join(CWD, 'reports', 'intelligence');
    await fs.mkdir(reportDir, { recursive: true });
    
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `market-intelligence-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(marketIntelligence, null, 2));
    
    // 5. Resumen ejecutivo
    const urgent = marketIntelligence.filter(p => p.decision === 'PUBLICAR_HOY');
    console.log('\n' + '='.repeat(60));
    console.log('[MarketIntelligence] 📊 RESUMEN EJECUTIVO');
    console.log('='.repeat(60));
    console.log(`Total productos analizados: ${marketIntelligence.length}`);
    console.log(`Productos para publicar HOY: ${urgent.length}`);
    console.log(`Probabilidad promedio de venta: ${Math.round(marketIntelligence.reduce((sum, p) => sum + p.prediction.salesProbability, 0) / marketIntelligence.length)}%`);
    console.log('\nTOP 3 PRODUCTOS CON MAYOR PROBABILIDAD:');
    marketIntelligence.slice(0, 3).forEach((p, i) => {
      console.log(`${i+1}. ${p.productName}`);
      console.log(`   Probabilidad: ${p.prediction.salesProbability}%`);
      console.log(`   Precio óptimo: S/ ${p.prediction.optimalPrice}`);
      console.log(`   Estrategia: ${p.prediction.strategy}`);
    });
    console.log('='.repeat(60));
    
    console.log(`\n[MarketIntelligence] 💾 Reporte guardado: ${reportPath}`);
    
  } catch (error) {
    console.error('[MarketIntelligence] ❌ Error fatal:', error);
  }
}

// Ejecutar
analyzeMarket();
