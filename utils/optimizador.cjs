const axios = require('axios');

// Leemos la API Key de las variables de entorno.
// Es más seguro que tenerla directamente en el código.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function optimizarProducto(producto) {
  // Si no hay API Key, no podemos continuar.
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Advertencia: Falta la variable de entorno GEMINI_API_KEY. No se puede optimizar el producto. Usando descripción original.');
    return producto;
  }

  // El prompt que le enviaremos a Gemini.
  const prompt = `Eres un experto en marketing y copywriter para ecommerce. Tu tarea es tomar el siguiente título y descripción de un producto y transformarlos en una descripción de venta irresistible, persuasiva y optimizada para SEO.

  **Reglas:**
  - Usa un tono entusiasta y profesional.
  - Destaca los 2-3 beneficios más importantes para el cliente.
  - Incluye una llamada a la acción clara (ej: "¡Compra ahora y transforma tu vida!").
  - Formatea la salida en HTML simple (párrafos <p>, negritas <b>, listas <ul><li>).
  - No excedas las 150 palabras.

  **Producto a Optimizar:**
  - Título: ${producto.title}
  - Descripción Original: ${producto.body_html}

  **Tu Nueva Descripción Optimizada (solo el HTML):**`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extraemos el texto generado por Gemini.
    const enriched = response.data.candidates[0].content.parts[0].text;

    console.log(`✨ Producto "${producto.title}" optimizado con IA.`);
    return { ...producto, body_html: enriched };

  } catch (error) {
    console.error(`❌ Error al llamar a la API de Gemini para optimizar "${producto.title}":`);
    // Imprimimos el error que nos da la API para más detalles.
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    // Si hay un error, devolvemos el producto original para no detener el flujo.
    return producto;
  }
}

module.exports = { optimizarProducto };
