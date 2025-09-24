// agents/supervisor.js
import express from 'express';
import { fork } from 'child_process';
import path from 'path';
import { config } from '../scripts/config.js'; // Importar nuestra configuración central

// --- Configuración del Servidor Web ---
const app = express();
const PORT = process.env.PORT || 3002;
const METRICS_TOKEN = process.env.METRICS_TOKEN;

// Middleware para parsear JSON (útil para futuros endpoints)
app.use(express.json());

// Endpoint de Métricas para Prometheus
app.get('/metrics', (req, res) => {
  // Validar el token de autorización
  if (METRICS_TOKEN && req.headers.authorization !== `Bearer ${METRICS_TOKEN}`) {
    return res.status(401).send('Unauthorized: Se requiere un token de métricas válido.');
  }
  
  // Aquí se agregarían las métricas reales en formato Prometheus
  // Por ahora, es un placeholder
  res.set('Content-Type', 'text/plain');
  res.send('# Aca iran las metricas de Prometheus\napp_online 1\n');
});

// Endpoint de Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


// --- Lógica de Orquestación de Agentes ---
const CWD = process.cwd();
const AGENTS_DIR = path.join(CWD, 'agents');

function runAgent(agentName, agentConfig) {
  return new Promise((resolve, reject) => {
    const agentPath = path.join(AGENTS_DIR, `${agentName}.js`);
    console.log(`
[Supervisor] ----------------------------------------`);
    console.log(`[Supervisor] 🚀 Lanzando agente: ${agentName}`);
    console.log(`[Supervisor] ----------------------------------------`);

    const child = fork(agentPath, [JSON.stringify(agentConfig)], {
      env: process.env,
      silent: false
    });

    child.on('error', (err) => {
      console.error(`[Supervisor] ❌ Error en el agente ${agentName}:`, err);
      reject(err);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`[Supervisor] ⚠️  Agente ${agentName} terminó con código de error: ${code}`);
      } else {
        console.log(`[Supervisor] ✅ Agente ${agentName} completado con éxito.`);
      }
      resolve();
    });
  });
}

function getSimpleName(fullAgentName) {
    const parts = fullAgentName.split('.');
    return parts.length > 1 ? parts[1].toLowerCase() : fullAgentName.toLowerCase();
}

async function runAgentCycle() {
  console.log('[Supervisor] 🎬 Iniciando ciclo de supervisión basado en config.js...');

  try {
    const agentsToRun = config.agentes;
    const agentNames = agentsToRun.map(agent => agent.nombre);

    console.log(`[Supervisor] 📋 Plan de ejecución: ${agentNames.join(' -> ')}`);

    for (const agent of agentsToRun) {
      const simpleName = getSimpleName(agent.nombre);
      
      if (simpleName === 'supervisor') continue;

      await runAgent(simpleName, agent);
    }

    console.log('\n[Supervisor] 🏁 Ciclo de supervisión completado.');

  } catch (error) {
    console.error('[Supervisor] ❌ Error fatal en el ciclo de supervisión:', error);
  }
}

// --- Arranque del Servidor y Ciclo de Agentes ---
app.listen(PORT, () => {
  console.log(`[Supervisor] 🌐 Servidor web escuchando en http://localhost:${PORT}`);
  console.log(`[Supervisor]    - Endpoint de métricas: /metrics`);
  console.log(`[Supervisor]    - Endpoint de salud: /health`);
  
  // Ejecutar el ciclo de agentes una vez, justo después de que el servidor arranque.
  // No bloquea el servidor, solo se ejecuta en segundo plano.
  console.log('[Supervisor] 🚀 El servidor está listo. Lanzando el ciclo de agentes inicial...');
  runAgentCycle().catch(error => {
    console.error('[Supervisor] ❌ Falló el ciclo de agentes inicial:', error);
  });
});
