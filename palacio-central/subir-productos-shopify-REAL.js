// 📤 SUBIR PRODUCTOS OPTIMIZADOS A SHOPIFY - VERSIÓN REAL
// Este script REALMENTE actualiza los productos en Shopify
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;

console.log('📤 SUBIENDO PRODUCTOS OPTIMIZADOS A SHOPIFY');
console.log('='.repeat(60));
console.log(`🏪 Tienda: ${SHOPIFY_DOMAIN}`);
console.log('');

// Cargar productos optimizados
const productosOptimizados = JSON.parse(
    fs.readFileSync('config/productos-optimizados-ia.json', 'utf8')
);

console.log(`📦 Productos a actualizar: ${productosOptimizados.productos_procesados}`);
console.log('');

let exitosos = 0;
let fallidos = 0;

for (const producto of productosOptimizados.productos) {
    try {
        const productId = producto.original.id;
        const titulo = producto.optimizado.titulo;
        const descripcion = producto.optimizado.descripcion;
        const precio = producto.optimizado.precio;
        
        console.log(`📝 Actualizando: ${producto.original.title}`);
        console.log(`   Nuevo título: ${titulo.substring(0, 60)}...`);
        console.log(`   Nuevo precio: $${precio}`);
        
        // Actualizar producto via Shopify REST API
        const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${productId}.json`;
        
        const body = {
            product: {
                id: productId,
                title: titulo,
                body_html: descripcion,
                variants: [
                    {
                        id: producto.original.variants[0].id,
                        price: precio.toString(),
                        compare_at_price: producto.optimizado.precio_comparacion?.toString() || null
                    }
                ]
            }
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`   ✅ ACTUALIZADO en Shopify`);
            console.log(`   🔗 ${SHOPIFY_DOMAIN}/admin/products/${productId}`);
            exitosos++;
        } else {
            const error = await response.text();
            console.log(`   ❌ Error ${response.status}: ${error.substring(0, 100)}`);
            fallidos++;
        }
        
        console.log('');
        
        // Esperar 2 segundos entre requests (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        fallidos++;
        console.log('');
    }
}

console.log('='.repeat(60));
console.log('📊 RESUMEN:');
console.log(`   ✅ Exitosos: ${exitosos}`);
console.log(`   ❌ Fallidos: ${fallidos}`);
console.log('');

if (exitosos > 0) {
    console.log('🎉 ¡PRODUCTOS ACTUALIZADOS EN SHOPIFY!');
    console.log(`   Verifica en: https://${SHOPIFY_DOMAIN}/admin/products`);
} else {
    console.log('⚠️ No se actualizaron productos. Verifica la configuración.');
}
