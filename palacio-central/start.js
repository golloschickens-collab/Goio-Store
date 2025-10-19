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
 * NUEVO FLUJO AUTOMATIZADO:
 * 1. TrendHunter → Busca tendencias
 * 2. Research → Analiza oportunidades
 * 3. ImageGenerator → Crea imágenes profesionales (DALL-E 3)
 * 4. ShopifySync → Crea productos en Shopify con imagen
 * 5. Creative → Genera copy persuasivo con URL
 * 6. Publisher → Publica en Facebook con imagen + URL
 * 7. GroupMarketer → Distribuye en grupos (orgánico)
 * 8. Engagement → Responde comentarios 24/7
 */

const AGENT_FLOW = [
  { name: 'TrendHunter', script: 'trendhunter.js', wait: true },
  { name: 'Research', script: 'research.js', wait: true },
  { name: 'ImageGenerator', script: 'imagegenerator.js', wait: true },
  { name: 'ShopifySync', script: 'shopifysync.js', wait: true },
  { name: 'Creative', script: 'creative.js', wait: true },
  { name: 'Publisher', script: 'publisher.js', wait: true },
  { name: 'GroupMarketer', script: 'groupmarketer.js', wait: true },
  { name: 'Engagement', script: 'engagement.js', wait: false } // Corre en paralelo
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
