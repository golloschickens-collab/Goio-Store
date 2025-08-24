import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Usaremos las credenciales de la tienda de producción
const shopifyStore = process.env.PROD_SHOPIFY_STORE;
const apiToken = process.env.PROD_SHOPIFY_ADMIN_TOKEN;

if (!shopifyStore || !apiToken) {
  console.error("❌ Error: Las credenciales de la tienda de producción (PROD_SHOPIFY_STORE, PROD_SHOPIFY_ADMIN_TOKEN) no están configuradas en el archivo .env");
  process.exit(1);
}

const storefrontUrl = `https://${shopifyStore}/admin/api/2023-10/products.json?limit=10`;

async function auditStore() {
  console.log(`🔍 Iniciando auditoría en la tienda: ${shopifyStore}...`);
  
  try {
    const response = await fetch(storefrontUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': apiToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta de la API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products;

    if (products.length === 0) {
      console.log("\n텅 El Auditor no ha encontrado productos en la tienda.");
      console.log("Asegúrate de haber añadido productos y que no estén en estado de 'borrador'.");
      return;
    }

    console.log("\n✅ Auditoría completada. Se han encontrado los siguientes tesoros en el reino:\n");
    console.log("--------------------------------------------------------------------------");

    products.forEach(product => {
      console.log(`👑 **Producto:** ${product.title}`);
      console.log(`   **ID:** ${product.id}`);
      console.log(`   **Estado:** ${product.status}`);
      console.log(`   **Vendedor:** ${product.vendor}`);
      const firstVariant = product.variants[0];
      if (firstVariant) {
        console.log(`   **Precio:** ${firstVariant.price} ${firstVariant.price_set?.shop_money.currency_code || ''}`);
        console.log(`   **Stock:** ${firstVariant.inventory_quantity}`);
      }
      console.log("--------------------------------------------------------------------------");
    });

  } catch (error) {
    console.error("❌ Error catastrófico durante la auditoría:", error);
  }
}

auditStore();
