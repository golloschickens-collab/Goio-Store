// Carga las variables de entorno (necesario para GEMINI_API_KEY)
require('dotenv').config({ path: '.env.prod' });

const { optimizarProducto } = require('./utils/optimizador.cjs');

// 1. Define un producto de ejemplo
const productoDePrueba = {
  title: "Taza de Café Espacial",
  body_html: "<p>Una simple taza de cerámica blanca.</p>"
};

async function probarOptimizador() {
  console.log("🚀 Probando el nuevo optimizador de productos con IA...");
  console.log("----------------------------------------------------);
  console.log("Producto Original:");
  console.log(`Título: ${productoDePrueba.title}`);
  console.log(`Descripción: ${productoDePrueba.body_html}`);
  console.log("----------------------------------------------------);

  // 2. Llama a la función para optimizarlo
  const productoOptimizado = await optimizarProducto(productoDePrueba);

  console.log("\n✅ Producto Optimizado por Gemini:");
  console.log(`Título: ${productoOptimizado.title}`);
  console.log(`Nueva Descripción: ${productoOptimizado.body_html}`);
  console.log("----------------------------------------------------);
}

probarOptimizador();
