// 🔍 VERIFICADOR DE HANDLES REALES - GOIOSTORE
// Obtiene los handles exactos de productos para URLs correctas
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 VERIFICADOR DE HANDLES REALES - GOIOSTORE');
console.log('='.repeat(80));
console.log('🎯 Objetivo: Obtener URLs exactas de productos para goiostore.com');
console.log('📅 Fecha:', new Date().toLocaleString('es-PE'));
console.log('');

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD || 'skhqgs-2j.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
const FRONTEND_DOMAIN = 'goiostore.com';

async function obtenerHandlesReales() {
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/products.json?fields=id,title,handle,status&limit=250`;
        
        const response = await fetch(url, {
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
        console.error('❌ Error obteniendo handles:', error.message);
        return [];
    }
}

async function testearHandleReal(handle) {
    try {
        const url = `https://${FRONTEND_DOMAIN}/products/${handle}`;
        
        const response = await fetch(url, {
            method: 'HEAD', // Solo headers, más rápido
            timeout: 5000
        });
        
        return {
            handle: handle,
            url: url,
            status: response.status,
            accesible: response.status === 200
        };
    } catch (error) {
        return {
            handle: handle,
            url: `https://${FRONTEND_DOMAIN}/products/${handle}`,
            status: 'ERROR',
            accesible: false,
            error: error.message
        };
    }
}

async function verificarTodosLosHandles() {
    console.log('🚀 Obteniendo handles reales de productos...\n');
    
    const productos = await obtenerHandlesReales();
    
    if (productos.length === 0) {
        console.log('❌ No se pudieron obtener productos');
        return;
    }
    
    console.log(`📦 Total productos encontrados: ${productos.length}\n`);
    console.log('📋 HANDLES REALES Y TEST DE URLs:');
    console.log('─'.repeat(80));
    
    const resultados = [];
    
    for (const producto of productos) {
        if (producto.status === 'active') {
            console.log(`\n🔍 ${producto.title}`);
            console.log(`   Handle real: ${producto.handle}`);
            
            const test = await testearHandleReal(producto.handle);
            
            if (test.accesible) {
                console.log(`   ✅ URL accesible: ${test.url}`);
            } else {
                console.log(`   ❌ URL no accesible (${test.status}): ${test.url}`);
            }
            
            resultados.push({
                id: producto.id,
                titulo: producto.title,
                handle: producto.handle,
                url_completa: test.url,
                accesible: test.accesible,
                status: test.status
            });
            
            // Pausa entre requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Resumen
    const accesibles = resultados.filter(r => r.accesible);
    const noAccesibles = resultados.filter(r => !r.accesible);
    
    console.log('\n═'.repeat(80));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('═'.repeat(80));
    console.log(`📦 Total productos activos: ${resultados.length}`);
    console.log(`✅ URLs accesibles: ${accesibles.length}`);
    console.log(`❌ URLs no accesibles: ${noAccesibles.length}`);
    console.log(`📈 Porcentaje éxito: ${Math.round((accesibles.length / resultados.length) * 100)}%`);
    
    if (accesibles.length > 0) {
        console.log('\n🎯 PRODUCTOS LISTOS PARA VENTA (URLs funcionando):');
        console.log('─'.repeat(80));
        accesibles.slice(0, 5).forEach((producto, index) => {
            console.log(`${index + 1}. ${producto.titulo}`);
            console.log(`   🔗 ${producto.url_completa}`);
            console.log('');
        });
    }
    
    if (noAccesibles.length > 0) {
        console.log('\n⚠️  PRODUCTOS CON URLs ROTAS:');
        console.log('─'.repeat(80));
        noAccesibles.forEach((producto, index) => {
            console.log(`${index + 1}. ${producto.titulo}`);
            console.log(`   Handle: ${producto.handle}`);
            console.log(`   Status: ${producto.status}`);
            console.log(`   URL: ${producto.url_completa}`);
            console.log('');
        });
    }
    
    // Generar URLs para marketing
    if (accesibles.length > 0) {
        console.log('\n📱 URLS PARA MARKETING INMEDIATO:');
        console.log('─'.repeat(80));
        console.log('Copiar y pegar en WhatsApp/Instagram:');
        console.log('');
        
        accesibles.slice(0, 3).forEach((producto, index) => {
            const titulo = producto.titulo.replace(/🌟|Premium|Calidad Superior|Envío Gratis \+\$25/g, '').trim();
            console.log(`${index + 1}. 🛒 ${titulo}`);
            console.log(`${producto.url_completa}`);
            console.log('');
        });
    }
    
    // Guardar reporte
    const reporte = {
        fecha: new Date().toISOString(),
        frontend_domain: FRONTEND_DOMAIN,
        total_productos: resultados.length,
        productos_accesibles: accesibles.length,
        productos_no_accesibles: noAccesibles.length,
        porcentaje_exito: Math.round((accesibles.length / resultados.length) * 100),
        productos: resultados,
        urls_marketing: accesibles.slice(0, 3).map(p => ({
            titulo: p.titulo,
            url: p.url_completa,
            handle: p.handle
        }))
    };
    
    const nombreArchivo = `reports/verificacion-handles-${Date.now()}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));
    
    console.log(`📄 Reporte guardado: ${nombreArchivo}`);
    
    // Estado final
    if (accesibles.length >= resultados.length * 0.8) {
        console.log('\n🎉 ✅ TIENDA LISTA PARA VENDER');
        console.log('🚀 Usar URLs verificadas para marketing inmediato');
    } else {
        console.log('\n⚠️  🔧 CORRECCIONES NECESARIAS');
        console.log('Muchas URLs rotas - verificar configuración de dominio');
    }
    
    console.log('═'.repeat(80));
    
    return reporte;
}

// Ejecutar verificación
verificarTodosLosHandles()
    .then(reporte => {
        if (reporte && reporte.porcentaje_exito >= 80) {
            console.log('\n💰 ¡LISTO PARA PRIMERA VENTA!');
            console.log('📱 Compartir URLs en redes sociales AHORA');
        }
    })
    .catch(error => {
        console.error('❌ Error en verificación de handles:', error);
        process.exit(1);
    });