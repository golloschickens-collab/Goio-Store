import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

console.log('[TrendHunter] Agente iniciado. Misión: Encontrar las últimas tendencias globales.');

const CWD = process.cwd();
const PYTHON_SCRIPT_PATH = path.join(CWD, 'utils', 'trends.py');
const TEMP_DIR = path.join(CWD, 'temp');
const OUTPUT_PATH = path.join(TEMP_DIR, 'search_results.json');

async function huntForTrends() {
  try {
    console.log(`[TrendHunter] Ejecutando script de Python en: ${PYTHON_SCRIPT_PATH}`);

    const pythonProcess = spawn('python', [PYTHON_SCRIPT_PATH]);

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`[TrendHunter] ❌ El script de Python terminó con errores (código: ${code}).`);
        console.error('[TrendHunter] Error:', scriptError);
        // Salir con error para que el supervisor detenga la cadena
        process.exit(1); 
      }

      try {
        console.log('[TrendHunter] Script de Python completado. Procesando salida...');
        const trends = JSON.parse(scriptOutput);
        
        // Asegurarse de que el directorio temporal exista
        await fs.mkdir(TEMP_DIR, { recursive: true });
        
        // Guardar los resultados para el siguiente agente
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(trends, null, 2));
        
        console.log(`[TrendHunter] ✅ Misión cumplida. Tendencias guardadas en: ${OUTPUT_PATH}`);
        console.log('[TrendHunter] El agente Research ahora tiene nueva inteligencia para procesar.');
        
      } catch (parseError) {
        console.error('[TrendHunter] ❌ Error al parsear la salida del script de Python:', parseError);
        console.error('[TrendHunter] Salida recibida:', scriptOutput);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('[TrendHunter] ❌ Error fatal al intentar ejecutar el agente:', error);
    process.exit(1);
  }
}

huntForTrends();
