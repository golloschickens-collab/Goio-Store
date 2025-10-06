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

    // 3. Publicar en Facebook
    for (const item of creativeData) {
      const message = item.creativeContent; // Usamos el contenido creativo completo
      console.log(`[Publisher] Intentando publicar en Facebook para ${item.productName}...`);
      
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v18.0/${fbConfig.pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, access_token: fbConfig.accessToken })
        });
        
        const fbResponseJson = await fbRes.json();

        if (!fbRes.ok) {
          console.error(`[Publisher] ❌ Error al publicar en Facebook para ${item.productName}.`);
          console.error(`[Publisher] Respuesta de Facebook:`, fbResponseJson);
        } else {
          console.log(`[Publisher] ✅ Publicado en Facebook para ${item.productName}. Post ID: ${fbResponseJson.id}`);
        }
      } catch (e) {
        console.error(`[Publisher] ❌ Fallo la conexión a Facebook para ${item.productName}:`, e);
      }
    }

    console.log('[Publisher] Tarea de publicación completada.');

  } catch (error) {
    console.error('[Publisher] Ocurrió un error fatal durante la ejecución:', error);
  }
}

publishContent();
