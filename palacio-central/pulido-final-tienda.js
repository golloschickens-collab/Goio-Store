// 🎨 PULIDO FINAL - Checklist antes de vender
// Verifica que TODO esté perfecto para recibir clientes
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;

console.log('🎨 PULIDO FINAL - CHECKLIST PROFESIONAL');
console.log('='.repeat(70));
console.log(`🏪 Tienda: ${SHOPIFY_DOMAIN}`);
console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
console.log('');

const checklist = {
    productos: { status: 'pending', detalles: [] },
    imagenes: { status: 'pending', detalles: [] },
    precios: { status: 'pending', detalles: [] },
    descripciones: { status: 'pending', detalles: [] },
    inventario: { status: 'pending', detalles: [] },
    pagos: { status: 'pending', detalles: [] },
    dominio: { status: 'pending', detalles: [] },
    seo: { status: 'pending', detalles: [] }
};

console.log('📋 VERIFICANDO PRODUCTOS...');
console.log('━'.repeat(70));

// Obtener TODOS los productos
const productsUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?limit=250`;
const response = await fetch(productsUrl, {
    headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN
    }
});

const data = await response.json();
const productos = data.products;

console.log(`📦 Total productos encontrados: ${productos.length}`);
console.log('');

// Verificar cada producto
let productosOK = 0;
let problemas = [];

for (const producto of productos) {
    const issues = [];
    
    // 1. Verificar estado activo
    if (producto.status !== 'active') {
        issues.push('❌ No está activo');
    }
    
    // 2. Verificar imágenes
    if (!producto.images || producto.images.length === 0) {
        issues.push('❌ Sin imagen');
    }
    
    // 3. Verificar título optimizado
    if (!producto.title.includes('🌟') && !producto.title.includes('Premium')) {
        issues.push('⚠️ Título sin optimizar');
    }
    
    // 4. Verificar descripción
    if (!producto.body_html || producto.body_html.length < 100) {
        issues.push('⚠️ Descripción muy corta');
    }
    
    // 5. Verificar precio
    const precio = parseFloat(producto.variants[0].price);
    if (precio <= 0) {
        issues.push('❌ Sin precio');
    } else if (precio > 100) {
        issues.push('⚠️ Precio alto (>$100)');
    }
    
    // 6. Verificar inventario
    const inventoryQuantity = producto.variants[0].inventory_quantity || 0;
    if (inventoryQuantity <= 0) {
        issues.push('❌ Sin inventario');
    } else if (inventoryQuantity < 10) {
        issues.push('⚠️ Inventario bajo (<10)');
    }
    
    // 7. Verificar SEO
    if (!producto.handle || producto.handle.length < 5) {
        issues.push('⚠️ URL SEO corta');
    }
    
    if (issues.length === 0) {
        console.log(`✅ ${producto.title.substring(0, 60)}...`);
        productosOK++;
    } else {
        console.log(`⚠️ ${producto.title.substring(0, 60)}...`);
        issues.forEach(issue => console.log(`   ${issue}`));
        problemas.push({
            producto: producto.title,
            id: producto.id,
            issues
        });
    }
}

console.log('');
console.log(`📊 Productos OK: ${productosOK}/${productos.length}`);
console.log('');

// Actualizar checklist
checklist.productos.status = productosOK === productos.length ? 'ok' : 'warning';
checklist.productos.detalles = problemas;

// Verificar imágenes
console.log('📸 VERIFICANDO IMÁGENES...');
console.log('━'.repeat(70));

const productosSinImagen = productos.filter(p => !p.images || p.images.length === 0);
const productosConImagen = productos.filter(p => p.images && p.images.length > 0);

console.log(`✅ Con imágenes: ${productosConImagen.length}`);
console.log(`❌ Sin imágenes: ${productosSinImagen.length}`);

if (productosSinImagen.length > 0) {
    console.log('');
    console.log('⚠️ Productos sin imagen:');
    productosSinImagen.forEach(p => {
        console.log(`   - ${p.title} (ID: ${p.id})`);
    });
}

checklist.imagenes.status = productosSinImagen.length === 0 ? 'ok' : 'error';
checklist.imagenes.detalles = productosSinImagen.map(p => ({ title: p.title, id: p.id }));

console.log('');

// Verificar precios
console.log('💰 VERIFICANDO PRECIOS...');
console.log('━'.repeat(70));

const preciosOptimizados = productos.filter(p => {
    const precio = parseFloat(p.variants[0].price);
    return precio.toString().endsWith('.99') || precio.toString().endsWith('.95');
});

console.log(`✅ Precios optimizados (.99/.95): ${preciosOptimizados.length}/${productos.length}`);

const precioPromedio = productos.reduce((sum, p) => sum + parseFloat(p.variants[0].price), 0) / productos.length;
console.log(`📊 Precio promedio: $${precioPromedio.toFixed(2)}`);

const precioMin = Math.min(...productos.map(p => parseFloat(p.variants[0].price)));
const precioMax = Math.max(...productos.map(p => parseFloat(p.variants[0].price)));
console.log(`📊 Rango: $${precioMin.toFixed(2)} - $${precioMax.toFixed(2)}`);

checklist.precios.status = preciosOptimizados.length >= productos.length * 0.8 ? 'ok' : 'warning';

console.log('');

// Verificar inventario
console.log('📦 VERIFICANDO INVENTARIO...');
console.log('━'.repeat(70));

const inventarioTotal = productos.reduce((sum, p) => {
    return sum + (p.variants[0].inventory_quantity || 0);
}, 0);

const sinInventario = productos.filter(p => (p.variants[0].inventory_quantity || 0) <= 0);

console.log(`📊 Inventario total: ${inventarioTotal} unidades`);
console.log(`✅ Con stock: ${productos.length - sinInventario.length}`);
console.log(`❌ Sin stock: ${sinInventario.length}`);

if (sinInventario.length > 0) {
    console.log('');
    console.log('⚠️ Productos sin inventario:');
    sinInventario.forEach(p => {
        console.log(`   - ${p.title.substring(0, 50)}...`);
    });
}

checklist.inventario.status = sinInventario.length === 0 ? 'ok' : 'error';

console.log('');

// Verificar métodos de pago
console.log('💳 VERIFICANDO MÉTODOS DE PAGO...');
console.log('━'.repeat(70));

try {
    const shopUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/shop.json`;
    const shopResponse = await fetch(shopUrl, {
        headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN
        }
    });
    const shopData = await shopResponse.json();
    
    console.log(`🏪 Nombre: ${shopData.shop.name}`);
    console.log(`🌍 País: ${shopData.shop.country_name}`);
    console.log(`💰 Moneda: ${shopData.shop.currency}`);
    console.log(`📧 Email: ${shopData.shop.email}`);
    console.log(`🌐 Dominio principal: ${shopData.shop.domain}`);
    
    checklist.dominio.status = 'ok';
    checklist.dominio.detalles = {
        nombre: shopData.shop.name,
        dominio: shopData.shop.domain,
        email: shopData.shop.email
    };
} catch (error) {
    console.log(`⚠️ No se pudo verificar configuración de tienda`);
}

console.log('');
console.log('💡 Nota: Verifica métodos de pago manualmente en:');
console.log(`   https://${SHOPIFY_DOMAIN}/admin/settings/payments`);

checklist.pagos.status = 'manual';
checklist.pagos.detalles = 'Verificar manualmente en admin';

console.log('');

// Verificar SEO
console.log('🔍 VERIFICANDO SEO...');
console.log('━'.repeat(70));

const conMetaDescription = productos.filter(p => p.body_html && p.body_html.length > 150);
const urlsOptimizadas = productos.filter(p => p.handle && p.handle.includes('-'));

console.log(`✅ Con descripción completa: ${conMetaDescription.length}/${productos.length}`);
console.log(`✅ URLs SEO-friendly: ${urlsOptimizadas.length}/${productos.length}`);

checklist.seo.status = conMetaDescription.length >= productos.length * 0.8 ? 'ok' : 'warning';

console.log('');

// Resumen final
console.log('='.repeat(70));
console.log('📊 RESUMEN FINAL DEL PULIDO');
console.log('='.repeat(70));
console.log('');

const categorias = [
    { nombre: '📦 Productos', status: checklist.productos.status },
    { nombre: '📸 Imágenes', status: checklist.imagenes.status },
    { nombre: '💰 Precios', status: checklist.precios.status },
    { nombre: '📦 Inventario', status: checklist.inventario.status },
    { nombre: '🌐 Dominio', status: checklist.dominio.status },
    { nombre: '🔍 SEO', status: checklist.seo.status },
    { nombre: '💳 Pagos', status: checklist.pagos.status }
];

categorias.forEach(cat => {
    const emoji = cat.status === 'ok' ? '✅' : cat.status === 'warning' ? '⚠️' : cat.status === 'manual' ? '🔧' : '❌';
    console.log(`${emoji} ${cat.nombre}: ${cat.status.toUpperCase()}`);
});

console.log('');

// Calcular score general
const okCount = categorias.filter(c => c.status === 'ok').length;
const totalCount = categorias.filter(c => c.status !== 'manual').length;
const score = Math.round((okCount / totalCount) * 100);

console.log('🎯 SCORE GENERAL DE LA TIENDA:');
console.log(`   ${score}% (${okCount}/${totalCount} categorías OK)`);
console.log('');

if (score >= 90) {
    console.log('🎉 ¡EXCELENTE! Tu tienda está lista para vender');
    console.log('   Puedes lanzar campañas con confianza');
} else if (score >= 70) {
    console.log('👍 BIEN - Algunos ajustes menores recomendados');
    console.log('   Revisa las advertencias arriba');
} else {
    console.log('⚠️ REQUIERE ATENCIÓN - Arregla los problemas críticos');
    console.log('   No recomendado lanzar hasta resolver errores');
}

console.log('');

// Guardar reporte
const reporte = {
    fecha: new Date().toISOString(),
    score,
    total_productos: productos.length,
    checklist,
    problemas: problemas.length > 0 ? problemas : 'Ninguno',
    recomendaciones: []
};

// Generar recomendaciones
if (productosSinImagen.length > 0) {
    reporte.recomendaciones.push('Agregar imágenes a productos faltantes');
}
if (sinInventario.length > 0) {
    reporte.recomendaciones.push('Actualizar inventario de productos sin stock');
}
if (preciosOptimizados.length < productos.length) {
    reporte.recomendaciones.push('Optimizar precios con .99 o .95');
}
if (conMetaDescription.length < productos.length) {
    reporte.recomendaciones.push('Completar descripciones de productos');
}

fs.writeFileSync('config/reporte-pulido-final.json', JSON.stringify(reporte, null, 2));

console.log('💾 Reporte guardado en: config/reporte-pulido-final.json');
console.log('');

// Próximas acciones
console.log('🎯 PRÓXIMAS ACCIONES RECOMENDADAS:');
console.log('━'.repeat(70));

if (score >= 90) {
    console.log('1. ✅ Verificar métodos de pago en Shopify admin');
    console.log('2. ✅ Hacer compra de prueba completa');
    console.log('3. ✅ Preparar primera publicación en redes');
    console.log('4. ✅ Configurar Meta Ads (opcional)');
    console.log('5. ✅ ¡Lanzar y empezar a vender!');
} else {
    console.log('1. 🔧 Resolver problemas críticos listados arriba');
    console.log('2. 🔧 Re-ejecutar este script para verificar');
    console.log('3. ✅ Cuando score > 90%, lanzar ventas');
}

console.log('');
console.log('🏪 URL Admin: https://' + SHOPIFY_DOMAIN + '/admin');
console.log('🌐 URL Tienda: https://' + SHOPIFY_DOMAIN.replace('-admin', ''));
console.log('');
console.log('🎨 PULIDO FINAL COMPLETADO');
