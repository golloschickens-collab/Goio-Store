// agents/publisher.js
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js'; // Importar la configuración global

// --- Configuración y Validación Inicial ---
if (!process.argv[2]) {
  console.error('[Publisher] Error Crítico: Este agente debe ser ejecutado por el supervisor y recibir una configuración.');
  process.exit(1);
}

const agentConfig = JSON.parse(process.argv[2]);
console.log('[Publisher] Agente iniciado. Órdenes recibidas:', agentConfig.tareas);

const CWD = process.cwd();

// --- Lógica Principal de Publicación ---
async function publishContent() {
  console.log('[Publisher] Tarea: Publicar contenido creativo en redes sociales.');

  try {
    // 1. Cargar credenciales de Facebook desde la configuración global
    const fbConfig = globalConfig.socialMedia?.facebook;
    if (!fbConfig || !fbConfig.pageId || !fbConfig.accessToken) {
      console.error('[Publisher] ❌ Error: Credenciales de Facebook (FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN) no encontradas en el archivo .env o en config.js. No se puede proceder.');
      return;
    }

    // 2. Leer el reporte creativo más reciente (generado por creative.js)
    const creativeReportDir = path.join(CWD, 'reports', 'creative');
    const creativeFiles = (await fs.readdir(creativeReportDir).catch(() => [])).filter(f => f.endsWith('.json'));
    
    if (creativeFiles.length === 0) {
        console.log('[Publisher] No se encontraron reportes creativos para procesar. Terminando.');
        return;
    }

    const latestCreativeReport = creativeFiles.sort().pop();
    const reportPath = path.join(creativeReportDir, latestCreativeReport);
    const creativeReportContent = await fs.readFile(reportPath, 'utf8');
    const creativeData = JSON.parse(creativeReportContent);
    console.log(`[Publisher]  Cargado el informe creativo: ${latestCreativeReport}`);

    if (!creativeData || creativeData.length === 0) {
      console.log('[Publisher] No hay contenido creativo para publicar. Terminando.');
      return;
    }

    // 3. Publicar en Facebook CON IMAGEN
    for (const item of creativeData) {
      const message = item.creativeContent;
      const imageUrl = item.imageUrl; // URL de la imagen de Shopify
      
      console.log(`[Publisher] 📸 Publicando con IMAGEN para ${item.productName}...`);
      
      try {
        let fbRes;
        
        // Si hay imagen, publicar como PHOTO (no solo texto)
        if (imageUrl) {
          fbRes = await fetch(`https://graph.facebook.com/v18.0/${fbConfig.pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: imageUrl,
              caption: message,
              access_token: fbConfig.accessToken
            })
          });
        } else {
          // Fallback: Post solo texto (como antes)
          fbRes = await fetch(`https://graph.facebook.com/v18.0/${fbConfig.pageId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              access_token: fbConfig.accessToken
            })
          });
        }
        
        const fbResponseJson = await fbRes.json();

        if (!fbRes.ok) {
          console.error(`[Publisher] ❌ Error al publicar para ${item.productName}.`);
          console.error(`[Publisher] Respuesta de Facebook:`, fbResponseJson);
        } else {
          const postId = fbResponseJson.id || fbResponseJson.post_id;
          const postUrl = `https://www.facebook.com/${postId}`;
          console.log(`[Publisher] ✅ Publicado con IMAGEN para ${item.productName}`);
          console.log(`[Publisher] 🔗 Post ID: ${postId}`);
          console.log(`[Publisher] 🌐 URL: ${postUrl}`);
          console.log(`[Publisher] 🛒 Shopify: ${item.shopifyUrl}`);
        }
      } catch (e) {
        console.error(`[Publisher] ❌ Fallo la conexión a Facebook para ${item.productName}:`, e);
      }
      
      // Rate limiting (Facebook: 200 calls/hour)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre posts
    }

    console.log('[Publisher] Tarea de publicación completada.');

  } catch (error) {
    console.error('[Publisher] Ocurrió un error fatal durante la ejecución:', error);
  }
}

publishContent();
