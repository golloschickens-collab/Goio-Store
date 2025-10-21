import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🎓 KNOWLEDGE IMPORTER AGENT
 * 
 * Importa conocimiento de múltiples fuentes:
 * - Videos de YouTube (transcripciones)
 * - PDFs de Drive/Terabox
 * - Archivos de texto
 * - URLs de cursos
 * 
 * Procesa con IA y genera:
 * - Resúmenes estratégicos
 * - Insights accionables
 * - Agentes especializados
 */

class KnowledgeImporter {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    this.knowledgeBase = path.join(__dirname, '..', 'knowledge-base');
  }

  async initialize() {
    // Crear estructura de carpetas
    await fs.mkdir(this.knowledgeBase, { recursive: true });
    await fs.mkdir(path.join(this.knowledgeBase, 'videos'), { recursive: true });
    await fs.mkdir(path.join(this.knowledgeBase, 'books'), { recursive: true });
    await fs.mkdir(path.join(this.knowledgeBase, 'courses'), { recursive: true });
    await fs.mkdir(path.join(this.knowledgeBase, 'summaries'), { recursive: true });
    await fs.mkdir(path.join(this.knowledgeBase, 'agents'), { recursive: true });
    
    console.log('✅ Knowledge Base inicializado');
  }

  /**
   * Importar video de YouTube
   * @param {string} videoUrl - URL del video de YouTube
   * @param {string} category - Categoría (ecommerce, marketing, etc)
   */
  async importYouTubeVideo(videoUrl, category = 'general') {
    console.log(`📺 Importando video: ${videoUrl}`);
    
    try {
      // Extraer ID del video
      const videoId = this.extractVideoId(videoUrl);
      
      // Obtener transcripción usando API de YouTube
      // Por ahora, aceptamos texto pegado manualmente
      console.log(`\n⚠️  PASO MANUAL REQUERIDO:`);
      console.log(`1. Abre: https://www.youtube.com/watch?v=${videoId}`);
      console.log(`2. Clic en "..." → "Mostrar transcripción"`);
      console.log(`3. Copia toda la transcripción`);
      console.log(`4. Guárdala en: knowledge-base/videos/${videoId}.txt`);
      console.log(`5. Luego ejecuta: processTranscription('${videoId}', '${category}')\n`);
      
      return {
        videoId,
        status: 'pending_transcription',
        instructions: 'Ver consola para pasos manuales'
      };
    } catch (error) {
      console.error('❌ Error importando video:', error.message);
      throw error;
    }
  }

  /**
   * Procesar transcripción de video
   * @param {string} videoId - ID del video
   * @param {string} category - Categoría
   */
  async processTranscription(videoId, category = 'general') {
    console.log(`🔄 Procesando transcripción: ${videoId}`);
    
    try {
      // Leer transcripción
      const transcriptionPath = path.join(this.knowledgeBase, 'videos', `${videoId}.txt`);
      const transcription = await fs.readFile(transcriptionPath, 'utf-8');
      
      console.log(`📄 Transcripción cargada: ${transcription.length} caracteres`);
      
      // Generar resumen estratégico con IA
      const summary = await this.generateStrategicSummary(transcription, 'video', category);
      
      // Guardar resumen
      const summaryPath = path.join(this.knowledgeBase, 'summaries', `${videoId}-summary.json`);
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`✅ Resumen generado: ${summaryPath}`);
      
      return summary;
    } catch (error) {
      console.error('❌ Error procesando transcripción:', error.message);
      throw error;
    }
  }

  /**
   * Importar archivo de texto (libro, curso transcrito, etc)
   * @param {string} filePath - Ruta al archivo
   * @param {string} category - Categoría
   */
  async importTextFile(filePath, category = 'general') {
    console.log(`📄 Importando archivo: ${filePath}`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath, path.extname(filePath));
      
      console.log(`📄 Contenido cargado: ${content.length} caracteres`);
      
      // Generar resumen estratégico
      const summary = await this.generateStrategicSummary(content, 'text', category);
      
      // Guardar en knowledge base
      const targetPath = path.join(this.knowledgeBase, 'books', `${fileName}.txt`);
      await fs.writeFile(targetPath, content);
      
      // Guardar resumen
      const summaryPath = path.join(this.knowledgeBase, 'summaries', `${fileName}-summary.json`);
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`✅ Archivo importado: ${targetPath}`);
      console.log(`✅ Resumen generado: ${summaryPath}`);
      
      return summary;
    } catch (error) {
      console.error('❌ Error importando archivo:', error.message);
      throw error;
    }
  }

  /**
   * Generar resumen estratégico con IA
   * @param {string} content - Contenido a analizar
   * @param {string} type - Tipo de contenido (video, text, book)
   * @param {string} category - Categoría
   */
  async generateStrategicSummary(content, type, category) {
    console.log(`🤖 Generando resumen estratégico con IA...`);
    
    // Dividir en chunks si es muy largo (límite: 30K tokens ≈ 120K caracteres)
    const maxChunkSize = 100000;
    const chunks = this.splitIntoChunks(content, maxChunkSize);
    
    const summaries = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`📊 Procesando chunk ${i + 1}/${chunks.length}...`);
      
      const prompt = `
Eres un experto analista de contenido para ecommerce y dropshipping.

Analiza el siguiente contenido de ${type} sobre ${category} y genera un resumen ULTRA ESTRATÉGICO.

CONTENIDO:
${chunks[i]}

GENERA UN JSON CON:
{
  "titulo": "Título descriptivo del contenido",
  "categoria": "${category}",
  "tipo": "${type}",
  "resumen_ejecutivo": "Resumen en 3-5 líneas",
  "conceptos_clave": ["concepto1", "concepto2", ...],
  "estrategias_accionables": [
    {
      "estrategia": "Nombre de la estrategia",
      "descripcion": "Cómo aplicarla",
      "impacto": "Alto/Medio/Bajo",
      "tiempo_implementacion": "Horas/Días/Semanas"
    }
  ],
  "herramientas_mencionadas": ["tool1", "tool2", ...],
  "metricas_importantes": ["metrica1", "metrica2", ...],
  "errores_comunes": ["error1", "error2", ...],
  "insights_criticos": ["insight1", "insight2", ...],
  "aplicacion_goio_store": "Cómo aplicar esto específicamente a Goio Store (dropshipping, Shopify, productos para el hogar)"
}

RESPONDE SOLO CON EL JSON, SIN EXPLICACIONES ADICIONALES.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaries.push(JSON.parse(jsonMatch[0]));
      }
    }
    
    // Si hay múltiples chunks, combinar resúmenes
    if (summaries.length > 1) {
      return this.mergeSummaries(summaries);
    }
    
    return summaries[0];
  }

  /**
   * Crear agente especializado basado en conocimiento
   * @param {string} summaryFile - Archivo de resumen
   * @param {string} agentName - Nombre del agente
   */
  async createSpecializedAgent(summaryFile, agentName) {
    console.log(`🤖 Creando agente especializado: ${agentName}`);
    
    try {
      // Leer resumen
      const summaryPath = path.join(this.knowledgeBase, 'summaries', summaryFile);
      const summary = JSON.parse(await fs.readFile(summaryPath, 'utf-8'));
      
      // Generar código del agente
      const agentCode = this.generateAgentCode(agentName, summary);
      
      // Guardar agente
      const agentPath = path.join(this.knowledgeBase, 'agents', `${agentName}.js`);
      await fs.writeFile(agentPath, agentCode);
      
      console.log(`✅ Agente creado: ${agentPath}`);
      
      return {
        agentName,
        agentPath,
        capabilities: summary.estrategias_accionables.map(e => e.estrategia)
      };
    } catch (error) {
      console.error('❌ Error creando agente:', error.message);
      throw error;
    }
  }

  /**
   * Generar código de agente especializado
   */
  generateAgentCode(agentName, summary) {
    return `import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

/**
 * 🤖 ${agentName.toUpperCase()} AGENT
 * 
 * Agente especializado en: ${summary.categoria}
 * 
 * Capacidades:
${summary.estrategias_accionables.map(e => ` * - ${e.estrategia}`).join('\n')}
 * 
 * Generado automáticamente por Knowledge Importer
 */

class ${this.toPascalCase(agentName)}Agent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.knowledge = ${JSON.stringify(summary, null, 2)};
  }

  async execute() {
    console.log('🚀 Ejecutando ${agentName} Agent...');
    console.log('📚 Conocimiento base:', this.knowledge.titulo);
    console.log('🎯 Estrategias disponibles:', this.knowledge.estrategias_accionables.length);
    
    // Implementar lógica específica aquí
    return {
      status: 'success',
      agent: '${agentName}',
      knowledge: this.knowledge
    };
  }
}

// Exportar para uso en otros módulos
export default ${this.toPascalCase(agentName)}Agent;

// Ejecutar si se llama directamente
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const agent = new ${this.toPascalCase(agentName)}Agent();
  agent.execute()
    .then(result => console.log('✅ Resultado:', result))
    .catch(error => console.error('❌ Error:', error));
}
`;
  }

  // Utilidades
  extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  splitIntoChunks(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  mergeSummaries(summaries) {
    // Combinar múltiples resúmenes en uno solo
    return {
      titulo: summaries[0].titulo,
      categoria: summaries[0].categoria,
      tipo: summaries[0].tipo,
      resumen_ejecutivo: summaries.map(s => s.resumen_ejecutivo).join(' '),
      conceptos_clave: [...new Set(summaries.flatMap(s => s.conceptos_clave))],
      estrategias_accionables: summaries.flatMap(s => s.estrategias_accionables),
      herramientas_mencionadas: [...new Set(summaries.flatMap(s => s.herramientas_mencionadas))],
      metricas_importantes: [...new Set(summaries.flatMap(s => s.metricas_importantes))],
      errores_comunes: [...new Set(summaries.flatMap(s => s.errores_comunes))],
      insights_criticos: summaries.flatMap(s => s.insights_criticos),
      aplicacion_goio_store: summaries.map(s => s.aplicacion_goio_store).join('\n\n')
    };
  }

  toPascalCase(str) {
    return str.replace(/(^\w|-\w)/g, (match) => match.replace(/-/, '').toUpperCase());
  }

  /**
   * Listar todo el conocimiento importado
   */
  async listKnowledge() {
    console.log('\n📚 KNOWLEDGE BASE - CONTENIDO:\n');
    
    const summariesPath = path.join(this.knowledgeBase, 'summaries');
    const summaries = await fs.readdir(summariesPath);
    
    for (const file of summaries) {
      const content = JSON.parse(await fs.readFile(path.join(summariesPath, file), 'utf-8'));
      console.log(`📄 ${content.titulo}`);
      console.log(`   Categoría: ${content.categoria} | Tipo: ${content.tipo}`);
      console.log(`   Estrategias: ${content.estrategias_accionables.length}`);
      console.log(`   Archivo: ${file}\n`);
    }
  }
}

// Exportar
export default KnowledgeImporter;

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new KnowledgeImporter();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      importer.initialize();
      break;
      
    case 'youtube':
      const url = process.argv[3];
      const category = process.argv[4] || 'general';
      importer.importYouTubeVideo(url, category);
      break;
      
    case 'process':
      const videoId = process.argv[3];
      const cat = process.argv[4] || 'general';
      importer.processTranscription(videoId, cat)
        .then(summary => console.log('✅ Resumen:', summary))
        .catch(err => console.error('❌', err));
      break;
      
    case 'text':
      const filePath = process.argv[3];
      const category2 = process.argv[4] || 'general';
      importer.importTextFile(filePath, category2)
        .then(summary => console.log('✅ Resumen:', summary))
        .catch(err => console.error('❌', err));
      break;
      
    case 'agent':
      const summaryFile = process.argv[3];
      const agentName = process.argv[4];
      importer.createSpecializedAgent(summaryFile, agentName)
        .then(agent => console.log('✅ Agente:', agent))
        .catch(err => console.error('❌', err));
      break;
      
    case 'list':
      importer.listKnowledge();
      break;
      
    default:
      console.log(`
🎓 KNOWLEDGE IMPORTER - Uso:

node agents/knowledge-importer.js init
  → Inicializar Knowledge Base

node agents/knowledge-importer.js youtube [URL] [categoria]
  → Importar video de YouTube
  Ejemplo: node agents/knowledge-importer.js youtube https://youtube.com/watch?v=ABC123 ecommerce

node agents/knowledge-importer.js process [videoId] [categoria]
  → Procesar transcripción guardada
  Ejemplo: node agents/knowledge-importer.js process ABC123 ecommerce

node agents/knowledge-importer.js text [archivo] [categoria]
  → Importar archivo de texto
  Ejemplo: node agents/knowledge-importer.js text ./libro-shopify.txt ecommerce

node agents/knowledge-importer.js agent [summary-file] [nombre-agente]
  → Crear agente especializado
  Ejemplo: node agents/knowledge-importer.js agent ABC123-summary.json shopify-master

node agents/knowledge-importer.js list
  → Listar todo el conocimiento
      `);
  }
}
