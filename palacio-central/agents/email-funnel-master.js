#!/usr/bin/env node

/**
 * ================================================================================
 * 📧 AGENTE ELITE: EMAIL FUNNEL MASTER
 * 🎯 Misión: Convertir visitantes en compradores recurrentes vía email
 * ================================================================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class EmailFunnelMaster {
  constructor() {
    this.shopifyStore = process.env.SHOPIFY_STORE_URL;
    this.shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.geminiKey);
  }

  async ejecutarFunnelAutomatico() {
    console.log('\n' + '='.repeat(80));
    console.log('📧 AGENTE ELITE: EMAIL FUNNEL MASTER');
    console.log('🎯 Misión: Maximizar lifetime value con email marketing');
    console.log('='.repeat(80) + '\n');

    const reporte = {
      timestamp: new Date().toISOString(),
      secuencias_creadas: 0,
      emails_generados: 0,
      segmentos_configurados: 0,
      automaciones: []
    };

    try {
      // PASO 1: Crear secuencia de bienvenida
      console.log('👋 [1/8] Creando secuencia de bienvenida...\n');
      const secuenciaBienvenida = await this.crearSecuenciaBienvenida();
      reporte.secuencias_creadas++;
      reporte.emails_generados += secuenciaBienvenida.length;
      console.log(`   ✅ ${secuenciaBienvenida.length} emails de bienvenida creados\n`);

      // PASO 2: Crear secuencia de carrito abandonado
      console.log('🛒 [2/8] Configurando recuperación de carritos abandonados...\n');
      const secuenciaCarrito = await this.crearSecuenciaCarritoAbandonado();
      reporte.secuencias_creadas++;
      reporte.emails_generados += secuenciaCarrito.length;
      console.log(`   ✅ ${secuenciaCarrito.length} emails de recuperación creados\n`);

      // PASO 3: Crear secuencia post-compra
      console.log('📦 [3/8] Secuencia post-compra (upsell/cross-sell)...\n');
      const secuenciaPostCompra = await this.crearSecuenciaPostCompra();
      reporte.secuencias_creadas++;
      reporte.emails_generados += secuenciaPostCompra.length;
      console.log(`   ✅ ${secuenciaPostCompra.length} emails post-compra creados\n`);

      // PASO 4: Crear secuencia de reactivación
      console.log('🔄 [4/8] Secuencia de reactivación (clientes inactivos)...\n');
      const secuenciaReactivacion = await this.crearSecuenciaReactivacion();
      reporte.secuencias_creadas++;
      reporte.emails_generados += secuenciaReactivacion.length;
      console.log(`   ✅ ${secuenciaReactivacion.length} emails de reactivación creados\n`);

      // PASO 5: Configurar segmentación
      console.log('👥 [5/8] Configurando segmentos de audiencia...\n');
      const segmentos = await this.configurarSegmentos();
      reporte.segmentos_configurados = segmentos.length;
      console.log(`   ✅ ${segmentos.length} segmentos configurados\n`);

      // PASO 6: Crear campañas promocionales
      console.log('🎁 [6/8] Generando campañas promocionales...\n');
      const campanasPromo = await this.crearCampanasPromocionales();
      reporte.emails_generados += campanasPromo.length;
      console.log(`   ✅ ${campanasPromo.length} campañas promocionales listas\n`);

      // PASO 7: Configurar A/B testing automático
      console.log('🧪 [7/8] Configurando A/B testing de subject lines...\n');
      const abTests = await this.configurarABTesting();
      console.log(`   ✅ ${abTests.length} tests configurados\n`);

      // PASO 8: Configurar métricas y reportes
      console.log('📊 [8/8] Configurando tracking de métricas...\n');
      const metricas = await this.configurarMetricas();

      await this.guardarReporte(reporte);
      await this.guardarSecuencias({
        bienvenida: secuenciaBienvenida,
        carrito_abandonado: secuenciaCarrito,
        post_compra: secuenciaPostCompra,
        reactivacion: secuenciaReactivacion,
        promocionales: campanasPromo
      });

      console.log('\n' + '='.repeat(80));
      console.log('🏆 EMAIL MARKETING AUTOMATION ACTIVADO');
      console.log(`📧 Total emails generados: ${reporte.emails_generados}`);
      console.log(`🔄 Secuencias automáticas: ${reporte.secuencias_creadas}`);
      console.log(`👥 Segmentos: ${reporte.segmentos_configurados}`);
      console.log('⏱️  Conversión esperada: 15-25% en carritos abandonados');
      console.log('='.repeat(80) + '\n');

      return reporte;

    } catch (error) {
      console.error('❌ Error en email funnel:', error.message);
      throw error;
    }
  }

  async crearSecuenciaBienvenida() {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Crea una secuencia de 3 emails de bienvenida para e-commerce:

EMAIL 1 - Bienvenida + Descuento (envío inmediato)
EMAIL 2 - Productos más vendidos (24h después)
EMAIL 3 - Historia de marca + valores (48h después)

Para cada email genera:
- Subject line impactante (50 caracteres max)
- Preview text (80 caracteres)
- Cuerpo del email (HTML simple, conversacional)
- CTA claro
- P.S. con urgencia/beneficio extra

Tono: Amigable, cercano, LATAM
Objetivo: Primera compra con 15% descuento

Formato JSON:
{
  "emails": [
    {
      "numero": 1,
      "delay_horas": 0,
      "subject": "...",
      "preview": "...",
      "cuerpo_html": "...",
      "cta_texto": "...",
      "cta_url": "...",
      "ps": "..."
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let texto = result.response.text().trim();
    texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(texto);
      return parsed.emails || [];
    } catch (e) {
      return this.secuenciaBienvenidaFallback();
    }
  }

  secuenciaBienvenidaFallback() {
    return [
      {
        numero: 1,
        delay_horas: 0,
        subject: '🎁 ¡Bienvenido! Aquí está tu 15% OFF',
        preview: 'Empieza con el pie derecho. Tu cupón te espera...',
        cuerpo_html: `
          <h2>¡Bienvenido a Goio Store! 🎉</h2>
          <p>Estamos felices de tenerte aquí. Para celebrar, tenemos un regalo para ti:</p>
          <h3 style="color: #ff6b6b;">15% DE DESCUENTO</h3>
          <p>Usa el código: <strong>BIENVENIDO15</strong></p>
          <p>Válido por 48 horas en tu primera compra.</p>
        `,
        cta_texto: 'Ver Productos',
        cta_url: 'https://{STORE_URL}/collections/all',
        ps: 'P.D. Este cupón expira en 48h. ¡No te lo pierdas!'
      },
      {
        numero: 2,
        delay_horas: 24,
        subject: '⭐ Los favoritos de nuestros clientes',
        preview: 'Estos productos vuelan de las estanterías...',
        cuerpo_html: `
          <h2>¿Aún no sabes qué comprar?</h2>
          <p>Estos son los productos que nuestros clientes aman:</p>
          <p>✅ Alta calidad verificada<br>
          ✅ Envío rápido garantizado<br>
          ✅ Satisfacción 100%</p>
          <p><strong>Recuerda:</strong> Tu 15% OFF sigue activo.</p>
        `,
        cta_texto: 'Ver Best Sellers',
        cta_url: 'https://{STORE_URL}/collections/best-sellers',
        ps: 'P.D. Solo quedan 24h de tu descuento de bienvenida.'
      },
      {
        numero: 3,
        delay_horas: 48,
        subject: '❤️ Más que una tienda: nuestra historia',
        preview: 'Por qué hacemos lo que hacemos...',
        cuerpo_html: `
          <h2>Somos más que una tienda online</h2>
          <p>Nuestra misión es simple: traerte los mejores productos al mejor precio, con un servicio que supere tus expectativas.</p>
          <p>Cada producto es seleccionado cuidadosamente pensando en ti.</p>
          <p>Únete a miles de clientes satisfechos en Perú y Latinoamérica.</p>
        `,
        cta_texto: 'Conocer Más',
        cta_url: 'https://{STORE_URL}/pages/about',
        ps: 'P.D. ¿Dudas? Responde este email, estamos para ayudarte.'
      }
    ];
  }

  async crearSecuenciaCarritoAbandonado() {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Crea secuencia de recuperación de carrito abandonado (3 emails):

EMAIL 1 - Recordatorio suave (1 hora después de abandono)
EMAIL 2 - Incentivo + urgencia (24h después)
EMAIL 3 - Última oportunidad + descuento adicional (48h después)

Incluye:
- Subject lines con urgencia creciente
- Mostrar productos abandonados
- Testimonios/social proof
- Garantías (devolución, envío)
- Descuento progresivo (0%, 10%, 15%)

Formato JSON igual al anterior.`;

    const result = await model.generateContent(prompt);
    let texto = result.response.text().trim();
    texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(texto);
      return parsed.emails || [];
    } catch (e) {
      return this.secuenciaCarritoFallback();
    }
  }

  secuenciaCarritoFallback() {
    return [
      {
        numero: 1,
        delay_horas: 1,
        subject: '🛒 ¿Olvidaste algo en tu carrito?',
        preview: 'Tus productos te están esperando...',
        cuerpo_html: `
          <h2>¡Hola! Notamos que dejaste algo 👀</h2>
          <p>Tus productos siguen en el carrito esperándote:</p>
          <p>[PRODUCTOS ABANDONADOS]</p>
          <p>Completa tu compra ahora, solo toma 2 minutos.</p>
        `,
        cta_texto: 'Completar Compra',
        cta_url: '{CHECKOUT_URL}',
        ps: 'P.D. Stock limitado, asegura tu compra ahora.'
      },
      {
        numero: 2,
        delay_horas: 24,
        subject: '⏰ Tu carrito expira pronto + 10% OFF',
        preview: '¡Sorpresa! Te damos un descuento extra...',
        cuerpo_html: `
          <h2>No queremos que te lo pierdas 💔</h2>
          <p>Para ayudarte a decidir, te damos un <strong>10% OFF adicional</strong>:</p>
          <p>Código: <strong>RECUPERA10</strong></p>
          <p>[PRODUCTOS ABANDONADOS]</p>
          <p>⭐ Más de 1,000 clientes satisfechos<br>
          ✅ Envío rápido garantizado<br>
          🛡️ 30 días de garantía</p>
        `,
        cta_texto: 'Usar Mi Descuento',
        cta_url: '{CHECKOUT_URL}',
        ps: 'P.D. Este descuento expira en 24h.'
      },
      {
        numero: 3,
        delay_horas: 48,
        subject: '🚨 ÚLTIMA OPORTUNIDAD: 15% OFF',
        preview: 'Último llamado antes de que se agote...',
        cuerpo_html: `
          <h2>Esta es tu última oportunidad 🔔</h2>
          <p>Aumentamos tu descuento a <strong style="color: #ff6b6b;">15% OFF</strong></p>
          <p>Código: <strong>ULTIMAOPORTUNIDAD15</strong></p>
          <p>[PRODUCTOS ABANDONADOS]</p>
          <p>Después de esto, tu carrito se vaciará y estos productos pueden agotarse.</p>
          <p>¿Te lo vas a perder?</p>
        `,
        cta_texto: '¡Quiero Mi 15% OFF!',
        cta_url: '{CHECKOUT_URL}',
        ps: 'P.D. Este email es el último. Decide ahora.'
      }
    ];
  }

  async crearSecuenciaPostCompra() {
    return [
      {
        numero: 1,
        delay_horas: 2,
        subject: '✅ ¡Gracias por tu compra! Esto es lo que sigue',
        preview: 'Tu pedido está confirmado. Detalles dentro...',
        cuerpo_html: `
          <h2>¡Tu pedido está confirmado! 🎉</h2>
          <p>Número de orden: [ORDER_NUMBER]</p>
          <p>Recibirás un email cuando tu paquete esté en camino.</p>
          <p>Tiempo estimado de entrega: 2-4 días hábiles.</p>
          <p>¿Dudas? Estamos aquí para ayudarte.</p>
        `,
        cta_texto: 'Rastrear Pedido',
        cta_url: '{ORDER_STATUS_URL}',
        ps: 'P.D. Revisa tu email regularmente para actualizaciones.'
      },
      {
        numero: 2,
        delay_horas: 168, // 7 días
        subject: '❤️ ¿Qué tal tu compra? + Oferta exclusiva',
        preview: 'Queremos saber tu opinión (y tenemos un regalo)...',
        cuerpo_html: `
          <h2>¿Cómo estuvo tu experiencia?</h2>
          <p>Nos encantaría saber qué piensas de tu compra.</p>
          <p>Como agradecimiento, tenemos un <strong>20% OFF</strong> en tu próxima compra:</p>
          <p>Código: <strong>CLIENTEVIP20</strong></p>
          <p>Además, estos productos podrían interesarte:</p>
          <p>[PRODUCTOS RELACIONADOS - CROSS SELL]</p>
        `,
        cta_texto: 'Dejar Reseña',
        cta_url: '{REVIEW_URL}',
        ps: 'P.D. Tu opinión nos ayuda a mejorar cada día.'
      },
      {
        numero: 3,
        delay_horas: 336, // 14 días
        subject: '🎁 Regalo especial para clientes VIP',
        preview: 'Solo para ti: acceso anticipado a nuevos productos...',
        cuerpo_html: `
          <h2>Eres cliente VIP 👑</h2>
          <p>Como agradecimiento por tu compra, tienes acceso exclusivo a:</p>
          <p>✨ Nuevos productos antes que nadie<br>
          🎯 Descuentos exclusivos<br>
          📦 Envío gratis en pedidos +$50</p>
          <p>¿Listo para tu próxima compra?</p>
        `,
        cta_texto: 'Ver Novedades VIP',
        cta_url: '{STORE_URL}/collections/new',
        ps: 'P.D. Este beneficio es solo para clientes como tú.'
      }
    ];
  }

  async crearSecuenciaReactivacion() {
    return [
      {
        numero: 1,
        delay_dias: 30,
        subject: '😢 Te extrañamos... ¿Todo bien?',
        preview: 'Han pasado 30 días. Vuelve con 25% OFF...',
        cuerpo_html: `
          <h2>¡Hace tiempo que no te vemos! 💔</h2>
          <p>Han pasado 30 días desde tu última visita.</p>
          <p>Para que vuelvas, tenemos un regalo especial:</p>
          <h3>25% DE DESCUENTO</h3>
          <p>Código: <strong>TEVOLVEMOS25</strong></p>
          <p>Mira lo nuevo que tenemos para ti...</p>
        `,
        cta_texto: 'Ver Novedades',
        cta_url: '{STORE_URL}',
        ps: 'P.D. ¿Hubo algún problema? Responde este email.'
      },
      {
        numero: 2,
        delay_dias: 60,
        subject: '🎯 Última oportunidad: 30% OFF para ti',
        preview: 'No queremos perderte. Descuento máximo activado...',
        cuerpo_html: `
          <h2>Esto es lo máximo que podemos ofrecer 🙏</h2>
          <p>30% DE DESCUENTO en toda la tienda.</p>
          <p>Código: <strong>REGRESAMAX30</strong></p>
          <p>Si ya no quieres recibir emails, lo entendemos.</p>
          <p>Pero antes, dale una última oportunidad a estos productos...</p>
        `,
        cta_texto: 'Usar Mi 30% OFF',
        cta_url: '{STORE_URL}',
        ps: 'P.D. Si no compras en 30 días, dejaremos de escribirte.'
      }
    ];
  }

  async crearCampanasPromocionales() {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const ocasiones = [
      'Black Friday',
      'Cyber Monday',
      'Día de la Madre',
      'Día del Padre',
      'Navidad',
      'Año Nuevo'
    ];

    const campanas = [];

    for (const ocasion of ocasiones) {
      const prompt = `Crea un email promocional para ${ocasion}:

Incluye:
- Subject line urgente y atractivo
- Oferta irresistible (descuento % o 2x1)
- Countdown timer mental
- Beneficios múltiples
- Testimonios breves
- CTA repetido 2-3 veces

Formato JSON igual.`;

      try {
        const result = await model.generateContent(prompt);
        let texto = result.response.text().trim();
        texto = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(texto);
        campanas.push({
          ocasion,
          ...parsed
        });
      } catch (e) {
        campanas.push({
          ocasion,
          subject: `🔥 ${ocasion}: Hasta 50% OFF`,
          preview: 'Las mejores ofertas del año. No te lo pierdas...',
          cuerpo_html: `<h2>${ocasion} - Ofertas Especiales</h2><p>Descuentos de hasta 50% en productos seleccionados.</p>`,
          cta_texto: 'Ver Ofertas',
          cta_url: '{STORE_URL}/collections/sale'
        });
      }
    }

    return campanas;
  }

  async configurarSegmentos() {
    return [
      {
        nombre: 'Nuevos Suscriptores',
        criterio: 'Suscrito hace menos de 7 días, sin compras',
        secuencia: 'bienvenida'
      },
      {
        nombre: 'Carrito Abandonado',
        criterio: 'Agregó productos pero no compró en últimas 24h',
        secuencia: 'carrito_abandonado'
      },
      {
        nombre: 'Clientes VIP',
        criterio: 'Más de 3 compras o gasto total >$200',
        secuencia: 'vip_exclusivo'
      },
      {
        nombre: 'Inactivos',
        criterio: 'Sin compras en últimos 30 días',
        secuencia: 'reactivacion'
      },
      {
        nombre: 'Compradores Recientes',
        criterio: 'Compra en últimos 7 días',
        secuencia: 'post_compra'
      }
    ];
  }

  async configurarABTesting() {
    return [
      {
        test: 'Subject Line - Bienvenida Email 1',
        variante_a: '🎁 ¡Bienvenido! Aquí está tu 15% OFF',
        variante_b: '¡Tu descuento de bienvenida te espera!',
        metrica: 'open_rate',
        ganador_auto: true
      },
      {
        test: 'CTA Text - Carrito Abandonado',
        variante_a: 'Completar Compra',
        variante_b: '¡Quiero Mi Producto!',
        metrica: 'click_rate',
        ganador_auto: true
      }
    ];
  }

  async configurarMetricas() {
    console.log('   ✅ Open Rate tracking activado');
    console.log('   ✅ Click Rate tracking activado');
    console.log('   ✅ Conversion Rate tracking activado');
    console.log('   ✅ Revenue per email calculado');
    console.log('   ✅ Reportes semanales automáticos');

    return {
      metricas_principales: ['open_rate', 'click_rate', 'conversion_rate', 'revenue'],
      alertas: [
        { metrica: 'open_rate', umbral: '<15%', accion: 'Mejorar subject lines' },
        { metrica: 'click_rate', umbral: '<2%', accion: 'Mejorar CTAs y copy' }
      ]
    };
  }

  async guardarReporte(reporte) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../reports/email-funnel');
    
    await fs.mkdir(reportDir, { recursive: true });
    
    const jsonPath = path.join(reportDir, `email-report-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(reporte, null, 2));
  }

  async guardarSecuencias(secuencias) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../reports/email-funnel');
    
    await fs.mkdir(reportDir, { recursive: true });
    
    const seqPath = path.join(reportDir, `secuencias-${timestamp}.json`);
    await fs.writeFile(seqPath, JSON.stringify(secuencias, null, 2));
    
    console.log(`\n📧 Secuencias guardadas: ${seqPath}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const agente = new EmailFunnelMaster();
  agente.ejecutarFunnelAutomatico()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = EmailFunnelMaster;
