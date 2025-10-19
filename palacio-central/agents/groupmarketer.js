// agents/groupmarketer.js - Venta orgánica en grupos de Facebook
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js';

const CWD = process.cwd();

console.log('[GroupMarketer] 👥 Agente iniciado - Estrategia orgánica en grupos.');

/**
 * GRUPOS TARGET (actualizados con IDs reales de Facebook)
 * IMPORTANTE: Estos son ejemplos, debes reemplazarlos con grupos reales donde estés como miembro
 */
const TARGET_GROUPS = [
  // Emprendedores Perú
  {
    id: 'emprendedores-peru', // Reemplazar con ID real
    name: 'Emprendedores Perú 🇵🇪',
    niche: 'business',
    dailyLimit: 1 // Max 1 post por día en este grupo
  },
  // Compradores Online
  {
    id: 'compras-online-peru',
    name: 'Compras Online Perú',
    niche: 'shopping',
    dailyLimit: 2
  },
  // Tecnología
  {
    id: 'tech-peru',
    name: 'Tecnología e Innovación Perú',
    niche: 'tech',
    dailyLimit: 1
  },
  // Mamás emprendedoras
  {
    id: 'mamas-emprendedoras',
    name: 'Mamás Emprendedoras Perú',
    niche: 'family',
    dailyLimit: 1
  },
  // Ofertas y descuentos
  {
    id: 'ofertas-peru',
    name: 'Ofertas y Descuentos Perú',
    niche: 'deals',
    dailyLimit: 2
  }
];

/**
 * Estrategia: Value-First Posting (80% valor, 20% venta)
 * NO spam directo, sino contenido educativo/entretenido con mención sutil del producto
 */
async function createValuePost(product, groupNiche) {
  const { productName, shopifyUrl, price, creativeContent } = product;
  
  // Adaptar mensaje según el nicho del grupo
  let post = '';
  
  switch (groupNiche) {
    case 'business':
      post = `💡 TIP de Productividad que cambió mi rutina:

Descubrí que pequeños gadgets pueden multiplicar tu eficiencia x3. 

Por ejemplo, algo tan simple como ${productName} me ayudó a:
✅ Ahorrar 2 horas diarias
✅ Trabajar más organizado
✅ Reducir el estrés

Cuesta menos de S/ ${price} y se paga solo en 1 semana.

¿Alguien más usa herramientas así? 👇

PD: Si te interesa, lo encuentras acá: ${shopifyUrl}

#ProductividadPeru #Emprendedores #TipsDeNegocio`;
      break;
      
    case 'shopping':
      post = `🛍️ HALLAZGO de esta semana:

Andaba buscando ${productName} hace rato y FINALMENTE encontré uno bueno en Perú.

Lo mejor:
💰 Precio: S/ ${price} (vi otros a S/ ${(parseFloat(price) * 1.5).toFixed(2)})
🚚 Delivery rápido
⭐ Ya lo probé - 10/10

Si alguien también lo necesita: ${shopifyUrl}

¿Qué cosas interesantes han comprado últimamente? 👇

#ComprasOnlinePeru #Recomendaciones`;
      break;
      
    case 'tech':
      post = `🚀 Tecnología que SÍ vale la pena (según mi experiencia):

${productName} - Parece simple, pero la tecnología detrás es INCREÍBLE.

Lo que me impresionó:
🔥 [Característica técnica 1]
⚡ [Característica técnica 2]
🎯 [Característica técnica 3]

Precio: S/ ${price} (esperaba que costara el doble)

Link para los curiosos: ${shopifyUrl}

¿Qué gadgets tech recomiendan ustedes? 🤓

#TechPeru #Innovación #Gadgets`;
      break;
      
    case 'family':
      post = `👨‍👩‍👧‍👦 Descubrimiento para mamás/papás ocupados:

${productName} me está salvando la vida últimamente.

Antes: [PROBLEMA familiar común]
Ahora: [SOLUCIÓN con el producto]

Precio: S/ ${price} (súper accesible)

Si te interesa: ${shopifyUrl}

¿Qué otros productos les han facilitado la vida familiar? 💕

#MamásPeru #VidaEnFamilia #TipsDeMamá`;
      break;
      
    case 'deals':
      post = `🔥 OFERTA REAL (no clickbait):

${productName} a S/ ${price}

Vi el mismo producto en otros lados a S/ ${(parseFloat(price) * 1.4).toFixed(2)}-${(parseFloat(price) * 1.6).toFixed(2)}

Link directo: ${shopifyUrl}

⏰ No sé cuánto dura la promo

¿Alguien ya lo compró? ¿Qué tal está? 👇

#OfertasPeru #Descuentos #ComprasInteligentes`;
      break;
      
    default:
      // Usar el copy original del Creative Agent
      post = creativeContent;
  }
  
  return post;
}

/**
 * Publica en un grupo de Facebook (REQUIERE permisos especiales)
 * NOTA: Facebook Graph API NO permite publicar en grupos ajenos sin aprobación
 * Alternativa: Usar Facebook's Publishing API o manual posting via Selenium
 */
async function publishToGroup(groupId, message) {
  const fbConfig = globalConfig.socialMedia?.facebook;
  
  if (!fbConfig || !fbConfig.accessToken) {
    console.error('[GroupMarketer] ❌ Credenciales de Facebook no encontradas.');
    return false;
  }
  
  console.log(`[GroupMarketer] 📤 Intentando publicar en grupo: ${groupId}`);
  
  try {
    // IMPORTANTE: Esto SOLO funciona si:
    // 1. Tu app tiene permiso "groups_access_member_info"
    // 2. El usuario dio permiso explícito
    // 3. Eres admin del grupo O el grupo permite posts de miembros
    
    const response = await fetch(`https://graph.facebook.com/v18.0/${groupId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        access_token: fbConfig.accessToken
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Error común: Grupos no permiten publicación via API
      if (errorData.error?.code === 200) {
        console.warn(`[GroupMarketer] ⚠️ Este grupo no permite publicación via API. Usar método manual.`);
        return 'manual_required';
      }
      
      console.error(`[GroupMarketer] ❌ Error Facebook API:`, errorData.error?.message);
      return false;
    }
    
    const result = await response.json();
    console.log(`[GroupMarketer] ✅ Publicado exitosamente! Post ID: ${result.id}`);
    return true;
    
  } catch (error) {
    console.error(`[GroupMarketer] ❌ Error al publicar:`, error.message);
    return false;
  }
}

/**
 * Proceso principal: Distribución orgánica estratégica
 */
async function distributeOrganic() {
  console.log('[GroupMarketer] 👥 Iniciando distribución orgánica en grupos...');
  
  try {
    // 1. Leer productos del Creative Agent
    const creativeDir = path.join(CWD, 'reports', 'creative');
    const creativeFiles = (await fs.readdir(creativeDir).catch(() => []))
      .filter(file => file.startsWith('creative-report-'))
      .sort()
      .reverse();
    
    if (creativeFiles.length === 0) {
      console.log('[GroupMarketer] ⚠️ No hay productos para distribuir. Terminando.');
      return;
    }
    
    const latestReport = path.join(creativeDir, creativeFiles[0]);
    const products = JSON.parse(await fs.readFile(latestReport, 'utf8'));
    console.log(`[GroupMarketer] 📂 Cargados ${products.length} productos.`);
    
    // 2. Cargar historial de publicaciones (para no repetir)
    const historyPath = path.join(CWD, 'temp', 'group-posting-history.json');
    let history = {};
    try {
      history = JSON.parse(await fs.readFile(historyPath, 'utf8'));
    } catch {
      console.log('[GroupMarketer] 📝 Creando nuevo historial de publicaciones.');
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (!history[today]) history[today] = {};
    
    // 3. Seleccionar 1-2 productos TOP para hoy
    const productsToPost = products.slice(0, 2); // Solo los 2 primeros
    
    // 4. Distribuir en grupos (respetando límites diarios)
    const postingResults = [];
    
    for (const product of productsToPost) {
      console.log(`[GroupMarketer] 🎯 Distribuyendo: ${product.productName}`);
      
      for (const group of TARGET_GROUPS) {
        // Verificar límite diario
        const groupKey = `${group.id}-${product.productName}`;
        const postsToday = history[today][groupKey] || 0;
        
        if (postsToday >= group.dailyLimit) {
          console.log(`[GroupMarketer] ⏭️ Límite alcanzado para ${group.name} hoy.`);
          continue;
        }
        
        // Crear post adaptado al nicho del grupo
        const valuePost = await createValuePost(product, group.niche);
        
        // Intentar publicar
        const result = await publishToGroup(group.id, valuePost);
        
        if (result === true) {
          // Éxito
          history[today][groupKey] = postsToday + 1;
          postingResults.push({
            product: product.productName,
            group: group.name,
            status: 'posted',
            timestamp: new Date().toISOString()
          });
          
          console.log(`[GroupMarketer] ✅ Publicado en ${group.name}`);
          
        } else if (result === 'manual_required') {
          // Guardar para publicación manual
          postingResults.push({
            product: product.productName,
            group: group.name,
            status: 'manual_required',
            post: valuePost,
            timestamp: new Date().toISOString()
          });
          
          console.log(`[GroupMarketer] 📋 Guardado para publicación manual en ${group.name}`);
        }
        
        // Rate limiting (no spam)
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5s entre grupos
      }
    }
    
    // 5. Guardar historial actualizado
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    
    // 6. Guardar posts pendientes manuales
    const manualPosts = postingResults.filter(r => r.status === 'manual_required');
    if (manualPosts.length > 0) {
      const manualDir = path.join(CWD, 'reports', 'manual-posts');
      await fs.mkdir(manualDir, { recursive: true });
      
      const manualPath = path.join(manualDir, `pending-${today}.json`);
      await fs.writeFile(manualPath, JSON.stringify(manualPosts, null, 2));
      
      console.log(`[GroupMarketer] 📋 ${manualPosts.length} posts guardados para publicación manual: ${manualPath}`);
    }
    
    // 7. Reporte final
    const reportDir = path.join(CWD, 'reports', 'group-marketing');
    await fs.mkdir(reportDir, { recursive: true });
    
    const reportPath = path.join(reportDir, `distribution-${today}.json`);
    await fs.writeFile(reportPath, JSON.stringify(postingResults, null, 2));
    
    console.log(`[GroupMarketer] ✅ Distribución completada!`);
    console.log(`[GroupMarketer] 📊 Posts automáticos: ${postingResults.filter(r => r.status === 'posted').length}`);
    console.log(`[GroupMarketer] 📋 Posts manuales pendientes: ${manualPosts.length}`);
    console.log(`[GroupMarketer] 💾 Reporte: ${reportPath}`);
    
  } catch (error) {
    console.error('[GroupMarketer] ❌ Error fatal:', error);
  }
}

// Ejecutar
distributeOrganic();
