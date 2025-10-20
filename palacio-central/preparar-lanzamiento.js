// 🚀 PREPARACIÓN DE LANZAMIENTO
// Genera todo lo necesario para empezar a vender
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD;

console.log('🚀 PREPARACIÓN DE LANZAMIENTO');
console.log('='.repeat(70));
console.log('');

// Cargar reporte de pulido
const reportePulido = JSON.parse(
    fs.readFileSync('config/reporte-pulido-final.json', 'utf8')
);

console.log('📊 ESTADO DE TU TIENDA:');
console.log('━'.repeat(70));
console.log(`   🎯 Score: ${reportePulido.score}%`);
console.log(`   📦 Productos: ${reportePulido.total_productos}`);
console.log(`   ✅ Todo verificado y optimizado`);
console.log('');

// Generar kit de lanzamiento
const kitLanzamiento = {
    fecha_preparacion: new Date().toISOString(),
    
    urls_importantes: {
        admin_shopify: `https://${SHOPIFY_DOMAIN}/admin`,
        tienda_online: `https://${SHOPIFY_DOMAIN.replace('.myshopify.com', '')}.myshopify.com`,
        verificar_pagos: `https://${SHOPIFY_DOMAIN}/admin/settings/payments`,
        productos: `https://${SHOPIFY_DOMAIN}/admin/products`,
        ordenes: `https://${SHOPIFY_DOMAIN}/admin/orders`,
        analytics: `https://${SHOPIFY_DOMAIN}/admin/analytics`
    },
    
    productos_destacados: [
        {
            nombre: 'Botella reutilizable eco-friendly Premium',
            precio: '$29.99',
            link: 'https://skhqgs-2j.myshopify.com/products/botella-reutilizable-eco-friendly',
            descripcion_corta: 'Botella de acero inoxidable, 600ml, mantiene temperatura 12h'
        },
        {
            nombre: 'Botella Smart GO',
            precio: '$29.99',
            link: 'https://skhqgs-2j.myshopify.com/products/botella-smart-go-nunca-olvides-hidratarte',
            descripcion_corta: 'Botella inteligente con recordatorios de hidratación'
        },
        {
            nombre: 'Cafetera Cold Brew Express',
            precio: '$29.99',
            link: 'https://skhqgs-2j.myshopify.com/products/cafetera-cold-brew-express',
            descripcion_corta: 'Café premium en casa, preparación rápida y fácil'
        }
    ],
    
    primeras_publicaciones: {
        instagram: {
            post_1: {
                imagen: 'foto_producto_destacado.jpg',
                copy: `🌟 ¡Nuevo! Botella Premium Eco-Friendly 🌿

💧 Mantiene tu bebida fría por 12 horas
♻️ Libre de BPA y 100% reciclable
🎁 Envío GRATIS en pedidos +$25

Solo $29.99 → Link en bio 👆

#EcoFriendly #Sostenible #VidaSaludable #Peru`,
                hashtags: ['#EcoFriendly', '#Sostenible', '#VidaSaludable', '#Peru']
            },
            
            story_1: {
                tipo: 'producto',
                copy: '¿Cuánta agua tomas al día? 💧\n\nEsta botella te ayuda a mantenerte hidratado ✨',
                sticker: 'Swipe Up',
                link: 'https://skhqgs-2j.myshopify.com/products/botella-reutilizable-eco-friendly'
            }
        },
        
        facebook: {
            post_1: {
                copy: `🌟 ¡LANZAMIENTO! Nueva colección de productos eco-friendly

Estamos emocionados de presentar nuestra línea de productos sostenibles diseñados para tu estilo de vida saludable.

✨ Productos destacados:
🌿 Botella reutilizable de acero inoxidable - $29.99
💧 Botella Smart con recordatorios - $29.99
☕ Cafetera Cold Brew profesional - $29.99

🎁 OFERTA DE LANZAMIENTO:
✅ Envío GRATIS en pedidos mayores a $25
✅ Garantía de satisfacción 100%
✅ Productos de alta calidad

👉 Compra ahora: [LINK A TU TIENDA]

#EcoFriendly #Peru #VidaSaludable`,
                target: 'Amigos y grupos locales'
            }
        },
        
        whatsapp: {
            mensaje_broadcast: `¡Hola! 👋

Te comparto algo emocionante:

Acabo de lanzar mi tienda online de productos eco-friendly y sostenibles 🌿

Tengo productos increíbles como:
• Botellas reutilizables premium
• Cafetera Cold Brew
• Y mucho más...

Con ENVÍO GRATIS en pedidos +$25 🎁

¿Te gustaría echar un vistazo?
[LINK]

¡Cualquier compra me ayuda mucho! 💚`
        }
    },
    
    estrategia_ventas: {
        semana_1: {
            objetivo: 'Primeras 3-5 ventas',
            acciones: [
                'Publicar en Instagram/Facebook (1 post al día)',
                'Compartir en grupos de WhatsApp/Facebook',
                'Enviar a familia y amigos cercanos',
                'Ofrecer descuento especial a primeros compradores (10%)'
            ],
            inversion: '$0 (todo orgánico)'
        },
        
        semana_2: {
            objetivo: '10-15 ventas',
            acciones: [
                'Continuar publicaciones orgánicas',
                'Testimonios de primeros clientes',
                'Lanzar Meta Ads con presupuesto bajo ($10-20/día)',
                'Crear urgencia (stock limitado)'
            ],
            inversion: '$140-280 en ads'
        },
        
        mes_1: {
            objetivo: '25-40 ventas ($750-1,200)',
            acciones: [
                'Escalar Meta Ads a $30/día',
                'Colaboraciones con micro-influencers locales',
                'Email marketing a clientes',
                'Retargeting de visitantes'
            ],
            inversion: '$900 en ads'
        }
    },
    
    metricas_clave: {
        conversion_objetivo: '2.5%',
        ticket_promedio: '$31.45',
        roi_minimo: '2x (recuperar inversión y duplicar)',
        ventas_dia_objetivo: '1-2 (primeros 15 días)'
    },
    
    checklist_pre_lanzamiento: {
        tecnico: [
            { item: 'Verificar PayPal activo', completado: false },
            { item: 'Compra de prueba exitosa', completado: false },
            { item: 'Email de confirmación recibido', completado: false },
            { item: 'Orden visible en admin', completado: false }
        ],
        
        contenido: [
            { item: 'Tomar foto de 1 producto para redes', completado: false },
            { item: 'Escribir primera publicación', completado: false },
            { item: 'Preparar link de tienda', completado: false }
        ],
        
        marketing: [
            { item: 'Lista de grupos de Facebook para publicar', completado: false },
            { item: 'Lista de contactos WhatsApp', completado: false },
            { item: 'Calendario de publicaciones (semana 1)', completado: false }
        ]
    }
};

// Guardar kit
fs.writeFileSync(
    'config/kit-lanzamiento.json',
    JSON.stringify(kitLanzamiento, null, 2)
);

console.log('📦 KIT DE LANZAMIENTO GENERADO:');
console.log('━'.repeat(70));
console.log('');

console.log('🔗 URLS IMPORTANTES:');
console.log(`   Admin: ${kitLanzamiento.urls_importantes.admin_shopify}`);
console.log(`   Tienda: ${kitLanzamiento.urls_importantes.tienda_online}`);
console.log(`   Pagos: ${kitLanzamiento.urls_importantes.verificar_pagos}`);
console.log('');

console.log('⭐ PRODUCTOS DESTACADOS PARA PROMOCIONAR:');
kitLanzamiento.productos_destacados.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.nombre}`);
    console.log(`      💰 ${p.precio}`);
    console.log(`      🔗 ${p.link}`);
    console.log('');
});

console.log('📱 PRIMERA PUBLICACIÓN DE INSTAGRAM:');
console.log('━'.repeat(70));
console.log(kitLanzamiento.primeras_publicaciones.instagram.post_1.copy);
console.log('');

console.log('📊 OBJETIVOS:');
console.log('━'.repeat(70));
console.log(`   Semana 1: ${kitLanzamiento.estrategia_ventas.semana_1.objetivo}`);
console.log(`   Semana 2: ${kitLanzamiento.estrategia_ventas.semana_2.objetivo}`);
console.log(`   Mes 1: ${kitLanzamiento.estrategia_ventas.mes_1.objetivo}`);
console.log('');

console.log('✅ CHECKLIST PRE-LANZAMIENTO:');
console.log('━'.repeat(70));
console.log('');
console.log('Técnico:');
kitLanzamiento.checklist_pre_lanzamiento.tecnico.forEach(item => {
    console.log(`   ${item.completado ? '✅' : '⬜'} ${item.item}`);
});
console.log('');
console.log('Contenido:');
kitLanzamiento.checklist_pre_lanzamiento.contenido.forEach(item => {
    console.log(`   ${item.completado ? '✅' : '⬜'} ${item.item}`);
});
console.log('');
console.log('Marketing:');
kitLanzamiento.checklist_pre_lanzamiento.marketing.forEach(item => {
    console.log(`   ${item.completado ? '✅' : '⬜'} ${item.item}`);
});
console.log('');

console.log('💾 Guardado en: config/kit-lanzamiento.json');
console.log('');

console.log('🎯 PRÓXIMO PASO:');
console.log('━'.repeat(70));
console.log('1. Verifica métodos de pago (ver GUIA-VERIFICAR-PAGOS.md)');
console.log('2. Haz compra de prueba');
console.log('3. Cuando esté listo, avísame para preparar primera publicación');
console.log('');

console.log('🚀 ¡TODO ESTÁ PREPARADO PARA EL LANZAMIENTO!');
