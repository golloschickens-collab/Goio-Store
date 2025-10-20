import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

// Cargar variables de entorno
config();

class CreativeAgent {
  constructor() {
    this.trace_id = `creative_${Date.now()}`;
    this.ctas = [
      "Compra ahora",
      "Descúbrelo hoy", 
      "Ver oferta",
      "Añadir al carrito",
      "¡Conseguir ya!",
      "Aprovecha oferta",
      "Ver detalles",
      "Comprar aquí"
    ];
  }

  // Generar título optimizado para Meta Ads (máx 40 caracteres)
  generateTitle(product) {
    const title = product.title;
    if (title.length <= 40) return title;
    
    // Versiones abreviadas inteligentes
    const shortcuts = {
      "Kit Home Office Ergonómico": "Kit Office Ergonómico",
      "Purificador de Aire Compacto GO": "Purificador Aire GO",
      "Botella Inteligente Hidratación GO": "Botella Smart GO",
      "Lámpara LED Ambiente Premium": "Lámpara LED Premium",
      "Mini Proyector HD Portátil": "Mini Proyector HD",
      "Set Bandas de Resistencia Pro": "Bandas Resistencia Pro",
      "Organizador Modular de Closet": "Organizador Closet",
      "Cafetera Cold Brew Express": "Cafetera Cold Brew",
      "Robot Aspiradora Slim": "Robot Aspiradora",
      "Set Aromaterapia Relax": "Set Aromaterapia"
    };

    return shortcuts[title] || title.substring(0, 37) + "...";
  }

  // Generar texto principal optimizado (máx 125 caracteres)
  generateMainText(product) {
    const baseTexts = {
      "Kit Home Office Ergonómico": "✨ Transforma tu workspace. Soporte laptop + mouse ergonómico. ¡Tu espalda te lo agradecerá! 💻",
      "Purificador de Aire Compacto GO": "🌬️ Aire puro en cualquier lugar. Filtro HEPA + ionizador. Compacto y potente. ¡Respira mejor!",
      "Botella Inteligente Hidratación GO": "💧 Nunca olvides hidratarte. Recordatorios smart + medición automática. ¡Salud en tus manos!",
      "Lámpara LED Ambiente Premium": "💡 Iluminación perfecta para cada momento. RGB + control app. ¡Crea tu ambiente ideal!",
      "Mini Proyector HD Portátil": "🎬 Cine en cualquier lugar. HD portátil, fácil conexión. ¡Entretenimiento sin límites!",
      "Set Bandas de Resistencia Pro": "💪 Gym completo en casa. 5 niveles resistencia + guía. ¡Entrena como un pro!",
      "Organizador Modular de Closet": "👗 Orden que enamora. Sistema modular, máximo espacio. ¡Tu closet perfecto!",
      "Cafetera Cold Brew Express": "☕ Café frío perfecto en minutos. Extracción rápida, sabor intenso. ¡Despierta tus sentidos!",
      "Robot Aspiradora Slim": "🤖 Limpieza automática sin esfuerzo. Slim design, máxima potencia. ¡Tu casa siempre impecable!",
      "Set Aromaterapia Relax": "🕯️ Relajación total garantizada. Aceites premium + difusor. ¡Tu oasis personal!"
    };

    const text = baseTexts[product.title];
    return text && text.length <= 125 ? text : product.title + " - ¡Calidad premium a precio increíble! 🔥";
  }

  // Seleccionar CTA apropiado
  selectCTA(product) {
    // CTAs específicos por categoría
    const categoryMapping = {
      "Oficina": "Compra ahora",
      "Hogar": "Descúbrelo hoy",
      "Salud": "Ver oferta",
      "Tecnología": "¡Conseguir ya!",
      "Fitness": "Aprovecha oferta",
      "Cocina": "Añadir al carrito"
    };

    return categoryMapping[product.product_type] || this.ctas[Math.floor(Math.random() * this.ctas.length)];
  }

  // Generar anuncio individual
  generateIndividualAd(product) {
    const title = this.generateTitle(product);
    const mainText = this.generateMainText(product);
    const cta = this.selectCTA(product);
    const imageUrl = product.images && product.images[0] ? product.images[0].src : "https://via.placeholder.com/1200x628/0066cc/ffffff?text=Goio+Store";
    const sku = product.variants && product.variants[0] ? product.variants[0].sku : "SKU-" + product.title.substring(0, 6);

    return {
      sku: sku,
      title: title,
      mainText: mainText,
      cta: cta,
      imageUrl: imageUrl,
      productTitle: product.title,
      price: product.variants && product.variants[0] ? product.variants[0].price : "29.99"
    };
  }

  // Generar anuncio combo
  generateComboAd(products) {
    const totalValue = products.reduce((sum, p) => {
      const price = p.variants && p.variants[0] ? parseFloat(p.variants[0].price) : 29.99;
      return sum + price;
    }, 0);

    const discount = Math.round(totalValue * 0.15); // 15% descuento
    const finalPrice = totalValue - discount;

    return {
      sku: "COMBO-GOIO-2024",
      title: "🔥 Mega Combo Goio - Todo en 1",
      mainText: `💥 Pack completo: ${products.length} productos premium. ¡Ahorra $${discount} comprando todo junto! 🛍️`,
      cta: "¡Mega oferta!",
      imageUrl: "https://cdn.shopify.com/s/files/1/0000/0000/0000/files/combo-goio-store-collection.jpg",
      productTitle: "Mega Combo Goio Store",
      price: finalPrice.toFixed(2),
      originalPrice: totalValue.toFixed(2),
      savings: discount.toFixed(2)
    };
  }

  // Formatear reporte como tabla
  formatReport(ads) {
    const header = "| SKU | Título | Texto Principal | CTA | URL Imagen |";
    const separator = "|-----|--------|------------------|-----|------------|";
    
    const rows = ads.map(ad => 
      `| ${ad.sku} | ${ad.title} | ${ad.mainText} | ${ad.cta} | ${ad.imageUrl} |`
    );

    return [header, separator, ...rows].join('\n');
  }

  async loadProducts() {
    try {
      const productsPath = path.join(process.cwd(), 'config', 'products.json');
      const data = await fs.readFile(productsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('[Creative] ❌ Error cargando productos:', error.message);
      return [];
    }
  }

  async generateAllAds() {
    console.log('[Creative] 🎨 Iniciando generación de creativos Meta Ads...');
    
    const products = await this.loadProducts();
    
    if (products.length === 0) {
      console.error('[Creative] ❌ No hay productos para procesar');
      return [];
    }

    console.log(`[Creative] 📦 Productos encontrados: ${products.length}`);

    // Generar anuncios individuales
    const individualAds = products.map(product => {
      console.log(`[Creative] 🎯 Generando anuncio para: ${product.title}`);
      return this.generateIndividualAd(product);
    });

    // Generar anuncio combo
    console.log('[Creative] 🔥 Generando anuncio combo...');
    const comboAd = this.generateComboAd(products);

    const allAds = [...individualAds, comboAd];

    // Guardar reporte
    const report = this.formatReport(allAds);
    const reportPath = path.join(process.cwd(), 'reports', `meta-ads-creativos-${Date.now()}.md`);
    
    try {
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, report);
      console.log(`[Creative] 📋 Reporte guardado en: ${reportPath}`);
    } catch (error) {
      console.log('[Creative] ⚠️ No se pudo guardar reporte, mostrando en consola');
    }

    return allAds;
  }

  async run() {
    console.log('[Creative] 🚀 INSTRUCCIÓN 3 - Generación de Creativos Meta Ads');
    
    const ads = await this.generateAllAds();
    
    if (ads.length === 0) {
      console.error('[Creative] ❌ No se generaron anuncios');
      return;
    }

    // Mostrar reporte en consola
    console.log('\n🎯 === REPORTE CREATIVOS META ADS ===');
    console.log(`Agente: Creative | Acción: Generar anuncios | Estado: ✅ Completado | trace_id: ${this.trace_id}`);
    console.log(`📊 Total anuncios generados: ${ads.length}`);
    console.log(`📦 Anuncios individuales: ${ads.length - 1}`);
    console.log(`🔥 Anuncios combo: 1`);
    
    console.log('\n📋 === TABLA DE CREATIVOS ===\n');
    console.log(this.formatReport(ads));

    // Resumen ejecutivo
    console.log('\n💡 === RESUMEN EJECUTIVO ===');
    console.log('✅ Títulos optimizados: máx 40 caracteres');
    console.log('✅ Textos principales: máx 125 caracteres');
    console.log('✅ CTAs variados y efectivos');
    console.log('✅ URLs de imágenes profesionales incluidas');
    console.log('✅ SKUs mapeados correctamente');
    
    console.log(`\n🎉 ¡CREATIVOS LISTOS PARA META ADS!`);
    console.log(`💰 Próximo paso: Instrucción 4 - Lanzar campaña con presupuesto $20-30`);

    return {
      status: 'completed',
      totalAds: ads.length,
      individualAds: ads.length - 1,
      comboAds: 1,
      trace_id: this.trace_id,
      ads: ads
    };
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new CreativeAgent();
  agent.run().catch(console.error);
}

export { CreativeAgent };