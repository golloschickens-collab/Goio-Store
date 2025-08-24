import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config as globalConfig } from '../scripts/config.js';

// --- Configuración y Validación Inicial ---
if (!process.argv[2]) {
  console.error('[ContentStrategist] Error Crítico: Este agente debe ser ejecutado por el supervisor.');
  process.exit(1);
}

const agentConfig = JSON.parse(process.argv[2]);
console.log('[ContentStrategist] Agente iniciado. Órdenes recibidas:', agentConfig.tareas);

const CWD = process.cwd();

// --- Lógica Principal del Agente ---
async function generateContentStrategies() {
  console.log('[ContentStrategist] Tarea: Generar estrategias de contenido orgánico.');

  try {
    // 1. Validar que la API Key de Gemini exista
    if (!globalConfig.apiKeys.gemini) {
      console.error('[ContentStrategist] ❌ Error: La GEMINI_API_KEY no está definida en el archivo .env. No se puede proceder.');
      return;
    }

    // 2. Cargar la plantilla del prompt
    const promptTemplatePath = path.join(CWD, 'prompts', 'content_strategist_prompt.txt');
    const promptTemplate = await fs.readFile(promptTemplatePath, 'utf8');
    console.log('[ContentStrategist] Plantilla de prompt cargada.');

    // 3. Cargar el reporte creativo más reciente para obtener los productos
    const creativeReportDir = path.join(CWD, 'reports', 'creative');
    const creativeFiles = (await fs.readdir(creativeReportDir).catch(() => [])).filter(f => f.endsWith('.json'));
    
    if (creativeFiles.length === 0) {
        console.log('[ContentStrategist] No se encontraron reportes creativos para procesar. Terminando.');
        return;
    }

    const latestCreativeReport = creativeFiles.sort().pop();
    const reportPath = path.join(creativeReportDir, latestCreativeReport);
    const creativeData = JSON.parse(await fs.readFile(reportPath, 'utf8'));
    console.log(`[ContentStrategist] Usando productos del informe: ${latestCreativeReport}`);

    // 4. Inicializar el cliente de IA
    const genAI = new GoogleGenerativeAI(globalConfig.apiKeys.gemini);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const allStrategies = [];

    // 5. Generar estrategias para cada producto
    for (const item of creativeData) {
      const productName = item.productName;
      console.log(`[ContentStrategist] Generando estrategias para: ${productName}...`);

      const finalPrompt = promptTemplate.replace('[Product Name]', productName);
      
      try {
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();
        
        allStrategies.push({
          productName: productName,
          contentStrategies: text
        });
        console.log(`[ContentStrategist] ✅ Estrategias generadas para ${productName}.`);

      } catch (e) {
        console.error(`[ContentStrategist] ❌ Fallo la llamada a la API de Gemini para ${productName}:`, e);
      }
    }

    // 6. Guardar el nuevo reporte de estrategias
    if (allStrategies.length > 0) {
      const now = new Date().toISOString().split('T')[0];
      const reportDir = path.join(CWD, 'reports', 'content-strategy');
      const reportPath = path.join(reportDir, `content-plan-${now}.json`);
      
      await fs.mkdir(reportDir, { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(allStrategies, null, 2));
      console.log(`[ContentStrategist] ✅ Reporte de estrategias de contenido guardado en: ${reportPath}`);
    }

    console.log('[ContentStrategist] Tarea completada.');

  } catch (error) {
    console.error('[ContentStrategist] Ocurrió un error fatal durante la ejecución:', error);
  }
}

generateContentStrategies();
