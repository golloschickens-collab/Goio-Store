// agents/supervisor.js
import { fork } from 'child_process';
import path from 'path';
import { config } from '../scripts/config.js'; // Importar nuestra configuración central

const CWD = process.cwd();
const AGENTS_DIR = path.join(CWD, 'agents');

/**
 * Runs a single agent script, passing its specific configuration.
 * @param {string} agentName - The simple name of the agent to run (e.g., 'listing').
 * @param {object} agentConfig - The configuration block for that specific agent.
 * @returns {Promise<void>} A promise that resolves when the agent exits, or rejects on error.
 */
function runAgent(agentName, agentConfig) {
  return new Promise((resolve, reject) => {
    const agentPath = path.join(AGENTS_DIR, `${agentName}.js`);
    console.log(`\n[Supervisor] ----------------------------------------`);
    console.log(`[Supervisor] 🚀 Lanzando agente: ${agentName}`);
    console.log(`[Supervisor] ----------------------------------------`);

    // Pasar la configuración específica del agente como un argumento de línea de comandos en formato JSON
    const child = fork(agentPath, [JSON.stringify(agentConfig)], {
      env: process.env, // Las variables de entorno ya están cargadas por config.js
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

/**
 * Extrae el nombre simple del agente del nombre completo.
 * E.g., "Agent.ProductManager" -> "productmanager"
 * @param {string} fullAgentName
 * @returns {string}
 */
function getSimpleName(fullAgentName) {
    const parts = fullAgentName.split('.');
    return parts.length > 1 ? parts[1].toLowerCase() : fullAgentName.toLowerCase();
}


/**
 * Main supervisor loop.
 */
async function run() {
  console.log('[Supervisor] 🎬 Iniciando ciclo de supervisión basado en config.js...');

  try {
    const agentsToRun = config.agentes;
    const agentNames = agentsToRun.map(agent => agent.nombre);

    console.log(`[Supervisor] 📋 Plan de ejecución: ${agentNames.join(' -> ')}`);

    for (const agent of agentsToRun) {
      const simpleName = getSimpleName(agent.nombre);
      
      if (simpleName === 'supervisor') continue;

      // Ahora pasamos la configuración completa del agente a runAgent
      await runAgent(simpleName, agent);
    }

    console.log('\n[Supervisor] 🏁 Ciclo de supervisión completado.');

  } catch (error) {
    console.error('[Supervisor] ❌ Error fatal en el ciclo de supervisión:', error);
  }
}

run();