// 🏆 AGENTE ELITE #3: IMAGE OPTIMIZER
// Optimiza, genera ALT text, y sugiere mejoras visuales

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

class ImageOptimizer {
  constructor() {
    this.name = 'Image Optimizer';
    this.role = 'Fotógrafo Digital & SEO Visual';
    this.philosophy = 'Una imagen vale 1000 conversiones';
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.shopifyConfig = {
      domain: process.env.SHOPIFY_STORE_URL?.replace('https://', '').replace('/', ''),
      token: process.env.SHOPIFY_ACCESS_TOKEN
    };
    
    this.standards = {
      min_images: 3,
      min_resolution: 1000,
      recommended_resolution: 2048,
      max_file_size: 1024 * 1024, // 1MB
      formats_recomendados: ['jpg', 'webp']
    };
  }

  async optimizarTodasLasImagenes(autoFix = false) {
    console.log('\n' + '='.repeat(80));
    console.log('📸 AGENTE ELITE: IMAGE OPTIMIZER');
    console.log('🎯 Misión: Imágenes profesionales que venden');
    console.log('='.repeat(80));
    
    const productos = await this.obtenerProductos();
    const analisis = [];
    let fixes_aplicados = 0;
    
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      console.log(`\n[${i+1}/${productos.length}] ${producto.title}`);
      
      const resultado = await this.analizarImagenesProducto(producto);
      analisis.push(resultado);
      
      // AUTO-FIX: Generar ALT text automáticamente
      if (autoFix && resultado.imagenes_sin_alt > 0) {
        console.log(`   🔧 Generando ALT text para ${resultado.imagenes_sin_alt} imágenes...`);
        const fixed = await this.generarAltTextAutomatico(producto);
        fixes_aplicados += fixed;
        console.log(`   ✅ ${fixed} imágenes actualizadas`);
      }
    }
    
    if (analisis.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        productos_analizados: 0,
        score_promedio: '0.0',
        total_imagenes: 0,
        imagenes_sin_alt: 0,
        imagenes_baja_resolucion: 0,
        productos_sin_imagenes: 0,
        fixes_aplicados: 0,
        detalle: [],
        recomendacion: 'Sin productos para analizar'
      };
    }
    
    const scorePromedio = analisis.reduce((sum, a) => sum + a.score, 0) / analisis.length;
    
    return {
      timestamp: new Date().toISOString(),
      productos_analizados: productos.length,
      score_promedio: scorePromedio.toFixed(1),
      total_imagenes: analisis.reduce((sum, a) => sum + a.total_imagenes, 0),
      imagenes_sin_alt: analisis.reduce((sum, a) => sum + a.imagenes_sin_alt, 0),
      imagenes_baja_resolucion: analisis.reduce((sum, a) => sum + a.imagenes_baja_res, 0),
      productos_sin_imagenes: analisis.filter(a => a.total_imagenes === 0).length,
      fixes_aplicados: fixes_aplicados,
      analisis_detallado: analisis,
      recomendacion: this.generarRecomendacion(analisis)
    };
  }

  async analizarImagenesProducto(producto) {
    const imagenes = producto.images || [];
    const issues = [];
    
    // Sin imágenes = BLOQUEANTE
    if (imagenes.length === 0) {
      return {
        producto_id: producto.id,
        producto_titulo: producto.title,
        score: 0,
        total_imagenes: 0,
        imagenes_sin_alt: 0,
        imagenes_baja_res: 0,
        estado: '🔴 BLOQUEANTE',
        prioridad: 'CRÍTICA',
        accion: 'Agregar mínimo 3 imágenes de calidad'
      };
    }
    
    // Menos de 3 imágenes
    if (imagenes.length < this.standards.min_images) {
      issues.push({
        tipo: 'CANTIDAD',
        gravedad: 'ALTA',
        problema: `Solo ${imagenes.length} imagen(es), recomendado: ${this.standards.min_images}+`,
        impacto: '-20% conversión'
      });
    }
    
    // Analizar cada imagen
    let sinAlt = 0;
    let bajaRes = 0;
    
    for (const img of imagenes) {
      // Sin ALT text (SEO + Accesibilidad)
      if (!img.alt || img.alt.trim() === '') {
        sinAlt++;
        issues.push({
          tipo: 'SEO',
          gravedad: 'MEDIA',
          problema: `Imagen sin ALT text: ${img.src}`,
          impacto: 'Pierde ranking SEO'
        });
      }
      
      // Resolución baja
      if (img.width < this.standards.min_resolution || img.height < this.standards.min_resolution) {
        bajaRes++;
        issues.push({
          tipo: 'CALIDAD',
          gravedad: 'MEDIA',
          problema: `Resolución baja ${img.width}x${img.height}`,
          impacto: 'No se ve bien en zoom'
        });
      }
    }
    
    // Calcular score
    let score = 100;
    score -= (this.standards.min_images - imagenes.length) * 15; // -15 pts por imagen faltante
    score -= sinAlt * 5; // -5 pts por imagen sin ALT
    score -= bajaRes * 10; // -10 pts por imagen baja resolución
    score = Math.max(0, score);
    
    return {
      producto_id: producto.id,
      producto_titulo: producto.title,
      score: score,
      total_imagenes: imagenes.length,
      imagenes_sin_alt: sinAlt,
      imagenes_baja_res: bajaRes,
      issues: issues,
      estado: score >= 80 ? '✅ EXCELENTE' : 
              score >= 60 ? '🟡 MEJORABLE' : 
              score >= 40 ? '🟠 DEFICIENTE' : '🔴 CRÍTICO',
      recomendaciones: this.generarRecomendacionesProducto(imagenes, issues)
    };
  }

  async generarAltTextAutomatico(producto) {
    const imagenes = producto.images || [];
    let fixes = 0;
    
    for (const img of imagenes) {
      if (!img.alt || img.alt.trim() === '') {
        const altText = await this.generarAltTextIA(producto.title, img.position);
        
        try {
          await axios.put(
            `https://${this.shopifyConfig.domain}/admin/api/2024-01/products/${producto.id}/images/${img.id}.json`,
            {
              image: {
                id: img.id,
                alt: altText
              }
            },
            {
              headers: {
                'X-Shopify-Access-Token': this.shopifyConfig.token,
                'Content-Type': 'application/json'
              }
            }
          );
          fixes++;
        } catch (error) {
          console.error(`Error actualizando ALT text imagen ${img.id}:`, error.message);
        }
      }
    }
    
    return fixes;
  }

  async generarAltTextIA(tituloProducto, posicion) {
    const prompt = `
Genera un ALT text SEO-optimizado para una imagen de producto.

PRODUCTO: ${tituloProducto}
POSICIÓN: Imagen #${posicion}

El ALT text debe:
- Ser descriptivo y conciso (máximo 125 caracteres)
- Incluir el nombre del producto
- Describir qué se ve en la imagen
- Ser útil para SEO
- No usar "imagen de" o "foto de"

Ejemplos BUENOS:
- "Zapatillas Nike Air Max 270 color negro con suela blanca"
- "Polo Adidas Originals azul marino vista frontal"

Responde SOLO con el ALT text, nada más.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      // Fallback si falla la IA
      return `${tituloProducto} - Imagen ${posicion}`;
    }
  }

  generarRecomendacionesProducto(imagenes, issues) {
    const recomendaciones = [];
    
    if (imagenes.length < this.standards.min_images) {
      recomendaciones.push({
        prioridad: 1,
        accion: `Agregar ${this.standards.min_images - imagenes.length} imágenes más`,
        razon: 'Clientes necesitan ver producto desde varios ángulos',
        sugerencias: [
          '1. Foto principal: producto completo fondo blanco',
          '2. Foto detalle: textura, material, calidad',
          '3. Foto uso: persona usando el producto'
        ]
      });
    }
    
    if (issues.some(i => i.tipo === 'SEO')) {
      recomendaciones.push({
        prioridad: 2,
        accion: 'Agregar ALT text a todas las imágenes',
        razon: 'Mejora SEO y accesibilidad',
        como: 'Usa el agente con --auto-fix para generarlo automáticamente'
      });
    }
    
    if (issues.some(i => i.tipo === 'CALIDAD')) {
      recomendaciones.push({
        prioridad: 3,
        accion: 'Reemplazar imágenes de baja resolución',
        razon: 'Clientes quieren hacer zoom para ver detalles',
        minimo: `${this.standards.min_resolution}x${this.standards.min_resolution}px`
      });
    }
    
    return recomendaciones;
  }

  generarRecomendacion(analisis) {
    if (analisis.length === 0) return 'Sin productos para analizar';
    const sinImagenes = analisis.filter(a => a.total_imagenes === 0).length;
    const scorePromedio = analisis.reduce((sum, a) => sum + a.score, 0) / analisis.length;
    
    if (sinImagenes > 0) {
      return `🔴 BLOQUEANTE: ${sinImagenes} producto(s) sin imágenes. No se puede vender.`;
    }
    
    if (scorePromedio < 60) {
      return '🟠 URGENTE: Calidad de imágenes afectando conversión. Priorizar mejora.';
    }
    
    if (scorePromedio < 80) {
      return '🟡 MEJORABLE: Agregar más imágenes y optimizar ALT text para SEO.';
    }
    
    return '✅ EXCELENTE: Imágenes nivel profesional.';
  }

  async obtenerProductos() {
    try {
      const response = await axios.get(
        `https://${this.shopifyConfig.domain}/admin/api/2024-01/products.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.shopifyConfig.token
          }
        }
      );
      return response.data.products || [];
    } catch (error) {
      console.error('Error obteniendo productos:', error.message);
      return [];
    }
  }

  async ejecutar(autoFix = false) {
    const resultado = await this.optimizarTodasLasImagenes(autoFix);
    
    // Guardar reporte
    await fs.mkdir('reports/images', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      `reports/images/optimization-${timestamp}.json`,
      JSON.stringify(resultado, null, 2)
    );
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 SCORE PROMEDIO: ${resultado.score_promedio}/100`);
    console.log(`📸 Total imágenes: ${resultado.total_imagenes}`);
    console.log(`❌ Sin ALT text: ${resultado.imagenes_sin_alt}`);
    console.log(`📉 Baja resolución: ${resultado.imagenes_baja_resolucion}`);
    if (autoFix) console.log(`✅ Fixes aplicados: ${resultado.fixes_aplicados}`);
    console.log('='.repeat(80));
    
    return resultado;
  }
}

export default ImageOptimizer;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoFix = process.argv.includes('--auto-fix');
  const optimizer = new ImageOptimizer();
  
  console.log(`🔧 Auto-fix: ${autoFix ? 'ACTIVADO (generará ALT text)' : 'DESACTIVADO'}`);
  console.log('   (Usa --auto-fix para generar ALT text automáticamente)\n');
  
  optimizer.ejecutar(autoFix)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
