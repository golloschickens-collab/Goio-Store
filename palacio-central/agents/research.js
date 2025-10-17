// agents/research.js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';

const CWD = process.cwd();

console.log('[Research] Agente Cazador de Tendencias iniciado.');

async function findAndAnalyzeTrends() {
  console.log('[Research] Tarea: Analizar resultados de búsqueda para encontrar productos.');

  try {
    // 1. Cargar la clave de API de Google
    const keysPath = path.join(CWD, 'config', 'keys.json');
    const keysFile = await fs.readFile(keysPath, 'utf8');
    const keys = JSON.parse(keysFile);
  const genAI = new GoogleGenerativeAI(keys.google_api_key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('[Research] Cliente de IA de Google inicializado.');

    // 2. Leer los resultados de búsqueda de un archivo temporal
    const searchResultsPath = path.join(CWD, 'temp', 'search_results.json');
    let searchResults;
    try {
      const searchResultsFile = await fs.readFile(searchResultsPath, 'utf8');
      searchResults = JSON.parse(searchResultsFile);
      console.log('[Research] Resultados de búsqueda cargados desde temp/search_results.json');
    } catch (error) {
      console.error('[Research] Error: No se encontraron resultados de búsqueda en temp/search_results.json. Ejecuta la búsqueda primero.');
      return;
    }

    // 3. Preparar y ejecutar el prompt de análisis
    const analysisPrompt = `
      Basado en los siguientes resultados de búsqueda sobre productos en tendencia, extrae un máximo de 5 ideas de productos prometedores para vender por dropshipping.
      Para cada idea, proporciona:
      - "product_name": Un nombre de producto corto y atractivo.
      - "description": Una descripción de 1-2 frases explicando por qué es una buena oportunidad.
      - "target_audience": El público objetivo principal.
      
      Devuelve el resultado como un array de objetos JSON válidos, y nada más. No incluyas texto introductorio ni de despedida. No uses markdown.

      Resultados de Búsqueda:
      ${JSON.stringify(searchResults, null, 2)}
    `;

    let foundProducts = [];
    try {
      console.log('[Research] Analizando resultados con IA para extraer ideas de productos...');
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      let text = response.text();
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
      }
      foundProducts = JSON.parse(text);
      console.log(`[Research] IA ha identificado ${foundProducts.length} productos potenciales.`);
    } catch (iaError) {
      console.warn('[Research] ⚠️ IA no disponible, generando ideas heurísticas.', iaError.message || iaError);
      const terms = Array.isArray(searchResults) ? searchResults : [];
      foundProducts = terms.slice(0, 5).map((term, index) => ({
        product_name: `${term} Kit ${index + 1}`,
        description: `Oferta rápida inspirada en la tendencia “${term}”. Incluye recursos digitales y accesorios complementarios listos para vender online.`,
        target_audience: 'Compradores digitales que siguen tendencias virales'
      }));
    }

    // 5. Guardar los productos encontrados
    const reportDir = path.join(CWD, 'reports', 'research');
    await fs.mkdir(reportDir, { recursive: true });
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `found_trends-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(foundProducts, null, 2));

    console.log(`[Research] Tarea completada. Nuevas oportunidades guardadas en: ${reportPath}`);

  } catch (error) {
    console.error('[Research] Ocurrió un error fatal durante la caza de tendencias:', error);
  }
}

findAndAnalyzeTrends();