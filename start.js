import { spawn } from 'child_process';
import path from 'path';

console.log("#############################################");
console.log("##                                         ##");
console.log("##  INICIANDO EL IMPERIO DE AGENTES GOIO™  ##");
console.log("##                                         ##");
console.log("#############################################");
console.log("\n");

const CWD = process.cwd();
const supervisorPath = path.join(CWD, 'agents', 'supervisor.js');

console.log(`[Arranque] 🚀 Lanzando al supervisor desde: ${supervisorPath}`);

const supervisorProcess = spawn('node', [supervisorPath], {
  // stdio: 'inherit' permite que el subproceso (supervisor) imprima directamente en esta terminal
  stdio: 'inherit',
  shell: true
});

supervisorProcess.on('close', (code) => {
  console.log("\n");
  console.log("#############################################");
  console.log("##                                         ##");
  if (code === 0) {
    console.log("##  EL CICLO DEL IMPERIO HA CONCLUIDO     ##");
    console.log("##  TODOS LOS AGENTES COMPLETARON SU      ##");
    console.log("##  MISIÓN CON ÉXITO.                     ##");
  } else {
    console.log("##  ALERTA: EL SUPERVISOR TERMINÓ CON     ##");
    console.log(`##  ERRORES (CÓDIGO: ${code}). REVISAR LOGS.   ##`);
  }
  console.log("##                                         ##");
  console.log("#############################################");
});

supervisorProcess.on('error', (err) => {
  console.error('[Arranque] ❌ Error fatal al intentar lanzar al supervisor:', err);
});
