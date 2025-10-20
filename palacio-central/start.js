import { spawn } from 'child_process';
import path from 'path';
import http from 'http';

console.log("#############################################");
console.log("##                                         ##");
console.log("##  🚀 GOIO STORE - SISTEMA ELITE V3.0    ##");
console.log("##  24/7 Autónomo en Cloud Run            ##");
console.log("##                                         ##");
console.log("#############################################");
console.log("\n");

const CWD = process.cwd();
const PORT = process.env.PORT || 8080;

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
  // { name: 'TrendHunter', script: 'trendhunter.js', wait: true }, // DESHABILITADO: SSL error con Google Trends
  // { name: 'Research', script: 'research.js', wait: true }, // DESHABILITADO: Depende de TrendHunter
  { name: 'MarketIntelligence', script: 'marketintelligence.js', wait: true }, // ÉLITE - Análisis de competencia
  
  // CAPA 2: OPTIMIZACIÓN
  { name: 'PricingGenius', script: 'pricinggenius.js', wait: true }, // ÉLITE - Precio dinámico
  { name: 'ConversionOptimizer', script: 'conversionoptimizer.js', wait: true }, // ÉLITE - CRO
  
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

let isExecuting = false;
let lastExecutionStatus = 'idle';
let lastExecutionTime = null;

async function executeAgent(agent) {
  return new Promise((resolve, reject) => {
    const agentPath = path.join(CWD, 'agents', agent.script);
    
    console.log(`\n[${agent.name}] 🚀 Iniciando...`);
    
    const childProcess = spawn('node', [agentPath], {
      stdio: 'inherit'
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`[${agent.name}] ✅ Completado exitosamente.\n`);
        resolve();
      } else {
        console.error(`[${agent.name}] ❌ Error (código: ${code})\n`);
        reject(new Error(`${agent.name} failed with code ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      console.error(`[${agent.name}] ❌ Error fatal:`, err);
      reject(err);
    });
  });
}

async function runImperialFlow() {
  if (isExecuting) {
    console.log("⚠️  Flujo ya en ejecución, ignorando solicitud duplicada");
    return { success: false, message: 'Already executing' };
  }
  
  isExecuting = true;
  lastExecutionTime = new Date().toISOString();
  
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
    
    lastExecutionStatus = 'success';
    isExecuting = false;
    
    return { success: true, message: 'Flow completed successfully' };
    
  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.log("\n#############################################");
    console.log("##                                         ##");
    console.log("##  ⚠️  ERROR EN CICLO IMPERIAL           ##");
    console.log("##  Revisar logs arriba                   ##");
    console.log("##                                         ##");
    console.log("#############################################\n");
    console.error("Error:", error.message);
    
    lastExecutionStatus = 'error';
    isExecuting = false;
    
    return { success: false, message: error.message };
  }
}

// Servidor HTTP para Cloud Run
const server = http.createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'Palacio Central ELITE v3.0',
      isExecuting,
      lastExecutionStatus,
      lastExecutionTime,
      uptime: process.uptime()
    }));
    return;
  }
  
  // Execute endpoint (llamado por Cloud Scheduler)
  if (req.url === '/execute' && req.method === 'POST') {
    console.log("\n🔔 Solicitud de ejecución recibida de Cloud Scheduler");
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Execution started',
      timestamp: new Date().toISOString()
    }));
    
    // Ejecutar flujo en background (no bloqueante)
    runImperialFlow().then(result => {
      console.log("Resultado de ejecución:", result);
    }).catch(err => {
      console.error("Error en ejecución:", err);
    });
    
    return;
  }
  
  // Endpoint no encontrado
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`\n🌐 Servidor HTTP escuchando en puerto ${PORT}`);
  console.log(`✅ Sistema ELITE v3.0 listo para recibir comandos de Cloud Scheduler\n`);
  console.log(`Endpoints disponibles:`);
  console.log(`  • GET  /health   → Health check`);
  console.log(`  • POST /execute  → Ejecutar flujo de agentes\n`);
});
