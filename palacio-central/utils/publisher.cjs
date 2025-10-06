const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { api, headersJSON, token, shop, API } = require('../scripts/_shopify.js');

async function publicarEnShopify(producto) {
  const url = api('products.json');
  try {
    const response = await axios.post(url, { product: producto }, {
      headers: headersJSON
    });

    if (response.data && response.data.product) {
      console.log(`✅ Publicado: ${producto.title}. ID: ${response.data.product.id}`);
      return response.data.product;
    } else {
      console.error(`❌ Error al publicar producto "${producto.title}": Respuesta inesperada de Shopify.`);
      console.error('Respuesta completa de Shopify:', JSON.stringify(response.data, null, 2));
      throw new Error('Respuesta inesperada de Shopify: No se encontró el objeto de producto.');
    }
  } catch (error) {
    console.error(`❌ Error al publicar producto "${producto.title}":`, error.response ? JSON.stringify(error.response.data) : error.message);
    throw error;
  }
}

async function publishProductsToShopify() {
    console.log('Iniciando publicación de productos en Shopify...');

    let products;
    try {
        const productsPath = path.join(__dirname, '..', 'config', 'products.json');
        const productsData = fs.readFileSync(productsPath, 'utf8');
        products = JSON.parse(productsData);
        console.log(`Se encontraron ${products.length} productos en config/products.json.`);
    } catch (error) {
        console.error('Error al leer o parsear config/products.json:', error.message);
        return;
    }

    if (products.length === 0) {
        console.log('No hay productos para publicar en config/products.json.');
        return;
    }

    for (const product of products) {
        try {
            await publicarEnShopify(product);
        } catch (error) {
            console.error(`Falló la publicación del producto "${product.title}".`);
        }
    }
    console.log('Proceso de publicación de productos finalizado.');
}

module.exports = {
    publishProductsToShopify,
    publicarEnShopify
};