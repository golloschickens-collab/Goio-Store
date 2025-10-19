// agents/engagement.js - Responde comentarios automáticamente 24/7
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js';

const CWD = process.cwd();

console.log('[Engagement] 💬 Agente iniciado - Respuestas automáticas 24/7.');

/**
 * Obtiene comentarios de un post de Facebook
 */
async function getPostComments(postId) {
  const fbConfig = globalConfig.socialMedia?.facebook;
  
  if (!fbConfig || !fbConfig.accessToken) {
    console.error('[Engagement] ❌ Credenciales de Facebook no encontradas.');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/comments?fields=id,message,from,created_time&access_token=${fbConfig.accessToken}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Engagement] ❌ Error al obtener comentarios:', errorData.error?.message);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
    
  } catch (error) {
    console.error('[Engagement] ❌ Error al obtener comentarios:', error.message);
    return [];
  }
}

/**
 * Genera respuesta inteligente con IA
 */
async function generateSmartReply(comment, productContext) {
  const keysPath = path.join(CWD, 'config', 'keys.json');
  const keysFile = await fs.readFile(keysPath, 'utf8');
  const keys = JSON.parse(keysFile);
  
  const genAI = new GoogleGenerativeAI(keys.google_api_key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Eres el community manager de Goio Store Peru, una tienda de productos innovadores.

CONTEXTO DEL PRODUCTO:
- Nombre: ${productContext.productName}
- Precio: S/ ${productContext.price}
- URL: ${productContext.shopifyUrl}

COMENTARIO DEL USUARIO:
"${comment.message}"

INSTRUCCIONES:
1. Si es una PREGUNTA → Responde de forma útil y amigable
2. Si es un INTERÉS → Motiva la compra sin ser agresivo
3. Si es POSITIVO → Agradece y ofrece ayuda
4. Si es NEGATIVO → Responde empáticamente y ofrece solución

REGLAS:
- Máximo 2-3 líneas
- Tono conversacional y peruano (usar "pe", "causa" cuando sea natural)
- Incluir emoji relevante (1 máximo)
- Si preguntan por precio/link, mencionar: S/ ${productContext.price} - ${productContext.shopifyUrl}
- NO usar lenguaje robótico o corporativo

Genera SOLO la respuesta, sin comillas ni explicaciones.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.warn('[Engagement] ⚠️ IA no disponible, usando respuesta template.');
    
    // Template de respuesta genérica
    if (comment.message.toLowerCase().includes('precio')) {
      return `¡Hola! El precio es S/ ${productContext.price} 😊 Aquí el link: ${productContext.shopifyUrl}`;
    } else if (comment.message.toLowerCase().includes('link')) {
      return `¡Claro! Aquí está: ${productContext.shopifyUrl} 🛒`;
    } else if (comment.message.toLowerCase().includes('envío') || comment.message.toLowerCase().includes('delivery')) {
      return `Hacemos envíos a todo Perú 🇵🇪 El costo lo ves al momento de pagar. Link: ${productContext.shopifyUrl}`;
    } else {
      return `¡Gracias por tu interés! 😊 Cualquier duda, escríbeme. Link del producto: ${productContext.shopifyUrl}`;
    }
  }
}

/**
 * Responde a un comentario en Facebook
 */
async function replyToComment(commentId, replyText) {
  const fbConfig = globalConfig.socialMedia?.facebook;
  
  if (!fbConfig || !fbConfig.accessToken) {
    console.error('[Engagement] ❌ Credenciales de Facebook no encontradas.');
    return false;
  }
  
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${commentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: replyText,
        access_token: fbConfig.accessToken
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Engagement] ❌ Error al responder:', errorData.error?.message);
      return false;
    }
    
    const result = await response.json();
    console.log(`[Engagement] ✅ Respuesta enviada. Comment ID: ${result.id}`);
    return true;
    
  } catch (error) {
    console.error('[Engagement] ❌ Error al responder:', error.message);
    return false;
  }
}

/**
 * Proceso principal: Monitorea y responde comentarios
 */
async function monitorAndRespond() {
  console.log('[Engagement] 💬 Iniciando monitoreo de comentarios...');
  
  try {
    // 1. Leer posts recientes del Publisher
    const publisherDir = path.join(CWD, 'reports', 'publisher');
    let recentPosts = [];
    
    // Si no existe el directorio, buscar en logs o usar Facebook API
    // Por ahora, vamos a buscar posts de la página directamente
    
    const fbConfig = globalConfig.socialMedia?.facebook;
    if (!fbConfig || !fbConfig.pageId || !fbConfig.accessToken) {
      console.error('[Engagement] ❌ Credenciales no encontradas.');
      return;
    }
    
    // Obtener posts recientes de la página
    console.log('[Engagement] 📡 Obteniendo posts recientes de Facebook...');
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${fbConfig.pageId}/posts?fields=id,message,created_time&limit=10&access_token=${fbConfig.accessToken}`
    );
    
    if (!postsResponse.ok) {
      console.error('[Engagement] ❌ Error al obtener posts.');
      return;
    }
    
    const postsData = await postsResponse.json();
    recentPosts = postsData.data || [];
    console.log(`[Engagement] 📊 Encontrados ${recentPosts.length} posts recientes.`);
    
    // 2. Cargar contexto de productos
    const creativeDir = path.join(CWD, 'reports', 'creative');
    const creativeFiles = (await fs.readdir(creativeDir).catch(() => []))
      .filter(file => file.startsWith('creative-report-'))
      .sort()
      .reverse();
    
    let productContexts = [];
    if (creativeFiles.length > 0) {
      const latestReport = path.join(creativeDir, creativeFiles[0]);
      productContexts = JSON.parse(await fs.readFile(latestReport, 'utf8'));
    }
    
    // 3. Cargar historial de comentarios respondidos
    const historyPath = path.join(CWD, 'temp', 'engagement-history.json');
    let respondedComments = new Set();
    try {
      const history = JSON.parse(await fs.readFile(historyPath, 'utf8'));
      respondedComments = new Set(history.respondedIds || []);
    } catch {
      console.log('[Engagement] 📝 Creando nuevo historial de engagement.');
    }
    
    // 4. Procesar cada post
    const engagementLog = [];
    
    for (const post of recentPosts) {
      console.log(`[Engagement] 🔍 Revisando post: ${post.id}`);
      
      // Obtener comentarios del post
      const comments = await getPostComments(post.id);
      
      if (comments.length === 0) {
        console.log(`[Engagement] 💭 Sin comentarios en este post.`);
        continue;
      }
      
      console.log(`[Engagement] 💬 ${comments.length} comentarios encontrados.`);
      
      // Buscar contexto del producto (basado en el mensaje del post)
      const productContext = productContexts.find(p => 
        post.message?.includes(p.productName)
      ) || {
        productName: 'producto',
        price: '79.90',
        shopifyUrl: 'https://skhqgs-2j.myshopify.com'
      };
      
      // Responder comentarios NO respondidos
      for (const comment of comments) {
        if (respondedComments.has(comment.id)) {
          console.log(`[Engagement] ⏭️ Comentario ya respondido: ${comment.id}`);
          continue;
        }
        
        console.log(`[Engagement] 💬 Nuevo comentario de ${comment.from.name}: "${comment.message}"`);
        
        // Generar respuesta inteligente
        const reply = await generateSmartReply(comment, productContext);
        console.log(`[Engagement] 🤖 Respuesta generada: "${reply}"`);
        
        // Enviar respuesta
        const success = await replyToComment(comment.id, reply);
        
        if (success) {
          respondedComments.add(comment.id);
          engagementLog.push({
            postId: post.id,
            commentId: comment.id,
            userName: comment.from.name,
            userComment: comment.message,
            botReply: reply,
            timestamp: new Date().toISOString()
          });
          
          console.log(`[Engagement] ✅ Respuesta enviada a ${comment.from.name}`);
        }
        
        // Rate limiting (no saturar)
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3s entre respuestas
      }
      
      // Pausa entre posts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 5. Guardar historial actualizado
    await fs.writeFile(historyPath, JSON.stringify({
      respondedIds: Array.from(respondedComments),
      lastUpdate: new Date().toISOString()
    }, null, 2));
    
    // 6. Guardar log de engagement
    if (engagementLog.length > 0) {
      const reportDir = path.join(CWD, 'reports', 'engagement');
      await fs.mkdir(reportDir, { recursive: true });
      
      const date = new Date().toISOString().split('T')[0];
      const reportPath = path.join(reportDir, `engagement-${date}.json`);
      
      let existingLog = [];
      try {
        existingLog = JSON.parse(await fs.readFile(reportPath, 'utf8'));
      } catch {}
      
      existingLog.push(...engagementLog);
      await fs.writeFile(reportPath, JSON.stringify(existingLog, null, 2));
      
      console.log(`[Engagement] ✅ ${engagementLog.length} respuestas enviadas hoy!`);
      console.log(`[Engagement] 💾 Log guardado: ${reportPath}`);
    } else {
      console.log(`[Engagement] 💤 No hay comentarios nuevos por responder.`);
    }
    
  } catch (error) {
    console.error('[Engagement] ❌ Error fatal:', error);
  }
}

// Ejecutar
monitorAndRespond();
