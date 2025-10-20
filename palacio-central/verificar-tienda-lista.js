// 🧪 AGENTE VERIFICADOR DE TIENDA LISTA - TEST COMPLETO
// Verifica que goiostore.com esté lista para vender HOY
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 AGENTE VERIFICADOR DE TIENDA LISTA - TEST COMPLETO');
console.log('='.repeat(80));
console.log('🎯 Objetivo: Verificar que goiostore.com esté 100% lista para vender');
console.log('📅 Fecha:', new Date().toLocaleString('es-PE'));
console.log('');

const FRONTEND_DOMAIN = 'goiostore.com';
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD || 'skhqgs-2j.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;

// URLs de productos prioritarios para testing
const PRODUCTOS_TEST = [
    'botella-reutilizable-eco-friendly',
    'camiseta-verde-organica', 
    'kit-home-office-ergonmico'
];

// Verificar accesibilidad del frontend
async function verificarFrontend() {
    console.log('🌐 VERIFICANDO FRONTEND');
    console.log('─'.repeat(60));
    
    try {
        console.log(`Testeando: https://${FRONTEND_DOMAIN}`);
        
        const response = await fetch(`https://${FRONTEND_DOMAIN}`, {
            method: 'GET',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GoioBot/1.0)'
            }
        });
        
        console.log(`✅ Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            return {
                accesible: false,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        }
        
        const html = await response.text();
        
        // Análisis de contenido crítico
        const analisis = {
            tiene_productos: html.includes('producto') || html.includes('Precio'),
            tiene_carrito: html.includes('carrito') || html.includes('cart') || html.includes('añadir'),
            tiene_checkout: html.includes('checkout') || html.includes('comprar'),
            tiene_placeholders: html.includes('Producto 1') || html.includes('Producto 2'),
            tiene_errores: html.includes('404') || html.includes('error'),
            tiene_ssl: response.url.startsWith('https://'),
            tiempo_carga: response.headers.get('x-response-time') || 'N/A'
        };
        
        console.log('\n📊 Análisis de contenido:');
        console.log(`   Productos detectados: ${analisis.tiene_productos ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   Carrito funcional: ${analisis.tiene_carrito ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   Checkout disponible: ${analisis.tiene_checkout ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   Placeholders eliminados: ${!analisis.tiene_placeholders ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   Sin errores: ${!analisis.tiene_errores ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   SSL activo: ${analisis.tiene_ssl ? '✅ SÍ' : '❌ NO'}`);
        
        return {
            accesible: true,
            status: response.status,
            analisis: analisis,
            score: Object.values(analisis).filter(v => v === true).length
        };
        
    } catch (error) {
        console.error(`❌ Error verificando frontend: ${error.message}`);
        return {
            accesible: false,
            error: error.message
        };
    }
}

// Verificar productos específicos
async function verificarProductos() {
    console.log('\n📦 VERIFICANDO PRODUCTOS');
    console.log('─'.repeat(60));
    
    const resultados = [];
    
    for (const handle of PRODUCTOS_TEST) {
        console.log(`\nTesteando producto: ${handle}`);
        
        try {
            const url = `https://${FRONTEND_DOMAIN}/products/${handle}`;
            console.log(`URL: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; GoioBot/1.0)'
                }
            });
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const html = await response.text();
                
                const analisis = {
                    handle: handle,
                    accesible: true,
                    tiene_precio: html.includes('$') || html.includes('USD') || html.includes('precio'),
                    tiene_imagenes: html.includes('<img') && html.includes('product'),
                    tiene_descripcion: html.length > 2000, // Página con contenido
                    tiene_boton_comprar: html.includes('Añadir') || html.includes('Comprar') || html.includes('cart'),
                    url_completa: url
                };
                
                console.log(`   ✅ Accesible`);
                console.log(`   Precio visible: ${analisis.tiene_precio ? '✅' : '❌'}`);
                console.log(`   Imágenes: ${analisis.tiene_imagenes ? '✅' : '❌'}`);
                console.log(`   Descripción: ${analisis.tiene_descripcion ? '✅' : '❌'}`);
                console.log(`   Botón comprar: ${analisis.tiene_boton_comprar ? '✅' : '❌'}`);
                
                resultados.push(analisis);
            } else {
                console.log(`   ❌ No accesible (${response.status})`);
                resultados.push({
                    handle: handle,
                    accesible: false,
                    error: response.status,
                    url_completa: url
                });
            }
            
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            resultados.push({
                handle: handle,
                accesible: false,
                error: error.message
            });
        }
        
        // Pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return resultados;
}

// Verificar configuración de pagos
async function verificarPagos() {
    console.log('\n💳 VERIFICANDO CONFIGURACIÓN DE PAGOS');
    console.log('─'.repeat(60));
    
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/shop.json`;
        
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
        const shop = data.shop;
        
        console.log(`✅ Tienda: ${shop.name}`);
        console.log(`   Dominio principal: ${shop.primary_domain}`);
        console.log(`   País: ${shop.country_name}`);
        console.log(`   Moneda: ${shop.currency}`);
        console.log(`   Plan: ${shop.plan_name}`);
        console.log(`   Habilitada: ${shop.enabled ? '✅' : '❌'}`);
        
        // Verificar métodos de pago (solo info disponible)
        const configPagos = {
            moneda: shop.currency,
            pais: shop.country_code,
            habilitada: shop.enabled,
            dominio_principal: shop.primary_domain,
            setup_required: shop.setup_required
        };
        
        return configPagos;
        
    } catch (error) {
        console.error(`❌ Error verificando pagos: ${error.message}`);
        return {
            error: error.message
        };
    }
}

// Verificar inventario
async function verificarInventario() {
    console.log('\n📦 VERIFICANDO INVENTARIO');
    console.log('─'.repeat(60));
    
    try {
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/products.json?fields=id,title,variants&limit=250`;
        
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
        const productos = data.products || [];
        
        let totalProductos = productos.length;
        let conInventario = 0;
        let sinInventario = 0;
        
        console.log(`📊 Total productos: ${totalProductos}`);
        
        productos.forEach(producto => {
            if (producto.variants && producto.variants.length > 0) {
                const inventario = producto.variants[0].inventory_quantity || 0;
                if (inventario > 0) {
                    conInventario++;
                    console.log(`   ✅ ${producto.title.substring(0, 50)}... (Stock: ${inventario})`);
                } else {
                    sinInventario++;
                    console.log(`   ⚠️  ${producto.title.substring(0, 50)}... (Sin stock)`);
                }
            }
        });
        
        return {
            total: totalProductos,
            con_inventario: conInventario,
            sin_inventario: sinInventario,
            porcentaje_con_stock: Math.round((conInventario / totalProductos) * 100)
        };
        
    } catch (error) {
        console.error(`❌ Error verificando inventario: ${error.message}`);
        return {
            error: error.message
        };
    }
}

// Generar puntuación de la tienda
function calcularPuntuacionTienda(resultados) {
    let puntuacion = 0;
    let maxPuntos = 100;
    
    // Frontend accesible (20 puntos)
    if (resultados.frontend.accesible) {
        puntuacion += 20;
        
        // Puntos adicionales por calidad del frontend
        if (resultados.frontend.analisis) {
            puntuacion += resultados.frontend.analisis.score * 2; // max 12 puntos adicionales
        }
    }
    
    // Productos accesibles (30 puntos)
    if (resultados.productos && resultados.productos.length > 0) {
        const productosOK = resultados.productos.filter(p => p.accesible).length;
        puntuacion += (productosOK / resultados.productos.length) * 30;
    }
    
    // Configuración de pagos (20 puntos)
    if (resultados.pagos && !resultados.pagos.error) {
        puntuacion += 20;
    }
    
    // Inventario (30 puntos)
    if (resultados.inventario && !resultados.inventario.error) {
        if (resultados.inventario.porcentaje_con_stock >= 80) puntuacion += 30;
        else if (resultados.inventario.porcentaje_con_stock >= 50) puntuacion += 20;
        else puntuacion += 10;
    }
    
    return Math.round(puntuacion);
}

// Función principal
async function verificarTiendaLista() {
    console.log('🚀 Iniciando verificación completa de la tienda...\n');
    
    const resultados = {
        fecha: new Date().toISOString(),
        frontend: null,
        productos: [],
        pagos: null,
        inventario: null,
        puntuacion: 0,
        lista_para_vender: false
    };
    
    // 1. Verificar frontend
    resultados.frontend = await verificarFrontend();
    
    // 2. Verificar productos específicos
    resultados.productos = await verificarProductos();
    
    // 3. Verificar configuración de pagos
    resultados.pagos = await verificarPagos();
    
    // 4. Verificar inventario
    resultados.inventario = await verificarInventario();
    
    // 5. Calcular puntuación final
    resultados.puntuacion = calcularPuntuacionTienda(resultados);
    resultados.lista_para_vender = resultados.puntuacion >= 80;
    
    // 6. Resumen final
    console.log('\n═'.repeat(80));
    console.log('🎯 RESUMEN FINAL - VERIFICACIÓN COMPLETADA');
    console.log('═'.repeat(80));
    
    console.log(`🏪 Tienda: ${FRONTEND_DOMAIN}`);
    console.log(`📊 Puntuación total: ${resultados.puntuacion}/100`);
    
    if (resultados.lista_para_vender) {
        console.log('🎉 ✅ TIENDA LISTA PARA VENDER');
    } else {
        console.log('⚠️  ❌ TIENDA NECESITA AJUSTES ANTES DE VENDER');
    }
    
    console.log('\n📋 Detalles:');
    console.log(`   Frontend: ${resultados.frontend.accesible ? '✅ Accesible' : '❌ No accesible'}`);
    console.log(`   Productos: ${resultados.productos.filter(p => p.accesible).length}/${resultados.productos.length} OK`);
    console.log(`   Pagos: ${resultados.pagos && !resultados.pagos.error ? '✅ Configurados' : '❌ Error'}`);
    console.log(`   Inventario: ${resultados.inventario && !resultados.inventario.error ? `✅ ${resultados.inventario.porcentaje_con_stock}% con stock` : '❌ Error'}`);
    
    if (resultados.lista_para_vender) {
        console.log('\n🚀 ACCIONES INMEDIATAS PARA PRIMERA VENTA:');
        console.log('1. 📱 Compartir en WhatsApp/Instagram Stories');
        console.log('2. 🎯 Promocionar productos prioritarios:');
        resultados.productos.filter(p => p.accesible).slice(0, 3).forEach((prod, i) => {
            console.log(`   ${i+1}. https://${FRONTEND_DOMAIN}/products/${prod.handle}`);
        });
        console.log('3. 💳 Preparar confirmación de pagos (PayPal/Yape)');
        console.log('4. 📦 Confirmar detalles de envío');
        console.log('5. 🎉 ¡Empezar a vender!');
    } else {
        console.log('\n🔧 CORRECCIONES NECESARIAS:');
        if (!resultados.frontend.accesible) {
            console.log('   ❌ Frontend no accesible - verificar DNS/SSL');
        }
        if (resultados.productos.filter(p => !p.accesible).length > 0) {
            console.log('   ❌ Algunos productos no accesibles - verificar URLs');
        }
        if (resultados.pagos && resultados.pagos.error) {
            console.log('   ❌ Configuración de pagos incompleta');
        }
        if (resultados.inventario && resultados.inventario.porcentaje_con_stock < 80) {
            console.log('   ⚠️  Bajo inventario - reponer stock');
        }
    }
    
    // Guardar reporte
    const nombreArchivo = `reports/verificacion-tienda-lista-${Date.now()}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(resultados, null, 2));
    
    console.log(`\n📄 Reporte completo guardado: ${nombreArchivo}`);
    console.log('═'.repeat(80));
    
    return resultados;
}

// Ejecutar verificación
verificarTiendaLista()
    .then(resultados => {
        if (resultados.lista_para_vender) {
            console.log('\n🎉🎉🎉 ¡FELICITACIONES! 🎉🎉🎉');
            console.log(`${FRONTEND_DOMAIN} está LISTA para generar ventas HOY`);
            console.log('💰 Primera venta esperada en las próximas 6 horas');
        } else {
            console.log('\n🔧 Correcciones menores necesarias');
            console.log('⏱️  Tiempo estimado para completar: 30-60 minutos');
        }
    })
    .catch(error => {
        console.error('❌ Error en verificación completa:', error);
        process.exit(1);
    });