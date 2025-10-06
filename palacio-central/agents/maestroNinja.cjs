const fs = require('fs');
const path = require('path');

// Define the path to the plan file
const PLAN_FILE_PATH = path.join(__dirname, '../config/plan.json');
const AGENTS_DIR = path.join(__dirname, './'); // Directory where agents are located

// Function to load the plan
const loadPlan = () => {
  try {
    const planData = fs.readFileSync(PLAN_FILE_PATH, 'utf8');
    return JSON.parse(planData);
  } catch (error) {
    console.error(`❌ Error al cargar el plan desde ${PLAN_FILE_PATH}:`, error.message);
    process.exit(1); // Exit if plan cannot be loaded
  }
};

// Function to run a single agent
const runAgent = async (agentName) => {
  console.log(`✨ Ejecutando agente: ${agentName}...`);
  try {
    // Construct the path to the agent file
    const agentPath = path.join(AGENTS_DIR, `${agentName}.js`);
    // Dynamically require the agent. For CJS, this works.
    // If agents were ESM, we'd need dynamic import()
    const agentModule = require(agentPath);

    // Assuming each agent exports an async function named 'run' or similar
    // Or, if they are self-executing, just requiring them is enough.
    // For now, let's assume they export a 'run' function.
    if (typeof agentModule.run === 'function') {
      await agentModule.run();
    } else {
      // If the agent is self-executing, just requiring it is enough.
      // We might need to adjust this based on actual agent implementations.
      console.log(`  Agente ${agentName} cargado. Asumiendo auto-ejecución.`);
    }
    console.log(`✅ Agente ${agentName} completado.`);
    return { agent: agentName, status: 'completed' };
  } catch (error) {
    console.error(`❌ Error al ejecutar agente ${agentName}:`, error.message);
    return { agent: agentName, status: 'failed', error: error.message };
  }
};

// Main supervisor function
const startSupervisor = async () => {
  console.log("👑 Iniciando el Oráculo Supervisor...");
  const plan = loadPlan();
  console.log("📜 Plan cargado. Agentes a orquestar:", plan.agents.join(', '));

  const dailyReport = [];

  for (const agentName of plan.agents) {
    const result = await runAgent(agentName);
    dailyReport.push(result);
  }

  console.log("\n--- Informe Diario del Oráculo Supervisor ---");
  dailyReport.forEach(item => {
    console.log(`- Agente: ${item.agent}, Estado: ${item.status}`);
    if (item.error) {
      console.log(`  Error: ${item.error}`);
    }
  });
  console.log("------------------------------------------");

  console.log("👑 Oráculo Supervisor ha completado su ciclo.");

  // Implement interval for continuous operation if supervisor_interval_ms > 0
  if (plan.supervisor_interval_ms > 0) {
    console.log(`El Oráculo se reactivará en ${plan.supervisor_interval_ms / 1000} segundos.`);
    setTimeout(startSupervisor, plan.supervisor_interval_ms);
  }
};

// Start the supervisor
startSupervisor();
