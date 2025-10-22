#!/usr/bin/env node

/**
 * ================================================================================
 * 👑 ORQUESTADOR MAESTRO: TRAFFIC & SALES AUTOMATION
 * 🎯 Misión: Coordinar todos los agentes de tráfico y ventas
 * ================================================================================
 */

const SEOTrafficMaster = require('./seo-traffic-master');
const FBAdsMatser = require('./fb-ads-master');
const SocialOrganicMaster = require('./social-organic-master');
const EmailFunnelMaster = require('./email-funnel-master');
const RetargetingMaster = require('./retargeting-master');

class TrafficSalesOrchestrator {
  constructor() {
    this.agentes = {
      seo: new SEOTrafficMaster(),
      fbAds: new FBAdsMatser(),
      social: new SocialOrganicMaster(),
      email: new EmailFunnelMaster(),
      retargeting: new RetargetingMaster()
    };
  }

  async ejecutarEstrategiaCompleta(opciones = {}) {
    console.log('\n' + '='.repeat(80));
    console.log('👑 ORQUESTADOR MAESTRO: TRAFFIC & SALES EMPIRE');
    console.log('🎯 Activando todos los motores de adquisición');
    console.log('='.repeat(80) + '\n');

    const {
      seo = true,
      fbAds = true,
      social = true,
      email = true,
      retargeting = true
    } = opciones;

    const reporteGeneral = {
      timestamp: new Date().toISOString(),
      estrategias_activadas: [],
      tiempo_total: 0,
      exito: true,
      errores: []
    };

    const inicio = Date.now();

    try {
      // FASE 1: Tráfico Orgánico (base sostenible)
      if (seo) {
        console.log('🔍 FASE 1: TRÁFICO ORGÁNICO (SEO)\n');
        try {
          await this.agentes.seo.ejecutarOptimizacionSEO();
          reporteGeneral.estrategias_activadas.push('SEO');
        } catch (error) {
          console.error('⚠️  Error en SEO (continuando):', error.message);
          reporteGeneral.errores.push({ agente: 'SEO', error: error.message });
        }
        console.log('\n' + '-'.repeat(80) + '\n');
      }

      // FASE 2: Redes Sociales Orgánicas (engagement + viralidad)
      if (social) {
        console.log('📱 FASE 2: REDES SOCIALES ORGÁNICAS\n');
        try {
          await this.agentes.social.ejecutarEstrategiaOrganica();
          reporteGeneral.estrategias_activadas.push('Social Organic');
        } catch (error) {
          console.error('⚠️  Error en Social (continuando):', error.message);
          reporteGeneral.errores.push({ agente: 'Social', error: error.message });
        }
        console.log('\n' + '-'.repeat(80) + '\n');
      }

      // FASE 3: Email Marketing (conversión + retención)
      if (email) {
        console.log('📧 FASE 3: EMAIL MARKETING AUTOMATION\n');
        try {
          await this.agentes.email.ejecutarFunnelAutomatico();
          reporteGeneral.estrategias_activadas.push('Email Funnel');
        } catch (error) {
          console.error('⚠️  Error en Email (continuando):', error.message);
          reporteGeneral.errores.push({ agente: 'Email', error: error.message });
        }
        console.log('\n' + '-'.repeat(80) + '\n');
      }

      // FASE 4: Facebook Ads (tráfico pagado inmediato)
      if (fbAds) {
        console.log('💰 FASE 4: FACEBOOK ADS (TRÁFICO PAGADO)\n');
        try {
          await this.agentes.fbAds.ejecutarCampañaAutomatica();
          reporteGeneral.estrategias_activadas.push('Facebook Ads');
        } catch (error) {
          console.error('⚠️  Error en FB Ads (continuando):', error.message);
          reporteGeneral.errores.push({ agente: 'Facebook Ads', error: error.message });
        }
        console.log('\n' + '-'.repeat(80) + '\n');
      }

      // FASE 5: Retargeting (recuperar ventas perdidas)
      if (retargeting) {
        console.log('🎯 FASE 5: RETARGETING INTELIGENTE\n');
        try {
          await this.agentes.retargeting.ejecutarRetargetingInteligente();
          reporteGeneral.estrategias_activadas.push('Retargeting');
        } catch (error) {
          console.error('⚠️  Error en Retargeting (continuando):', error.message);
          reporteGeneral.errores.push({ agente: 'Retargeting', error: error.message });
        }
        console.log('\n' + '-'.repeat(80) + '\n');
      }

      reporteGeneral.tiempo_total = Math.round((Date.now() - inicio) / 1000);
      await this.guardarReporteGeneral(reporteGeneral);

      // REPORTE FINAL
      console.log('\n' + '='.repeat(80));
      console.log('👑 IMPERIO DE TRÁFICO Y VENTAS ACTIVADO');
      console.log('='.repeat(80));
      console.log(`\n✅ Estrategias activas: ${reporteGeneral.estrategias_activadas.join(', ')}`);
      console.log(`⏱️  Tiempo total: ${reporteGeneral.tiempo_total}s`);
      
      if (reporteGeneral.errores.length > 0) {
        console.log(`\n⚠️  Advertencias: ${reporteGeneral.errores.length}`);
        reporteGeneral.errores.forEach(err => {
          console.log(`   - ${err.agente}: ${err.error}`);
        });
      } else {
        console.log('\n✨ Ejecución perfecta sin errores');
      }

      console.log('\n' + '='.repeat(80));
      console.log('📊 PROYECCIÓN DE RESULTADOS:');
      console.log('='.repeat(80));
      console.log('🔍 SEO Orgánico:');
      console.log('   - Primeros resultados: 14-30 días');
      console.log('   - Tráfico sostenible: 100-500 visitas/mes (mes 3)');
      console.log('   - Costo: $0 (solo tiempo de setup)');
      console.log('');
      console.log('📱 Redes Sociales:');
      console.log('   - Primeros seguidores: 7-14 días');
      console.log('   - Alcance orgánico: 500-2000 impresiones/semana');
      console.log('   - Costo: $0 (contenido automatizado)');
      console.log('');
      console.log('📧 Email Marketing:');
      console.log('   - Conversión carritos abandonados: 15-25%');
      console.log('   - Repeat purchases: +30%');
      console.log('   - Costo: $0 (gratis hasta 2000 contactos)');
      console.log('');
      console.log('💰 Facebook Ads:');
      console.log('   - Primeras ventas: 24-72 horas');
      console.log('   - ROI esperado: 3-5x');
      console.log('   - Costo: $10-20/día (ajustable)');
      console.log('');
      console.log('🎯 Retargeting:');
      console.log('   - Recuperación ventas: +70%');
      console.log('   - ROI: 5-8x (mejor que cold traffic)');
      console.log('   - Costo: $5/día');
      console.log('');
      console.log('💡 INVERSIÓN TOTAL SUGERIDA: $15-25/día ($450-750/mes)');
      console.log('💰 VENTAS NECESARIAS PARA BREAK-EVEN: 15-20 productos/mes');
      console.log('🚀 POTENCIAL MES 3: 100-300 ventas/mes');
      console.log('='.repeat(80) + '\n');

      return reporteGeneral;

    } catch (error) {
      console.error('\n❌ ERROR FATAL en orquestador:', error);
      reporteGeneral.exito = false;
      reporteGeneral.error_fatal = error.message;
      throw error;
    }
  }

  async ejecutarSoloOrganico() {
    console.log('🌱 Ejecutando solo estrategias ORGÁNICAS (costo $0)...\n');
    return await this.ejecutarEstrategiaCompleta({
      seo: true,
      social: true,
      email: true,
      fbAds: false,
      retargeting: false
    });
  }

  async ejecutarSoloPagado() {
    console.log('💰 Ejecutando solo estrategias PAGADAS...\n');
    return await this.ejecutarEstrategiaCompleta({
      seo: false,
      social: false,
      email: false,
      fbAds: true,
      retargeting: true
    });
  }

  async guardarReporteGeneral(reporte) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../reports/orchestrator');
    
    await fs.mkdir(reportDir, { recursive: true });
    
    const jsonPath = path.join(reportDir, `master-report-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(reporte, null, 2));
    
    // También crear reporte markdown legible
    const mdContent = this.generarReporteMarkdown(reporte);
    const mdPath = path.join(reportDir, `master-report-${timestamp}.md`);
    await fs.writeFile(mdPath, mdContent);
    
    console.log(`📁 Reportes guardados:`);
    console.log(`   - JSON: ${jsonPath}`);
    console.log(`   - Markdown: ${mdPath}`);
  }

  generarReporteMarkdown(reporte) {
    return `# 🏆 Reporte Maestro: Traffic & Sales Empire

**Fecha:** ${new Date(reporte.timestamp).toLocaleString('es-PE')}
**Tiempo de ejecución:** ${reporte.tiempo_total}s

## ✅ Estrategias Activadas

${reporte.estrategias_activadas.map(e => `- ${e}`).join('\n')}

## 📊 Estado

${reporte.exito ? '✅ **Ejecución exitosa**' : '❌ **Ejecución con errores**'}

${reporte.errores.length > 0 ? `
## ⚠️ Advertencias

${reporte.errores.map(err => `- **${err.agente}:** ${err.error}`).join('\n')}
` : ''}

## 🎯 Próximos Pasos

1. **Hoy:** Revisar métricas en dashboards (Facebook Ads Manager, Google Analytics)
2. **Mañana:** Verificar primeras impresiones y clicks en campañas
3. **Semana 1:** Ajustar presupuestos según ROI real
4. **Semana 2:** Optimizar copy y creatividades según A/B tests
5. **Mes 1:** Escalar campañas ganadoras, pausar las de bajo rendimiento

---

*Generado automáticamente por Traffic Sales Orchestrator*
`;
  }
}

// CLI - Ejecutar desde línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  const modo = args[0] || 'completo';

  const orchestrator = new TrafficSalesOrchestrator();

  let promesa;

  switch (modo) {
    case 'organico':
      promesa = orchestrator.ejecutarSoloOrganico();
      break;
    case 'pagado':
      promesa = orchestrator.ejecutarSoloPagado();
      break;
    case 'completo':
    default:
      promesa = orchestrator.ejecutarEstrategiaCompleta();
      break;
  }

  promesa
    .then(() => {
      console.log('\n✅ Orquestador completado exitosamente\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = TrafficSalesOrchestrator;
