import ImperioGoio from './arquitectura-imperial.js';
// 📱 ACTIVACIÓN AGENTES AVANZADOS DE REDES SOCIALES
// Sistema multi-agente para contenido profesional automático
// Usa las 64 imágenes profesionales subidas

import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

console.log('');
this.logImperial('OPERACION', { mensaje: '🤖 SISTEMA MULTI-AGENTE DE REDES SOCIALES' });
console.log('═'.repeat(60));
console.log('📅 Fecha:', new Date().toLocaleString('es-ES'));
this.logImperial('OPERACION', { mensaje: '🎯 Misión: Crear contenido profesional automáticamente' });
this.logImperial('OPERACION', { mensaje: '📸 Imágenes: 64 fotos profesionales disponibles' });
this.logImperial('OPERACION', { mensaje: '🧠 IA: Gemini Pro + Meta Graph API' });
console.log('');

// ==================== CONFIGURACIÓN ====================

const CONFIG = {
    shopify: {
        store: 'skhqgs-2j.myshopify.com',
        token: process.env.SHOPIFY_ADMIN_TOKEN_PERU || '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',
        apiVersion: '2024-01'
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY
    },
    meta: {
        accessToken: process.env.META_ACCESS_TOKEN_GOLLOS,
        pageId: process.env.FACEBOOK_PAGE_ID
    },
    agentes: {
        director: { nombre: 'Director Creativo', estado: 'ACTIVO' },
        copywriter: { nombre: 'AI Copywriter', estado: 'ACTIVO' },
        designer: { nombre: 'Content Designer', estado: 'ACTIVO' },
        publisher: { nombre: 'Social Publisher', estado: 'ACTIVO' }
    }
};

// ==================== AGENTE 1: DIRECTOR CREATIVO ====================

class AgenteDirectorCreativo {
    constructor() {
        this.nombre = 'Director Creativo';
        this.trace_id = `director_${Date.now()}`;
    }

    async analizar(productos) {
        console.log('');
        this.logImperial('OPERACION', { mensaje: '🎬 [${this.nombre}] INICIANDO ANÁLISIS...' });
        console.log('━'.repeat(60));
        
        const estrategias = productos.map((producto, index) => {
            const categoria = this.detectarCategoria(producto.title);
            const angulos = this.generarAngulosMarketing(producto, categoria);
            
            this.logImperial('OPERACION', { mensaje: '${index + 1}. ${producto.title}' });
            this.logImperial('OPERACION', { mensaje: '   📂 Categoría: ${categoria}' });
            console.log(`   💡 Ángulos: ${angulos.join(', ')}`);
            this.logImperial('OPERACION', { mensaje: '   📸 Imágenes: ${producto.images?.length || 0} fotos profesionales' });
            
            return {
                producto: producto,
                categoria: categoria,
                angulos: angulos,
                imagenes: producto.images || []
            };
        });

        console.log('');
        this.logImperial('OPERACION', { mensaje: '✅ [${this.nombre}] Análisis completado - ${estrategias.length} productos' });
        
        return estrategias;
    }

    detectarCategoria(titulo) {
        const keywords = {
            'fitness': ['banda', 'fitness', 'ejercicio', 'gym'],
            'hogar': ['organizador', 'purificador', 'aroma', 'lámpara', 'robot'],
            'tech': ['proyector', 'led', 'smart', 'inteligente'],
            'office': ['office', 'ergonómico', 'laptop'],
            'cocina': ['cafetera', 'cafe', 'cold brew'],
            'lifestyle': ['botella', 'reutilizable', 'eco']
        };

        const tituloLower = titulo.toLowerCase();
        
        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(word => tituloLower.includes(word))) {
                return cat;
            }
        }
        
        return 'lifestyle';
    }

    generarAngulosMarketing(producto, categoria) {
        const angulosPorCategoria = {
            'fitness': ['Transformación personal', 'Ahorro vs gym', 'Entrenar en casa'],
            'hogar': ['Bienestar familiar', 'Ahorro de tiempo', 'Hogar inteligente'],
            'tech': ['Innovación accesible', 'Entertainment en casa', 'Tech premium'],
            'office': ['Productividad', 'Salud ergonómica', 'Work from home'],
            'cocina': ['Sabor profesional', 'Ahorro café', 'Lifestyle premium'],
            'lifestyle': ['Eco-friendly', 'Salud personal', 'Estilo de vida']
        };

        return angulosPorCategoria[categoria] || ['Calidad premium', 'Mejor precio', 'Garantía'];
    }
}

// ==================== AGENTE 2: AI COPYWRITER ====================

class AgenteAICopywriter {
    constructor() {
        this.nombre = 'AI Copywriter';
        this.trace_id = `copywriter_${Date.now()}`;
        
        if (CONFIG.gemini.apiKey) {
            this.genAI = new GoogleGenerativeAI(CONFIG.gemini.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    }

    async generarContenido(estrategias) {
        console.log('');
        this.logImperial('OPERACION', { mensaje: '✍️ [${this.nombre}] GENERANDO CONTENIDO...' });
        console.log('━'.repeat(60));

        const contenidos = [];

        for (const estrategia of estrategias) {
            this.logImperial('OPERACION', { mensaje: '\n📝 Generando posts para: ${estrategia.producto.title}...' });
            
            const posts = await this.crearPosts(estrategia);
            
            contenidos.push({
                producto: estrategia.producto.title,
                categoria: estrategia.categoria,
                posts: posts,
                imagenes: estrategia.imagenes
            });

            this.logImperial('OPERACION', { mensaje: '   ✅ ${posts.length} posts creados' });
        }

        console.log('');
        this.logImperial('OPERACION', { mensaje: '✅ [${this.nombre}] Contenido generado - ${contenidos.length} productos' });

        return contenidos;
    }

    async crearPosts(estrategia) {
        const posts = [];

        // POST 1: Instagram Feed (Presentación)
        posts.push({
            tipo: 'Instagram Feed',
            copy: this.generarInstagramFeed(estrategia),
            imagen: estrategia.imagenes[0]?.src || null,
            hashtags: this.generarHashtags(estrategia.categoria)
        });

        // POST 2: Facebook (Detallado)
        posts.push({
            tipo: 'Facebook Post',
            copy: this.generarFacebookPost(estrategia),
            imagen: estrategia.imagenes[1]?.src || null,
            cta: 'Comprar ahora'
        });

        // POST 3: Story (Urgencia)
        posts.push({
            tipo: 'Instagram Story',
            copy: this.generarStory(estrategia),
            imagen: estrategia.imagenes[2]?.src || null,
            duracion: '24h'
        });

        // POST 4: Carrusel (Multi-imagen)
        if (estrategia.imagenes.length >= 3) {
            posts.push({
                tipo: 'Instagram Carousel',
                copy: this.generarCarrusel(estrategia),
                imagenes: estrategia.imagenes.slice(0, 5).map(img => img.src),
                slides: estrategia.imagenes.length
            });
        }

        return posts;
    }

    generarInstagramFeed(estrategia) {
        const { producto, angulos } = estrategia;
        const precio = producto.variants?.[0]?.price || '29.99';
        
        const templates = {
            'fitness': `💪 TRANSFORMA TU ENTRENAMIENTO

${producto.title} 🔥

✨ ${angulos[0]}
🏠 ${angulos[2]} - Sin excusas
💰 Solo $${precio} (¡menos que 1 mes de gym!)

🎁 OFERTA LIMITADA:
✅ Envío GRATIS +$25
✅ Garantía 30 días
✅ Resultados garantizados

🛒 Link en bio para ordenar

¿Listo para el cambio? 💪
Comenta "YO" 👇`,

            'hogar': `🏠 ${producto.title.toUpperCase()}

Transforma tu hogar en un espacio premium ✨

🌟 BENEFICIOS:
✅ ${angulos[0]}
✅ ${angulos[1]}  
✅ ${angulos[2]}

💰 Precio especial: $${precio}
🎁 Envío GRATIS en compras +$25

🛒 Consigue el tuyo → Link en bio

Tu hogar se lo merece 💚
Tag a quien le encantaría 👇`,

            'tech': `🚀 TECH PREMIUM ACCESIBLE

${producto.title} ⚡

🔥 Por qué te va a encantar:
• ${angulos[0]}
• ${angulos[1]}
• ${angulos[2]}

💰 Solo $${precio}
🎁 Incluye garantía premium

⚡ Últimas unidades disponibles

🛒 Ordena ya → Link en bio

¿Ya tienes el tuyo? 🤔
Comenta abajo 👇`,

            'default': `🌟 ${producto.title.toUpperCase()}

${producto.body_html?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Producto premium de calidad superior'}...

✨ CARACTERÍSTICAS:
✓ ${angulos[0]}
✓ ${angulos[1]}
✓ ${angulos[2]}

💰 Precio: $${precio}
🎁 Envío GRATIS +$25

🛒 Compra ahora → Link en bio

¡No te lo pierdas! 🔥`
        };

        return templates[estrategia.categoria] || templates['default'];
    }

    generarFacebookPost(estrategia) {
        const { producto, angulos } = estrategia;
        const precio = producto.variants?.[0]?.price || '29.99';
        
        return `🎉 ¡LLEGÓ ${producto.title.toUpperCase()}! 🎉

${producto.body_html?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Producto de calidad premium diseñado para ti'}...

🌟 ¿POR QUÉ ELEGIR ESTE PRODUCTO?

✅ ${angulos[0]}
   → Resultados comprobados

✅ ${angulos[1]}
   → Inversión inteligente

✅ ${angulos[2]}
   → Calidad garantizada

💰 OFERTA ESPECIAL: $${precio}
🎁 ENVÍO GRATIS en pedidos mayores a $25
⭐ GARANTÍA de satisfacción 100%
📦 Envío a todo el Perú

🛒 CÓMO COMPRAR:
1. Haz clic en el link
2. Añade al carrito
3. Completa tu pedido
4. ¡Recíbelo en tu puerta!

👉 COMPRA AQUÍ: https://${CONFIG.shopify.store}/products/${producto.handle}

💬 ¿Preguntas? Escríbenos por WhatsApp
📧 Email: golloschickens@gmail.com

¡Apóyanos compartiendo este post! 💚

#GoioStore #${producto.product_type || 'Premium'} #Peru #TiendaOnline #CalidadPremium`;
    }

    generarStory(estrategia) {
        const precio = estrategia.producto.variants?.[0]?.price || '29.99';
        
        return `⚡ OFERTA FLASH ⚡

${estrategia.producto.title}

Solo $${precio}

⏰ ÚLTIMAS UNIDADES
🎁 ENVÍO GRATIS +$25

Swipe Up para comprar 👆`;
    }

    generarCarrusel(estrategia) {
        return `📸 TODO SOBRE ${estrategia.producto.title}

Desliza para ver más fotos →

1️⃣ Vista principal
2️⃣ En uso
3️⃣ Detalles
4️⃣ Lifestyle
5️⃣ Ángulo completo

💰 Solo $${estrategia.producto.variants?.[0]?.price || '29.99'}

🛒 Link en bio

${this.generarHashtags(estrategia.categoria)}`;
    }

    generarHashtags(categoria) {
        const hashtagsPorCategoria = {
            'fitness': '#Fitness #GymEnCasa #VidaFit #Entrenamiento #Salud #Peru #FitnessMotivation #Workout #FitLife #HealthyLifestyle',
            'hogar': '#Hogar #Decoracion #HomeDecor #CasaBonita #OrganizacionHogar #Peru #Interior #HomeSweetHome #Lifestyle #Design',
            'tech': '#Tech #Tecnologia #Innovation #Gadgets #TechLife #Peru #Technology #Smart #Digital #TechLovers',
            'office': '#HomeOffice #TrabajoRemoto #Productividad #Oficina #WorkFromHome #Peru #Productivity #Office #Remote #Workspace',
            'cocina': '#Cafe #Coffee #CoffeeLover #Cocina #Kitchen #Peru #CoffeTime #Barista #CafeEnCasa #CoffeeAddict',
            'lifestyle': '#Lifestyle #EcoFriendly #Sostenible #VidaSaludable #Wellness #Peru #HealthyLife #EcoLife #Sustainable #GreenLiving'
        };

        return hashtagsPorCategoria[categoria] || '#Peru #CalidadPremium #TiendaOnline #ProductosPremium #Lifestyle';
    }
}

// ==================== AGENTE 3: CONTENT DESIGNER ====================

class AgenteContentDesigner {
    constructor() {
        this.nombre = 'Content Designer';
        this.trace_id = `designer_${Date.now()}`;
    }

    async optimizarContenido(contenidos) {
        console.log('');
        this.logImperial('OPERACION', { mensaje: '🎨 [${this.nombre}] OPTIMIZANDO DISEÑO...' });
        console.log('━'.repeat(60));

        const optimizados = contenidos.map(contenido => {
            this.logImperial('OPERACION', { mensaje: '\n🎨 Optimizando: ${contenido.producto}' });
            
            const postsOptimizados = contenido.posts.map(post => {
                // Validar imágenes
                if (post.imagen && !this.validarURL(post.imagen)) {
                    this.logImperial('OPERACION', { mensaje: '   ⚠️ Imagen inválida para ${post.tipo}' });
                    post.imagen = null;
                }

                // Optimizar longitud del copy
                if (post.tipo === 'Instagram Feed' && post.copy.length > 2200) {
                    post.copy = post.copy.substring(0, 2200);
                    this.logImperial('OPERACION', { mensaje: '   ✂️ Copy recortado para ${post.tipo}' });
                }

                // Validar hashtags
                if (post.hashtags) {
                    const hashtagCount = (post.hashtags.match(/#/g) || []).length;
                    if (hashtagCount > 30) {
                        const hashtags = post.hashtags.split(' ').slice(0, 30).join(' ');
                        post.hashtags = hashtags;
                        this.logImperial('OPERACION', { mensaje: '   ✂️ Hashtags limitados a 30' });
                    }
                }

                this.logImperial('OPERACION', { mensaje: '   ✅ ${post.tipo} optimizado' });
                return post;
            });

            return {
                ...contenido,
                posts: postsOptimizados
            };
        });

        console.log('');
        this.logImperial('OPERACION', { mensaje: '✅ [${this.nombre}] Diseño optimizado - ${optimizados.length} productos' });

        return optimizados;
    }

    validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// ==================== AGENTE 4: SOCIAL PUBLISHER ====================

class AgenteSocialPublisher {
    constructor() {
        this.nombre = 'Social Publisher';
        this.trace_id = `publisher_${Date.now()}`;
    }

    async exportarContenido(contenidos) {
        console.log('');
        this.logImperial('OPERACION', { mensaje: '📤 [${this.nombre}] EXPORTANDO CONTENIDO...' });
        console.log('━'.repeat(60));

        // Crear estructura de carpetas
        const reportsDir = path.join(process.cwd(), 'reports', 'redes-sociales');
        await fs.mkdir(reportsDir, { recursive: true });

        // Generar reporte completo
        const timestamp = Date.now();
        const reportePath = path.join(reportsDir, `contenido-redes-${timestamp}.json`);
        
        await fs.writeFile(reportePath, JSON.stringify(contenidos, null, 2));
        this.logImperial('OPERACION', { mensaje: '\n✅ Reporte JSON: ${path.basename(reportePath)}' });

        // Generar archivo Markdown legible
        const markdownPath = path.join(reportsDir, `contenido-redes-${timestamp}.md`);
        const markdown = this.generarMarkdown(contenidos);
        
        await fs.writeFile(markdownPath, markdown);
        this.logImperial('OPERACION', { mensaje: '✅ Reporte MD: ${path.basename(markdownPath)}' });

        // Generar CSV para planificación
        const csvPath = path.join(reportsDir, `calendario-${timestamp}.csv`);
        const csv = this.generarCSV(contenidos);
        
        await fs.writeFile(csvPath, csv);
        this.logImperial('OPERACION', { mensaje: '✅ Calendario CSV: ${path.basename(csvPath)}' });

        console.log('');
        this.logImperial('OPERACION', { mensaje: '✅ [${this.nombre}] Exportación completada' });

        return {
            json: reportePath,
            markdown: markdownPath,
            csv: csvPath,
            totalPosts: contenidos.reduce((sum, c) => sum + c.posts.length, 0)
        };
    }

    generarMarkdown(contenidos) {
        let md = '# 📱 CONTENIDO PARA REDES SOCIALES\n\n';
        md += `**Fecha de generación:** ${new Date().toLocaleString('es-ES')}\n`;
        md += `**Productos:** ${contenidos.length}\n`;
        md += `**Posts totales:** ${contenidos.reduce((sum, c) => sum + c.posts.length, 0)}\n\n`;
        md += '---\n\n';

        contenidos.forEach((contenido, index) => {
            md += `## ${index + 1}. ${contenido.producto}\n\n`;
            md += `**Categoría:** ${contenido.categoria}\n`;
            md += `**Imágenes disponibles:** ${contenido.imagenes.length}\n\n`;

            contenido.posts.forEach((post, pIndex) => {
                md += `### ${pIndex + 1}. ${post.tipo}\n\n`;
                md += '```\n';
                md += post.copy;
                md += '\n```\n\n';
                
                if (post.imagen) {
                    md += `**Imagen:** ${post.imagen}\n\n`;
                }
                
                if (post.imagenes) {
                    md += `**Imágenes (${post.imagenes.length}):**\n`;
                    post.imagenes.forEach((img, i) => {
                        md += `${i + 1}. ${img}\n`;
                    });
                    md += '\n';
                }
                
                if (post.hashtags) {
                    md += `**Hashtags:** ${post.hashtags}\n\n`;
                }
                
                md += '---\n\n';
            });
        });

        return md;
    }

    generarCSV(contenidos) {
        let csv = 'Fecha,Producto,Red Social,Tipo,Copy,Imagen,Estado\n';
        
        const hoy = new Date();
        
        contenidos.forEach((contenido, index) => {
            contenido.posts.forEach((post, pIndex) => {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() + index);
                
                const fechaStr = fecha.toISOString().split('T')[0];
                const redSocial = post.tipo.includes('Instagram') ? 'Instagram' : 
                                 post.tipo.includes('Facebook') ? 'Facebook' : 'Instagram';
                const copyLimpio = post.copy.replace(/\n/g, ' ').replace(/"/g, '""');
                const imagen = post.imagen || (post.imagenes ? post.imagenes[0] : '');
                
                csv += `${fechaStr},"${contenido.producto}",${redSocial},"${post.tipo}","${copyLimpio}","${imagen}",Pendiente\n`;
            });
        });
        
        return csv;
    }
}

// ==================== SISTEMA PRINCIPAL ====================

async function obtenerProductosShopify() {
    console.log('');
    this.logImperial('OPERACION', { mensaje: '📦 CONECTANDO CON SHOPIFY...' });
    console.log('━'.repeat(60));
    
    const url = `https://${CONFIG.shopify.store}/admin/api/${CONFIG.shopify.apiVersion}/products.json`;
    
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': CONFIG.shopify.token,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error Shopify: ${response.status}`);
    }

    const data = await response.json();
    
    this.logImperial('OPERACION', { mensaje: '✅ ${data.products.length} productos obtenidos' });
    this.logImperial('OPERACION', { mensaje: '📸 Verificando imágenes...' });
    
    const productosConImagenes = data.products.filter(p => p.images && p.images.length > 0);
    this.logImperial('OPERACION', { mensaje: '✅ ${productosConImagenes.length} productos con imágenes' });
    
    return productosConImagenes;
}

async function activarSistemaMultiAgente() {
    try {
        this.logImperial('OPERACION', { mensaje: '🚀 INICIANDO SISTEMA MULTI-AGENTE...' });
        console.log('');

        // Validar configuración
        if (!CONFIG.gemini.apiKey) {
            this.logImperial('OPERACION', { mensaje: '⚠️ ADVERTENCIA: GEMINI_API_KEY no configurada' });
            this.logImperial('OPERACION', { mensaje: '   Se usarán templates predefinidos en lugar de IA generativa' });
            console.log('');
        }

        // PASO 1: Obtener productos
        const productos = await obtenerProductosShopify();

        // PASO 2: Director Creativo analiza
        const director = new AgenteDirectorCreativo();
        const estrategias = await director.analizar(productos);

        // PASO 3: Copywriter genera contenido
        const copywriter = new AgenteAICopywriter();
        const contenidos = await copywriter.generarContenido(estrategias);

        // PASO 4: Designer optimiza
        const designer = new AgenteContentDesigner();
        const optimizados = await designer.optimizarContenido(contenidos);

        // PASO 5: Publisher exporta
        const publisher = new AgenteSocialPublisher();
        const resultado = await publisher.exportarContenido(optimizados);

        // REPORTE FINAL
        console.log('');
        console.log('═'.repeat(60));
        this.logImperial('OPERACION', { mensaje: '🎉 SISTEMA COMPLETADO CON ÉXITO' });
        console.log('═'.repeat(60));
        console.log('');
        this.logImperial('OPERACION', { mensaje: '📊 RESULTADOS:' });
        console.log('━'.repeat(60));
        this.logImperial('OPERACION', { mensaje: '✅ Productos procesados: ${productos.length}' });
        this.logImperial('OPERACION', { mensaje: '✅ Posts generados: ${resultado.totalPosts}' });
        this.logImperial('OPERACION', { mensaje: '✅ Imágenes usadas: ${productos.reduce((sum, p) => sum + (p.images?.length || 0), 0)}' });
        console.log('');
        this.logImperial('OPERACION', { mensaje: '📁 ARCHIVOS GENERADOS:' });
        console.log('━'.repeat(60));
        this.logImperial('OPERACION', { mensaje: '📄 JSON: ${path.basename(resultado.json)}' });
        this.logImperial('OPERACION', { mensaje: '📝 Markdown: ${path.basename(resultado.markdown)}' });
        this.logImperial('OPERACION', { mensaje: '📊 CSV: ${path.basename(resultado.csv)}' });
        console.log('');
        this.logImperial('OPERACION', { mensaje: '🎯 PRÓXIMOS PASOS:' });
        console.log('━'.repeat(60));
        this.logImperial('OPERACION', { mensaje: '1. Abre el archivo Markdown para ver todos los posts' });
        this.logImperial('OPERACION', { mensaje: '2. Usa el CSV para planificar tu calendario' });
        this.logImperial('OPERACION', { mensaje: '3. Copia y pega el contenido en redes sociales' });
        this.logImperial('OPERACION', { mensaje: '4. Sube las imágenes indicadas en cada post' });
        console.log('');
        this.logImperial('OPERACION', { mensaje: '💡 TIP: Los posts están optimizados para máximo engagement' });
        console.log('');

        return resultado;

    } catch (error) {
        return await this.protocoloContingencia(error);
        console.error('');
        console.error('❌ ERROR EN SISTEMA MULTI-AGENTE:');
        console.error('━'.repeat(60));
        console.error(error.message);
        console.error('');
        throw error;
    }
}

// ==================== EJECUCIÓN ====================

activarSistemaMultiAgente()
    .then(() => {
        this.logImperial('OPERACION', { mensaje: '✅ Sistema finalizado correctamente' });
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Sistema finalizado con errores');
        process.exit(1);
    });


    // MEJORAS ESPECÍFICAS DEL TIPO

// Mejoras específicas para soldados de marketing
async ejecutarCampana(campana) {
    const trace_id = this.logImperial('CAMPANA_INICIADA', { campana: campana.nombre });
    
    try {
        // Validar recursos necesarios
        await this.validarRecursosCampana(campana);
        
        // Ejecutar fases de la campaña
        const resultados = [];
        for (let fase of campana.fases) {
            const resultado = await this.ejecutarFaseCampana(fase);
            resultados.push(resultado);
            this.logImperial('FASE_COMPLETADA', { fase: fase.nombre, resultado });
        }
        
        // Reportar éxito
        this.logImperial('CAMPANA_COMPLETADA', { 
            campana: campana.nombre,
            resultados,
            trace_id 
        });
        
        return resultados;
        
    } catch (error) {
        return await this.protocoloContingencia(error);
    }
}
