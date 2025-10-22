#!/usr/bin/env node

/**
 * ================================================================================
 * 🔍 AGENTE ELITE: SEO TRAFFIC MASTER
 * 🎯 Misión: Tráfico orgánico masivo desde Google
 * ================================================================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class SEOTrafficMaster {
  constructor() {
    this.shopifyStore = process.env.SHOPIFY_STORE_URL;
    this.shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.geminiKey);
  }

  async ejecutarOptimizacionSEO() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 AGENTE ELITE: SEO TRAFFIC MASTER');
    console.log('🎯 Misión: Dominar rankings de Google');
    console.log('='.repeat(80) + '\n');

    const reporte = {
      timestamp: new Date().toISOString(),
      optimizaciones: [],
      keywords_nuevas: 0,
      contenido_generado: 0,
      meta_optimizadas: 0
    };

    try {
      // PASO 1: Analizar keywords actuales
      console.log('📊 [1/6] Analizando keywords actuales...\n');
      const productos = await this.obtenerProductos();
      const keywordsActuales = await this.extraerKeywords(productos);
      
      // PASO 2: Investigar keywords de alto volumen
      console.log('🔎 [2/6] Investigando keywords rentables...\n');
      const keywordsRentables = await this.investigarKeywordsRentables(productos);
      reporte.keywords_nuevas = keywordsRentables.length;
      
      // PASO 3: Optimizar títulos y meta descriptions
      console.log('✍️ [3/6] Optimizando meta tags...\n');
      for (const producto of productos) {
        const metaOptimizada = await this.optimizarMetaTags(producto, keywordsRentables);
        await this.actualizarProducto(producto.id, metaOptimizada);
        reporte.meta_optimizadas++;
        console.log(`   ✅ ${producto.title}`);
      }
      
      // PASO 4: Generar contenido blog para keywords
      console.log('\n📝 [4/6] Generando contenido blog SEO...\n');
      const articulosBlog = await this.generarArticulosBlog(keywordsRentables, productos);
      reporte.contenido_generado = articulosBlog.length;
      
      // PASO 5: Optimizar URLs
      console.log('🔗 [5/6] Optimizando URLs para SEO...\n');
      for (const producto of productos) {
        const urlOptimizada = await this.optimizarURL(producto);
        await this.actualizarProducto(producto.id, { handle: urlOptimizada });
        console.log(`   ✅ ${producto.handle} → ${urlOptimizada}`);
      }
      
      // PASO 6: Generar schema markup
      console.log('\n🏷️ [6/6] Generando Schema Markup...\n');
      for (const producto of productos) {
        const schema = this.generarSchemaMarkup(producto);
        reporte.optimizaciones.push({
          producto: producto.title,
          schema_generado: true
        });
      }

      // Guardar reporte
      await this.guardarReporte(reporte);

      console.log('\n' + '='.repeat(80));
      console.log('🏆 OPTIMIZACIÓN SEO COMPLETADA');
      console.log(`🔑 Keywords rentables identificadas: ${reporte.keywords_nuevas}`);
      console.log(`📝 Artículos blog generados: ${reporte.contenido_generado}`);
      console.log(`✅ Meta tags optimizadas: ${reporte.meta_optimizadas}`);
      console.log('='.repeat(80) + '\n');

      return reporte;

    } catch (error) {
      console.error('❌ Error en optimización SEO:', error.message);
      throw error;
    }
  }

  async obtenerProductos() {
    const url = `https://${this.shopifyStore}/admin/api/2024-01/products.json?limit=250`;
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.shopifyToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error obteniendo productos');
    const data = await response.json();
    return data.products;
  }

  async extraerKeywords(productos) {
    const keywords = new Set();
    for (const prod of productos) {
      const palabras = prod.title.toLowerCase().split(/\s+/);
      palabras.forEach(p => keywords.add(p));
    }
    return Array.from(keywords);
  }

  async investigarKeywordsRentables(productos) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const categoriasProductos = productos.map(p => p.product_type).filter(Boolean);
    
    const prompt = `Eres un experto en SEO para e-commerce.

Categorías de productos que vendemos:
${categoriasProductos.join(', ')}

Genera una lista de 20 keywords de alto volumen y baja competencia para e-commerce en Perú/Latinoamérica.

Enfócate en:
- Long-tail keywords (3-5 palabras)
- Intención de compra alta
- Términos en español
- Búsquedas locales

Formato: Solo la lista, una keyword por línea, sin numeración.`;

    const result = await model.generateContent(prompt);
    const keywords = result.response.text()
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    return keywords.slice(0, 20);
  }

  async optimizarMetaTags(producto, keywordsRentables) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const keywordsRelevantes = keywordsRentables
      .filter(kw => {
        const palabrasKw = kw.toLowerCase().split(/\s+/);
        const palabrasProd = producto.title.toLowerCase().split(/\s+/);
        return palabrasKw.some(p => palabrasProd.includes(p));
      })
      .slice(0, 3);

    const prompt = `Optimiza SEO para e-commerce:

Producto: ${producto.title}
Precio: $${producto.variants[0]?.price || 'N/A'}
Keywords objetivo: ${keywordsRelevantes.join(', ')}

Genera:
1. Título SEO (60 caracteres max, incluye keyword principal al inicio)
2. Meta Description (155 caracteres max, persuasiva, incluye precio si es competitivo)

Formato JSON:
{
  "title": "...",
  "meta_description": "..."
}`;

    const result = await model.generateContent(prompt);
    let texto = result.response.text().trim();
    
    // Limpiar markdown
    texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(texto);
    } catch (e) {
      return {
        title: producto.title,
        meta_description: producto.body_html?.substring(0, 155) || ''
      };
    }
  }

  async generarArticulosBlog(keywords, productos) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const articulos = [];

    for (const keyword of keywords.slice(0, 5)) {
      const productosRelacionados = productos.filter(p => 
        p.title.toLowerCase().includes(keyword.toLowerCase().split(' ')[0])
      ).slice(0, 3);

      if (productosRelacionados.length === 0) continue;

      const prompt = `Escribe un artículo de blog optimizado para SEO:

Keyword principal: ${keyword}
Productos a mencionar: ${productosRelacionados.map(p => p.title).join(', ')}

El artículo debe:
- 800-1000 palabras
- Título H1 con keyword
- 3-4 subtítulos H2
- Mencionar productos naturalmente
- Incluir llamadas a la acción
- Tono conversacional y persuasivo
- Español de Latinoamérica

Formato: Solo el contenido en Markdown.`;

      const result = await model.generateContent(prompt);
      const contenido = result.response.text();

      articulos.push({
        keyword,
        titulo: keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        contenido,
        productos_mencionados: productosRelacionados.map(p => p.id)
      });

      console.log(`   ✅ Artículo generado: "${keyword}"`);
    }

    return articulos;
  }

  async optimizarURL(producto) {
    // Convertir título a URL SEO-friendly
    let url = producto.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // espacios a guiones
      .replace(/-+/g, '-'); // múltiples guiones a uno solo

    return url;
  }

  generarSchemaMarkup(producto) {
    const variant = producto.variants[0];
    
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": producto.title,
      "image": producto.images.map(img => img.src),
      "description": producto.body_html?.replace(/<[^>]*>/g, '') || '',
      "sku": variant?.sku || producto.id.toString(),
      "brand": {
        "@type": "Brand",
        "name": producto.vendor || "Goio Store"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://${this.shopifyStore}/products/${producto.handle}`,
        "priceCurrency": "USD",
        "price": variant?.price || "0",
        "availability": variant?.inventory_quantity > 0 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock"
      }
    };
  }

  async actualizarProducto(productoId, datos) {
    const url = `https://${this.shopifyStore}/admin/api/2024-01/products/${productoId}.json`;
    
    const payload = {
      product: {
        id: productoId,
        ...datos
      }
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.shopifyToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error actualizando producto: ${error}`);
    }

    return await response.json();
  }

  async guardarReporte(reporte) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../reports/seo-traffic');
    
    await fs.mkdir(reportDir, { recursive: true });
    
    const jsonPath = path.join(reportDir, `seo-report-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(reporte, null, 2));
    
    console.log(`\n📁 Reporte guardado: ${jsonPath}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const agente = new SEOTrafficMaster();
  agente.ejecutarOptimizacionSEO()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = SEOTrafficMaster;
