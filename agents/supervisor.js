// agents/supervisor.js
import 'dotenv/config';
import { fork } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

console.log('[Supervisor] Iniciando ciclo de supervisión...');

const AGENTS_DIR = path.resolve(process.cwd(), 'agents');

async function run() {
  try {
    const configPath = path.resolve(process.cwd(), 'config', 'plan.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const { supervisor_interval_ms, agents: agentNames } = config;

    console.log(`[Supervisor] Agentes a ejecutar: ${agentNames.join(', ')}`);

    for (const agentName of agentNames) {
      // No ejecutar el propio supervisor en un bucle
      if (agentName === 'supervisor') continue;
      
      

      const agentPath = path.join(AGENTS_DIR, `${agentName}.js`);
      try {
        await fs.access(agentPath); // Check if file exists
        console.log(`[Supervisor] Lanzando agente: ${agentName}`);
        const child = fork(agentPath, [agentName]);

        child.on('error', (err) => {
          console.error(`[Supervisor] Error en el agente ${agentName}:`, err);
        });

        child.on('exit', (code) => {
          if (code !== 0) {
            console.warn(`[Supervisor] Agente ${agentName} terminó con código de salida: ${code}`);
          }
        });
      } catch (error) {
        console.warn(`[Supervisor] No se encontró el script para el agente '${agentName}' en ${agentPath}`);
      }
    }

    if (supervisor_interval_ms > 0) {
        setTimeout(run, supervisor_interval_ms);
        console.log(`[Supervisor] Próxima ejecución en ${supervisor_interval_ms / 1000} segundos.`);
    } else {
        console.log('[Supervisor] Ciclo único completado. No se re-ejecutará.');
    }

  } catch (error) {
    console.error('[Supervisor] Error fatal en el ciclo de supervisión:', error);
  }
}

// Antes de iniciar, crear los archivos de config si no existen
async function setupConfig() {
    const configDir = path.resolve(process.cwd(), 'config');
    const planPath = path.join(configDir, 'plan.json');
    const productsPath = path.join(configDir, 'products.json');

    try {
        await fs.mkdir(configDir, { recursive: true });

        try {
            await fs.access(planPath);
        } catch {
            console.log('[Supervisor] Creando config/plan.json de ejemplo.');
            await fs.writeFile(planPath, JSON.stringify({
                "supervisor_interval_ms": 60000,
                "agents": ["creative", "listings", "metrics", "growth", "research", "supplier_sync"]
            }, null, 2));
        }

        try {
            await fs.access(productsPath);
        } catch {
            console.log('[Supervisor] Creando config/products.json vacío.');
            await fs.writeFile(productsPath, '[]');
        }
    } catch (error) {
        console.error('[Supervisor] No se pudo crear la configuración inicial:', error);
    }
}

setupConfig().then(run);