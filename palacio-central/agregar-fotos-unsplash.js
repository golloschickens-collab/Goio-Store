// 📸 AGREGAR FOTOS PROFESIONALES A PRODUCTOS
// Sistema automatizado para descargar y subir imágenes de Unsplash a Shopify
import fs from 'fs';
import https from 'https';
import { shopifyAdminRequest } from './utils/shopifyClient.js';

// Configuración Unsplash (API gratuita, 50 requests/hora)
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Obtener en unsplash.com/developers

// Mapeo de productos → términos de búsqueda en Unsplash
const productImageQueries = {
    'Botella reutilizable eco-friendly': 'reusable water bottle sustainable',
    'Botella Smart GO con sensor': 'smart water bottle technology',
    'Cafetera Cold Brew': 'cold brew coffee maker',
    'Juego de Cubiertos de Bambú': 'bamboo cutlery set sustainable',
    'Bolsa de Compras Reutilizable': 'reusable shopping bag organic',
    'Botella Térmica de Acero': 'stainless steel insulated bottle',
    'Filtro de Agua Portátil': 'portable water filter outdoor',
    'Set de Contenedores de Vidrio': 'glass food containers eco',
    'Termo para Comida de Acero': 'stainless steel lunch box',
    'Pajitas de Acero Inoxidable': 'stainless steel straws sustainable',
    'Cepillo de Dientes de Bambú': 'bamboo toothbrush natural',
    'Esponja de Lufa Natural': 'natural loofah sponge eco',
    'Jabonera de Madera': 'wooden soap dish sustainable'
};

// Función para descargar imagen de Unsplash
async function downloadUnsplashImage(query, productTitle) {
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`;
    
    return new Promise((resolve, reject) => {
        https.get(searchUrl, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.results && json.results.length > 0) {
                        const imageUrl = json.results[0].urls.regular;
                        const photographer = json.results[0].user.name;
                        const photographerUrl = json.results[0].user.links.html;
                        
                        resolve({
                            url: imageUrl,
                            attribution: `Foto por ${photographer} en Unsplash`,
                            photographerUrl
                        });
                    } else {
                        reject(new Error('No se encontraron imágenes'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

// Función para subir imagen a Shopify
async function uploadImageToProduct(productId, imageUrl, altText) {
    const mutation = `
        mutation productImageCreate($productId: ID!, $image: [ProductImageInput!]!) {
            productImageCreate(productId: $productId, image: $image) {
                image {
                    id
                    url
                    altText
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    
    const variables = {
        productId: `gid://shopify/Product/${productId}`,
        image: [{
            src: imageUrl,
            altText: altText
        }]
    };
    
    return await shopifyAdminRequest(mutation, variables);
}

// Función principal
async function agregarFotosProductos() {
    console.log('📸 AGREGANDO FOTOS PROFESIONALES A PRODUCTOS');
    console.log('='.repeat(50));
    console.log('');
    
    // Cargar productos optimizados
    const productosOptimizados = JSON.parse(
        fs.readFileSync('config/productos-optimizados-ia.json', 'utf8')
    );
    
    // Cargar configuración modo real para obtener IDs
    const modoRealConfig = JSON.parse(
        fs.readFileSync('config/modo-real-config.json', 'utf8')
    );
    
    const resultados = {
        exitosos: [],
        fallidos: [],
        fecha: new Date().toISOString()
    };
    
    console.log('📋 Procesando 13 productos...');
    console.log('');
    
    for (const producto of productosOptimizados.productos) {
        try {
            const titulo = producto.titulo_original;
            const tituloOptimizado = producto.titulo_optimizado;
            
            console.log(`📸 Procesando: ${titulo}`);
            
            // Buscar query de imagen
            const query = productImageQueries[titulo] || titulo;
            
            console.log(`   🔍 Buscando en Unsplash: "${query}"`);
            
            // Descargar imagen
            const imagen = await downloadUnsplashImage(query, titulo);
            
            console.log(`   ✅ Imagen encontrada: ${imagen.url.substring(0, 50)}...`);
            console.log(`   📸 ${imagen.attribution}`);
            
            // Encontrar ID del producto en Shopify
            const productoShopify = modoRealConfig.productos.find(
                p => p.title === titulo
            );
            
            if (!productoShopify) {
                throw new Error('Producto no encontrado en Shopify');
            }
            
            // Subir imagen a Shopify
            const result = await uploadImageToProduct(
                productoShopify.id,
                imagen.url,
                tituloOptimizado
            );
            
            if (result.productImageCreate.userErrors.length > 0) {
                throw new Error(result.productImageCreate.userErrors[0].message);
            }
            
            console.log(`   ✅ Imagen subida a Shopify`);
            console.log('');
            
            resultados.exitosos.push({
                producto: titulo,
                imagen_url: imagen.url,
                atribucion: imagen.attribution,
                shopify_id: productoShopify.id
            });
            
            // Esperar 2 segundos entre requests (rate limiting)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            console.log('');
            
            resultados.fallidos.push({
                producto: producto.titulo_original,
                error: error.message
            });
        }
    }
    
    // Guardar resultados
    fs.writeFileSync(
        'config/imagenes-productos-log.json',
        JSON.stringify(resultados, null, 2)
    );
    
    console.log('📊 RESUMEN:');
    console.log('━'.repeat(40));
    console.log(`✅ Exitosos: ${resultados.exitosos.length}`);
    console.log(`❌ Fallidos: ${resultados.fallidos.length}`);
    console.log('');
    
    if (resultados.exitosos.length > 0) {
        console.log('🎉 ¡PRODUCTOS CON FOTOS PROFESIONALES!');
        console.log('   Ahora tu tienda se ve 100% profesional');
        console.log('   Lista para generar ventas');
    }
    
    console.log('');
    console.log('💾 Log guardado en: config/imagenes-productos-log.json');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    agregarFotosProductos().catch(console.error);
}

export { agregarFotosProductos };