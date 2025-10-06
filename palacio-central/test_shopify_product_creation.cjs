require('dotenv').config(); // Carga las variables de entorno desde .env
const axios = require('axios');

const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

if (!SHOPIFY_API_TOKEN || !SHOPIFY_STORE || !SHOPIFY_API_VERSION) {
    console.error('Error: Las variables de entorno SHOPIFY_API_TOKEN, SHOPIFY_STORE y SHOPIFY_API_VERSION deben estar configuradas.');
    process.exit(1);
}

const productToCreate = {
    "title": "Producto de Prueba Automatizado",
    "body_html": "Este es un producto creado automáticamente para pruebas.",
    "vendor": "Mi Tienda",
    "product_type": "Test",
    "status": "draft", // Start as draft to avoid immediate visibility
    "variants": [
        {
            "price": "10.00",
            "sku": "TESTSKU001"
        }
    ]
};

async function createTestProduct() {
    const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products.json`;
    console.log(`Intentando crear producto en: ${url}`);
    try {
        const response = await axios.post(url, { product: productToCreate }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_API_TOKEN
            }
        });

        if (response.data && response.data.product) {
            console.log('✅ Producto de prueba creado exitosamente:');
            console.log(JSON.stringify(response.data.product, null, 2));
        } else {
            console.error('❌ Error: Respuesta inesperada de Shopify al crear producto de prueba.');
            console.error('Respuesta completa de Shopify:', JSON.stringify(response.data, null, 2));
        }
    } catch (error) {
        console.error('❌ Error al intentar crear producto de prueba:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

createTestProduct();