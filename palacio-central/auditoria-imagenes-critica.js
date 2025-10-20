// 🚨 AUDITORÍA CRÍTICA DE IMÁGENES EN SHOPIFY
// Verificar qué imágenes están realmente en cada producto
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚨 AUDITORÍA CRÍTICA DE IMÁGENES - TODAS LAS TIENDAS');
console.log('='.repeat(80));
console.log('📅 Fecha:', new Date().toLocaleString('es-PE'));
console.log('');

// DEFINIR TODAS LAS TIENDAS
const TIENDAS = [
    {
        nombre: '🇵🇪 My Store (Peru)',
        domain: 'skhqgs-2j.myshopify.com',
        token: process.env.SHOPIFY_ADMIN_TOKEN_PROD,
        descripcion: 'Tienda principal Perú'
    },
    {
        nombre: '🌍 Goio Global',
        domain: 'goio-global.myshopify.com',
        token: process.env.SHOPIFY_ADMIN_TOKEN_GLOBAL || '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',
        descripcion: 'Tienda internacional USA'
    },
    {
        nombre: '🏪 Goio Store',
        domain: 'goio-store.myshopify.com',
        token: 'QS8m8s9DaJ5XV7vWhna4NmZB6iI2ByGWZcST7eDM49RYSqjBdFEDJfaKxaBEH2M1p46kjIGihFxzF18iTpF7HtikFmVSXZCRYdcS87H0KI73Y1FZBIZBqpuGu9eKMNjFx8HBOlLqL1IAgGpqDCScacTO4GHS',
        descripcion: 'Tienda custom frontend'
    }
];

// Función para obtener todos los productos de una tienda
async function obtenerProductosTienda(tienda) {
    try {
        const url = `https://${tienda.domain}/admin/api/2024-07/products.json?limit=250`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': tienda.token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error(`❌ Error en ${tienda.nombre}:`, error.message);
        return [];
    }
}

// Función para analizar imágenes de un producto
function analizarImagenesProducto(producto) {
    const analisis = {
        id: producto.id,
        titulo: producto.title,
        handle: producto.handle,
        total_imagenes: producto.images ? producto.images.length : 0,
        imagenes: [],
        problemas: []
    };

    if (!producto.images || producto.images.length === 0) {
        analisis.problemas.push('SIN IMÁGENES');
        return analisis;
    }

    // Analizar cada imagen
    producto.images.forEach((img, index) => {
        const info = {
            posicion: index + 1,
            id: img.id,
            url: img.src,
            alt: img.alt || 'Sin texto alternativo',
            width: img.width,
            height: img.height,
            created_at: img.created_at
        };

        // Detectar imágenes genéricas de Shopify
        if (img.src.includes('cdn.shopify.com/s/files/1/0000/0000/0000/')) {
            analisis.problemas.push(`Imagen ${index + 1}: URL genérica placeholder`);
        }

        // Detectar imágenes muy antiguas (placeholder iniciales)
        const fechaCreacion = new Date(img.created_at);
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        
        if (fechaCreacion < haceUnMes) {
            analisis.problemas.push(`Imagen ${index + 1}: Creada hace más de 1 mes (posible placeholder)`);
        }

        // Detectar resoluciones bajas
        if (img.width < 800 || img.height < 800) {
            analisis.problemas.push(`Imagen ${index + 1}: Resolución baja ${img.width}x${img.height}`);
        }

        analisis.imagenes.push(info);
    });

    return analisis;
}

// Función principal de auditoría
async function ejecutarAuditoria() {
    const reporte = {
        fecha: new Date().toISOString(),
        tiendas: []
    };

    for (const tienda of TIENDAS) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`${tienda.nombre} - ${tienda.domain}`);
        console.log(`${tienda.descripcion}`);
        console.log(`${'='.repeat(80)}\n`);

        const productos = await obtenerProductosTienda(tienda);
        
        if (productos.length === 0) {
            console.log('⚠️  NO SE ENCONTRARON PRODUCTOS EN ESTA TIENDA\n');
            reporte.tiendas.push({
                nombre: tienda.nombre,
                domain: tienda.domain,
                total_productos: 0,
                productos: [],
                estado: 'VACÍA'
            });
            continue;
        }

        console.log(`📦 Total productos: ${productos.length}\n`);

        const analisisProductos = [];
        let productosSinImagenes = 0;
        let productosConProblemas = 0;
        let totalImagenes = 0;

        // Analizar cada producto
        for (const producto of productos) {
            const analisis = analizarImagenesProducto(producto);
            analisisProductos.push(analisis);
            totalImagenes += analisis.total_imagenes;

            // Mostrar análisis en consola
            console.log(`\n📦 ${analisis.titulo}`);
            console.log(`   Handle: ${analisis.handle}`);
            console.log(`   ID: ${analisis.id}`);
            console.log(`   Total imágenes: ${analisis.total_imagenes}`);

            if (analisis.total_imagenes === 0) {
                productosSinImagenes++;
                console.log('   ❌ SIN IMÁGENES');
            } else {
                // Mostrar detalles de cada imagen
                analisis.imagenes.forEach(img => {
                    console.log(`\n   Imagen ${img.posicion}:`);
                    console.log(`     - URL: ${img.url.substring(0, 80)}...`);
                    console.log(`     - Alt: ${img.alt}`);
                    console.log(`     - Resolución: ${img.width}x${img.height}`);
                    console.log(`     - Creada: ${new Date(img.created_at).toLocaleDateString('es-PE')}`);
                });
            }

            // Mostrar problemas detectados
            if (analisis.problemas.length > 0) {
                productosConProblemas++;
                console.log(`\n   ⚠️  PROBLEMAS DETECTADOS (${analisis.problemas.length}):`);
                analisis.problemas.forEach(problema => {
                    console.log(`      • ${problema}`);
                });
            } else if (analisis.total_imagenes > 0) {
                console.log('\n   ✅ Imágenes OK');
            }

            console.log(`   ${'─'.repeat(70)}`);
        }

        // Resumen de la tienda
        console.log(`\n${'═'.repeat(80)}`);
        console.log(`📊 RESUMEN ${tienda.nombre}`);
        console.log(`${'═'.repeat(80)}`);
        console.log(`Total productos: ${productos.length}`);
        console.log(`Total imágenes: ${totalImagenes}`);
        console.log(`Productos sin imágenes: ${productosSinImagenes} (${((productosSinImagenes/productos.length)*100).toFixed(1)}%)`);
        console.log(`Productos con problemas: ${productosConProblemas} (${((productosConProblemas/productos.length)*100).toFixed(1)}%)`);
        console.log(`Productos OK: ${productos.length - productosConProblemas - productosSinImagenes}`);

        // Clasificación del estado
        let estado = 'OK';
        if (productosSinImagenes > 0) estado = 'CRÍTICO';
        else if (productosConProblemas > productos.length / 2) estado = 'PROBLEMAS';
        else if (productosConProblemas > 0) estado = 'ADVERTENCIAS';

        console.log(`\n🎯 Estado: ${estado}`);

        reporte.tiendas.push({
            nombre: tienda.nombre,
            domain: tienda.domain,
            total_productos: productos.length,
            total_imagenes: totalImagenes,
            productos_sin_imagenes: productosSinImagenes,
            productos_con_problemas: productosConProblemas,
            estado: estado,
            productos: analisisProductos
        });
    }

    // Guardar reporte completo
    const nombreArchivo = `reports/auditoria-imagenes-completa-${Date.now()}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));

    // Generar reporte Markdown
    const reporteMD = generarReporteMarkdown(reporte);
    const nombreMD = `reports/auditoria-imagenes-completa-${Date.now()}.md`;
    fs.writeFileSync(nombreMD, reporteMD);

    console.log(`\n${'═'.repeat(80)}`);
    console.log('📄 REPORTES GENERADOS:');
    console.log(`   JSON: ${nombreArchivo}`);
    console.log(`   Markdown: ${nombreMD}`);
    console.log(`${'═'.repeat(80)}\n`);

    return reporte;
}

// Función para generar reporte en Markdown
function generarReporteMarkdown(reporte) {
    let md = `# 🚨 AUDITORÍA CRÍTICA DE IMÁGENES - TODAS LAS TIENDAS\n\n`;
    md += `**Fecha:** ${new Date(reporte.fecha).toLocaleString('es-PE')}\n\n`;
    md += `---\n\n`;

    reporte.tiendas.forEach(tienda => {
        md += `## ${tienda.nombre}\n\n`;
        md += `- **Domain:** ${tienda.domain}\n`;
        md += `- **Total Productos:** ${tienda.total_productos}\n`;
        
        if (tienda.estado === 'VACÍA') {
            md += `- **Estado:** ⚠️ TIENDA VACÍA - SIN PRODUCTOS\n\n`;
            return;
        }

        md += `- **Total Imágenes:** ${tienda.total_imagenes}\n`;
        md += `- **Sin Imágenes:** ${tienda.productos_sin_imagenes} productos\n`;
        md += `- **Con Problemas:** ${tienda.productos_con_problemas} productos\n`;
        md += `- **Estado:** ${tienda.estado === 'CRÍTICO' ? '🔴' : tienda.estado === 'PROBLEMAS' ? '🟡' : '🟢'} ${tienda.estado}\n\n`;

        md += `### Detalle de Productos\n\n`;

        tienda.productos.forEach(prod => {
            md += `#### ${prod.titulo}\n`;
            md += `- **Handle:** \`${prod.handle}\`\n`;
            md += `- **ID:** ${prod.id}\n`;
            md += `- **Imágenes:** ${prod.total_imagenes}\n`;

            if (prod.problemas.length > 0) {
                md += `- **⚠️ Problemas:**\n`;
                prod.problemas.forEach(p => {
                    md += `  - ${p}\n`;
                });
            }

            if (prod.imagenes.length > 0) {
                md += `- **Imágenes:**\n`;
                prod.imagenes.forEach(img => {
                    md += `  ${img.posicion}. ${img.width}x${img.height} - ${new Date(img.created_at).toLocaleDateString('es-PE')}\n`;
                    md += `     Alt: "${img.alt}"\n`;
                });
            }

            md += `\n`;
        });

        md += `---\n\n`;
    });

    return md;
}

// Ejecutar auditoría
console.log('🚀 Iniciando auditoría completa de todas las tiendas...\n');
ejecutarAuditoria()
    .then(reporte => {
        console.log('✅ Auditoría completada exitosamente\n');
        
        // Mostrar resumen final
        console.log('📊 RESUMEN GLOBAL:');
        console.log('─'.repeat(80));
        reporte.tiendas.forEach(t => {
            const icon = t.estado === 'VACÍA' ? '⚪' : 
                        t.estado === 'CRÍTICO' ? '🔴' : 
                        t.estado === 'PROBLEMAS' ? '🟡' : '🟢';
            console.log(`${icon} ${t.nombre}: ${t.total_productos} productos, ${t.total_imagenes} imágenes - ${t.estado}`);
        });
        console.log('─'.repeat(80));
    })
    .catch(error => {
        console.error('❌ Error en auditoría:', error);
        process.exit(1);
    });
