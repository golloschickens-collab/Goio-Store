import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';
import { AgentValidator } from '../agents/validator.js';
import { findProductByHandle, createProduct, updateProduct } from './product-updater.js';
import { postToFacebook } from './facebook-publisher.js';

const SCRIPT_VERSION = "2.0.3 (Variants Removed)"; // Nueva versión

/**
 * Parsea el contenido markdown en un objeto de secciones.
 * Este método es más robusto que las expresiones regulares para este caso.
 * @param {string} markdownContent El contenido completo del archivo.
 * @returns {Object.<string, string>} Un objeto donde las claves son los títulos de las secciones.
 */
function parseSections(markdownContent) {
    const sections = {};
    // Eliminar el BOM (Byte Order Mark) si existe al inicio del archivo.
    const cleanContent = markdownContent.charCodeAt(0) === 65279 ? markdownContent.substring(1) : markdownContent;
    const lines = cleanContent.split(/\r?\n/);
    
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
        if (line.startsWith('## ')) {
            if (currentSection) {
                sections[currentSection] = currentContent.join('\n').trim();
            }
            currentSection = line.substring(3).trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }

    if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
}

async function publishProductWorkflow(markdownFilePath) {
    console.log(`Iniciando flujo 'publish-product' para el archivo: ${markdownFilePath}`);
    
    const productFilePath = path.resolve(process.cwd(), markdownFilePath);
    const markdownContent = await fs.readFile(productFilePath, 'utf-8');

    const sections = parseSections(markdownContent);

    const title = sections['Título SEO'];
    const body_html = sections['Descripción HTML']; // Mantener para el log, pero usar descriptionHtml para Shopify
    const handle = sections['Handle'];
    const price = sections['Precio'];

    if (!title || !body_html || !handle || !price) {
        console.error('--- FALLO LA EXTRACCIÓN (Lector Simple) ---');
        console.error(`Título: ${!!title}, Descripción: ${!!body_html}, Handle: ${!!handle}, Precio: ${!!price}`);
        console.error('------------------------------------------');
        throw new Error(`No se pudo extraer una o más secciones críticas del archivo ${markdownFilePath}.`);
    }

    const productData = {
        title: title,
        descriptionHtml: body_html, // Corregido para Shopify GraphQL
        handle: handle,
        productType: "Cuidado de Mascotas", // Corregido para Shopify GraphQL
        vendor: "Goio™ Store",
        status: 'ACTIVE', // Corregido a valor de enumeración
        // Eliminado el campo 'variants' de aquí, ya que productCreate solo crea una variante por defecto.
    };

    console.log("DEBUG: Objeto productData enviado a Shopify:", JSON.stringify(productData, null, 2)); // Nuevo log

    console.log(`Buscando producto con handle: ${handle}`);
    let existingProduct = await findProductByHandle(handle);
    let productResponse;

    if (existingProduct) {
        console.log(`Producto encontrado (ID: ${existingProduct.id}). Actualizando...`);
        productResponse = await updateProduct(existingProduct.id, productData);
    } else {
        console.log('Producto no encontrado. Creando nuevo producto...');
        productResponse = await createProduct(productData);
    }

    const userErrors = productResponse.data.productCreate?.userErrors || productResponse.data.productUpdate?.userErrors;
    if (userErrors && userErrors.length > 0) {
        throw new Error(`Error en la API de Shopify: ${JSON.stringify(userErrors)}`);
    }

    const createdOrUpdatedProduct = productResponse.data.productCreate?.product || productResponse.data.productUpdate?.product;
    if (!createdOrUpdatedProduct) {
        throw new Error(`Respuesta inesperada de la API de Shopify: ${JSON.stringify(productResponse)}`);
    }

    console.log(`Producto ${existingProduct ? 'actualizado' : 'creado'} con éxito en Shopify.`);

    const devStore = config.entorno.tiendas.find(t => t.entorno === 'desarrollo');
    const productUrl = `https://${devStore.dominio}/products/${handle}`;
    const facebookMessage = `¡Nuevo producto disponible! ✨ ${title}. ¡Stock limitado! Compra ahora:`;

    console.log('Publicando en Facebook...');
    await postToFacebook(facebookMessage, productUrl);
}

async function main() {
    console.log(`Orquestador.js versión ${SCRIPT_VERSION}`);
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Uso: node scripts/orquestador.js <comando> <archivo>');
        process.exit(1);
    }
    const [command, sourceFile] = args;

    try {
        const validator = new AgentValidator();
        await validator.runChecks();

        console.log(`
Comando recibido: ${command}`);

        switch (command) {
            case 'publish-product':
                await publishProductWorkflow(sourceFile);
                break;
            default:
                console.error(`Comando desconocido: "${command}"`);
                process.exit(1);
        }

        console.log('\n¡Orquestación completada con éxito!');

    } catch (error) {
        console.error(`
Ocurrió un error en el orquestador durante el comando '${command}':`, error.message);
        process.exit(1);
    }
}

main();