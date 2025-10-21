/**
 * 🔍 AGENTE SHERLOCK - INVESTIGADOR DE CONOCIMIENTO
 * 
 * Capacidades:
 * 1. Buscar videos en YouTube por tema
 * 2. Analizar calidad de recursos con Gemini AI
 * 3. Explorar índice de cursos propios (Drive/Terabox)
 * 4. Buscar documentación en internet (Google Custom Search)
 * 5. Recomendar top 3 fuentes por tema
 * 
 * Nivel: ELITE - Siempre actualizado, siempre experto
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class SherlockInvestigador {
  constructor(config) {
    this.geminiApiKey = config.geminiApiKey;
    this.youtubeApiKey = config.youtubeApiKey;
    this.customSearchApiKey = config.customSearchApiKey;
    this.customSearchEngineId = config.customSearchEngineId;
    
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Índice de conocimiento propio
    this.knowledgeIndexPath = path.join(__dirname, '../knowledge-base/index.json');
    this.knowledgeIndex = null;
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Buscar conocimiento experto sobre un tema
   * 
   * @param {string} tema - Tema a investigar (ej: "Google Shopping Ads")
   * @param {string} nivel - Nivel deseado: "básico", "intermedio", "senior", "experto"
   * @param {object} opciones - { buscarYouTube, buscarInternet, buscarPropio }
   * @returns {object} Top 3 fuentes recomendadas con análisis
   */
  async buscarConocimiento(tema, nivel = 'senior', opciones = {}) {
    console.log(`\n🔍 [SHERLOCK] Investigando: "${tema}" (nivel ${nivel})`);
    
    const config = {
      buscarPropio: opciones.buscarPropio !== false,
      buscarYouTube: opciones.buscarYouTube !== false,
      buscarInternet: opciones.buscarInternet !== false,
      maxResultados: opciones.maxResultados || 3
    };
    
    const resultados = {
      tema,
      nivel,
      timestamp: new Date().toISOString(),
      fuentes: [],
      recomendaciones: []
    };
    
    try {
      // 1. Buscar en conocimiento propio primero (más rápido)
      if (config.buscarPropio) {
        console.log('📚 [1/3] Buscando en biblioteca propia...');
        const propios = await this.buscarEnIndicePropio(tema, nivel);
        resultados.fuentes.push(...propios);
      }
      
      // 2. Buscar en YouTube
      if (config.buscarYouTube) {
        console.log('🎥 [2/3] Buscando videos en YouTube...');
        const videos = await this.buscarEnYouTube(tema, nivel);
        resultados.fuentes.push(...videos);
      }
      
      // 3. Buscar en internet
      if (config.buscarInternet) {
        console.log('🌐 [3/3] Buscando en internet...');
        const webResults = await this.buscarEnInternet(tema, nivel);
        resultados.fuentes.push(...webResults);
      }
      
      // 4. Analizar y rankear con Gemini AI
      console.log('🤖 Analizando calidad con Gemini AI...');
      const rankeadas = await this.analizarYRankear(resultados.fuentes, tema, nivel);
      
      // 5. Seleccionar top 3
      resultados.recomendaciones = rankeadas.slice(0, config.maxResultados);
      
      console.log(`\n✅ [SHERLOCK] Encontradas ${resultados.fuentes.length} fuentes`);
      console.log(`🏆 Top ${config.maxResultados} recomendadas\n`);
      
      return resultados;
      
    } catch (error) {
      console.error('❌ [SHERLOCK] Error en investigación:', error.message);
      return {
        ...resultados,
        error: error.message
      };
    }
  }

  /**
   * 📚 Buscar en índice de cursos propios
   */
  async buscarEnIndicePropio(tema, nivel) {
    try {
      // Cargar índice si no está en memoria
      if (!this.knowledgeIndex) {
        const indexExists = await fs.access(this.knowledgeIndexPath).then(() => true).catch(() => false);
        
        if (!indexExists) {
          console.log('⚠️  Índice no encontrado, creando uno nuevo...');
          await this.crearIndiceVacio();
        }
        
        const indexData = await fs.readFile(this.knowledgeIndexPath, 'utf-8');
        this.knowledgeIndex = JSON.parse(indexData);
      }
      
      // Buscar coincidencias por keywords
      const matches = this.knowledgeIndex.recursos.filter(recurso => {
        const temaLower = tema.toLowerCase();
        const keywords = recurso.keywords?.map(k => k.toLowerCase()) || [];
        const titulo = recurso.titulo?.toLowerCase() || '';
        const descripcion = recurso.descripcion?.toLowerCase() || '';
        
        return keywords.some(k => k.includes(temaLower) || temaLower.includes(k)) ||
               titulo.includes(temaLower) ||
               descripcion.includes(temaLower);
      });
      
      // Filtrar por nivel si está especificado
      const filtered = matches.filter(m => {
        if (!m.nivel) return true;
        const niveles = ['básico', 'intermedio', 'avanzado', 'senior', 'experto'];
        const nivelIdx = niveles.indexOf(nivel.toLowerCase());
        const recursoIdx = niveles.indexOf(m.nivel.toLowerCase());
        return recursoIdx >= nivelIdx - 1; // Acepta nivel pedido o superior
      });
      
      return filtered.map(recurso => ({
        tipo: 'PROPIO',
        origen: recurso.tipo || 'desconocido',
        titulo: recurso.titulo,
        descripcion: recurso.descripcion,
        url: recurso.url || recurso.ruta,
        nivel: recurso.nivel,
        duracion: recurso.duracion,
        formato: recurso.formato,
        fecha_agregado: recurso.fecha_agregado,
        score_relevancia: 100 // Propio siempre es más relevante
      }));
      
    } catch (error) {
      console.log('⚠️  Error leyendo índice propio:', error.message);
      return [];
    }
  }

  /**
   * 🎥 Buscar videos relevantes en YouTube
   */
  async buscarEnYouTube(tema, nivel) {
    if (!this.youtubeApiKey) {
      console.log('⚠️  YouTube API key no configurada');
      return [];
    }
    
    try {
      // Optimizar query según nivel
      const queries = this.generarQueriesYouTube(tema, nivel);
      const todosLosResultados = [];
      
      for (const query of queries) {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: this.youtubeApiKey,
            q: query,
            part: 'snippet',
            type: 'video',
            maxResults: 5,
            order: 'relevance',
            videoDuration: nivel === 'senior' || nivel === 'experto' ? 'long' : 'any',
            videoDefinition: 'high'
          }
        });
        
        for (const item of response.data.items) {
          // Obtener detalles adicionales (duración, vistas)
          const detalles = await this.obtenerDetallesVideo(item.id.videoId);
          
          todosLosResultados.push({
            tipo: 'YOUTUBE',
            origen: 'YouTube',
            video_id: item.id.videoId,
            titulo: item.snippet.title,
            descripcion: item.snippet.description,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            canal: item.snippet.channelTitle,
            publicado: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.high.url,
            ...detalles
          });
        }
      }
      
      return todosLosResultados;
      
    } catch (error) {
      console.error('❌ Error buscando en YouTube:', error.message);
      return [];
    }
  }

  /**
   * 🌐 Buscar documentación en internet
   */
  async buscarEnInternet(tema, nivel) {
    if (!this.customSearchApiKey || !this.customSearchEngineId) {
      console.log('⚠️  Google Custom Search no configurada');
      return [];
    }
    
    try {
      const query = `${tema} ${nivel} tutorial guide documentation`;
      
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.customSearchApiKey,
          cx: this.customSearchEngineId,
          q: query,
          num: 10
        }
      });
      
      return response.data.items.map(item => ({
        tipo: 'WEB',
        origen: 'Internet',
        titulo: item.title,
        descripcion: item.snippet,
        url: item.link,
        dominio: new URL(item.link).hostname
      }));
      
    } catch (error) {
      console.error('❌ Error buscando en internet:', error.message);
      return [];
    }
  }

  /**
   * 🤖 Analizar y rankear fuentes con Gemini AI
   */
  async analizarYRankear(fuentes, tema, nivel) {
    if (fuentes.length === 0) return [];
    
    try {
      const prompt = `Eres un experto analizando recursos educativos. Debes rankear las siguientes fuentes según su calidad y relevancia para aprender sobre "${tema}" a nivel ${nivel}.

FUENTES:
${JSON.stringify(fuentes, null, 2)}

CRITERIOS DE EVALUACIÓN:
1. Relevancia al tema (0-30 puntos)
2. Nivel de profundidad adecuado (0-25 puntos)
3. Autoridad de la fuente (0-20 puntos)
4. Actualidad/fecha (0-15 puntos)
5. Duración/extensión apropiada (0-10 puntos)

Para cada fuente, responde SOLO con un JSON array así:
[
  {
    "index": 0,
    "score": 85,
    "razon": "Video completo de 3 horas, canal verificado, actualizado 2024",
    "pros": ["Nivel senior adecuado", "Ejemplos prácticos"],
    "contras": ["Duración larga"],
    "recomendacion": "ALTA"
  }
]

IMPORTANTE: Responde SOLO el JSON array, sin texto adicional.`;

      const result = await this.model.generateContent(prompt);
      const respuesta = result.response.text();
      
      // Extraer JSON de la respuesta
      const jsonMatch = respuesta.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No se pudo parsear análisis de Gemini');
      }
      
      const analisis = JSON.parse(jsonMatch[0]);
      
      // Combinar fuentes con análisis
      const rankeadas = analisis
        .map(a => ({
          ...fuentes[a.index],
          score_ia: a.score,
          razon: a.razon,
          pros: a.pros,
          contras: a.contras,
          recomendacion: a.recomendacion
        }))
        .sort((a, b) => b.score_ia - a.score_ia);
      
      return rankeadas;
      
    } catch (error) {
      console.error('⚠️  Error en análisis IA, usando scoring básico:', error.message);
      // Fallback: ordenar por relevancia básica
      return fuentes.sort((a, b) => {
        const scoreA = a.score_relevancia || 50;
        const scoreB = b.score_relevancia || 50;
        return scoreB - scoreA;
      });
    }
  }

  /**
   * 📊 Obtener detalles de un video de YouTube
   */
  async obtenerDetallesVideo(videoId) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          key: this.youtubeApiKey,
          id: videoId,
          part: 'contentDetails,statistics'
        }
      });
      
      const video = response.data.items[0];
      
      return {
        duracion: this.parsearDuracionISO(video.contentDetails.duration),
        vistas: parseInt(video.statistics.viewCount),
        likes: parseInt(video.statistics.likeCount || 0),
        comentarios: parseInt(video.statistics.commentCount || 0)
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * 🔧 Generar queries optimizadas para YouTube según nivel
   */
  generarQueriesYouTube(tema, nivel) {
    const queries = [];
    
    switch (nivel.toLowerCase()) {
      case 'básico':
        queries.push(`${tema} tutorial para principiantes`);
        queries.push(`${tema} curso completo español`);
        break;
      case 'intermedio':
        queries.push(`${tema} tutorial avanzado`);
        queries.push(`${tema} técnicas avanzadas`);
        break;
      case 'senior':
      case 'experto':
        queries.push(`${tema} advanced tutorial`);
        queries.push(`${tema} expert level course`);
        queries.push(`${tema} professional certification`);
        break;
      default:
        queries.push(`${tema} tutorial completo`);
    }
    
    return queries;
  }

  /**
   * ⏱️ Parsear duración ISO 8601 de YouTube
   */
  parsearDuracionISO(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 📝 Crear índice vacío si no existe
   */
  async crearIndiceVacio() {
    const indiceInicial = {
      version: '1.0',
      creado: new Date().toISOString(),
      actualizado: new Date().toISOString(),
      recursos: [],
      categorias: ['ecommerce', 'marketing', 'desarrollo', 'diseño', 'negocios']
    };
    
    const dir = path.dirname(this.knowledgeIndexPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.knowledgeIndexPath, JSON.stringify(indiceInicial, null, 2));
    
    this.knowledgeIndex = indiceInicial;
  }

  /**
   * ➕ Agregar recurso al índice propio
   */
  async agregarAlIndice(recurso) {
    if (!this.knowledgeIndex) {
      await this.crearIndiceVacio();
    }
    
    const nuevoRecurso = {
      id: `REC-${Date.now()}`,
      fecha_agregado: new Date().toISOString(),
      ...recurso
    };
    
    this.knowledgeIndex.recursos.push(nuevoRecurso);
    this.knowledgeIndex.actualizado = new Date().toISOString();
    
    await fs.writeFile(
      this.knowledgeIndexPath,
      JSON.stringify(this.knowledgeIndex, null, 2)
    );
    
    console.log(`✅ Recurso agregado al índice: ${nuevoRecurso.titulo}`);
    return nuevoRecurso;
  }

  /**
   * 📊 Generar reporte de búsqueda en formato Markdown
   */
  generarReporte(resultados) {
    let reporte = `# 🔍 Reporte de Investigación: ${resultados.tema}\n\n`;
    reporte += `**Fecha:** ${new Date(resultados.timestamp).toLocaleString('es-ES')}\n`;
    reporte += `**Nivel:** ${resultados.nivel}\n`;
    reporte += `**Fuentes encontradas:** ${resultados.fuentes.length}\n\n`;
    
    reporte += `## 🏆 Top Recomendaciones\n\n`;
    
    resultados.recomendaciones.forEach((rec, idx) => {
      reporte += `### ${idx + 1}. ${rec.titulo}\n\n`;
      reporte += `- **Tipo:** ${rec.tipo}\n`;
      reporte += `- **Origen:** ${rec.origen}\n`;
      reporte += `- **URL:** ${rec.url}\n`;
      
      if (rec.score_ia) {
        reporte += `- **Score IA:** ${rec.score_ia}/100\n`;
        reporte += `- **Razón:** ${rec.razon}\n`;
        
        if (rec.pros) {
          reporte += `- **Pros:** ${rec.pros.join(', ')}\n`;
        }
        if (rec.contras) {
          reporte += `- **Contras:** ${rec.contras.join(', ')}\n`;
        }
      }
      
      if (rec.duracion) {
        reporte += `- **Duración:** ${rec.duracion}\n`;
      }
      
      reporte += `\n---\n\n`;
    });
    
    return reporte;
  }
}

module.exports = SherlockInvestigador;
