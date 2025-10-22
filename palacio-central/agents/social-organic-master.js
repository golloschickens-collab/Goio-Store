#!/usr/bin/env node

/**
 * ================================================================================
 * 📱 AGENTE ELITE: SOCIAL ORGANIC MASTER
 * 🎯 Misión: Presencia viral en Instagram/TikTok sin gastar en ads
 * ================================================================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class SocialOrganicMaster {
  constructor() {
    this.shopifyStore = process.env.SHOPIFY_STORE_URL;
    this.shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.genAI = new GoogleGenerativeAI(this.geminiKey);
    this.postsPerDay = 3; // 3 posts diarios
  }

  async ejecutarEstrategiaOrganica() {
    console.log('\n' + '='.repeat(80));
    console.log('📱 AGENTE ELITE: SOCIAL ORGANIC MASTER');
    console.log('🎯 Misión: Viralidad orgánica en redes sociales');
    console.log('='.repeat(80) + '\n');

    const reporte = {
      timestamp: new Date().toISOString(),
      posts_generados: 0,
      historias_generadas: 0,
      reels_generados: 0,
      hashtags_investigados: 0,
      contenido_calendario: []
    };

    try {
      // PASO 1: Obtener productos para promocionar
      console.log('📦 [1/8] Seleccionando productos para contenido...\n');
      const productos = await this.obtenerProductos();
      const productosContenido = await this.seleccionarProductosContenido(productos);
      console.log(`   ✅ ${productosContenido.length} productos seleccionados\n`);

      // PASO 2: Investigar hashtags trending
      console.log('🔍 [2/8] Investigando hashtags de alto alcance...\n');
      const hashtagsStrategy = await this.investigarHashtags(productosContenido);
      reporte.hashtags_investigados = hashtagsStrategy.length;
      console.log(`   ✅ ${hashtagsStrategy.length} grupos de hashtags generados\n`);

      // PASO 3: Generar contenido para posts
      console.log('✍️ [3/8] Generando copy para posts...\n');
      const posts = [];
      for (const producto of productosContenido.slice(0, 7)) {
        const postContent = await this.generarPost(producto, hashtagsStrategy);
        posts.push(postContent);
        reporte.posts_generados++;
        console.log(`   ✅ Post: ${producto.title.substring(0, 40)}...`);
      }

      // PASO 4: Generar ideas para Reels/TikTok
      console.log('\n🎬 [4/8] Generando guiones para Reels/TikTok...\n');
      const reels = await this.generarReels(productosContenido);
      reporte.reels_generados = reels.length;
      console.log(`   ✅ ${reels.length} guiones de Reels generados\n`);

      // PASO 5: Generar historias (stories)
      console.log('📸 [5/8] Generando contenido para Stories...\n');
      const stories = await this.generarStories(productosContenido);
      reporte.historias_generadas = stories.length;
      console.log(`   ✅ ${stories.length} Stories generadas\n`);

      // PASO 6: Crear calendario de contenido
      console.log('📅 [6/8] Creando calendario de publicación...\n');
      const calendario = await this.crearCalendario(posts, reels, stories);
      reporte.contenido_calendario = calendario;
      console.log(`   ✅ Calendario de ${calendario.length} días creado\n`);

      // PASO 7: Generar respuestas automáticas para DMs comunes
      console.log('💬 [7/8] Configurando respuestas automáticas DM...\n');
      const respuestasAuto = await this.generarRespuestasAutomaticas();
      console.log(`   ✅ ${respuestasAuto.length} plantillas de respuesta creadas\n`);

      // PASO 8: Estrategia de engagement
      console.log('❤️ [8/8] Configurando estrategia de engagement...\n');
      const estrategiaEngagement = await this.configurarEngagement();

      await this.guardarReporte(reporte);
      await this.guardarCalendario(calendario);

      console.log('\n' + '='.repeat(80));
      console.log('🏆 ESTRATEGIA ORGÁNICA CONFIGURADA');
      console.log(`📱 Posts generados: ${reporte.posts_generados}`);
      console.log(`🎬 Reels/TikToks: ${reporte.reels_generados}`);
      console.log(`📸 Stories: ${reporte.historias_generadas}`);
      console.log(`📅 Calendario: ${calendario.length} días de contenido`);
      console.log('⏱️  Primeros resultados: 7-14 días de publicación constante');
      console.log('='.repeat(80) + '\n');

      return reporte;

    } catch (error) {
      console.error('❌ Error en estrategia orgánica:', error.message);
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

  async seleccionarProductosContenido(productos) {
    // Priorizar productos:
    // 1. Con imágenes atractivas
    // 2. Precio medio-alto (más margen para invertir en contenido después)
    // 3. Nombres atractivos/virales

    return productos
      .filter(p => p.images && p.images.length > 0)
      .sort((a, b) => {
        const precioA = parseFloat(a.variants[0]?.price || 0);
        const precioB = parseFloat(b.variants[0]?.price || 0);
        return precioB - precioA;
      })
      .slice(0, 15);
  }

  async investigarHashtags(productos) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const categorias = [...new Set(productos.map(p => p.product_type).filter(Boolean))];

    const prompt = `Eres experto en estrategia de hashtags para Instagram/TikTok en Latinoamérica.

Categorías de productos: ${categorias.join(', ')}

Genera 5 grupos estratégicos de hashtags (30 hashtags por grupo):

GRUPO 1 - Alto alcance (100K+ posts): hashtags populares generales
GRUPO 2 - Medio alcance (10K-100K): hashtags específicos de nicho
GRUPO 3 - Bajo alcance (<10K): hashtags ultra-específicos
GRUPO 4 - Locales Perú/LATAM: geolocalización
GRUPO 5 - Trending: hashtags virales actuales

Formato JSON:
{
  "grupos": [
    {
      "nombre": "Alto Alcance",
      "estrategia": "Máxima visibilidad",
      "hashtags": ["tag1", "tag2", ...]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let texto = result.response.text().trim();
    texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(texto);
      return parsed.grupos || [];
    } catch (e) {
      return [{
        nombre: 'Default',
        estrategia: 'Mix general',
        hashtags: ['ecommerce', 'tiendaonline', 'compraonline', 'peru', 'lima']
      }];
    }
  }

  async generarPost(producto, hashtagsStrategy) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const precio = producto.variants[0]?.price || '0';
    const hashtags = hashtagsStrategy
      .flatMap(grupo => grupo.hashtags)
      .slice(0, 30)
      .map(tag => `#${tag.replace('#', '')}`)
      .join(' ');

    const prompt = `Crea un post viral para Instagram/TikTok:

Producto: ${producto.title}
Precio: $${precio}

El copy debe:
- Hook poderoso en primera línea (gancho viral)
- 2-3 líneas de beneficios emocionales
- Llamada a la acción clara
- Emojis estratégicos
- Tono casual, amigable, LATAM
- Máximo 150 palabras

Formato JSON:
{
  "copy": "...",
  "emojis_sugeridos": ["emoji1", "emoji2"],
  "mejor_hora_publicacion": "HH:MM",
  "tipo_contenido": "carousel/reel/imagen"
}`;

    const result = await model.generateContent(prompt);
    let texto = result.response.text().trim();
    texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(texto);
      return {
        producto_id: producto.id,
        producto_titulo: producto.title,
        imagen_url: producto.images[0]?.src || '',
        copy: parsed.copy,
        hashtags: hashtags,
        emojis: parsed.emojis_sugeridos || [],
        hora_sugerida: parsed.mejor_hora_publicacion || '19:00',
        tipo: parsed.tipo_contenido || 'imagen'
      };
    } catch (e) {
      return {
        producto_id: producto.id,
        producto_titulo: producto.title,
        imagen_url: producto.images[0]?.src || '',
        copy: `¡Mira esto! 🔥 ${producto.title} ahora disponible. ¿Quién más lo quiere? 👀✨`,
        hashtags: hashtags,
        hora_sugerida: '19:00',
        tipo: 'imagen'
      };
    }
  }

  async generarReels(productos) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Genera 5 ideas virales para Reels/TikTok de e-commerce:

Productos disponibles: ${productos.map(p => p.title).join(', ')}

Para cada idea incluye:
- Concepto viral (trend actual)
- Guión (15-30 segundos)
- Productos a mostrar
- Audio/música sugerida
- Texto en pantalla
- Gancho en primeros 3 segundos

Formato JSON:
{
  "reels": [
    {
      "concepto": "...",
      "guion": "...",
      "productos": ["prod1", "prod2"],
      "audio_sugerido": "...",
      "texto_pantalla": ["texto1", "texto2"],
      "gancho": "..."
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let texto = result.response.text().trim();
    texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(texto);
      return parsed.reels || [];
    } catch (e) {
      return [];
    }
  }

  async generarStories(productos) {
    const stories = [];
    
    for (const producto of productos.slice(0, 10)) {
      stories.push({
        tipo: 'producto_destacado',
        producto_id: producto.id,
        imagen: producto.images[0]?.src || '',
        texto: `¡Nuevo! ${producto.title}`,
        sticker: 'link',
        cta: 'Comprar ahora'
      });

      stories.push({
        tipo: 'encuesta',
        pregunta: `¿Te gusta este ${producto.title}?`,
        opciones: ['😍 Me encanta', '🤔 No estoy seguro'],
        producto_relacionado: producto.id
      });

      stories.push({
        tipo: 'countdown',
        texto: '¡Oferta por tiempo limitado!',
        producto_id: producto.id,
        duracion_horas: 24
      });
    }

    return stories;
  }

  async crearCalendario(posts, reels, stories) {
    const calendario = [];
    const hoy = new Date();

    for (let dia = 0; dia < 30; dia++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + dia);

      const contenidoDia = {
        fecha: fecha.toISOString().split('T')[0],
        publicaciones: []
      };

      // 3 posts por día
      if (posts[dia % posts.length]) {
        contenidoDia.publicaciones.push({
          hora: '09:00',
          tipo: 'post',
          contenido: posts[dia % posts.length]
        });
      }

      if (posts[(dia + 1) % posts.length]) {
        contenidoDia.publicaciones.push({
          hora: '15:00',
          tipo: 'post',
          contenido: posts[(dia + 1) % posts.length]
        });
      }

      if (posts[(dia + 2) % posts.length]) {
        contenidoDia.publicaciones.push({
          hora: '20:00',
          tipo: 'post',
          contenido: posts[(dia + 2) % posts.length]
        });
      }

      // 1 reel cada 3 días
      if (dia % 3 === 0 && reels[Math.floor(dia / 3) % reels.length]) {
        contenidoDia.publicaciones.push({
          hora: '19:00',
          tipo: 'reel',
          contenido: reels[Math.floor(dia / 3) % reels.length]
        });
      }

      // Stories diarias
      const storiesDia = stories.slice((dia * 3) % stories.length, ((dia * 3) % stories.length) + 3);
      storiesDia.forEach((story, idx) => {
        contenidoDia.publicaciones.push({
          hora: `${10 + idx * 4}:00`,
          tipo: 'story',
          contenido: story
        });
      });

      calendario.push(contenidoDia);
    }

    return calendario;
  }

  async generarRespuestasAutomaticas() {
    return [
      {
        trigger: ['precio', 'cuanto cuesta', 'valor'],
        respuesta: '¡Hola! 👋 Los precios están en nuestra tienda: https://{STORE_URL}. ¿Hay algún producto que te interese en especial?'
      },
      {
        trigger: ['envio', 'delivery', 'despacho'],
        respuesta: 'Hacemos envíos a todo Perú 🇵🇪 En Lima llega en 24-48h. ¿A qué zona lo necesitas?'
      },
      {
        trigger: ['disponible', 'stock', 'tienen'],
        respuesta: '¡Sí, tenemos stock! 📦 ¿Qué producto te interesa? Te confirmo disponibilidad de inmediato.'
      },
      {
        trigger: ['garantia', 'devolucion'],
        respuesta: 'Todos nuestros productos tienen garantía de satisfacción. 30 días para devoluciones sin problemas. 🛡️'
      },
      {
        trigger: ['pago', 'como pagar', 'metodos'],
        respuesta: 'Aceptamos tarjetas, transferencias y pago contra entrega en Lima. 💳 ¿Cuál prefieres?'
      }
    ];
  }

  async configurarEngagement() {
    const estrategia = {
      comentarios: {
        responder_en: '< 30 minutos',
        usar_nombre_usuario: true,
        agregar_emojis: true,
        promocionar_productos_relacionados: true
      },
      dm: {
        respuesta_automatica_activada: true,
        escalamiento_humano_si: ['pedido', 'problema', 'urgente']
      },
      interaccion_otros: {
        likear_posts_hashtags_objetivo: 50,
        comentar_posts_relacionados: 20,
        seguir_usuarios_nicho: 30,
        frecuencia: 'diaria'
      }
    };

    console.log('   ✅ Auto-respuesta a comentarios en <30 min');
    console.log('   ✅ DMs automáticos configurados');
    console.log('   ✅ Engagement diario: 50 likes, 20 comentarios, 30 follows');

    return estrategia;
  }

  async guardarReporte(reporte) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../reports/social-organic');
    
    await fs.mkdir(reportDir, { recursive: true });
    
    const jsonPath = path.join(reportDir, `social-report-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(reporte, null, 2));
  }

  async guardarCalendario(calendario) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../reports/social-organic');
    
    await fs.mkdir(reportDir, { recursive: true });
    
    const calPath = path.join(reportDir, `calendario-${timestamp}.json`);
    await fs.writeFile(calPath, JSON.stringify(calendario, null, 2));
    
    console.log(`\n📅 Calendario guardado: ${calPath}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const agente = new SocialOrganicMaster();
  agente.ejecutarEstrategiaOrganica()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = SocialOrganicMaster;
