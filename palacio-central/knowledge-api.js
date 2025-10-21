import express from 'express';
import KnowledgeImporter from './agents/knowledge-importer.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

/**
 * 🌐 KNOWLEDGE BASE API
 * 
 * API REST para importar y gestionar conocimiento en tu imperio
 * 
 * Endpoints:
 * - POST /import/youtube - Importar video de YouTube
 * - POST /import/text - Subir archivo de texto
 * - POST /process/:videoId - Procesar transcripción
 * - POST /agent/create - Crear agente especializado
 * - GET /knowledge - Listar todo el conocimiento
 * - GET /knowledge/:id - Ver resumen específico
 */

const app = express();
const PORT = process.env.KNOWLEDGE_API_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'knowledge-base', 'uploads');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Inicializar Knowledge Importer
const importer = new KnowledgeImporter();
await importer.initialize();

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Knowledge Base API',
    version: '1.0.0',
    endpoints: [
      'POST /import/youtube',
      'POST /import/text',
      'POST /process/:videoId',
      'POST /agent/create',
      'GET /knowledge',
      'GET /knowledge/:id'
    ]
  });
});

// Importar video de YouTube
app.post('/import/youtube', async (req, res) => {
  try {
    const { url, category = 'general' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL requerida' });
    }
    
    console.log(`📺 Importando video: ${url}`);
    const result = await importer.importYouTubeVideo(url, category);
    
    res.json({
      success: true,
      message: 'Video preparado para importación',
      data: result,
      next_step: `POST /process/${result.videoId}?category=${category}`
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Procesar transcripción de video
app.post('/process/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { category = 'general' } = req.query;
    
    console.log(`🔄 Procesando: ${videoId}`);
    const summary = await importer.processTranscription(videoId, category);
    
    res.json({
      success: true,
      message: 'Transcripción procesada exitosamente',
      summary
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subir y procesar archivo de texto
app.post('/import/text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }
    
    const { category = 'general' } = req.body;
    
    console.log(`📄 Procesando archivo: ${req.file.originalname}`);
    const summary = await importer.importTextFile(req.file.path, category);
    
    res.json({
      success: true,
      message: 'Archivo procesado exitosamente',
      file: req.file.originalname,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      summary
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear agente especializado
app.post('/agent/create', async (req, res) => {
  try {
    const { summaryFile, agentName } = req.body;
    
    if (!summaryFile || !agentName) {
      return res.status(400).json({ error: 'summaryFile y agentName requeridos' });
    }
    
    console.log(`🤖 Creando agente: ${agentName}`);
    const agent = await importer.createSpecializedAgent(summaryFile, agentName);
    
    res.json({
      success: true,
      message: 'Agente creado exitosamente',
      agent
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar todo el conocimiento
app.get('/knowledge', async (req, res) => {
  try {
    const summariesPath = path.join(process.cwd(), 'knowledge-base', 'summaries');
    const files = await fs.readdir(summariesPath);
    
    const knowledge = [];
    
    for (const file of files) {
      const content = JSON.parse(
        await fs.readFile(path.join(summariesPath, file), 'utf-8')
      );
      
      knowledge.push({
        id: file.replace('-summary.json', ''),
        file,
        titulo: content.titulo,
        categoria: content.categoria,
        tipo: content.tipo,
        estrategias: content.estrategias_accionables.length,
        resumen: content.resumen_ejecutivo
      });
    }
    
    res.json({
      success: true,
      total: knowledge.length,
      knowledge
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ver resumen específico
app.get('/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const summaryPath = path.join(
      process.cwd(), 
      'knowledge-base', 
      'summaries', 
      `${id}-summary.json`
    );
    
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf-8'));
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar agentes creados
app.get('/agents', async (req, res) => {
  try {
    const agentsPath = path.join(process.cwd(), 'knowledge-base', 'agents');
    const files = await fs.readdir(agentsPath);
    
    const agents = files.map(file => ({
      name: file.replace('.js', ''),
      file,
      path: `/agents/${file}`
    }));
    
    res.json({
      success: true,
      total: agents.length,
      agents
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎓 KNOWLEDGE BASE API - SISTEMA IMPERIAL                ║
║                                                            ║
║   🌐 Servidor: http://localhost:${PORT}                     ║
║                                                            ║
║   📡 ENDPOINTS DISPONIBLES:                                ║
║                                                            ║
║   POST /import/youtube                                     ║
║     → Importar video de YouTube                            ║
║                                                            ║
║   POST /import/text                                        ║
║     → Subir archivo de texto (libro, curso, etc)           ║
║                                                            ║
║   POST /process/:videoId                                   ║
║     → Procesar transcripción guardada                      ║
║                                                            ║
║   POST /agent/create                                       ║
║     → Crear agente especializado                           ║
║                                                            ║
║   GET /knowledge                                           ║
║     → Listar todo el conocimiento                          ║
║                                                            ║
║   GET /knowledge/:id                                       ║
║     → Ver resumen específico                               ║
║                                                            ║
║   GET /agents                                              ║
║     → Listar agentes creados                               ║
║                                                            ║
║   ✅ Sistema listo para importar conocimiento              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
