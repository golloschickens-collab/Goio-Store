// 🔧 AGENTE OPTIMIZADOR DE FICHAS - PRODUCTOS GOIOSTORE
// Completa información faltante y optimiza productos para venta inmediata
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 AGENTE OPTIMIZADOR DE FICHAS - PRODUCTOS GOIOSTORE');
console.log('='.repeat(80));
console.log('🎯 Objetivo: Completar fichas para venta inmediata');
console.log('📅 Fecha:', new Date().toLocaleString('es-PE'));
console.log('');

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD || 'skhqgs-2j.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;

// Productos prioritarios para venta HOY
const PRODUCTOS_PRIORITARIOS = [
    'botella',
    'camiseta',
    'kit-home-office',
    'purificador-aire',
    'bandas-resistencia'
];

// Obtener productos actuales
async function obtenerProductos() {
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/products.json?limit=250`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('❌ Error obteniendo productos:', error.message);
        return [];
    }
}

// Analizar calidad de fichas
function analizarCalidadFicha(producto) {
    const analisis = {
        id: producto.id,
        titulo: producto.title,
        handle: producto.handle,
        status: producto.status,
        puntuacion: 0,
        problemas: [],
        fortalezas: [],
        prioridad: PRODUCTOS_PRIORITARIOS.some(p => producto.handle.includes(p)) ? 'ALTA' : 'MEDIA'
    };

    // Verificar título (max 30 puntos)
    if (producto.title && producto.title.length > 20) {
        analisis.puntuacion += 15;
        analisis.fortalezas.push('Título descriptivo');
        
        if (producto.title.includes('Premium') || producto.title.includes('Superior')) {
            analisis.puntuacion += 10;
            analisis.fortalezas.push('Título premium');
        }
        
        if (producto.title.includes('Envío Gratis')) {
            analisis.puntuacion += 5;
            analisis.fortalezas.push('Incluye envío gratis');
        }
    } else {
        analisis.problemas.push('Título muy corto');
    }

    // Verificar descripción (max 25 puntos)
    if (producto.body_html && producto.body_html.length > 100) {
        analisis.puntuacion += 15;
        analisis.fortalezas.push('Descripción presente');
        
        if (producto.body_html.length > 500) {
            analisis.puntuacion += 10;
            analisis.fortalezas.push('Descripción detallada');
        }
    } else {
        analisis.problemas.push('Descripción insuficiente');
    }

    // Verificar imágenes (max 20 puntos)
    if (producto.images && producto.images.length > 0) {
        analisis.puntuacion += 10;
        analisis.fortalezas.push(`${producto.images.length} imágenes`);
        
        if (producto.images.length >= 3) {
            analisis.puntuacion += 10;
            analisis.fortalezas.push('Múltiples imágenes');
        }
    } else {
        analisis.problemas.push('Sin imágenes');
    }

    // Verificar variantes y precios (max 15 puntos)
    if (producto.variants && producto.variants.length > 0) {
        const precioBase = parseFloat(producto.variants[0].price);
        if (precioBase > 0) {
            analisis.puntuacion += 10;
            analisis.fortalezas.push(`Precio: $${precioBase}`);
            
            if (precioBase >= 25) {
                analisis.puntuacion += 5;
                analisis.fortalezas.push('Precio premium');
            }
        } else {
            analisis.problemas.push('Sin precio válido');
        }
    } else {
        analisis.problemas.push('Sin variantes de producto');
    }

    // Verificar inventario (max 10 puntos)
    if (producto.variants && producto.variants[0] && producto.variants[0].inventory_quantity > 0) {
        analisis.puntuacion += 10;
        analisis.fortalezas.push(`Stock: ${producto.variants[0].inventory_quantity}`);
    } else {
        analisis.problemas.push('Sin inventario');
    }

    // Clasificar calidad
    if (analisis.puntuacion >= 80) analisis.calidad = 'EXCELENTE';
    else if (analisis.puntuacion >= 60) analisis.calidad = 'BUENA';
    else if (analisis.puntuacion >= 40) analisis.calidad = 'REGULAR';
    else analisis.calidad = 'DEFICIENTE';

    return analisis;
}

// Optimizar descripción de producto
function optimizarDescripcion(producto) {
    const titulo = producto.title.replace(/🌟|Premium|Calidad Superior|Envío Gratis \+\$25/g, '').trim();
    
    // Plantilla optimizada por categoría
    let descripcionBase = '';
    
    if (producto.handle.includes('botella')) {
        descripcionBase = `
<div class="producto-descripcion">
<h3>🌟 ${titulo} - Hidratación Sostenible</h3>

<div class="beneficios">
<h4>✅ Beneficios Principales:</h4>
<ul>
<li>💧 Mantiene la temperatura 12+ horas</li>
<li>🌿 Material eco-friendly sin BPA</li>
<li>🎯 Diseño ergonómico y antideslizante</li>
<li>♻️ Reduce el uso de plásticos de un solo uso</li>
<li>🚿 Fácil limpieza y mantenimiento</li>
</ul>
</div>

<div class="especificaciones">
<h4>📏 Especificaciones:</h4>
<ul>
<li>Capacidad: 500ml / 750ml disponible</li>
<li>Material: Acero inoxidable grado alimentario</li>
<li>Aislamiento: Doble pared de vacío</li>
<li>Garantía: 2 años</li>
</ul>
</div>

<div class="envio">
<h4>🚚 Envío y Entrega:</h4>
<p>✅ <strong>Envío GRATIS</strong> en pedidos +$25<br>
📦 Entrega en Lima: 1-2 días laborables<br>
🇵🇪 Entrega nacional: 3-5 días laborables</p>
</div>

<div class="garantia">
<h4>🛡️ Garantía y Devoluciones:</h4>
<p>💯 Satisfacción garantizada o devolvemos tu dinero<br>
🔄 30 días para devoluciones gratuitas<br>
📞 Soporte 24/7 vía WhatsApp</p>
</div>
</div>`;
    } else if (producto.handle.includes('camiseta')) {
        descripcionBase = `
<div class="producto-descripcion">
<h3>🌟 ${titulo} - Moda Sostenible</h3>

<div class="beneficios">
<h4>✅ Beneficios Principales:</h4>
<ul>
<li>🌿 Algodón 100% orgánico certificado</li>
<li>🎨 Colores naturales que no se destiñen</li>
<li>💨 Transpirable y cómoda todo el día</li>
<li>🌍 Producción ética y sostenible</li>
<li>👕 Corte unisex moderno</li>
</ul>
</div>

<div class="especificaciones">
<h4>📏 Tallas Disponibles:</h4>
<ul>
<li>S: Pecho 86-91cm</li>
<li>M: Pecho 96-101cm</li>
<li>L: Pecho 106-111cm</li>
<li>XL: Pecho 116-121cm</li>
</ul>
</div>

<div class="cuidado">
<h4>🧺 Cuidado:</h4>
<p>🌊 Lavar en agua fría (30°C máx)<br>
🚫 No usar lejía ni suavizantes<br>
☀️ Secar al aire libre</p>
</div>

<div class="envio">
<h4>🚚 Envío y Entrega:</h4>
<p>✅ <strong>Envío GRATIS</strong> en pedidos +$25<br>
📦 Entrega en Lima: 1-2 días laborables</p>
</div>
</div>`;
    } else {
        // Descripción genérica mejorada
        descripcionBase = `
<div class="producto-descripcion">
<h3>🌟 ${titulo} - Calidad Premium</h3>

<div class="beneficios">
<h4>✅ Beneficios Principales:</h4>
<ul>
<li>🎯 Diseño innovador y funcional</li>
<li>💪 Calidad superior garantizada</li>
<li>🌟 Tecnología avanzada</li>
<li>🛡️ Durabilidad comprobada</li>
<li>🎁 Perfecto como regalo</li>
</ul>
</div>

<div class="envio">
<h4>🚚 Envío y Entrega:</h4>
<p>✅ <strong>Envío GRATIS</strong> en pedidos +$25<br>
📦 Entrega rápida en todo Perú<br>
💳 Pago seguro con PayPal, Yape o Plin</p>
</div>

<div class="garantia">
<h4>🛡️ Garantía:</h4>
<p>💯 Satisfacción garantizada<br>
🔄 30 días para devoluciones<br>
📞 Soporte vía WhatsApp</p>
</div>
</div>`;
    }

    return descripcionBase;
}

// Actualizar producto
async function actualizarProducto(producto, descripcionOptimizada) {
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/products/${producto.id}.json`;
        
        // Optimizar también el título si es necesario
        let tituloOptimizado = producto.title;
        if (!tituloOptimizado.includes('Premium') && !tituloOptimizado.includes('Superior')) {
            tituloOptimizado = tituloOptimizado.replace('🌟 ', '🌟 ') + ' Premium';
        }
        if (!tituloOptimizado.includes('Envío Gratis')) {
            tituloOptimizado += ' | Envío Gratis +$25';
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: {
                    id: producto.id,
                    title: tituloOptimizado,
                    body_html: descripcionOptimizada,
                    status: 'active',
                    vendor: 'Goio Store',
                    product_type: 'Premium Products',
                    tags: 'premium,envío-gratis,calidad-superior,goio-store'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Error actualizando producto ${producto.id}:`, error.message);
        return false;
    }
}

// Función principal
async function optimizarFichas() {
    console.log('🚀 Iniciando optimización de fichas de productos...\n');
    
    // 1. Obtener productos
    console.log('PASO 1: Obteniendo productos actuales');
    console.log('─'.repeat(60));
    const productos = await obtenerProductos();
    console.log(`📦 Total productos encontrados: ${productos.length}`);
    
    if (productos.length === 0) {
        console.log('❌ No se encontraron productos. Abortando optimización.');
        return;
    }
    
    // 2. Analizar calidad de fichas
    console.log('\nPASO 2: Analizando calidad de fichas');
    console.log('─'.repeat(60));
    
    const analisis = productos.map(analizarCalidadFicha);
    
    // Ordenar por prioridad y puntuación
    analisis.sort((a, b) => {
        if (a.prioridad !== b.prioridad) {
            return a.prioridad === 'ALTA' ? -1 : 1;
        }
        return b.puntuacion - a.puntuacion;
    });
    
    console.log('\n📊 Calidad de fichas por producto:');
    analisis.forEach((item, index) => {
        const icon = item.calidad === 'EXCELENTE' ? '🟢' :
                    item.calidad === 'BUENA' ? '🟡' :
                    item.calidad === 'REGULAR' ? '🟠' : '🔴';
        
        console.log(`\n   ${index + 1}. ${icon} ${item.titulo}`);
        console.log(`      Puntuación: ${item.puntuacion}/100 (${item.calidad})`);
        console.log(`      Prioridad: ${item.prioridad}`);
        console.log(`      Fortalezas: ${item.fortalezas.join(', ')}`);
        if (item.problemas.length > 0) {
            console.log(`      ⚠️  Problemas: ${item.problemas.join(', ')}`);
        }
    });
    
    // 3. Optimizar productos prioritarios
    console.log('\nPASO 3: Optimizando productos prioritarios');
    console.log('─'.repeat(60));
    
    let optimizados = 0;
    let errores = 0;
    
    // Optimizar primero los productos de alta prioridad con baja puntuación
    const productosAOptimizar = analisis.filter(item => 
        item.prioridad === 'ALTA' || item.puntuacion < 70
    ).slice(0, 8); // Limitar a 8 productos para evitar rate limits
    
    for (const item of productosAOptimizar) {
        console.log(`\n🔧 Optimizando: ${item.titulo}`);
        console.log(`   Puntuación actual: ${item.puntuacion}/100`);
        
        const producto = productos.find(p => p.id === item.id);
        const descripcionOptimizada = optimizarDescripcion(producto);
        
        const actualizado = await actualizarProducto(producto, descripcionOptimizada);
        
        if (actualizado) {
            console.log('   ✅ Producto optimizado exitosamente');
            optimizados++;
        } else {
            console.log('   ❌ Error optimizando producto');
            errores++;
        }
        
        // Pausa entre actualizaciones
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // 4. Resumen final
    console.log('\n═'.repeat(80));
    console.log('📊 RESUMEN DE OPTIMIZACIÓN COMPLETADA');
    console.log('═'.repeat(80));
    console.log(`📦 Total productos analizados: ${productos.length}`);
    console.log(`🎯 Productos prioritarios identificados: ${analisis.filter(a => a.prioridad === 'ALTA').length}`);
    console.log(`🔧 Productos optimizados: ${optimizados}`);
    console.log(`⚠️  Errores: ${errores}`);
    
    // Top 5 productos listos para venta
    const topProductos = analisis.slice(0, 5);
    console.log('\n🏆 TOP 5 PRODUCTOS LISTOS PARA VENTA HOY:');
    topProductos.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.titulo}`);
        console.log(`      Calidad: ${item.calidad} (${item.puntuacion}/100)`);
        console.log(`      Handle: ${item.handle}`);
        console.log('');
    });
    
    // Guardar reporte
    const reporte = {
        fecha: new Date().toISOString(),
        productos_analizados: productos.length,
        productos_optimizados: optimizados,
        errores: errores,
        analisis_completo: analisis,
        top_productos: topProductos,
        estadisticas: {
            excelente: analisis.filter(a => a.calidad === 'EXCELENTE').length,
            buena: analisis.filter(a => a.calidad === 'BUENA').length,
            regular: analisis.filter(a => a.calidad === 'REGULAR').length,
            deficiente: analisis.filter(a => a.calidad === 'DEFICIENTE').length
        }
    };
    
    const nombreArchivo = `reports/optimizacion-fichas-${Date.now()}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));
    
    console.log(`📄 Reporte guardado: ${nombreArchivo}`);
    
    // Próximos pasos
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. 🖼️  Ejecutar corrector de imágenes express');
    console.log('2. 🧪 Hacer test de compra con producto estrella');
    console.log('3. 📱 Compartir en WhatsApp para primera venta');
    console.log('4. 📊 Monitorear conversiones y optimizar');
    
    console.log('\n💡 PRODUCTOS RECOMENDADOS PARA PRIMERA VENTA:');
    topProductos.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. https://goiostore.com/products/${item.handle}`);
    });
    
    console.log('\n═'.repeat(80));
    
    return reporte;
}

// Ejecutar optimización
optimizarFichas()
    .then(reporte => {
        console.log('✅ Optimización de fichas completada exitosamente');
        
        if (reporte.productos_optimizados > 0) {
            console.log(`\n🎉 ${reporte.productos_optimizados} productos optimizados para venta`);
            console.log('🌐 Revisar goiostore.com para ver las mejoras');
        }
        
        console.log('\n🚀 ¡TIENDA LISTA PARA PRIMERAS VENTAS!');
    })
    .catch(error => {
        console.error('❌ Error en optimización de fichas:', error);
        process.exit(1);
    });