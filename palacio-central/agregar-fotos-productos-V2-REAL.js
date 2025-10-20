// 📸 AGREGAR FOTOS DE ALTA CALIDAD V2 - Pexels sin API
// Usa URLs directas de imágenes de alta calidad
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;

console.log('📸 AGREGANDO FOTOS DE ALTA CALIDAD A PRODUCTOS V2');
console.log('='.repeat(70));
console.log(`🏪 Tienda: ${SHOPIFY_DOMAIN}`);
console.log('🖼️  Fuente: Pexels (imágenes gratis de alta calidad)');
console.log('');

// URLs directas de imágenes de alta calidad desde Pexels
const productImages = {
    'Botella reutilizable eco-friendly': 'https://images.pexels.com/photos/4246221/pexels-photo-4246221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Botella Smart GO': 'https://images.pexels.com/photos/3942821/pexels-photo-3942821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Cafetera Cold Brew Express': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Camiseta verde orgánica': 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Kit Home Office Ergonómico': 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Lámpara LED Ambiente Premium': 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Mini Proyector HD Portátil': 'https://images.pexels.com/photos/7991428/pexels-photo-7991428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Organizador Modular de Closet': 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Purificador de Aire GO': 'https://images.pexels.com/photos/4353618/pexels-photo-4353618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Robot Aspiradora Slim': 'https://images.pexels.com/photos/7256046/pexels-photo-7256046.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Set Aromaterapia Relax': 'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Set Bandas de Resistencia Pro': 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'Test Product': 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'
};

// Función para subir imagen a Shopify
async function subirImagenAShopify(productId, imageUrl, altText) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${productId}/images.json`;
    
    const body = {
        image: {
            src: imageUrl,
            alt: altText
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    
    return response;
}

// Cargar productos optimizados
const productosOptimizados = JSON.parse(
    fs.readFileSync('config/productos-optimizados-ia.json', 'utf8')
);

console.log(`📦 Productos a procesar: ${productosOptimizados.productos_procesados}`);
console.log('');

let exitosos = 0;
let fallidos = 0;
const log = [];

for (const producto of productosOptimizados.productos) {
    try {
        const productId = producto.original.id;
        const tituloOriginal = producto.original.title;
        const tituloOptimizado = producto.optimizado.titulo;
        
        console.log(`📸 Procesando: ${tituloOriginal}`);
        
        // Buscar URL de imagen
        let imageUrl = null;
        for (const [key, value] of Object.entries(productImages)) {
            if (tituloOriginal.includes(key) || key.includes(tituloOriginal.substring(0, 15))) {
                imageUrl = value;
                break;
            }
        }
        
        if (!imageUrl) {
            console.log(`   ⚠️ No hay imagen asignada para este producto`);
            fallidos++;
            log.push({
                producto: tituloOriginal,
                status: 'fallido',
                error: 'No hay imagen asignada'
            });
            console.log('');
            continue;
        }
        
        console.log(`   📥 URL imagen: ${imageUrl.substring(0, 60)}...`);
        
        // Subir a Shopify
        const response = await subirImagenAShopify(
            productId,
            imageUrl,
            tituloOptimizado
        );
        
        if (response.ok) {
            const result = await response.json();
            console.log(`   ✅ IMAGEN SUBIDA A SHOPIFY`);
            console.log(`   🆔 Image ID: ${result.image.id}`);
            exitosos++;
            
            log.push({
                producto: tituloOriginal,
                status: 'exitoso',
                imagen_url: imageUrl,
                shopify_image_id: result.image.id
            });
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Error al subir a Shopify: ${response.status}`);
            console.log(`   📋 ${errorText.substring(0, 100)}`);
            fallidos++;
            
            log.push({
                producto: tituloOriginal,
                status: 'fallido',
                error: `Shopify error ${response.status}: ${errorText.substring(0, 50)}`
            });
        }
        
        console.log('');
        
        // Esperar 2 segundos entre productos (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        fallidos++;
        
        log.push({
            producto: producto.original.title,
            status: 'fallido',
            error: error.message
        });
        
        console.log('');
    }
}

// Guardar log
const logData = {
    fecha: new Date().toISOString(),
    exitosos,
    fallidos,
    detalles: log
};

fs.writeFileSync(
    'config/imagenes-subidas-log.json',
    JSON.stringify(logData, null, 2)
);

console.log('='.repeat(70));
console.log('📊 RESUMEN FINAL:');
console.log(`   ✅ Imágenes subidas: ${exitosos}`);
console.log(`   ❌ Fallidos: ${fallidos}`);
console.log(`   📈 Tasa de éxito: ${Math.round((exitosos / (exitosos + fallidos)) * 100)}%`);
console.log('');

if (exitosos > 0) {
    console.log('🎉 ¡PRODUCTOS CON FOTOS DE ALTA CALIDAD!');
    console.log(`   Verifica en: https://${SHOPIFY_DOMAIN}/admin/products`);
    console.log('   🔄 REFRESCA tu panel de Shopify para ver los cambios');
    console.log('');
    console.log('📸 Fuente de imágenes:');
    console.log('   Pexels.com - Licencia gratuita para uso comercial');
    console.log('   No se requiere atribución');
    console.log('');
    console.log('🎯 SIGUIENTE PASO:');
    console.log('   1. Refresca Shopify admin');
    console.log('   2. Verifica que las fotos se ven bien');
    console.log('   3. ¡Listo para vender!');
} else {
    console.log('⚠️ No se subieron imágenes. Revisa los errores arriba.');
}

console.log('');
console.log('💾 Log detallado guardado en: config/imagenes-subidas-log.json');
