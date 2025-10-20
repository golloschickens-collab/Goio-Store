// 📸 AGREGAR FOTOS DE ALTA CALIDAD A PRODUCTOS - VERSIÓN REAL
// Descarga de Unsplash y sube directamente a Shopify
import fetch from 'node-fetch';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;
const UNSPLASH_ACCESS_KEY = 'cJWa3VE0g55BvMl_SZJLMZ9YnVqVQsZCPBY_xFmZRWk'; // Access key público de Unsplash

console.log('📸 AGREGANDO FOTOS DE ALTA CALIDAD A PRODUCTOS');
console.log('='.repeat(70));
console.log(`🏪 Tienda: ${SHOPIFY_DOMAIN}`);
console.log('🖼️  Fuente: Unsplash (imágenes gratis de alta calidad)');
console.log('');

// Mapeo de productos a términos de búsqueda en Unsplash
const productImageQueries = {
    'Botella reutilizable eco-friendly': 'reusable water bottle steel',
    'Botella Smart GO': 'smart water bottle hydration',
    'Cafetera Cold Brew Express': 'cold brew coffee maker glass',
    'Camiseta verde orgánica': 'green organic tshirt cotton',
    'Kit Home Office Ergonómico': 'ergonomic home office desk setup',
    'Lámpara LED Ambiente Premium': 'led ambient lamp modern',
    'Mini Proyector HD Portátil': 'portable mini projector',
    'Organizador Modular de Closet': 'closet organizer modular storage',
    'Purificador de Aire GO': 'air purifier white modern',
    'Robot Aspiradora Slim': 'robot vacuum cleaner slim',
    'Set Aromaterapia Relax': 'aromatherapy essential oils set',
    'Set Bandas de Resistencia Pro': 'resistance bands fitness workout',
    'Test Product': 'premium product white background' // Producto de prueba
};

// Función para buscar imagen en Unsplash
async function buscarImagenUnsplash(query) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return {
            url: photo.urls.regular, // Alta calidad (1080px)
            downloadUrl: photo.links.download_location,
            author: photo.user.name,
            authorUrl: photo.user.links.html
        };
    }
    return null;
}

// Función para registrar descarga en Unsplash (requerido por API)
async function registrarDescargaUnsplash(downloadUrl) {
    try {
        await fetch(`${downloadUrl}?client_id=${UNSPLASH_ACCESS_KEY}`);
    } catch (error) {
        console.log('   ⚠️ No se pudo registrar descarga en Unsplash');
    }
}

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
        
        // Buscar término de búsqueda
        let query = null;
        for (const [key, value] of Object.entries(productImageQueries)) {
            if (tituloOriginal.includes(key) || key.includes(tituloOriginal.substring(0, 15))) {
                query = value;
                break;
            }
        }
        
        if (!query) {
            // Usar título original como fallback
            query = tituloOriginal.split(' ').slice(0, 3).join(' ');
        }
        
        console.log(`   🔍 Buscando en Unsplash: "${query}"`);
        
        // Buscar imagen
        const imagen = await buscarImagenUnsplash(query);
        
        if (!imagen) {
            console.log(`   ❌ No se encontró imagen en Unsplash`);
            fallidos++;
            log.push({
                producto: tituloOriginal,
                status: 'fallido',
                error: 'No se encontró imagen'
            });
            console.log('');
            continue;
        }
        
        console.log(`   ✅ Imagen encontrada: ${imagen.url.substring(0, 50)}...`);
        console.log(`   📸 Crédito: ${imagen.author}`);
        
        // Registrar descarga en Unsplash
        await registrarDescargaUnsplash(imagen.downloadUrl);
        
        // Subir a Shopify
        const response = await subirImagenAShopify(
            productId,
            imagen.url,
            tituloOptimizado
        );
        
        if (response.ok) {
            const result = await response.json();
            console.log(`   ✅ IMAGEN SUBIDA A SHOPIFY`);
            console.log(`   🔗 ID: ${result.image.id}`);
            exitosos++;
            
            log.push({
                producto: tituloOriginal,
                status: 'exitoso',
                imagen_url: imagen.url,
                shopify_image_id: result.image.id,
                credito: `${imagen.author} - ${imagen.authorUrl}`
            });
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Error al subir a Shopify: ${response.status}`);
            console.log(`   📋 ${errorText.substring(0, 100)}`);
            fallidos++;
            
            log.push({
                producto: tituloOriginal,
                status: 'fallido',
                error: `Shopify error ${response.status}`
            });
        }
        
        console.log('');
        
        // Esperar 3 segundos entre productos (rate limiting Unsplash + Shopify)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
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
console.log('');

if (exitosos > 0) {
    console.log('🎉 ¡PRODUCTOS CON FOTOS DE ALTA CALIDAD!');
    console.log(`   Verifica en: https://${SHOPIFY_DOMAIN}/admin/products`);
    console.log('   Refresca tu panel de Shopify para ver los cambios');
    console.log('');
    console.log('📸 Créditos de imágenes:');
    console.log('   Todas las fotos son de Unsplash.com (licencia gratuita)');
    console.log('   Autores individuales listados en: config/imagenes-subidas-log.json');
} else {
    console.log('⚠️ No se subieron imágenes. Revisa los errores arriba.');
}

console.log('');
console.log('💾 Log guardado en: config/imagenes-subidas-log.json');
