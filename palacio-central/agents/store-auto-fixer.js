// 🏆 AGENTE ELITE #10: STORE AUTO-FIXER
// Implementa TODOS los fixes automáticamente

import StorePerfectionMaster from './store-perfection-master.js';
import ProductDescriptionWriter from './product-description-writer.js';
import ImageOptimizer from './image-optimizer.js';
import TrustBuilder from './trust-builder.js';
import { promises as fs } from 'fs';

class StoreAutoFixer {
  constructor() {
    this.name = 'Store Auto-Fixer';
    this.role = 'Ejecutor Automático de Mejoras';
    this.philosophy = 'Análisis es conocimiento. Acción es progreso.';
  }

  async ejecutarMejorasCompletas() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 AGENTE ELITE: STORE AUTO-FIXER');
    console.log('🎯 Misión: Implementar TODAS las mejoras automáticamente');
    console.log('⚠️  MODO AGRESIVO: Aplicará cambios SIN confirmación');
    console.log('='.repeat(80));
    
    const resultados = {
      timestamp: new Date().toISOString(),
      fixes_aplicados: [],
      errores: [],
      tiempo_total: 0
    };
    
    const inicio = Date.now();
    
    // PASO 1: Auditoría inicial
    console.log('\n📊 PASO 1/5: Auditoría inicial...');
    const master = new StorePerfectionMaster();
    const auditInicial = await master.ejecutar();
    const scoreInicial = auditInicial.score_general;
    console.log(`   Score inicial: ${scoreInicial}/100`);
    
    // PASO 2: Mejorar descripciones (AUTO-FIX)
    console.log('\n✍️ PASO 2/5: Mejorando descripciones con IA...');
    try {
      const writer = new ProductDescriptionWriter();
      const resultDescripciones = await writer.ejecutar(true); // AUTO-FIX = true
      resultados.fixes_aplicados.push({
        agente: 'Product Description Writer',
        mejoras: `${resultDescripciones.productos_analizados} productos optimizados`,
        impacto: `Score ${resultDescripciones.score_promedio_original} → ${resultDescripciones.score_promedio_mejorado}`
      });
    } catch (error) {
      resultados.errores.push({
        agente: 'Product Description Writer',
        error: error.message
      });
    }
    
    // PASO 3: Optimizar imágenes (AUTO-FIX ALT text)
    console.log('\n📸 PASO 3/5: Generando ALT text para SEO...');
    try {
      const optimizer = new ImageOptimizer();
      const resultImagenes = await optimizer.ejecutar(true); // AUTO-FIX = true
      resultados.fixes_aplicados.push({
        agente: 'Image Optimizer',
        mejoras: `${resultImagenes.fixes_aplicados} imágenes optimizadas`,
        impacto: `${resultImagenes.imagenes_sin_alt} → 0 imágenes sin ALT text`
      });
    } catch (error) {
      resultados.errores.push({
        agente: 'Image Optimizer',
        error: error.message
      });
    }
    
    // PASO 4: Construir confianza (AUTO-GENERATE políticas)
    console.log('\n🛡️ PASO 4/5: Generando elementos de confianza...');
    try {
      const trustBuilder = new TrustBuilder();
      const resultTrust = await trustBuilder.ejecutar(true); // AUTO-GENERATE = true
      resultados.fixes_aplicados.push({
        agente: 'Trust Builder',
        mejoras: 'Políticas legales y elementos de confianza',
        impacto: `Trust Score: ${resultTrust.trust_score}/100`
      });
    } catch (error) {
      resultados.errores.push({
        agente: 'Trust Builder',
        error: error.message
      });
    }
    
    // PASO 5: Auditoría final
    console.log('\n📊 PASO 5/5: Auditoría final...');
    const auditFinal = await master.ejecutar();
    const scoreFinal = auditFinal.score_general;
    
    const tiempoTotal = Math.round((Date.now() - inicio) / 1000);
    
    resultados.tiempo_total = tiempoTotal;
    resultados.score_inicial = scoreInicial;
    resultados.score_final = scoreFinal;
    resultados.mejora = scoreFinal - scoreInicial;
    resultados.estado_final = auditFinal.estado;
    
    // Generar reporte final
    await this.generarReporteFinal(resultados);
    
    return resultados;
  }

  async generarReporteFinal(resultados) {
    await fs.mkdir('reports/auto-fix', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // JSON detallado
    await fs.writeFile(
      `reports/auto-fix/fix-report-${timestamp}.json`,
      JSON.stringify(resultados, null, 2)
    );
    
    // Markdown legible
    const markdown = this.generarMarkdown(resultados);
    await fs.writeFile(
      `reports/auto-fix/fix-report-${timestamp}.md`,
      markdown
    );
    
    console.log('\n' + '='.repeat(80));
    console.log('📁 Reportes generados:');
    console.log(`   reports/auto-fix/fix-report-${timestamp}.json`);
    console.log(`   reports/auto-fix/fix-report-${timestamp}.md`);
    console.log('='.repeat(80));
  }

  generarMarkdown(resultados) {
    return `# 🤖 REPORTE AUTO-FIX - STORE PERFECTION

**Fecha:** ${new Date(resultados.timestamp).toLocaleString('es-PE')}
**Tiempo total:** ${resultados.tiempo_total} segundos

---

## 📊 RESULTADOS

### Score General
- **Inicial:** ${resultados.score_inicial}/100
- **Final:** ${resultados.score_final}/100
- **Mejora:** ${resultados.mejora > 0 ? '+' : ''}${resultados.mejora} puntos
- **Estado:** ${resultados.estado_final}

---

## ✅ FIXES APLICADOS

${resultados.fixes_aplicados.map((fix, i) => `
### ${i+1}. ${fix.agente}
- **Mejoras:** ${fix.mejoras}
- **Impacto:** ${fix.impacto}
`).join('\n')}

---

## ❌ ERRORES

${resultados.errores.length === 0 ? '✅ Sin errores' : 
  resultados.errores.map((err, i) => `
### ${i+1}. ${err.agente}
- **Error:** ${err.error}
`).join('\n')}

---

## 🎯 SIGUIENTE PASO

${resultados.score_final >= 85 ? `
### ¡TIENDA LISTA! 🏆

Tu tienda está a nivel profesional. Ahora:

1. **Configurar envíos** (Lima Metropolitana)
2. **Test de compra** (verificar flujo completo)
3. **Lanzar tráfico** (WhatsApp + Facebook + Instagram)

**Meta:** S/450 en 7 días es ALCANZABLE.
` : `
### Mejorar más ⚡

Score ${resultados.score_final}/100 es funcional pero mejorable.

**Prioridades:**
1. Revisar productos sin imágenes
2. Completar descripciones cortas
3. Verificar stock de productos

**Ejecuta nuevamente este agente en 24h para re-optimizar.**
`}

---

## 💬 Mensaje Candiani

> ${resultados.score_final >= 85 ?
  '"La perfección es enemiga del progreso. Ya estás listo para vender. AHORA actúa."' :
  '"Cada mejora te acerca al cliente. Sigue optimizando, las ventas llegarán."'
}
`;
  }

  async ejecutar() {
    const resultado = await this.ejecutarMejorasCompletas();
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 AUTO-FIX COMPLETADO');
    console.log(`📊 Score: ${resultado.score_inicial} → ${resultado.score_final} (+${resultado.mejora})`);
    console.log(`⏱️  Tiempo: ${resultado.tiempo_total}s`);
    console.log(`✅ Fixes: ${resultado.fixes_aplicados.length}`);
    console.log(`❌ Errores: ${resultado.errores.length}`);
    console.log('='.repeat(80));
    
    return resultado;
  }
}

export default StoreAutoFixer;

if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new StoreAutoFixer();
  
  console.log('⚠️  ADVERTENCIA: Este agente aplicará cambios automáticamente.');
  console.log('   Asegúrate de tener backup o poder revertir cambios.');
  console.log('');
  console.log('   Presiona Ctrl+C en los próximos 5 segundos para cancelar...\n');
  
  setTimeout(() => {
    fixer.ejecutar()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
      });
  }, 5000);
}
