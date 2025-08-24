const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

const CWD = process.cwd();

let apiConfig = null;

async function getApiConfig() {
  if (apiConfig) return apiConfig;
  try {
    const keysPath = path.join(CWD, 'config', 'keys.json');
    const keysFile = await fs.readFile(keysPath, 'utf8');
    const keys = JSON.parse(keysFile);

    const promptPath = path.join(CWD, 'prompts', 'listing_optimizer_prompt.txt');
    const promptTemplate = await fs.readFile(promptPath, 'utf8');

    apiConfig = { apiKey: keys.google_api_key, promptTemplate };
    return apiConfig;
  } catch (error) {
    console.error('❌ Error al cargar la configuración para el optimizador:', error);
    return null;
  }
}

async function optimizarProducto(productoOriginal) {
  const config = await getApiConfig();
  if (!config) {
    console.warn('⚠️ Advertencia: No se pudo cargar la configuración de la API. Usando producto original.');
    return productoOriginal;
  }

  const { apiKey, promptTemplate } = config;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  // Usamos el nombre del producto original para el prompt
  const finalPrompt = promptTemplate.replace('{product_json}', JSON.stringify({ title: productoOriginal.product_name, body_html: productoOriginal.description }, null, 2));

  try {
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza robusta de la respuesta de la IA
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1];
    } else {
      // Si no hay bloque de código, intentar encontrar el primer { y el último }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
    }

    // Parseo y validación
    const optimizedData = JSON.parse(text);

    // Asegurarse de que los campos esenciales existan
    if (!optimizedData.title || !optimizedData.body_html) {
        console.warn(`[Optimizador] La IA devolvió un objeto JSON incompleto. Usando datos originales.`);
        return productoOriginal;
    }

    console.log(`✨ Producto "${optimizedData.title}" optimizado con IA.`);
    // Devolver un objeto consistente que `listing.js` espera
    return {
        title: optimizedData.title,
        body_html: optimizedData.body_html,
        tags: optimizedData.tags || []
    };

  } catch (error) {
    console.error(`❌ Error al procesar la respuesta de la IA para "${productoOriginal.product_name}":`, error.message);
    // Devolver un objeto válido con los datos originales para no detener el flujo
    return {
        title: productoOriginal.product_name,
        body_html: productoOriginal.description,
        tags: []
    };
  }
}

module.exports = { optimizarProducto };
