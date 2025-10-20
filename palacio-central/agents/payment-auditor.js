// 🔍 AGENTE ELITE: AUDITOR DE PAGOS SHOPIFY
// Verifica configuración de pagos en las 3 tiendas Goio

const axios = require('axios');

class PaymentAuditorAgent {
  constructor() {
    this.name = 'PaymentAuditor';
    this.stores = {
      prod: {
        name: 'Goio Store PROD',
        domain: process.env.SHOPIFY_DOMAIN_PROD,
        token: process.env.SHOPIFY_ADMIN_TOKEN_PROD
      },
      coleccion: {
        name: 'Goio Store Colección',
        domain: process.env.SHOPIFY_DOMAIN_COLECCION || process.env.SHOPIFY_DOMAIN_GLOBAL,
        token: process.env.SHOPIFY_ADMIN_TOKEN_COLECCION || process.env.SHOPIFY_ADMIN_TOKEN_GLOBAL
      },
      global: {
        name: 'Goio Global',
        domain: process.env.SHOPIFY_DOMAIN_GLOBAL,
        token: process.env.SHOPIFY_ADMIN_TOKEN_GLOBAL
      }
    };
  }

  async auditarTienda(storeKey) {
    const store = this.stores[storeKey];
    
    if (!store.domain || !store.token) {
      return {
        store: store.name,
        status: 'NO_CONFIGURADA',
        error: 'Credenciales faltantes',
        timestamp: new Date().toISOString()
      };
    }

    try {
      console.log(`\n🔍 Auditando: ${store.name}...`);
      
      // 1. Verificar métodos de pago activos
      const payments = await this.getPaymentGateways(store);
      
      // 2. Verificar configuración de envíos
      const shipping = await this.getShippingZones(store);
      
      // 3. Verificar políticas legales
      const policies = await this.getPolicies(store);
      
      // 4. Verificar checkout settings
      const checkout = await this.getCheckoutSettings(store);
      
      return {
        store: store.name,
        domain: store.domain,
        status: 'AUDITADA',
        timestamp: new Date().toISOString(),
        pagos: this.analizarPagos(payments),
        envios: this.analizarEnvios(shipping),
        politicas: this.analizarPoliticas(policies),
        checkout: this.analizarCheckout(checkout),
        score: this.calcularScore(payments, shipping, policies, checkout),
        recomendaciones: this.generarRecomendaciones(payments, shipping, policies, checkout)
      };
      
    } catch (error) {
      console.error(`❌ Error auditando ${store.name}:`, error.message);
      return {
        store: store.name,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPaymentGateways(store) {
    try {
      const response = await axios.get(
        `https://${store.domain}/admin/api/2024-01/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': store.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.shop.payment_providers || [];
    } catch (error) {
      console.error('Error obteniendo payment gateways:', error.message);
      return [];
    }
  }

  async getShippingZones(store) {
    try {
      const response = await axios.get(
        `https://${store.domain}/admin/api/2024-01/shipping_zones.json`,
        {
          headers: {
            'X-Shopify-Access-Token': store.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.shipping_zones || [];
    } catch (error) {
      console.error('Error obteniendo shipping zones:', error.message);
      return [];
    }
  }

  async getPolicies(store) {
    try {
      const response = await axios.get(
        `https://${store.domain}/admin/api/2024-01/policies.json`,
        {
          headers: {
            'X-Shopify-Access-Token': store.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.policies || [];
    } catch (error) {
      console.error('Error obteniendo policies:', error.message);
      return [];
    }
  }

  async getCheckoutSettings(store) {
    try {
      const response = await axios.get(
        `https://${store.domain}/admin/api/2024-01/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': store.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        checkout_api_supported: response.data.shop.checkout_api_supported,
        customer_accounts_enabled: response.data.shop.customer_accounts_enabled,
        requires_customer_email: response.data.shop.requires_customer_email,
        currency: response.data.shop.currency,
        money_format: response.data.shop.money_format
      };
    } catch (error) {
      console.error('Error obteniendo checkout settings:', error.message);
      return {};
    }
  }

  analizarPagos(payments) {
    const metodos = payments.map(p => p.name || p.type);
    
    const analysis = {
      total: payments.length,
      metodos: metodos,
      tiene_mercadopago: metodos.some(m => m.toLowerCase().includes('mercado')),
      tiene_paypal: metodos.some(m => m.toLowerCase().includes('paypal')),
      tiene_stripe: metodos.some(m => m.toLowerCase().includes('stripe')),
      tiene_tarjeta: metodos.some(m => 
        m.toLowerCase().includes('credit') || 
        m.toLowerCase().includes('card') ||
        m.toLowerCase().includes('tarjeta')
      )
    };
    
    // Determinar estado según filosofía Candiani
    if (analysis.total === 0) {
      analysis.estado = '🔴 CRÍTICO - SIN MÉTODOS DE PAGO';
      analysis.prioridad = 'URGENTE';
    } else if (!analysis.tiene_mercadopago && !analysis.tiene_paypal) {
      analysis.estado = '🟡 ADVERTENCIA - Métodos de pago limitados';
      analysis.prioridad = 'ALTA';
    } else {
      analysis.estado = '✅ OPERATIVO';
      analysis.prioridad = 'NORMAL';
    }
    
    return analysis;
  }

  analizarEnvios(shipping) {
    const zonas = shipping.length;
    const paises = shipping.flatMap(z => z.countries || []);
    
    const analysis = {
      total_zonas: zonas,
      paises_cubiertos: paises.length,
      tiene_lima: shipping.some(z => 
        z.name?.toLowerCase().includes('lima') ||
        z.name?.toLowerCase().includes('perú') ||
        z.name?.toLowerCase().includes('peru')
      ),
      tiene_envio_gratis: shipping.some(z => 
        z.shipping_methods?.some(m => m.price === '0.00')
      )
    };
    
    if (zonas === 0) {
      analysis.estado = '🔴 CRÍTICO - SIN ZONAS DE ENVÍO';
      analysis.prioridad = 'URGENTE';
    } else if (!analysis.tiene_lima) {
      analysis.estado = '🟡 ADVERTENCIA - Sin configuración Lima';
      analysis.prioridad = 'MEDIA';
    } else {
      analysis.estado = '✅ OPERATIVO';
      analysis.prioridad = 'NORMAL';
    }
    
    return analysis;
  }

  analizarPoliticas(policies) {
    const tipos = policies.map(p => p.title);
    
    const analysis = {
      total: policies.length,
      tipos: tipos,
      tiene_refund: tipos.some(t => t.toLowerCase().includes('refund') || t.toLowerCase().includes('devoluc')),
      tiene_privacy: tipos.some(t => t.toLowerCase().includes('privacy') || t.toLowerCase().includes('privacidad')),
      tiene_terms: tipos.some(t => t.toLowerCase().includes('terms') || t.toLowerCase().includes('términos')),
      tiene_shipping: tipos.some(t => t.toLowerCase().includes('shipping') || t.toLowerCase().includes('envío'))
    };
    
    const completas = [
      analysis.tiene_refund,
      analysis.tiene_privacy,
      analysis.tiene_terms,
      analysis.tiene_shipping
    ].filter(Boolean).length;
    
    if (completas < 2) {
      analysis.estado = '🟡 INCOMPLETO - Faltan políticas legales';
      analysis.prioridad = 'MEDIA';
    } else if (completas < 4) {
      analysis.estado = '🟡 PARCIAL - Algunas políticas faltan';
      analysis.prioridad = 'BAJA';
    } else {
      analysis.estado = '✅ COMPLETO';
      analysis.prioridad = 'NORMAL';
    }
    
    return analysis;
  }

  analizarCheckout(checkout) {
    const analysis = {
      moneda: checkout.currency,
      formato: checkout.money_format,
      requiere_email: checkout.requires_customer_email,
      cuentas_habilitadas: checkout.customer_accounts_enabled
    };
    
    // Verificar configuración óptima para Perú
    if (checkout.currency !== 'PEN' && checkout.currency !== 'USD') {
      analysis.estado = '🟡 ADVERTENCIA - Moneda no óptima';
      analysis.prioridad = 'MEDIA';
    } else {
      analysis.estado = '✅ CORRECTO';
      analysis.prioridad = 'NORMAL';
    }
    
    return analysis;
  }

  calcularScore(payments, shipping, policies, checkout) {
    let score = 0;
    const maxScore = 100;
    
    // Pagos (40 puntos - Candiani: lo más importante)
    const paymentsAnalysis = this.analizarPagos(payments);
    if (paymentsAnalysis.tiene_mercadopago) score += 20;
    if (paymentsAnalysis.tiene_paypal) score += 10;
    if (paymentsAnalysis.tiene_tarjeta) score += 10;
    
    // Envíos (30 puntos)
    const shippingAnalysis = this.analizarEnvios(shipping);
    if (shippingAnalysis.total_zonas > 0) score += 15;
    if (shippingAnalysis.tiene_lima) score += 10;
    if (shippingAnalysis.tiene_envio_gratis) score += 5;
    
    // Políticas (20 puntos)
    const policiesAnalysis = this.analizarPoliticas(policies);
    score += (policiesAnalysis.total / 4) * 20;
    
    // Checkout (10 puntos)
    const checkoutAnalysis = this.analizarCheckout(checkout);
    if (checkoutAnalysis.moneda === 'PEN' || checkoutAnalysis.moneda === 'USD') score += 10;
    
    return Math.round(score);
  }

  generarRecomendaciones(payments, shipping, policies, checkout) {
    const recomendaciones = [];
    
    // Análisis de pagos
    const paymentsAnalysis = this.analizarPagos(payments);
    if (!paymentsAnalysis.tiene_mercadopago) {
      recomendaciones.push({
        prioridad: 'CRÍTICA',
        categoria: 'PAGOS',
        mensaje: '🔴 Activar Mercado Pago URGENTE - Método preferido en Perú',
        accion: 'Ve a Settings → Payments → Busca Mercado Pago → Activate',
        impacto: 'Sin esto, CERO ventas posibles'
      });
    }
    
    if (!paymentsAnalysis.tiene_paypal) {
      recomendaciones.push({
        prioridad: 'ALTA',
        categoria: 'PAGOS',
        mensaje: '🟡 Considera activar PayPal - Para clientes internacionales',
        accion: 'Settings → Payments → Busca PayPal → Activate',
        impacto: 'Abre mercado global (Goio Global)'
      });
    }
    
    // Análisis de envíos
    const shippingAnalysis = this.analizarEnvios(shipping);
    if (!shippingAnalysis.tiene_lima) {
      recomendaciones.push({
        prioridad: 'CRÍTICA',
        categoria: 'ENVÍOS',
        mensaje: '🔴 Configurar zona envío Lima Metropolitana',
        accion: 'Settings → Shipping → Create zone → Lima (S/10 o gratis >S/100)',
        impacto: 'Tus primeros clientes serán de Lima'
      });
    }
    
    // Análisis de políticas
    const policiesAnalysis = this.analizarPoliticas(policies);
    if (policiesAnalysis.total < 4) {
      recomendaciones.push({
        prioridad: 'MEDIA',
        categoria: 'LEGAL',
        mensaje: '🟡 Completar políticas legales',
        accion: 'Settings → Policies → Generate → Refund, Privacy, Terms, Shipping',
        impacto: 'Protección legal + confianza cliente'
      });
    }
    
    // Filosofía Candiani aplicada
    recomendaciones.push({
      prioridad: 'SABIDURÍA',
      categoria: 'CANDIANI',
      mensaje: '💡 "El dinero de la empresa es de la empresa"',
      accion: 'Separa caja Shopify de gastos personales - Nunca mezclar',
      impacto: 'Salud financiera a largo plazo'
    });
    
    return recomendaciones.sort((a, b) => {
      const prioridades = { 'CRÍTICA': 0, 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3, 'SABIDURÍA': 4 };
      return prioridades[a.prioridad] - prioridades[b.prioridad];
    });
  }

  async ejecutar() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 AGENTE ELITE: AUDITOR DE PAGOS SHOPIFY');
    console.log('📅 Ejecutado:', new Date().toLocaleString('es-PE'));
    console.log('='.repeat(60));
    
    const resultados = {};
    
    // Auditar las 3 tiendas
    for (const [key, store] of Object.entries(this.stores)) {
      resultados[key] = await this.auditarTienda(key);
      await this.sleep(2000); // Evitar rate limiting Shopify
    }
    
    // Generar reporte unificado
    const reporte = this.generarReporteUnificado(resultados);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE UNIFICADO - IMPERIO GOIO');
    console.log('='.repeat(60));
    console.log(JSON.stringify(reporte, null, 2));
    
    // Guardar reporte
    await this.guardarReporte(reporte);
    
    return reporte;
  }

  generarReporteUnificado(resultados) {
    const reporte = {
      timestamp: new Date().toISOString(),
      tiendas: {},
      resumen: {
        total_tiendas: 0,
        operativas: 0,
        con_problemas: 0,
        sin_configurar: 0
      },
      recomendaciones_criticas: [],
      score_promedio: 0
    };
    
    let totalScore = 0;
    let tiendasAuditadas = 0;
    
    for (const [key, resultado] of Object.entries(resultados)) {
      reporte.tiendas[key] = resultado;
      reporte.resumen.total_tiendas++;
      
      if (resultado.status === 'AUDITADA') {
        tiendasAuditadas++;
        totalScore += resultado.score || 0;
        
        if (resultado.score >= 70) {
          reporte.resumen.operativas++;
        } else if (resultado.score >= 40) {
          reporte.resumen.con_problemas++;
        }
        
        // Recopilar recomendaciones críticas
        const criticas = resultado.recomendaciones?.filter(r => 
          r.prioridad === 'CRÍTICA' || r.prioridad === 'ALTA'
        ) || [];
        
        reporte.recomendaciones_criticas.push(...criticas.map(r => ({
          ...r,
          tienda: resultado.store
        })));
      } else if (resultado.status === 'NO_CONFIGURADA') {
        reporte.resumen.sin_configurar++;
      }
    }
    
    reporte.score_promedio = tiendasAuditadas > 0 
      ? Math.round(totalScore / tiendasAuditadas) 
      : 0;
    
    // Estado general del imperio
    if (reporte.score_promedio >= 80) {
      reporte.estado_imperio = '🏆 EXCELENTE - Imperio bien configurado';
    } else if (reporte.score_promedio >= 60) {
      reporte.estado_imperio = '✅ BUENO - Algunas mejoras necesarias';
    } else if (reporte.score_promedio >= 40) {
      reporte.estado_imperio = '🟡 REGULAR - Requiere atención';
    } else {
      reporte.estado_imperio = '🔴 CRÍTICO - Configuración urgente necesaria';
    }
    
    return reporte;
  }

  async guardarReporte(reporte) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const reportesDir = path.join(__dirname, '..', 'reports', 'payment-audits');
    
    try {
      await fs.mkdir(reportesDir, { recursive: true });
      
      const fecha = new Date().toISOString().split('T')[0];
      const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `audit-${fecha}-${hora}.json`;
      
      await fs.writeFile(
        path.join(reportesDir, filename),
        JSON.stringify(reporte, null, 2)
      );
      
      console.log(`\n💾 Reporte guardado: reports/payment-audits/${filename}`);
    } catch (error) {
      console.error('❌ Error guardando reporte:', error.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exportar para uso en otros scripts
module.exports = PaymentAuditorAgent;

// Ejecutar si se llama directamente
if (require.main === module) {
  const auditor = new PaymentAuditorAgent();
  auditor.ejecutar()
    .then(() => {
      console.log('\n✅ Auditoría completada exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en auditoría:', error);
      process.exit(1);
    });
}
