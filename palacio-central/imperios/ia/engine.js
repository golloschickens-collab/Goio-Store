/**
 * 🧠 MÓDULO DE INTELIGENCIA ARTIFICIAL
 * 
 * Responsable de:
 * - Generación de contenido optimizado con IA
 * - Recomendaciones de productos personalizadas
 * - Optimización automática de descripciones y títulos
 * - Análisis predictivo de tendencias
 * 
 * Integración con: Google Gemini API, análisis de datos internos
 */

import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dayjs from 'dayjs';

const CWD = process.cwd();
const LOG_DIR = path.join(CWD, 'logs', 'imperial', 'ia');
const KEYS_PATH = path.join(CWD, 'config', 'keys.json');

export class IAEngine {
  constructor() {
    this.version = '1.0.0';
    this.geminiAPI = null;
    this.model = null;
  }

  /**
   * Inicializar modelo de IA
   */
  async initialize() {
    try {
      const data = await fs.readFile(KEYS_PATH, 'utf8');
      const keys = JSON.parse(data);
      
      this.geminiAPI = new GoogleGenerativeAI(keys.GEMINI_API_KEY);
      this.model = this.geminiAPI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      console.log('[IA] ✅ Modelo Gemini Pro inicializado');
    } catch (error) {
      console.error('[IA] ❌ Error inicializando IA:', error.message);
      throw error;
    }
  }

  /**
   * Generar descripción optimizada de producto
   */
  async generateProductDescription(producto) {
    const { nombre, categoria, ingredientes, beneficios } = producto;
    
    console.log(`[IA] 📝 Generando descripción para: ${nombre}`);
    
    const prompt = `Como experto en marketing gastronómico, crea una descripción atractiva y persuasiva para este producto:

Producto: ${nombre}
Categoría: ${categoria}
Ingredientes principales: ${ingredientes.join(', ')}
Beneficios: ${beneficios.join(', ')}

La descripción debe:
- Ser emocionalmente atractiva y persuasiva
- Destacar los beneficios únicos
- Incluir llamado a la acción (CTA)
- Máximo 150 palabras
- Optimizada para SEO con palabras clave naturales

Devuelve solo la descripción sin comentarios adicionales.`;

    try {
      const result = await this.model.generateContent(prompt);
      const descripcion = result.response.text();
      
      await this.logGeneration('product_description', { producto: nombre, descripcion });
      
      return {
        success: true,
        descripcion,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[IA] ❌ Error generando descripción:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar contenido para redes sociales
   */
  async generateSocialContent(tema, plataforma, tono = 'casual_profesional') {
    console.log(`[IA] 📱 Generando contenido ${plataforma} sobre: ${tema}`);
    
    const caracteristicasPlataforma = {
      instagram: 'post visual con caption corto y hashtags relevantes',
      facebook: 'post narrativo con engagement hooks',
      tiktok: 'script de 15-30 segundos con hook inicial fuerte',
      youtube_shorts: 'script de 60 segundos educativo y entretenido'
    };
    
    const prompt = `Crea contenido optimizado para ${plataforma} sobre: ${tema}

Características:
- Plataforma: ${caracteristicasPlataforma[plataforma]}
- Tono: ${tono}
- Público objetivo: amantes de pollo broaster y comida rápida de calidad
- Marca: Gollos Chickens (16 años de experiencia en Lima Norte)

Incluye:
- Hook inicial impactante
- Contenido valioso y relevante
- Call to action claro
- Hashtags estratégicos (si aplica)

Devuelve el contenido listo para publicar.`;

    try {
      const result = await this.model.generateContent(prompt);
      const contenido = result.response.text();
      
      await this.logGeneration('social_content', { tema, plataforma, contenido });
      
      return {
        success: true,
        contenido,
        plataforma,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[IA] ❌ Error generando contenido social:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Optimizar título de producto para SEO
   */
  async optimizeProductTitle(tituloActual, palabrasClave) {
    console.log(`[IA] 🎯 Optimizando título: ${tituloActual}`);
    
    const prompt = `Optimiza este título de producto para SEO y conversión:

Título actual: "${tituloActual}"
Palabras clave objetivo: ${palabrasClave.join(', ')}

Requisitos:
- Máximo 60 caracteres (óptimo para Google)
- Incluir palabra clave principal al inicio
- Claro, descriptivo y atractivo
- Sin clickbait exagerado

Devuelve solo el título optimizado.`;

    try {
      const result = await this.model.generateContent(prompt);
      const tituloOptimizado = result.response.text().trim().replace(/['"]/g, '');
      
      await this.logGeneration('title_optimization', { 
        tituloActual, 
        tituloOptimizado,
        palabrasClave 
      });
      
      return {
        success: true,
        tituloOriginal: tituloActual,
        tituloOptimizado,
        mejora: `Optimizado con palabras clave: ${palabrasClave.join(', ')}`
      };
    } catch (error) {
      console.error('[IA] ❌ Error optimizando título:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar recomendaciones personalizadas
   */
  async generateRecommendations(clienteHistorial) {
    const { productosComprados, categoriasFavoritas, presupuestoPromedio } = clienteHistorial;
    
    console.log('[IA] 🎁 Generando recomendaciones personalizadas');
    
    const prompt = `Basándote en el historial de compra del cliente, recomienda 3 productos ideales:

Productos comprados anteriormente: ${productosComprados.join(', ')}
Categorías favoritas: ${categoriasFavoritas.join(', ')}
Presupuesto promedio: $${presupuestoPromedio}

Catálogo disponible:
- Pechuga Broaster Premium: $16
- Combo Familiar (8 piezas): $55
- Alitas Especiales (6 unid.): $20
- Combo Doble Alitas: $30
- Hamburguesa Especial: $16
- Salchipapa a la Pobre: $18

Devuelve un JSON con este formato:
{
  "recomendaciones": [
    {
      "producto": "nombre del producto",
      "razon": "razón personalizada de la recomendación",
      "precio": 00.00
    }
  ]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let respuesta = result.response.text().trim();
      
      // Extraer JSON de la respuesta
      const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recomendaciones = JSON.parse(jsonMatch[0]);
        
        await this.logGeneration('recommendations', { clienteHistorial, recomendaciones });
        
        return {
          success: true,
          recomendaciones: recomendaciones.recomendaciones,
          generatedAt: new Date().toISOString()
        };
      }
      
      throw new Error('No se pudo extraer JSON de la respuesta');
    } catch (error) {
      console.error('[IA] ❌ Error generando recomendaciones:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analizar tendencias predictivas
   */
  async analyzeTrends(datosVentas) {
    console.log('[IA] 📈 Analizando tendencias predictivas');
    
    const { ventasUltimos30Dias, productosMasVendidos, horariosPico } = datosVentas;
    
    const prompt = `Analiza estos datos de ventas y genera insights accionables:

Ventas últimos 30 días: $${ventasUltimos30Dias}
Productos más vendidos: ${productosMasVendidos.map(p => `${p.nombre} (${p.cantidad} unidades)`).join(', ')}
Horarios pico: ${horariosPico.join(', ')}

Genera:
1. Predicción de ventas para próximos 7 días
2. Recomendaciones de productos para promocionar
3. Sugerencias de horarios óptimos para campañas
4. Estrategias para incrementar ticket promedio

Devuelve análisis breve y accionable (máximo 200 palabras).`;

    try {
      const result = await this.model.generateContent(prompt);
      const analisis = result.response.text();
      
      await this.logGeneration('trend_analysis', { datosVentas, analisis });
      
      return {
        success: true,
        analisis,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[IA] ❌ Error analizando tendencias:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Guardar log de generación
   */
  async logGeneration(tipo, data) {
    await fs.mkdir(LOG_DIR, { recursive: true });
    const logPath = path.join(LOG_DIR, `generaciones_${dayjs().format('YYYY-MM-DD')}.jsonl`);
    const line = JSON.stringify({ 
      tipo, 
      data, 
      timestamp: new Date().toISOString() 
    }) + '\n';
    await fs.appendFile(logPath, line);
  }

  /**
   * Ejecutar ciclo de optimización con IA
   */
  async runOptimizationCycle() {
    console.log('\n🧠 [IA Engine] Iniciando ciclo de optimización con IA');
    
    await this.initialize();
    
    // 1. Generar descripción de producto ejemplo
    console.log('\n📝 Generando descripción optimizada...');
    const descripcion = await this.generateProductDescription({
      nombre: 'Pechuga Broaster Premium',
      categoria: 'Pollo Broaster',
      ingredientes: ['Pechuga de pollo', 'Especias secretas', 'Papas fritas', 'Ensalada'],
      beneficios: ['Crujiente por fuera, jugoso por dentro', '100% pollo fresco', '16 años de receta perfecta']
    });
    
    if (descripcion.success) {
      console.log('\n✅ Descripción generada:');
      console.log(descripcion.descripcion);
    }
    
    // 2. Generar contenido para redes sociales
    console.log('\n📱 Generando contenido para Instagram...');
    const socialContent = await this.generateSocialContent(
      'Promoción de combo familiar con descuento especial',
      'instagram',
      'casual_profesional'
    );
    
    if (socialContent.success) {
      console.log('\n✅ Contenido generado:');
      console.log(socialContent.contenido);
    }
    
    // 3. Optimizar título de producto
    console.log('\n🎯 Optimizando título de producto...');
    const titulo = await this.optimizeProductTitle(
      'Combo de pollo',
      ['pollo broaster', 'combo familiar', 'delivery']
    );
    
    if (titulo.success) {
      console.log(`\n✅ Título optimizado: "${titulo.tituloOptimizado}"`);
    }
    
    // 4. Generar recomendaciones personalizadas
    console.log('\n🎁 Generando recomendaciones...');
    const recomendaciones = await this.generateRecommendations({
      productosComprados: ['Pechuga Broaster', 'Papas fritas'],
      categoriasFavoritas: ['Pollo', 'Guarniciones'],
      presupuestoPromedio: 25
    });
    
    if (recomendaciones.success) {
      console.log('\n✅ Recomendaciones generadas:');
      recomendaciones.recomendaciones.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec.producto} - ${rec.razon}`);
      });
    }
    
    console.log('\n✅ [IA Engine] Ciclo completado\n');
  }
}

// Ejecución independiente para pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  const iaEngine = new IAEngine();
  iaEngine.runOptimizationCycle()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('[IA] ❌ Error fatal:', error);
      process.exit(1);
    });
}
