import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config as globalConfig } from '../scripts/config.js';

function normalizarNombreAgente(nombre = '') {
  return nombre.split('.').pop()?.toLowerCase();
}

function obtenerConfigFallback() {
  return globalConfig.agentes.find(agente => normalizarNombreAgente(agente.nombre) === 'contentstrategist');
}

function generarOrdenesFallback() {
  return {
    nombre: 'Agent.ContentStrategist',
    tareas: [
      'Generar 5 ángulos de marketing de contenido orgánico para cada producto con reportes creativos recientes.'
    ],
    tiendas: []
  };
}

function cargarConfiguracionAgente() {
  if (process.argv[2]) {
    try {
      return JSON.parse(process.argv[2]);
    } catch (error) {
      console.warn('[ContentStrategist] ⚠️  No se pudo parsear el JSON recibido por CLI. Continuando con fallback.', error);
    }
  }

  const fallback = obtenerConfigFallback();
  if (fallback) {
    console.log('[ContentStrategist] 🔄 Usando configuración desde scripts/config.js');
    return fallback;
  }

  console.log('[ContentStrategist] 🔄 Usando configuración mínima por defecto.');
  return generarOrdenesFallback();
}

const agentConfig = cargarConfiguracionAgente();
console.log('[ContentStrategist] Agente iniciado. Órdenes recibidas:', agentConfig.tareas ?? []);

const CWD = process.cwd();

// --- Lógica Principal del Agente ---
async function generateContentStrategies() {
  console.log('[ContentStrategist] Tarea: Generar estrategias de contenido orgánico.');

  try {
    // 1. Validar que la API Key de Gemini exista
    if (!globalConfig.apiKeys.gemini) {
      console.warn('[ContentStrategist] ⚠️ GEMINI_API_KEY no definida. Se utilizará un plan de contenidos heurístico.');
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
    let model = null;
    if (globalConfig.apiKeys.gemini) {
      try {
        const genAI = new GoogleGenerativeAI(globalConfig.apiKeys.gemini);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      } catch (clientError) {
        console.warn('[ContentStrategist] ⚠️ No se pudo inicializar el cliente de Gemini. Se aplicará fallback heurístico.', clientError);
      }
    }

    const allStrategies = [];

    // 5. Generar estrategias para cada producto
    for (const item of creativeData) {
      const productName = item.productName;
      console.log(`[ContentStrategist] Generando estrategias para: ${productName}...`);

      const finalPrompt = promptTemplate.replace('[Product Name]', productName);
      
      try {
        if (model) {
          const result = await model.generateContent(finalPrompt);
          const response = await result.response;
          const text = response.text();

          allStrategies.push({
            productName: productName,
            contentStrategies: text,
            source: 'gemini'
          });
          console.log(`[ContentStrategist] ✅ Estrategias generadas para ${productName}.`);
          continue;
        }
        throw new Error('Modelo no disponible');
      } catch (e) {
        console.warn(`[ContentStrategist] ⚠️ Falló la IA para ${productName}. Generando plan heurístico.`, e.message ?? e);
        const heuristico = generarPlanHeuristico(productName, item.creativeContent ?? '');
        allStrategies.push({
          productName: productName,
          contentStrategies: heuristico,
          source: 'heuristic'
        });
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

function generarPlanHeuristico(nombreProducto, creativeContent) {
  const resumen = creativeContent
    ? creativeContent.split('\n').slice(0, 3).join(' ')
    : `Un ángulo aspiracional destacando beneficios clave de ${nombreProducto}.`;

  const canales = [
    'Instagram Reels',
    'TikTok Orgánico',
    'Historias de Instagram',
    'Email Newsletter',
    'Blog / SEO'
  ];

  const bullets = canales.map((canal, idx) => {
    const gancho = idx === 0
      ? `Mostrar el beneficio principal de ${nombreProducto} en los primeros 3 segundos.`
      : idx === 1
        ? `Usar tendencia de audio + demostración rápida del antes/después.`
        : idx === 2
          ? `Crear serie de tres historias con CTA final hacia Whatsapp / tienda.`
          : idx === 3
            ? `Segmentar lista cálida destacando testimonio breve + oferta limitada.`
            : `Redactar guía de uso con keywords long-tail que respondan dudas frecuentes.`;

    return `• ${canal}: ${gancho}`;
  }).join('\n');

  return `Resumen creativo: ${resumen}\n\nPlan de acción:\n${bullets}\n\nCTA sugerido: Visita la tienda y asegura tu ${nombreProducto} hoy.`;
}
