// agents/creative.js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';

const CWD = process.cwd();

console.log('[Creative] Agente iniciado.');

async function generateCreativeContent() {
  console.log('[Creative] Tarea: Generar ideas de contenido y copy para productos encontrados.');

  try {
    // 1. Cargar la clave de API de Google
    const keysPath = path.join(CWD, 'config', 'keys.json');
    const keysFile = await fs.readFile(keysPath, 'utf8');
    const keys = JSON.parse(keysFile);
  const genAI = new GoogleGenerativeAI(keys.google_api_key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('[Creative] Cliente de IA de Google inicializado.');

    // 2. Encontrar y leer el último reporte de tendencias del agente de investigación
    const researchDir = path.join(CWD, 'reports', 'research');
    const trendFiles = (await fs.readdir(researchDir))
      .filter(file => file.startsWith('found_trends-'))
      .sort()
      .reverse();

    if (trendFiles.length === 0) {
      console.log('[Creative] No se encontraron reportes de tendencias para procesar. Terminando.');
      return;
    }

    const latestTrendReportPath = path.join(researchDir, trendFiles[0]);
    const productsFile = await fs.readFile(latestTrendReportPath, 'utf8');
    const products = JSON.parse(productsFile);
    console.log(`[Creative] Cargadas ${products.length} nuevas oportunidades desde: ${trendFiles[0]}`);

    // 3. Leer el prompt base
    const promptPath = path.join(CWD, 'prompts', 'creative_prompt.txt');
    const promptTemplate = await fs.readFile(promptPath, 'utf8');
    console.log('[Creative] Plantilla de prompt cargada.');

    const creativeOutputs = [];

    // 4. Generar contenido para cada producto encontrado
    for (const product of products) {
      console.log(`[Creative] Procesando oportunidad: ${product.product_name}`);
      const finalPrompt = promptTemplate.replace('{product_title}', product.product_name);

      let generatedText;
      try {
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        generatedText = response.text();
      } catch (iaError) {
        console.warn(`[Creative] ⚠️ IA no disponible para ${product.product_name}. Usando plantilla interna.`);
        generatedText = `🔥 ${product.product_name} en tendencia\n\nPor qué funciona: ${product.description}\n\nIdea de contenido:\n• Reel mostrando antes/después usando ${product.product_name}\n• CTA: "Desliza para ver cómo elevar tu día con este kit"\n• Hashtags: #${product.product_name.replace(/\s+/g, '')} #TendenciasGOIO #HechoParaTi`;
      }

      creativeOutputs.push({
        productName: product.product_name,
        original_description: product.description,
        creativeContent: generatedText,
      });
      console.log(`[Creative] Contenido generado para: ${product.product_name}`);
    }

    // 5. Guardar los resultados en `reports/creative/`
    const reportDir = path.join(CWD, 'reports', 'creative');
    await fs.mkdir(reportDir, { recursive: true });
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `creative-report-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(creativeOutputs, null, 2));

    console.log(`[Creative] Tarea completada. Informe creativo guardado en: ${reportPath}`);

  } catch (error) {
    console.error('[Creative] Ocurrió un error durante la ejecución:', error);
  }
}

generateCreativeContent();