const { exec } = require('child_process');
const path = require('path');

/**
 * Ejecuta un script de Pinokio.
 * @param {string} scriptPath - La ruta relativa al script de Pinokio desde la raíz del proyecto.
 */
function ejecutarPinokio(scriptPath) {
  // Construye la ruta absoluta al script
  const absoluteScriptPath = path.resolve(__dirname, '..', scriptPath);
  const command = `pinokio run "${absoluteScriptPath}"`;

  console.log(`Ejecutando comando: ${command}`);

  const child = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar Pinokio: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error en Pinokio: ${stderr}`);
      return;
    }
    console.log(`Resultado de Pinokio:\n${stdout}`);
  });

  child.on('exit', (code) => {
    console.log(`Proceso de Pinokio finalizado con código ${code}`);
  });
}

module.exports = { ejecutarPinokio };
