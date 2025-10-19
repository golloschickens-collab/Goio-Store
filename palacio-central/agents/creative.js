// agents/creative.js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';

const CWD = process.cwd();

console.log('[Creative] Agente iniciado.');

async function generateCreativeContent() {
  console.log('[Creative] Tarea: Generar ideas de contenido y copy para productos encontrados.');

  try {
    // 1. Cargar la clave de API de Google
    const keysPath = path.join(CWD, 'config', 'keys.json');
    const keysFile = await fs.readFile(keysPath, 'utf8');
    const keys = JSON.parse(keysFile);
  const genAI = new GoogleGenerativeAI(keys.google_api_key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('[Creative] Cliente de IA de Google inicializado.');

    // 2. Leer productos de Shopify (con URLs creadas)
    const shopifyDir = path.join(CWD, 'reports', 'shopify');
    const shopifyFiles = (await fs.readdir(shopifyDir).catch(() => []))
      .filter(file => file.startsWith('shopify-products-'))
      .sort()
      .reverse();

    if (shopifyFiles.length === 0) {
      console.log('[Creative] ⚠️ No se encontraron productos de Shopify. Terminando.');
      return;
    }

    const latestShopifyReport = path.join(shopifyDir, shopifyFiles[0]);
    const shopifyData = JSON.parse(await fs.readFile(latestShopifyReport, 'utf8'));
    console.log(`[Creative] 📂 Cargados ${shopifyData.length} productos desde Shopify: ${shopifyFiles[0]}`);

    // 3. Leer el prompt base
    const promptPath = path.join(CWD, 'prompts', 'creative_prompt.txt');
    const promptTemplate = await fs.readFile(promptPath, 'utf8');
    console.log('[Creative] Plantilla de prompt cargada.');

    const creativeOutputs = [];

    // 4. Generar copy PERSUASIVO para cada producto (con URL Shopify)
    for (const product of shopifyData) {
      console.log(`[Creative] 🎯 Procesando: ${product.productName}`);
      
      // Prompt mejorado con frameworks de ventas
      const enhancedPrompt = `
Crea un post de Facebook ALTAMENTE PERSUASIVO para este producto:

PRODUCTO: ${product.productName}
PRECIO: S/ ${product.price}
URL: ${product.url}

FRAMEWORKS A USAR:
1. HOOK emocional (primeras 2 líneas): Genera curiosidad o deseo instantáneo
2. BENEFICIOS (no características): Qué problema resuelve
3. PRUEBA SOCIAL: "Miles ya lo están usando" o estadística impactante
4. URGENCIA: Stock limitado o promoción temporal
5. CTA CLARA: "Compra ahora en 👉 [URL]"

ESTILO:
- Lenguaje conversacional (tutear)
- Emojis estratégicos (3-5 máximo)
- Párrafos cortos (máx 2 líneas)
- Precio visible y atractivo

EJEMPLO DE ESTRUCTURA:
[HOOK EMOCIONAL con pregunta]

[BENEFICIO PRINCIPAL]

[PRUEBA SOCIAL]

[URGENCIA + PRECIO]

[CTA con URL]

Genera SOLO el texto del post, sin explicaciones adicionales.`;

      let generatedText;
      try {
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        generatedText = response.text();
        
        // Asegurar que la URL esté en el copy
        if (!generatedText.includes(product.url)) {
          generatedText += `\n\n👉 Compra ahora: ${product.url}\n\n#GoioStorePeru #Innovación #Tendencias`;
        }
        
      } catch (iaError) {
        console.warn(`[Creative] ⚠️ IA no disponible. Usando template premium para ${product.productName}`);
        
        // Template de respaldo con estructura de ventas
        generatedText = `🔥 ¿Cansado de [PROBLEMA]? 

${product.productName} es la solución que estabas esperando.

✅ [BENEFICIO 1]
✅ [BENEFICIO 2]  
✅ [BENEFICIO 3]

Más de 10,000 personas ya lo están usando en todo Perú 🇵🇪

💰 HOY: Solo S/ ${product.price} (precio normal S/ ${(parseFloat(product.price) * 1.3).toFixed(2)})

⏰ Stock limitado - Los últimos 15 se están agotando AHORA

👉 Compra aquí: ${product.url}

#GoioStorePeru #Innovación #TendenciasPeru #CompraOnline`;
      }

      creativeOutputs.push({
        productName: product.productName,
        shopifyUrl: product.url,
        price: product.price,
        imageUrl: product.imageUrl,
        creativeContent: generatedText,
        shopifyId: product.shopifyId
      });
      console.log(`[Creative] ✅ Copy persuasivo generado para: ${product.productName}`);
    }

    // 5. Guardar los resultados en `reports/creative/`
    const reportDir = path.join(CWD, 'reports', 'creative');
    await fs.mkdir(reportDir, { recursive: true });
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `creative-report-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(creativeOutputs, null, 2));

    console.log(`[Creative] Tarea completada. Informe creativo guardado en: ${reportPath}`);

  } catch (error) {
    console.error('[Creative] Ocurrió un error durante la ejecución:', error);
  }
}

generateCreativeContent();