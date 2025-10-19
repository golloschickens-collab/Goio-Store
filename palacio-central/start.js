import { spawn } from 'child_process';
import path from 'path';

console.log("#############################################");
console.log("##                                         ##");
console.log("##  🚀 GOIO STORE - SISTEMA AVANZADO v2.0  ##");
console.log("##  Venta Orgánica + IA + Automatización  ##");
console.log("##                                         ##");
console.log("#############################################");
console.log("\n");

const CWD = process.cwd();

/**
 * FLUJO ÉLITE - AGENTES QUE GENERAN DINERO REAL:
 * 
 * CAPA 1: INTELIGENCIA DE MERCADO
 * 1. TrendHunter → Busca tendencias globales
 * 2. Research → Analiza oportunidades
 * 3. MarketIntelligence → Espía competencia + predice ventas (NUEVO ÉLITE)
 * 
 * CAPA 2: OPTIMIZACIÓN COMERCIAL
 * 4. PricingGenius → Precio dinámico que maximiza ganancia (NUEVO ÉLITE)
 * 5. ConversionOptimizer → Elimina fricción en funnel (NUEVO ÉLITE)
 * 
 * CAPA 3: CREACIÓN DE ASSETS
 * 6. ImageGenerator → Imágenes profesionales DALL-E 3
 * 7. ShopifySync → Crea productos con precio óptimo
 * 
 * CAPA 4: DISTRIBUCIÓN AGRESIVA
 * 8. Creative → Copy que convierte al 10%+
 * 9. Publisher → Facebook con imagen + URL
 * 10. GroupMarketer → Venta orgánica en grupos
 * 
 * CAPA 5: ENGAGEMENT 24/7
 * 11. Engagement → Responde comentarios en tiempo real
 */

const AGENT_FLOW = [
  // CAPA 1: INTELIGENCIA
  { name: 'TrendHunter', script: 'trendhunter.js', wait: true },
  { name: 'Research', script: 'research.js', wait: true },
  { name: 'MarketIntelligence', script: 'marketintelligence.js', wait: true }, // ÉLITE
  
  // CAPA 2: OPTIMIZACIÓN
  { name: 'PricingGenius', script: 'pricinggenius.js', wait: true }, // ÉLITE
  { name: 'ConversionOptimizer', script: 'conversionoptimizer.js', wait: true }, // ÉLITE
  
  // CAPA 3: ASSETS
  { name: 'ImageGenerator', script: 'imagegenerator.js', wait: true },
  { name: 'ShopifySync', script: 'shopifysync.js', wait: true },
  
  // CAPA 4: DISTRIBUCIÓN
  { name: 'Creative', script: 'creative.js', wait: true },
  { name: 'Publisher', script: 'publisher.js', wait: true },
  { name: 'GroupMarketer', script: 'groupmarketer.js', wait: true },
  
  // CAPA 5: ENGAGEMENT
  { name: 'Engagement', script: 'engagement.js', wait: false } // Paralelo 24/7
];

async function executeAgent(agent) {
  return new Promise((resolve, reject) => {
    const agentPath = path.join(CWD, 'agents', agent.script);
    
    console.log(`\n[${agent.name}] 🚀 Iniciando...`);
    
    const process = spawn('node', [agentPath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`[${agent.name}] ✅ Completado exitosamente.\n`);
        resolve();
      } else {
        console.error(`[${agent.name}] ❌ Error (código: ${code})\n`);
        reject(new Error(`${agent.name} failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`[${agent.name}] ❌ Error fatal:`, err);
      reject(err);
    });
  });
}

async function runImperialFlow() {
  console.log("📋 FLUJO IMPERIAL INICIADO\n");
  console.log("Agentes a ejecutar:");
  AGENT_FLOW.forEach((agent, i) => {
    console.log(`  ${i + 1}. ${agent.name} ${agent.wait ? '(secuencial)' : '(paralelo)'}`);
  });
  console.log("\n" + "=".repeat(50) + "\n");
  
  try {
    // Ejecutar agentes secuencialmente hasta Engagement
    for (const agent of AGENT_FLOW) {
      if (agent.wait) {
        await executeAgent(agent);
      } else {
        // Engagement corre en paralelo (no bloqueante)
        console.log(`[${agent.name}] 🔄 Ejecutando en segundo plano...`);
        executeAgent(agent).catch(err => {
          console.error(`[${agent.name}] Error en background:`, err.message);
        });
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("\n#############################################");
    console.log("##                                         ##");
    console.log("##  ✅ CICLO IMPERIAL COMPLETADO          ##");
    console.log("##  Todos los agentes ejecutados OK       ##");
    console.log("##                                         ##");
    console.log("#############################################\n");
    
    process.exit(0);
    
  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.log("\n#############################################");
    console.log("##                                         ##");
    console.log("##  ⚠️  ERROR EN CICLO IMPERIAL           ##");
    console.log("##  Revisar logs arriba                   ##");
    console.log("##                                         ##");
    console.log("#############################################\n");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Ejecutar flujo
runImperialFlow();
