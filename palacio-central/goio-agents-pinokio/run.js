// goio-agents-pinokio/run.js

// Importa el supervisor de agentes desde su ubicación original
const supervisor = require('../agents/supervisor');

// Llama a la función para iniciar los agentes
supervisor.iniciarAgentes();

console.log("Pinokio ha iniciado los agentes de Goio Store.");
