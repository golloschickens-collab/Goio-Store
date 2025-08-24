import dotenv from "dotenv";
import path from "path";
import { GraphQLClient, gql } from "graphql-request";

console.log("--- Iniciando Script de Diagnóstico de Conexión Shopify ---");

// 1. Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const shopDomain = process.env.SHOPIFY_DOMAIN_PROD;
const apiToken = process.env.SHOPIFY_API_KEY_PROD;

// 2. Verificar y mostrar las variables leídas
console.log("[Diagnóstico] Leyendo del archivo .env:");
if (!shopDomain || !apiToken) {
    console.error("[Diagnóstico] ERROR: No se encontraron las variables SHOPIFY_DOMAIN_PROD o SHOPIFY_API_KEY_PROD.");
    process.exit(1);
}
console.log(`   - Dominio: ${shopDomain}`);
const tokenPreview = `${apiToken.substring(0, 8)}...${apiToken.substring(apiToken.length - 4)}`;
console.log(`   - Token: ${tokenPreview}`);

// 3. Construir el endpoint
const apiVersion = "2024-10";
const endpoint = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;
console.log(`[Diagnóstico] URL de conexión: ${endpoint}`);

// 4. Preparar y ejecutar la llamada
const client = new GraphQLClient(endpoint, {
    headers: { "X-Shopify-Access-Token": apiToken }
});

const query = gql`{ shop { name } }`;

async function runDiagnosis() {
    try {
        console.log("[Diagnóstico] Enviando petición...");
        const response = await client.request(query);
        console.log("---------------------------------------------------");
        console.log("[Diagnóstico] ✅ ¡CONEXIÓN EXITOSA! ✅");
        console.log("---------------------------------------------------");
        console.log("Respuesta de Shopify:", response);
    } catch (error) {
        console.log("---------------------------------------------------");
        console.error("[Diagnóstico] ❌ ¡FALLÓ LA CONEXIÓN! ❌");
        console.error("---------------------------------------------------");
        console.error("[Diagnóstico] Error completo:", error);
    }
}

runDiagnosis();