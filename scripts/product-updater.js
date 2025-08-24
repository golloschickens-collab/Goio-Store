import fetch from 'node-fetch';
import config from './config.js';

const devStore = config.entorno.tiendas.find(t => t.entorno === 'desarrollo');
if (!devStore) {
    throw new Error("No se encontró la configuración para la tienda de desarrollo en config.js");
}

const { dominio, api_key } = devStore;
const API_URL = `https://${dominio}/admin/api/2023-10/graphql.json`;

async function findProductByHandle(handle) {
    const query = `
    query {
      products(first: 1, query: "handle:${handle}") {
        edges {
          node {
            id
            handle
          }
        }
      }
    }`;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': api_key,
        },
        body: JSON.stringify({ query }),
    });

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
        console.error("Error en la respuesta de la API de Shopify:", JSON.stringify(jsonResponse.errors, null, 2));
        throw new Error("Error en la consulta a la API de Shopify.");
    }

    if (!jsonResponse.data) {
        console.error("La respuesta de la API de Shopify no contiene 'data':", JSON.stringify(jsonResponse, null, 2));
        throw new Error("Respuesta inesperada de la API de Shopify.");
    }

    if (jsonResponse.data.products.edges.length > 0) {
        return jsonResponse.data.products.edges[0].node;
    }
    return null;
}

async function createProduct(productData) {
    const mutation = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }`;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': api_key,
        },
        body: JSON.stringify({ 
            query: mutation,
            variables: { input: productData }
        }),
    });

    const jsonResponse = await response.json(); // <-- Added
    console.log("DEBUG: Shopify createProduct raw response:", JSON.stringify(jsonResponse, null, 2)); // <-- Added
    return jsonResponse; // <-- Modified
}

async function updateProduct(productId, productData) {
    const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }`;
    
    const input = { ...productData, id: productId };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': api_key,
        },
        body: JSON.stringify({ 
            query: mutation,
            variables: { input }
        }),
    });

    const jsonResponse = await response.json(); // <-- Added
    console.log("DEBUG: Shopify updateProduct raw response:", JSON.stringify(jsonResponse, null, 2)); // <-- Added
    return jsonResponse; // <-- Modified
}

export { findProductByHandle, createProduct, updateProduct };