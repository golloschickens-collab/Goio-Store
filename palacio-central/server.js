import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 8080;

let lastExecution = null;
let isRunning = false;

// ============================================
// SALÓN DEL TRONO - ENDPOINTS PRINCIPALES
// ============================================

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Agentes ELITE - Palacio Central',
    lastExecution: lastExecution,
    isRunning: isRunning,
    endpoints: [
      'GET / - Health check',
      'GET /audit - Ejecutar auditoría completa',
      'GET /fix - Ejecutar fix completo',
      'GET /reports - Ver reportes',
      'GET /trace/:trace_id - Rastrear operación (Pilar 1 - Trazabilidad)'
    ]
  });
});

// ============================================
// PILAR 1: ENDPOINT DE TRAZABILIDAD
// Implementado por Agente Copilot
// Solicitado por Agente Gemini
// ============================================

app.get('/trace/:trace_id', async (req, res) => {
  try {
    const { trace_id } = req.params;
    const { desde, hasta, tipo, limite = 1000, offset = 0 } = req.query;
    
    console.log(`[TRACE] Buscando operaciones para: ${trace_id}`);
    
    const startTime = Date.now();
    const logsDir = path.join(__dirname, 'logs', 'imperial');
    
    // Crear directorio si no existe
    await fs.mkdir(logsDir, { recursive: true });
    
    // Obtener todos los archivos .log
    let logFiles = [];
    try {
      const files = await fs.readdir(logsDir);
      logFiles = files.filter(f => f.endsWith('.log'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        logFiles = [];
      } else {
        throw error;
      }
    }
    
    if (logFiles.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron registros para el trace_id proporcionado.',
        trace_id,
        archivos_revisados: 0,
        directorio: logsDir
      });
    }
    
    // Buscar en todos los archivos
    const traces = [];
    let totalLines = 0;
    
    for (const logFile of logFiles) {
      const filePath = path.join(logsDir, logFile);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        totalLines++;
        try {
          const logEntry = JSON.parse(line);
          
          // Filtro principal: trace_id
          if (logEntry.trace_id === trace_id) {
            // Filtros opcionales
            let include = true;
            
            // Filtro por fecha
            if (desde && logEntry.timestamp < desde) include = false;
            if (hasta && logEntry.timestamp > hasta) include = false;
            
            // Filtro por tipo
            if (tipo && logEntry.tipo !== tipo) include = false;
            
            if (include) {
              traces.push(logEntry);
            }
          }
        } catch (parseError) {
          // Ignorar líneas que no son JSON válido
        }
      }
    }
    
    // Ordenar cronológicamente
    traces.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
    
    // Paginación
    const paginatedTraces = traces.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limite)
    );
    
    const searchTime = Date.now() - startTime;
    
    if (traces.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron registros para el trace_id proporcionado.',
        trace_id,
        archivos_revisados: logFiles.length,
        lineas_analizadas: totalLines,
        tiempo_busqueda_ms: searchTime
      });
    }
    
    res.json({
      trace: paginatedTraces,
      metadata: {
        trace_id,
        total_encontrado: traces.length,
        mostrando: paginatedTraces.length,
        offset: parseInt(offset),
        limite: parseInt(limite),
        archivos_revisados: logFiles.length,
        lineas_analizadas: totalLines,
        tiempo_busqueda_ms: searchTime,
        filtros_aplicados: {
          desde: desde || 'ninguno',
          hasta: hasta || 'ninguno',
          tipo: tipo || 'ninguno'
        }
      }
    });
    
  } catch (error) {
    console.error('[TRACE ERROR]', error);
    res.status(500).json({
      error: 'Error interno del servidor al buscar trace',
      detalle: error.message
    });
  }
});

// ============================================
// ENDPOINT: AUDITORÍA
// ============================================

app.get('/audit', async (req, res) => {
  if (isRunning) {
    return res.json({ 
      status: 'busy', 
      message: 'Ya hay una auditoría en ejecución' 
    });
  }
  
  isRunning = true;
  res.json({ 
    status: 'started', 
    message: 'Auditoría iniciada',
    trace_id: generateTraceId('AUDIT')
  });
  
  try {
    const traceId = generateTraceId('AUDIT');
    await logOperation(traceId, 'audit', 'iniciado', { tipo: 'auditoria_completa' });
    
    const { stdout, stderr } = await execAsync('node agents/store-perfection-master.js');
    
    lastExecution = {
      type: 'audit',
      timestamp: new Date().toISOString(),
      success: true,
      output: stdout,
      trace_id: traceId
    };
    
    await logOperation(traceId, 'audit', 'completado', { 
      success: true,
      output_length: stdout.length 
    });
    
  } catch (error) {
    lastExecution = {
      type: 'audit',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message
    };
    
    await logOperation(traceId, 'audit', 'error', { 
      error: error.message 
    });
  } finally {
    isRunning = false;
  }
});

// ============================================
// ENDPOINT: FIX COMPLETO
// ============================================

app.get('/fix', async (req, res) => {
  if (isRunning) {
    return res.json({ 
      status: 'busy', 
      message: 'Ya hay una operación en ejecución' 
    });
  }
  
  isRunning = true;
  const traceId = generateTraceId('FIX');
  
  res.json({ 
    status: 'started', 
    message: 'Fix completo iniciado',
    trace_id: traceId
  });
  
  try {
    await logOperation(traceId, 'fix', 'iniciado', { tipo: 'fix_completo' });
    
    const { stdout, stderr } = await execAsync('node agents/store-auto-fixer.js');
    
    lastExecution = {
      type: 'fix',
      timestamp: new Date().toISOString(),
      success: true,
      output: stdout,
      trace_id: traceId
    };
    
    await logOperation(traceId, 'fix', 'completado', { 
      success: true,
      output_length: stdout.length 
    });
    
  } catch (error) {
    lastExecution = {
      type: 'fix',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message
    };
    
    await logOperation(traceId, 'fix', 'error', { 
      error: error.message 
    });
  } finally {
    isRunning = false;
  }
});

// ============================================
// ENDPOINT: REPORTES
// ============================================

app.get('/reports', async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, 'reports', 'store-perfection');
    
    try {
      const files = await fs.readdir(reportsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const reports = [];
      for (const file of jsonFiles.slice(-10)) {
        const content = await fs.readFile(path.join(reportsDir, file), 'utf-8');
        const report = JSON.parse(content);
        reports.push({
          file,
          timestamp: report.timestamp,
          score: report.score_general,
          estado: report.estado
        });
      }
      
      reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.json({
        total: reports.length,
        latest: reports
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({ total: 0, latest: [] });
      } else {
        throw error;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UTILIDADES IMPERIALES
// ============================================

/**
 * Generar trace_id único
 * Formato: IMP-{OPERACION}-{TIMESTAMP}
 */
function generateTraceId(operacion) {
  const timestamp = Date.now();
  return `IMP-${operacion.toUpperCase()}-${timestamp}`;
}

/**
 * Registrar operación en logs imperiales
 */
async function logOperation(trace_id, tipo, estado, datos = {}) {
  try {
    const logsDir = path.join(__dirname, 'logs', 'imperial');
    await fs.mkdir(logsDir, { recursive: true });
    
    const fecha = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `operaciones-${fecha}.log`);
    
    const logEntry = {
      trace_id,
      timestamp: new Date().toISOString(),
      tipo,
      estado,
      ...datos
    };
    
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('[LOG ERROR]', error);
  }
}

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏰 SALÓN DEL TRONO - CENTRO DE MANDO IMPERIAL           ║
║                                                            ║
║   🌐 Servidor: http://localhost:${PORT.toString().padEnd(4)}                       ║
║                                                            ║
║   📡 ENDPOINTS OPERATIVOS:                                 ║
║                                                            ║
║   GET  /                                                   ║
║     → Health check + estado del imperio                    ║
║                                                            ║
║   GET  /audit                                              ║
║     → Ejecutar auditoría completa de tienda                ║
║                                                            ║
║   GET  /fix                                                ║
║     → Ejecutar fix completo automático                     ║
║                                                            ║
║   GET  /reports                                            ║
║     → Ver últimos 10 reportes                              ║
║                                                            ║
║   GET  /trace/:trace_id                                    ║
║     → Rastrear operación (PILAR 1 - Trazabilidad)          ║
║     Query params:                                          ║
║       ?desde=ISO_DATE - Filtrar desde fecha                ║
║       ?hasta=ISO_DATE - Filtrar hasta fecha                ║
║       ?tipo=audit|fix|deploy - Filtrar por tipo            ║
║       ?limite=100 - Límite de resultados                   ║
║       ?offset=0 - Offset para paginación                   ║
║                                                            ║
║   ✅ Pilar 1 (Trazabilidad) - OPERATIVO                   ║
║   ⏳ Pilar 2 - Aguardando órdenes                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  // Log inicial
  logOperation(generateTraceId('SYSTEM'), 'startup', 'completado', {
    port: PORT,
    node_version: process.version,
    pilar_1: 'operativo'
  });
});

export default app;
