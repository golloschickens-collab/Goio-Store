// agents/growth.js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';

const CWD = process.cwd();

console.log('[Growth] Agente iniciado.');

async function identifyGrowthOpportunities() {
  console.log('[Growth] Tarea: Identificar oportunidades de crecimiento.');

  try {
    // 1. Cargar la clave de API de Google
    const keysPath = path.join(CWD, 'config', 'keys.json');
    const keysFile = await fs.readFile(keysPath, 'utf8');
    const keys = JSON.parse(keysFile);
    const genAI = new GoogleGenerativeAI(keys.google_api_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    console.log('[Growth] Cliente de IA de Google inicializado.');

    // 2. Leer el reporte creativo más reciente
    const creativeReportDir = path.join(CWD, 'reports', 'creative');
    const creativeFiles = await fs.readdir(creativeReportDir);
    const latestCreativeReport = creativeFiles.sort().pop();
    let creativeReportContent = 'No hay informes creativos disponibles.';
    if (latestCreativeReport) {
      const reportPath = path.join(creativeReportDir, latestCreativeReport);
      creativeReportContent = await fs.readFile(reportPath, 'utf8');
      console.log(`[Growth] Cargado el informe creativo: ${latestCreativeReport}`);
    }

    // Métricas (placeholder hasta que el agente de métricas esté activo)
    const metricsContent = 'Métricas de rendimiento no disponibles actualmente.';

    // 3. Leer el prompt de estrategia de crecimiento
    const promptPath = path.join(CWD, 'prompts', 'growth_strategy_prompt.txt');
    const promptTemplate = await fs.readFile(promptPath, 'utf8');
    console.log('[Growth] Plantilla de prompt de crecimiento cargada.');

    // 4. Formatear el prompt y generar la estrategia
    const finalPrompt = promptTemplate
      .replace('{metrics}', metricsContent)
      .replace('{creative_report}', creativeReportContent);

    console.log('[Growth] Generando estrategia de crecimiento...');
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const growthPlan = response.text();

    // 5. Guardar el plan de crecimiento
    const reportDir = path.join(CWD, 'reports', 'growth');
    await fs.mkdir(reportDir, { recursive: true });
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `growth-report-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify({ growthPlan }, null, 2));

    console.log(`[Growth] Tarea completada. Informe guardado en: ${reportPath}`);

  } catch (error) {
    console.error('[Growth] Ocurrió un error durante la ejecución:', error);
  }
}

identifyGrowthOpportunities();
