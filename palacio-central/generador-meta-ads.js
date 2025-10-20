// Generador de campaña Meta Ads para productos
import fs from 'fs';

console.log('🎯 GENERADOR DE CAMPAÑA META ADS');
console.log('='.repeat(40));

const config = JSON.parse(fs.readFileSync('config/modo-real-config.json', 'utf8'));
const productos = config.datosReales.productos.slice(0, 3); // Top 3 productos

console.log('🚀 CAMPAÑA DE FACEBOOK/INSTAGRAM ADS OPTIMIZADA');
console.log('');

// Configuración de campaña
const campaignConfig = {
    presupuesto_diario: 30,
    duracion_dias: 7,
    objetivo: 'CONVERSIONES',
    audiencia_edad: '25-55',
    intereses: ['Productos ecológicos', 'Vida saludable', 'Sostenibilidad', 'Zero waste'],
    ubicaciones: ['España', 'México', 'Argentina', 'Colombia'],
    dispositivos: ['Mobile', 'Desktop']
};

console.log('📊 CONFIGURACIÓN DE CAMPAÑA:');
console.log(`💰 Presupuesto diario: $${campaignConfig.presupuesto_diario}`);
console.log(`📅 Duración: ${campaignConfig.duracion_dias} días`);
console.log(`🎯 Objetivo: ${campaignConfig.objetivo}`);
console.log(`👥 Audiencia: ${campaignConfig.audiencia_edad} años`);
console.log(`🌍 Países: ${campaignConfig.ubicaciones.join(', ')}`);
console.log('');

// Generar creativos para cada producto
productos.forEach((producto, index) => {
    const variant = producto.variants[0];
    const precio = parseFloat(variant.price);
    const descuento = precio * 0.25; // 25% descuento para ads
    const precioFinal = precio - descuento;
    
    console.log(`📱 CREATIVO ${index + 1}: ${producto.title}`);
    console.log('━'.repeat(50));
    
    // Headline principal
    console.log('🎨 HEADLINE PRINCIPAL:');
    console.log(`"${producto.title} - 25% OFF Solo HOY ⚡"`);
    console.log('');
    
    // Texto del anuncio
    console.log('📝 TEXTO DEL ANUNCIO:');
    console.log(`🌿 Descubre nuestro ${producto.title.toLowerCase()}`);
    console.log(`💚 Producto 100% eco-friendly y sostenible`);
    console.log(`⚡ OFERTA ESPECIAL: Antes $${precio.toFixed(2)} → AHORA $${precioFinal.toFixed(2)}`);
    console.log(`🚚 Envío GRATIS en pedidos +$25`);
    console.log(`✨ Stock limitado - Solo ${variant.inventory_quantity} unidades`);
    console.log(`👆 ¡Compra ahora y ahorra $${descuento.toFixed(2)}!`);
    console.log('');
    
    // Call to action
    console.log('🔗 CALL TO ACTION: "Comprar ahora"');
    console.log(`🌐 URL destino: https://${config.shopify.domain}/products/${producto.handle}`);
    console.log('');
    
    // Audiencia específica
    console.log('🎯 AUDIENCIA ESPECÍFICA:');
    if (producto.title.includes('Botella')) {
        console.log('   - Interesados en fitness y vida saludable');
        console.log('   - Personas que compran productos sostenibles');
        console.log('   - Edad: 25-45 años');
    } else if (producto.title.includes('Cafetera')) {
        console.log('   - Amantes del café de especialidad');
        console.log('   - Interesados en métodos de preparación');
        console.log('   - Edad: 30-55 años');
    }
    console.log('');
});

// Estimaciones de rendimiento
console.log('📈 ESTIMACIONES DE RENDIMIENTO:');
console.log('');
console.log(`💰 Inversión total: $${campaignConfig.presupuesto_diario * campaignConfig.duracion_dias}`);
console.log('🎯 Métricas esperadas (conservadoras):');
console.log('   - CTR: 2-3%');
console.log('   - CPC: $0.50-1.00');
console.log('   - Conversión: 2-4%');
console.log('   - Ventas esperadas: 15-25 productos');
console.log('   - ROI esperado: 200-400%');
console.log('');

console.log('⚡ RESULTADO ESPERADO:');
console.log(`💵 Inversión: $${campaignConfig.presupuesto_diario * campaignConfig.duracion_dias}`);
console.log('💰 Ventas estimadas: $600-1,200');
console.log('📊 ROI: 3-5x tu inversión');
console.log('');

console.log('🚀 PRÓXIMOS PASOS:');
console.log('1. ✅ Confirmar que los métodos de pago están activos');
console.log('2. 📱 Crear cuenta de Facebook Business Manager');
console.log('3. 🎨 Subir imágenes de productos (1080x1080px)');
console.log('4. 🎯 Crear los anuncios con estos textos');
console.log('5. 📊 Configurar Facebook Pixel para tracking');
console.log('6. ▶️ Lanzar campaña con $30/día iniciales');

// Generar archivo de configuración para Meta Ads
const metaAdsConfig = {
    campaign_name: 'Goio_Store_Conversion_2025',
    objective: 'CONVERSIONS',
    daily_budget: campaignConfig.presupuesto_diario,
    productos: productos.map(p => ({
        nombre: p.title,
        precio_original: parseFloat(p.variants[0].price),
        precio_promocional: parseFloat(p.variants[0].price) * 0.75,
        url: `https://${config.shopify.domain}/products/${p.handle}`,
        headline: `${p.title} - 25% OFF Solo HOY ⚡`,
        descripcion: `🌿 Producto eco-friendly con envío gratis. ¡Ahorra ${(parseFloat(p.variants[0].price) * 0.25).toFixed(2)}!`
    })),
    audiencia: {
        edad_min: 25,
        edad_max: 55,
        ubicaciones: campaignConfig.ubicaciones,
        intereses: campaignConfig.intereses
    }
};

fs.writeFileSync('config/meta-ads-config.json', JSON.stringify(metaAdsConfig, null, 2));
console.log('');
console.log('✅ Archivo de configuración guardado: config/meta-ads-config.json');