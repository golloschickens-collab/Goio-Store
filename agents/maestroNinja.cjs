const fs = require('fs');
// Import buscarEnGoogleTrends instead of buscarProductosGanadores
const { buscarEnGoogleTrends } = require('../utils/buscador.cjs');
const { optimizarProducto } = require('../utils/optimizador.cjs');
const { publicarEnShopify } = require('../utils/publisher.cjs');

(async () => {
  try {
    console.log("🥷 Iniciando agente Maestro Ninja...");

    // 1. Buscar candidatos usando Google Trends
    // Puedes cambiar 'SmartCup' por la palabra clave que desees buscar en Google Trends
    const nuevos = await buscarEnGoogleTrends('SmartCup');
    console.log(`🔍 Encontrados ${nuevos.length} productos candidatos de Google Trends.`);

    // 2. Optimizar
    const optimizados = [];
    for (const p of nuevos) {
      // Asumiendo que los resultados de Google Trends tienen 'title' y 'body_html' o similar
      // Si la estructura es diferente, necesitarás adaptarla aquí.
      const productData = {
        title: p.title || p.value, // Use 'title' if available, else 'value' from trends
        body_html: p.body_html || `Tendencia de búsqueda: ${p.value}`,
        vendor: 'Google Trends',
        product_type: 'Tendencia',
        tags: 'tendencia,google'
      };
      const op = await optimizarProducto(productData);
      optimizados.push(op);
    }

    // 3. Guardar en products.json
    fs.writeFileSync('./config/products.json', JSON.stringify(optimizados, null, 2));
    console.log("💾 products.json actualizado.");

    // 4. Publicar
    for (const p of optimizados) {
      await publicarEnShopify(p);
    }

    console.log("🚀 Operación completada con éxito.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();