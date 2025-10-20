// agents/supervisor.js
import express from 'express';
import { fork } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { config } from '../scripts/config.js';
import { RUTINA_PATH, responsablesIncluyen } from './castas/shared.js';

// --- Configuración General ---
const CWD = process.cwd();
const AGENTS_DIR = path.join(CWD, 'agents');
const SUPERVISOR_LOG_DIR = path.join(CWD, 'logs', 'imperial', 'supervisor');
const OPERATIONS_LOG_DIR = path.join(CWD, 'logs', 'imperial', 'operations');
const SOCIAL_CREDENTIALS_PATH = path.join(CWD, 'config', 'social_credentials.json');
const MAX_DASHBOARD_LOGS = 200;

const app = express();
const PORT = process.env.PORT || 3002;
const METRICS_TOKEN = process.env.METRICS_TOKEN;

const dashboardState = {
  logs: [],
  metricas: {},
  agentes: {},
  supervisor: {
    version: '1.0.0',
    ultimaActualizacion: null,
    rutina: null,
    credencialesHash: null
  }
};

const agenteRuntime = new Map();
const supervisorContext = {
  rutina: null,
  rutinasCastas: {},
  credencialesSociales: null,
  hashCredenciales: null
};

// --- Utilidades ---
async function ensureSupervisorDirectories() {
  await fs.mkdir(SUPERVISOR_LOG_DIR, { recursive: true });
  await fs.mkdir(OPERATIONS_LOG_DIR, { recursive: true });
}

async function appendSupervisorLog(evento, data = {}) {
  const entrada = {
    evento,
    timestamp: new Date().toISOString(),
    data
  };

  dashboardState.logs.push({ origen: 'supervisor', ...entrada });
  if (dashboardState.logs.length > MAX_DASHBOARD_LOGS) {
    dashboardState.logs.shift();
  }

  const filePath = path.join(SUPERVISOR_LOG_DIR, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
  await fs.appendFile(filePath, JSON.stringify(entrada) + '\n');

  const operationsPath = path.join(OPERATIONS_LOG_DIR, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
  await fs.appendFile(operationsPath, JSON.stringify({
    trace_id: `SUP-${dayjs().format('YYYYMMDD-HHmmss')}-${evento}`,
    agente: 'SupervisorImperial',
    ejercito: 'COMANDO_IMPERIAL',
    operacion: evento,
    timestamp: entrada.timestamp,
    data
  }) + '\n');
}

async function loadJsonSafe(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    await appendSupervisorLog('CONFIG_NO_DISPONIBLE', { filePath, error: error.message });
    return fallback;
  }
}

function hashObject(value) {
  const serialized = JSON.stringify(value ?? {});
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

function construirRutina(horario = [], fase, asignador) {
  return horario
    .map((entrada) => {
      const tarea = asignador(entrada);
      if (!tarea) return null;
      return {
        hora: tarea.hora ?? entrada.hora,
        protocolo: tarea.protocolo,
        parametros: tarea.parametros ?? {},
        contexto: {
          actividad: entrada.actividad,
          responsables: entrada.responsables,
          salida: entrada.salida,
          fase
        }
      };
    })
    .filter(Boolean);
}

const RUTINA_ASIGNADORES = {
  exploradora: (entrada) => {
    if (responsablesIncluyen(entrada, ['inteligencia'])) {
      return {
        protocolo: 'INVESTIGAR_MERCADO',
        parametros: { objetivo: entrada.salida, actividad: entrada.actividad }
      };
    }
    if (responsablesIncluyen(entrada, ['todos'])) {
      return { protocolo: 'CIERRE_DIARIO', parametros: { resumen: entrada.salida } };
    }
    return null;
  },
  obrera: (entrada) => {
    if (responsablesIncluyen(entrada, ['comercial', 'creativo'])) {
      return {
        protocolo: 'EJECUTAR_CAMPANAS',
        parametros: { actividad: entrada.actividad, salida: entrada.salida }
      };
    }
    if (responsablesIncluyen(entrada, ['todos'])) {
      return { protocolo: 'CIERRE_DIARIO', parametros: { resumen: entrada.salida } };
    }
    return null;
  },
  soldado: (entrada) => {
    if (responsablesIncluyen(entrada, ['tecnico', 'técnico'])) {
      return {
        protocolo: 'VERIFICAR_SEGURIDAD',
        parametros: { actividad: entrada.actividad }
      };
    }
    if (responsablesIncluyen(entrada, ['todos'])) {
      return { protocolo: 'CIERRE_DIARIO', parametros: { resumen: entrada.salida } };
    }
    return null;
  },
  nodriza: (entrada) => {
    if (responsablesIncluyen(entrada, ['academia'])) {
      return {
        protocolo: 'ADMINISTRAR_RECURSOS',
        parametros: { actividad: entrada.actividad, salida: entrada.salida }
      };
    }
    if (responsablesIncluyen(entrada, ['todos'])) {
      return { protocolo: 'CIERRE_DIARIO', parametros: { resumen: entrada.salida } };
    }
    return null;
  }
};

function getSimpleName(fullAgentName) {
  const parts = fullAgentName.split('.');
  return parts.length > 1 ? parts[1].toLowerCase() : fullAgentName.toLowerCase();
}

const AGENT_OVERRIDES = {
  exploradora: {
    script: 'exploradora',
    autoRestart: true,
    maxRestarts: Infinity,
    restartDelayMs: 15000,
    buildConfig: (contexto, rutina) => ({
      trazabilidad: {
        dashboardEndpoint: config.dashboard.reportEndpoint
      },
      integraciones: {
        metricasStreaming: config.dashboard.metricsEndpoint
      },
      rutinaDistribuida: rutina
    })
  },
  obrera: {
    script: 'obrera',
    autoRestart: true,
    maxRestarts: Infinity,
    restartDelayMs: 15000,
    buildConfig: (contexto, rutina) => ({
      trazabilidad: {
        dashboardEndpoint: config.dashboard.reportEndpoint
      },
      integraciones: {
        metricasStreaming: config.dashboard.metricsEndpoint
      },
      rutinaDistribuida: rutina
    })
  },
  soldado: {
    script: 'soldado',
    autoRestart: true,
    maxRestarts: Infinity,
    restartDelayMs: 20000,
    buildConfig: (contexto, rutina) => ({
      trazabilidad: {
        dashboardEndpoint: config.dashboard.reportEndpoint
      },
      integraciones: {
        metricasStreaming: config.dashboard.metricsEndpoint
      },
      rutinaDistribuida: rutina
    })
  },
  nodriza: {
    script: 'nodriza',
    autoRestart: true,
    maxRestarts: Infinity,
    restartDelayMs: 20000,
    buildConfig: (contexto, rutina) => ({
      trazabilidad: {
        dashboardEndpoint: config.dashboard.reportEndpoint
      },
      integraciones: {
        metricasStreaming: config.dashboard.metricsEndpoint
      },
      rutinaDistribuida: rutina
    })
  }
};

function actualizarDashboardAgente(nombre, patch = {}) {
  const actual = dashboardState.agentes[nombre] || {};
  dashboardState.agentes[nombre] = {
    ...actual,
    ...patch
  };
}

async function prepararContextoSupervisor() {
  await ensureSupervisorDirectories();
  const rutina = await loadJsonSafe(RUTINA_PATH, { horario: [], fase: 'desconocida', nombre: 'Rutina no disponible' });
  const credencialesSociales = await loadJsonSafe(SOCIAL_CREDENTIALS_PATH, {});

  const rutinasCastas = Object.entries(RUTINA_ASIGNADORES).reduce((acc, [casta, asignador]) => {
    acc[casta] = construirRutina(rutina.horario, rutina.fase, asignador);
    return acc;
  }, {});

  supervisorContext.rutina = rutina;
  supervisorContext.rutinasCastas = rutinasCastas;
  supervisorContext.credencialesSociales = credencialesSociales;
  supervisorContext.hashCredenciales = hashObject(credencialesSociales);

  dashboardState.supervisor = {
    ...dashboardState.supervisor,
    ultimaActualizacion: new Date().toISOString(),
    rutina: {
      fase: rutina.fase,
      nombre: rutina.nombre,
      totalBloques: Array.isArray(rutina.horario) ? rutina.horario.length : 0
    },
    credencialesHash: supervisorContext.hashCredenciales
  };

  await appendSupervisorLog('SUPERVISOR_CONTEXTO_ACTUALIZADO', {
    rutina: dashboardState.supervisor.rutina,
    credencialesHash: supervisorContext.hashCredenciales
  });
}

function construirConfigAgente(agentDef) {
  const simpleName = agentDef.simpleName;
  const override = AGENT_OVERRIDES[simpleName];
  const rutina = supervisorContext.rutinasCastas[simpleName] ?? [];
  const configOverride = override?.buildConfig?.(supervisorContext, rutina) ?? {};

  return {
    nombre: agentDef.nombre,
    config: configOverride,
    dashboard: config.dashboard,
    supervisor: {
      asignadoPor: 'SupervisorImperial',
      rutina: {
        fase: supervisorContext.rutina?.fase,
        totalBloques: rutina.length
      },
      credencialesHash: supervisorContext.hashCredenciales
    }
  };
}

async function spawnAgent(agentDef) {
  const simpleName = agentDef.simpleName;
  const override = AGENT_OVERRIDES[simpleName];
  const agentPath = path.join(AGENTS_DIR, `${override?.script ?? simpleName}.js`);

  const payload = construirConfigAgente(agentDef);

  await appendSupervisorLog('AGENTE_LANZANDO', { agente: simpleName, path: agentPath });

  const child = fork(agentPath, [JSON.stringify(payload)], {
    env: process.env,
    stdio: 'inherit'
  });

  const runtime = agenteRuntime.get(simpleName) || {
    lanzamientos: 0,
    reinicios: 0,
    status: 'init'
  };

  runtime.proceso = child;
  runtime.lanzamientos += 1;
  runtime.status = 'online';
  runtime.ultimoInicio = new Date().toISOString();
  runtime.detener = false;
  agenteRuntime.set(simpleName, runtime);

  actualizarDashboardAgente(simpleName, {
    status: 'online',
    ultimoInicio: runtime.ultimoInicio,
    lanzamientos: runtime.lanzamientos,
    reinicios: runtime.reinicios
  });

  child.on('message', (msg) => {
    appendSupervisorLog('AGENTE_MENSAJE', { agente: simpleName, mensaje: msg }).catch(() => {});
  });

  child.on('exit', async (code, signal) => {
    const exitInfo = { code, signal, agente: simpleName };
    await appendSupervisorLog('AGENTE_TERMINADO', exitInfo);
    runtime.status = 'offline';
    runtime.ultimoFin = new Date().toISOString();
    actualizarDashboardAgente(simpleName, {
      status: 'offline',
      ultimoFin: runtime.ultimoFin,
      ultimoCodigoSalida: code,
      ultimoSignal: signal
    });

    if (!runtime.detener && (override?.autoRestart ?? true)) {
      runtime.reinicios += 1;
      actualizarDashboardAgente(simpleName, {
        status: 'restarting',
        reinicios: runtime.reinicios,
        proximoReinicio: new Date(Date.now() + (override?.restartDelayMs ?? 15000)).toISOString()
      });

      const maxRestarts = override?.maxRestarts ?? 5;
      if (maxRestarts !== Infinity && runtime.reinicios > maxRestarts) {
        await appendSupervisorLog('AGENTE_REINICIOS_SUPERADOS', { agente: simpleName, reinicios: runtime.reinicios });
        actualizarDashboardAgente(simpleName, {
          status: 'failed',
          motivo: 'max_restarts_exceeded'
        });
        return;
      }

      setTimeout(() => {
        spawnAgent(agentDef).catch((error) => {
          appendSupervisorLog('AGENTE_REINICIO_FALLIDO', { agente: simpleName, error: error.message }).catch(() => {});
        });
      }, override?.restartDelayMs ?? 15000);
    }
  });

  child.on('error', async (error) => {
    await appendSupervisorLog('AGENTE_ERROR', { agente: simpleName, error: error.message });
    actualizarDashboardAgente(simpleName, {
      status: 'error',
      error: error.message
    });
  });
}

function detenerAgente(simpleName) {
  const runtime = agenteRuntime.get(simpleName);
  if (!runtime?.proceso) return;

  runtime.detener = true;
  runtime.proceso.kill('SIGTERM');
}

async function lanzarCastasImperiales() {
  const agentes = config.agentes
    .map((agent) => ({
      ...agent,
      simpleName: getSimpleName(agent.nombre)
    }))
    .filter((agent) => agent.simpleName !== 'supervisor');

  for (const agent of agentes) {
    try {
      await fs.access(path.join(AGENTS_DIR, `${AGENT_OVERRIDES[agent.simpleName]?.script ?? agent.simpleName}.js`));
      spawnAgent(agent).catch((error) => {
        appendSupervisorLog('AGENTE_NO_LANZADO', { agente: agent.simpleName, error: error.message }).catch(() => {});
      });
    } catch {
      await appendSupervisorLog('AGENTE_SCRIPT_INEXISTENTE', { agente: agent.simpleName });
    }
  }
}

// --- Middleware y Endpoints HTTP ---
app.use(express.json());

app.get('/metrics', (req, res) => {
  if (METRICS_TOKEN && req.headers.authorization !== `Bearer ${METRICS_TOKEN}`) {
    return res.status(401).send('Unauthorized: Se requiere un token de métricas válido.');
  }

  res.set('Content-Type', 'text/plain');
  res.send('# Métricas placeholder\napp_online 1\n');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/dashboard/report', (req, res) => {
  const payload = req.body || {};
  payload.recibido_en = new Date().toISOString();
  dashboardState.logs.push(payload);
  if (dashboardState.logs.length > MAX_DASHBOARD_LOGS) {
    dashboardState.logs.shift();
  }

  if (payload.agente && payload.agente.nombre) {
    actualizarDashboardAgente(payload.agente.nombre, {
      ultimoReporte: payload.recibido_en,
      payload
    });
  }

  res.status(200).json({ status: 'ok' });
});

app.post('/dashboard/metrics', (req, res) => {
  const payload = req.body || {};
  const { agente, metricas } = payload;
  const clave = agente?.nombre ?? 'desconocido';
  dashboardState.metricas[clave] = {
    metricas: metricas || {},
    timestamp: new Date().toISOString()
  };
  res.status(200).json({ status: 'ok' });
});

app.get('/dashboard/state', (req, res) => {
  res.status(200).json(dashboardState);
});

app.post('/dashboard/refresh', async (_req, res) => {
  await prepararContextoSupervisor();
  res.status(200).json({ status: 'ok', supervisor: dashboardState.supervisor });
});

// --- Arranque Imperial ---
app.listen(PORT, async () => {
  await ensureSupervisorDirectories();
  await appendSupervisorLog('SUPERVISOR_SERVIDOR_ARRANCADO', {
    puerto: PORT,
    endpoints: ['/metrics', '/health', '/dashboard/report', '/dashboard/metrics', '/dashboard/state', '/dashboard/refresh']
  });

  await prepararContextoSupervisor();
  await lanzarCastasImperiales();
});

// --- Manejo de Señales ---
const detenerSupervisor = async (signal) => {
  await appendSupervisorLog('SUPERVISOR_APAGADO', { signal });
  for (const simpleName of agenteRuntime.keys()) {
    detenerAgente(simpleName);
  }
  setTimeout(() => process.exit(0), 1000);
};

process.on('SIGINT', () => detenerSupervisor('SIGINT'));
process.on('SIGTERM', () => detenerSupervisor('SIGTERM'));
