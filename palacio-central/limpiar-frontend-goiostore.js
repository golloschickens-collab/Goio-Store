// 🧹 AGENTE LIMPIADOR DE FRONTEND - GOIOSTORE.COM
// Elimina placeholders y sincroniza productos del backend al frontend
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧹 AGENTE LIMPIADOR DE FRONTEND - GOIOSTORE.COM');
console.log('='.repeat(80));
console.log('🎯 Objetivo: Eliminar placeholders y activar productos reales');
console.log('📅 Fecha:', new Date().toLocaleString('es-PE'));
console.log('');

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD || 'skhqgs-2j.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
const FRONTEND_DOMAIN = 'goiostore.com';

// Obtener todos los productos
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

// Identificar productos problemáticos
function identificarProblemasProductos(productos) {
    const problemas = [];
    
    productos.forEach(producto => {
        const issues = [];
        
        // Verificar títulos genéricos
        if (producto.title.toLowerCase().includes('producto 1') || 
            producto.title.toLowerCase().includes('producto 2') ||
            producto.title.toLowerCase().includes('test product')) {
            issues.push('TÍTULO_GENÉRICO');
        }
        
        // Verificar si es borrador
        if (producto.status === 'draft') {
            issues.push('BORRADOR');
        }
        
        // Verificar descripción vacía o genérica
        if (!producto.body_html || producto.body_html.trim().length < 50) {
            issues.push('DESCRIPCIÓN_VACÍA');
        }
        
        // Verificar handle genérico
        if (producto.handle.includes('test-product') || 
            producto.handle.includes('producto-1') ||
            producto.handle.includes('producto-2')) {
            issues.push('HANDLE_GENÉRICO');
        }
        
        // Verificar falta de imágenes
        if (!producto.images || producto.images.length === 0) {
            issues.push('SIN_IMÁGENES');
        }
        
        // Verificar precio
        if (!producto.variants || producto.variants.length === 0 || 
            !producto.variants[0].price || producto.variants[0].price === '0.00') {
            issues.push('SIN_PRECIO');
        }
        
        if (issues.length > 0) {
            problemas.push({
                id: producto.id,
                titulo: producto.title,
                handle: producto.handle,
                status: producto.status,
                problemas: issues,
                producto: producto
            });
        }
    });
    
    return problemas;
}

// Activar productos en borrador
async function activarProducto(producto) {
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/products/${producto.id}.json`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: {
                    id: producto.id,
                    status: 'active'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Error activando producto ${producto.id}:`, error.message);
        return false;
    }
}

// Eliminar producto problemático
async function eliminarProducto(producto) {
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/products/${producto.id}.json`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Error eliminando producto ${producto.id}:`, error.message);
        return false;
    }
}

// Verificar estado del frontend
async function verificarFrontend() {
    try {
        console.log(`\n🌐 Verificando frontend: https://${FRONTEND_DOMAIN}`);
        
        const response = await fetch(`https://${FRONTEND_DOMAIN}`, {
            method: 'GET',
            timeout: 10000
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const html = await response.text();
            
            // Buscar indicadores de problemas
            const indicadores = {
                placeholders: html.includes('Producto 1') || html.includes('Producto 2'),
                productos_vacios: html.includes('No hay productos') || html.includes('Coming soon'),
                errores_404: html.includes('404') || html.includes('Not found'),
                mantenimiento: html.includes('maintenance') || html.includes('Under construction')
            };
            
            console.log('   📊 Análisis de contenido:');
            console.log(`      Placeholders detectados: ${indicadores.placeholders ? '❌ SÍ' : '✅ NO'}`);
            console.log(`      Productos vacíos: ${indicadores.productos_vacios ? '❌ SÍ' : '✅ NO'}`);
            console.log(`      Errores 404: ${indicadores.errores_404 ? '❌ SÍ' : '✅ NO'}`);
            console.log(`      En mantenimiento: ${indicadores.mantenimiento ? '❌ SÍ' : '✅ NO'}`);
            
            return {
                accesible: true,
                status: response.status,
                indicadores: indicadores
            };
        } else {
            return {
                accesible: false,
                status: response.status,
                error: response.statusText
            };
        }
    } catch (error) {
        console.error('❌ Error verificando frontend:', error.message);
        return {
            accesible: false,
            error: error.message
        };
    }
}

// Función principal
async function limpiarFrontend() {
    console.log('🚀 Iniciando limpieza de frontend...\n');
    
    // 1. Verificar estado actual del frontend
    console.log('PASO 1: Verificando estado actual del frontend');
    console.log('─'.repeat(60));
    const estadoFrontend = await verificarFrontend();
    
    // 2. Obtener productos del backend
    console.log('\nPASO 2: Obteniendo productos del backend');
    console.log('─'.repeat(60));
    const productos = await obtenerProductos();
    console.log(`📦 Total productos encontrados: ${productos.length}`);
    
    if (productos.length === 0) {
        console.log('❌ No se encontraron productos. Abortando limpieza.');
        return;
    }
    
    // 3. Identificar problemas
    console.log('\nPASO 3: Identificando problemas en productos');
    console.log('─'.repeat(60));
    const problemas = identificarProblemasProductos(productos);
    
    console.log(`🔍 Productos con problemas: ${problemas.length}/${productos.length}`);
    
    if (problemas.length === 0) {
        console.log('✅ No se encontraron problemas en los productos');
    } else {
        console.log('\n📋 Detalle de problemas:');
        problemas.forEach((item, index) => {
            console.log(`\n   ${index + 1}. ${item.titulo}`);
            console.log(`      ID: ${item.id}`);
            console.log(`      Handle: ${item.handle}`);
            console.log(`      Status: ${item.status}`);
            console.log(`      Problemas: ${item.problemas.join(', ')}`);
        });
    }
    
    // 4. Limpiar productos problemáticos
    console.log('\nPASO 4: Limpiando productos problemáticos');
    console.log('─'.repeat(60));
    
    let eliminados = 0;
    let activados = 0;
    let errores = 0;
    
    for (const item of problemas) {
        console.log(`\n🔧 Procesando: ${item.titulo}`);
        
        // Decidir acción según tipo de problema
        const tieneProblemasGraves = item.problemas.includes('TÍTULO_GENÉRICO') || 
                                   item.problemas.includes('HANDLE_GENÉRICO') ||
                                   item.problemas.includes('SIN_PRECIO');
        
        if (tieneProblemasGraves) {
            console.log('   ❌ Eliminando producto por problemas graves...');
            const eliminado = await eliminarProducto(item.producto);
            if (eliminado) {
                console.log('   ✅ Producto eliminado exitosamente');
                eliminados++;
            } else {
                console.log('   ❌ Error eliminando producto');
                errores++;
            }
        } else if (item.status === 'draft') {
            console.log('   🔄 Activando producto desde borrador...');
            const activado = await activarProducto(item.producto);
            if (activado) {
                console.log('   ✅ Producto activado exitosamente');
                activados++;
            } else {
                console.log('   ❌ Error activando producto');
                errores++;
            }
        } else {
            console.log('   ℹ️  Producto requiere corrección manual');
        }
        
        // Pausa entre operaciones
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 5. Verificar estado final
    console.log('\nPASO 5: Verificando estado final');
    console.log('─'.repeat(60));
    
    // Esperar un poco para que Shopify actualice
    console.log('⏳ Esperando actualización de Shopify (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const estadoFinal = await verificarFrontend();
    
    // 6. Resumen final
    console.log('\n═'.repeat(80));
    console.log('📊 RESUMEN DE LIMPIEZA COMPLETADA');
    console.log('═'.repeat(80));
    console.log(`📦 Total productos procesados: ${productos.length}`);
    console.log(`🔍 Productos con problemas: ${problemas.length}`);
    console.log(`❌ Productos eliminados: ${eliminados}`);
    console.log(`✅ Productos activados: ${activados}`);
    console.log(`⚠️  Errores: ${errores}`);
    
    console.log('\n🌐 Estado del frontend:');
    if (estadoFinal.accesible) {
        console.log(`✅ Frontend accesible (${estadoFinal.status})`);
        if (estadoFinal.indicadores) {
            console.log(`   Placeholders: ${estadoFinal.indicadores.placeholders ? '❌ Aún presentes' : '✅ Eliminados'}`);
            console.log(`   Productos vacíos: ${estadoFinal.indicadores.productos_vacios ? '❌ Detectados' : '✅ No detectados'}`);
        }
    } else {
        console.log(`❌ Frontend no accesible: ${estadoFinal.error}`);
    }
    
    // Guardar reporte
    const reporte = {
        fecha: new Date().toISOString(),
        frontend_domain: FRONTEND_DOMAIN,
        backend_domain: SHOPIFY_DOMAIN,
        productos_totales: productos.length,
        productos_problematicos: problemas.length,
        acciones: {
            eliminados: eliminados,
            activados: activados,
            errores: errores
        },
        estado_frontend: estadoFinal,
        productos_problematicos: problemas
    };
    
    const nombreArchivo = `reports/limpieza-frontend-${Date.now()}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));
    
    console.log(`\n📄 Reporte guardado: ${nombreArchivo}`);
    
    // Próximos pasos
    console.log('\n🎯 PRÓXIMOS PASOS:');
    if (eliminados > 0 || activados > 0) {
        console.log('1. ✅ Verificar manualmente goiostore.com en navegador');
        console.log('2. 🔧 Ejecutar optimizador de fichas para productos restantes');
        console.log('3. 🖼️  Ejecutar corrector de imágenes express');
        console.log('4. 🧪 Hacer test de compra completo');
    } else {
        console.log('1. 🔍 Revisar productos manualmente para problemas menores');
        console.log('2. 🖼️  Priorizar corrección de imágenes');
        console.log('3. 🎯 Continuar con optimización de fichas');
    }
    
    console.log('\n═'.repeat(80));
    
    return reporte;
}

// Ejecutar limpieza
limpiarFrontend()
    .then(reporte => {
        console.log('✅ Limpieza de frontend completada exitosamente');
        
        if (reporte.acciones.eliminados > 0 || reporte.acciones.activados > 0) {
            console.log(`\n🎉 Frontend actualizado: ${reporte.acciones.eliminados + reporte.acciones.activados} cambios realizados`);
            console.log('🌐 Revisar goiostore.com ahora para ver las mejoras');
        }
    })
    .catch(error => {
        console.error('❌ Error en limpieza de frontend:', error);
        process.exit(1);
    });