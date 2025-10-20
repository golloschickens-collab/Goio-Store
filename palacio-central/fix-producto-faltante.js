// Agregar foto al producto faltante (Robot Aspiradora Slim)
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN_PROD;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN_PROD;

// Producto faltante
const productId = 9249659453688; // Robot Aspiradora Slim
const imageUrl = 'https://images.pexels.com/photos/4107285/pexels-photo-4107285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'; // URL alternativa
const altText = '🌟 Robot Aspiradora Slim Premium | Calidad Superior | Envío Gratis +$25';

console.log('📸 Agregando foto al producto faltante...');
console.log(`🤖 Producto: Robot Aspiradora Slim`);
console.log(`📥 URL: ${imageUrl.substring(0, 60)}...`);
console.log('');

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

if (response.ok) {
    const result = await response.json();
    console.log('✅ IMAGEN SUBIDA EXITOSAMENTE');
    console.log(`🆔 Image ID: ${result.image.id}`);
    console.log('');
    console.log('🎉 ¡AHORA SÍ - 13/13 PRODUCTOS CON FOTOS!');
} else {
    const error = await response.text();
    console.log(`❌ Error: ${response.status}`);
    console.log(error);
}
