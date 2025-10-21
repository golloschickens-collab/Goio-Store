// 🏆 AGENTE ELITE #2: PRODUCT DESCRIPTION WRITER
// Genera descripciones que VENDEN (no solo describen)

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

class ProductDescriptionWriter {
  constructor() {
    this.name = 'Product Description Writer';
    this.role = 'Copywriter de Conversión';
    this.philosophy = 'Las palabras venden. Las características informan. Los beneficios convierten.';
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.shopifyConfig = {
      domain: process.env.SHOPIFY_STORE_URL?.replace('https://', '').replace('/', ''),
      token: process.env.SHOPIFY_ACCESS_TOKEN
    };
  }

  async mejorarTodasLasDescripciones(autoFix = false) {
    console.log('\n' + '='.repeat(80));
    console.log('✍️ AGENTE ELITE: PRODUCT DESCRIPTION WRITER');
    console.log('🎯 Misión: Transformar descripciones en máquinas de vender');
    console.log('='.repeat(80));
    
    const productos = await this.obtenerProductos();
    const mejoras = [];
    
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      console.log(`\n[${i+1}/${productos.length}] Analizando: ${producto.title}`);
      
      const mejora = await this.mejorarDescripcion(producto);
      mejoras.push(mejora);
      
      // AUTO-FIX: Actualizar en Shopify si autoFix está activado
      if (autoFix && mejora.mejora_significativa) {
        console.log(`   🔧 Aplicando mejora automáticamente...`);
        await this.actualizarProducto(producto.id, mejora.descripcion_mejorada);
        console.log(`   ✅ Descripción actualizada`);
      }
    }
    
    if (mejoras.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        productos_analizados: 0,
        score_promedio_original: '0.0',
        score_promedio_mejorado: '0.0',
        mejora_porcentual: '0.0%',
        mejoras: [],
        auto_fix_aplicado: autoFix,
        recomendacion: 'Sin productos para analizar'
      };
    }
    
    const scorePromedio = mejoras.reduce((sum, m) => sum + m.score_original, 0) / mejoras.length;
    const scoreMejorado = mejoras.reduce((sum, m) => sum + m.score_mejorado, 0) / mejoras.length;
    
    return {
      timestamp: new Date().toISOString(),
      productos_analizados: productos.length,
      score_promedio_original: scorePromedio.toFixed(1),
      score_promedio_mejorado: scoreMejorado.toFixed(1),
      mejora_porcentual: ((scoreMejorado - scorePromedio) / scorePromedio * 100).toFixed(1) + '%',
      mejoras: mejoras,
      auto_fix_aplicado: autoFix,
      recomendacion: autoFix ? 
        '✅ Descripciones mejoradas automáticamente' :
        '⏳ Ejecuta con autoFix=true para aplicar mejoras'
    };
  }

  async mejorarDescripcion(producto) {
    const descripcionActual = this.stripHTML(producto.body_html || '');
    const precio = producto.variants[0]?.price || 0;
    const compareAt = producto.variants[0]?.compare_at_price || 0;
    
    const prompt = `
Eres un copywriter experto en e-commerce con 15 años de experiencia.
Tu especialidad es escribir descripciones que VENDEN.

PRODUCTO ACTUAL:
Título: ${producto.title}
Descripción actual: ${descripcionActual || 'SIN DESCRIPCIÓN'}
Precio: S/${precio}
${compareAt ? `Precio antes: S/${compareAt}` : ''}

INSTRUCCIONES:
Reescribe la descripción aplicando estos principios:

1. BENEFICIOS, NO CARACTERÍSTICAS
   ❌ "Tela 100% algodón"
   ✅ "Te mantendrás fresco todo el día con nuestra tela 100% algodón que respira"

2. STORYTELLING EMOCIONAL
   Conecta con el cliente. ¿Qué siente? ¿Qué desea?

3. ELIMINAR OBJECIONES
   Responde las dudas ANTES de que las tengan:
   - "¿Es de calidad?" → "Material premium que dura años"
   - "¿Me quedará bien?" → "Talla perfecta gracias a nuestro corte ergonómico"
   - "¿Vale la pena?" → "Inversión inteligente: úsalo 100+ veces"

4. URGENCIA Y ESCASEZ
   "Stock limitado" / "Los primeros 10 clientes..."

5. LLAMADO A LA ACCIÓN
   Termina con "Agrégalo al carrito AHORA y recíbelo en 48h"

6. FORMATO VISUAL
   - Párrafos cortos (2-3 líneas)
   - Bullets para beneficios
   - Emojis estratégicos ✨🔥💎

ESTRUCTURA OBLIGATORIA:
[GANCHO EMOCIONAL - 1 línea que impacta]

[BENEFICIO PRINCIPAL - Por qué lo necesita]

✨ Características que importan:
• Beneficio 1
• Beneficio 2
• Beneficio 3

[ELIMINAR OBJECIÓN PRINCIPAL]

[URGENCIA]

[LLAMADO A LA ACCIÓN]

Responde en JSON:
{
  "score_original": 1-10,
  "problemas": ["problema1", "problema2"],
  "descripcion_mejorada": "descripción completa en HTML simple",
  "score_mejorado": 1-10,
  "mejora_significativa": true/false,
  "razon_score": "explicación breve"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluacion = JSON.parse(jsonMatch[0]);
        return {
          producto_id: producto.id,
          producto_titulo: producto.title,
          descripcion_original: descripcionActual.substring(0, 200) + '...',
          ...evaluacion
        };
      }
    } catch (error) {
      console.error(`Error mejorando descripción:`, error.message);
      return {
        producto_id: producto.id,
        producto_titulo: producto.title,
        error: error.message,
        score_original: 0,
        score_mejorado: 0
      };
    }
  }

  async actualizarProducto(productoId, nuevaDescripcion) {
    try {
      await axios.put(
        `https://${this.shopifyConfig.domain}/admin/api/2024-01/products/${productoId}.json`,
        {
          product: {
            id: productoId,
            body_html: nuevaDescripcion
          }
        },
        {
          headers: {
            'X-Shopify-Access-Token': this.shopifyConfig.token,
            'Content-Type': 'application/json'
          }
        }
      );
      return true;
    } catch (error) {
      console.error(`Error actualizando producto ${productoId}:`, error.message);
      return false;
    }
  }

  stripHTML(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
    const resultado = await this.mejorarTodasLasDescripciones(autoFix);
    
    // Guardar reporte
    await fs.mkdir('reports/copywriting', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      `reports/copywriting/descriptions-${timestamp}.json`,
      JSON.stringify(resultado, null, 2)
    );
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 SCORE ORIGINAL: ${resultado.score_promedio_original}/10`);
    console.log(`🚀 SCORE MEJORADO: ${resultado.score_promedio_mejorado}/10`);
    console.log(`📈 MEJORA: ${resultado.mejora_porcentual}`);
    console.log('='.repeat(80));
    
    return resultado;
  }
}

export default ProductDescriptionWriter;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoFix = process.argv.includes('--auto-fix');
  const writer = new ProductDescriptionWriter();
  
  console.log(`🔧 Auto-fix: ${autoFix ? 'ACTIVADO' : 'DESACTIVADO'}`);
  console.log('   (Usa --auto-fix para aplicar cambios automáticamente)\n');
  
  writer.ejecutar(autoFix)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
