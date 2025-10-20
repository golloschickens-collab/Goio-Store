// 🎖️ DASHBOARD IMPERIAL - MONITOREO EN TIEMPO REAL
// Protocolo: Supervisión constante del Imperio Goio
// División: INTELIGENCIA - Monitoreo y Control

import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import axios from 'axios';

const CWD = process.cwd();
const LOG_DIR = path.join(CWD, 'logs', 'imperial', 'operations');
const SUPERVISOR_STATE_ENDPOINT = process.env.SUPERVISOR_STATE_ENDPOINT || 'http://localhost:3002/dashboard/state';
const SUPERVISOR_REFRESH_ENDPOINT = process.env.SUPERVISOR_REFRESH_ENDPOINT || 'http://localhost:3002/dashboard/refresh';
const DASHBOARD_PORT = parseInt(process.env.DASHBOARD_PORT ?? '8080', 10);

const app = express();

function escapeHtml(value = '') {
  return value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function getRecentLogEvents(limit = 50) {
  try {
    const files = await fs.readdir(LOG_DIR);
    const logFiles = files
      .filter((file) => file.endsWith('.jsonl') || file.endsWith('.json'))
      .sort();

    const selected = logFiles.slice(-5);
    const events = [];

    for (const file of selected.reverse()) {
      const absolutePath = path.join(LOG_DIR, file);
      try {
        const contenido = await fs.readFile(absolutePath, 'utf8');
        if (!contenido.trim()) continue;

        if (file.endsWith('.jsonl')) {
          const lineas = contenido.trim().split('\n');
          for (const linea of lineas) {
            try {
              events.push({
                ...JSON.parse(linea),
                origen_archivo: file
              });
            } catch (error) {
              events.push({
                trace_id: 'PARSING_ERROR',
                error: error.message,
                contenido: linea,
                origen_archivo: file
              });
            }
          }
        } else {
          try {
            const data = JSON.parse(contenido);
            if (Array.isArray(data)) {
              data.forEach((item) => events.push({ ...item, origen_archivo: file }));
            } else {
              events.push({ ...data, origen_archivo: file });
            }
          } catch (error) {
            events.push({
              trace_id: 'PARSING_ERROR_JSON',
              error: error.message,
              origen_archivo: file
            });
          }
        }
      } catch (error) {
        events.push({ trace_id: 'READ_ERROR', error: error.message, origen_archivo: file });
      }
    }

    const ordered = events
      .map((event) => ({
        ...event,
        timestamp: event.timestamp || event.fecha || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return ordered.slice(0, limit);
  } catch (error) {
    return [
      {
        trace_id: 'SIN_LOGS',
        alerta: 'No hay reportes disponibles todavía',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function fetchSupervisorState() {
  try {
    const { data } = await axios.get(SUPERVISOR_STATE_ENDPOINT, { timeout: 5000 });
    return data;
  } catch (error) {
    return {
      error: 'No se pudo obtener el estado del supervisor',
      detalle: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function triggerSupervisorRefresh() {
  try {
    const { data } = await axios.post(SUPERVISOR_REFRESH_ENDPOINT, {}, { timeout: 5000 });
    return data;
  } catch (error) {
    return {
      error: 'No se pudo refrescar el supervisor',
      detalle: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

app.get('/', (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Dashboard Imperial</title>
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #05060a; color: #f5f6fa; }
    header { background: linear-gradient(135deg, #6366f1, #ec4899); padding: 24px; }
    header h1 { margin: 0; font-size: 30px; letter-spacing: 0.04em; }
    header p { margin: 6px 0 0; opacity: 0.82; }
    main { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
    .panel { background: rgba(13, 15, 25, 0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 22px; box-shadow: 0 24px 50px rgba(79, 70, 229, 0.18); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .badge-ok { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .badge-warn { background: rgba(250, 204, 21, 0.2); color: #facc15; }
    .badge-error { background: rgba(248, 113, 113, 0.2); color: #f87171; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
    th { text-transform: uppercase; font-size: 11px; letter-spacing: 0.12em; opacity: 0.7; }
    tr:hover { background: rgba(255,255,255,0.04); }
    .timestamp { font-size: 12px; opacity: 0.65; }
    button { background: #818cf8; color: #0b0d16; border: none; padding: 10px 16px; border-radius: 999px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    button:hover { background: #6366f1; color: #fff; }
    footer { padding: 18px 24px; text-align: right; font-size: 12px; opacity: 0.55; }
    .status-card { padding: 16px; border-radius: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(129, 140, 248, 0.25); display: flex; flex-direction: column; gap: 8px; }
    .status-card h3 { margin: 0; font-size: 18px; }
    .muted { opacity: 0.65; font-size: 13px; }
    .flex { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  </style>
</head>
<body>
  <header>
    <h1>👑 Dashboard Imperial</h1>
    <p>Monitoreo en vivo de castas, supervisor y auditoría de operaciones</p>
  </header>
  <main>
    <section class="panel">
      <div class="flex">
        <div>
          <strong>Supervisor Imperial</strong>
          <div id="supervisor-status" class="muted">Sin datos todavía…</div>
        </div>
        <button id="refresh-supervisor">Refrescar contexto</button>
        <div class="muted" id="last-update"></div>
      </div>
    </section>

    <section class="panel">
      <h2>Castas activas</h2>
      <div id="agents-grid" class="grid"></div>
    </section>

    <section class="panel">
      <h2>Últimas operaciones</h2>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Trace ID</th>
              <th>Agente</th>
              <th>Operación</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody id="logs-table"></tbody>
        </table>
      </div>
    </section>
  </main>
  <footer>
    Imperio Goio · ${escapeHtml(new Date().toLocaleString('es-PE'))}
  </footer>
  <script>
    const supervisorStatus = document.getElementById('supervisor-status');
    const agentsGrid = document.getElementById('agents-grid');
    const logsTable = document.getElementById('logs-table');
    const lastUpdate = document.getElementById('last-update');
    const refreshButton = document.getElementById('refresh-supervisor');

    const statusBadges = {
      online: '<span class="badge badge-ok">Online</span>',
      offline: '<span class="badge badge-warn">Offline</span>',
      restarting: '<span class="badge badge-warn">Reiniciando</span>',
      error: '<span class="badge badge-error">Error</span>',
      failed: '<span class="badge badge-error">Fallo</span>'
    };

    function renderSupervisor(data) {
      if (!data || data.error) {
        supervisorStatus.innerHTML = '<span class="badge badge-error">Supervisor</span> ' + (data && data.error ? data.error : 'Sin conexión');
        return;
      }
      const rutina = data.rutina
        ? data.rutina.nombre + ' · ' + ((data.rutina.totalBloques || 0)) + ' bloques'
        : 'Rutina no disponible';
      supervisorStatus.innerHTML = 'Hash Credenciales: <code>' + (data.credencialesHash || 'N/A') + '</code><br />Rutina: ' + rutina;
      if (data.ultimaActualizacion) {
        lastUpdate.textContent = 'Última actualización: ' + new Date(data.ultimaActualizacion).toLocaleString('es-PE');
      }
    }

    function renderAgents(agents = {}) {
      agentsGrid.innerHTML = '';
      const nombres = Object.keys(agents);
      if (!nombres.length) {
        agentsGrid.innerHTML = '<div class="muted">Sin información de agentes aún.</div>';
        return;
      }
      nombres.sort();
      for (const nombre of nombres) {
        const agente = agents[nombre] || {};
        let card = '<div class="status-card">';
        card += '<h3>' + nombre + '</h3>';
        card += '<div>' + (statusBadges[agente.status] || '<span class="badge">Sin estado</span>') + '</div>';
        card += '<div class="muted">Lanzamientos: ' + (agente.lanzamientos ?? 0) + ' · Reinicios: ' + (agente.reinicios ?? 0) + '</div>';
        card += '<div class="muted">Último inicio: ' + (agente.ultimoInicio ? new Date(agente.ultimoInicio).toLocaleString('es-PE') : 'N/D') + '</div>';
        if (agente.ultimoReporte) {
          card += '<div class="muted">Último reporte: ' + new Date(agente.ultimoReporte).toLocaleString('es-PE') + '</div>';
        }
        if (agente.ultimoCodigoSalida !== undefined) {
          card += '<div class="muted">Código salida: ' + agente.ultimoCodigoSalida + '</div>';
        }
        card += '</div>';
        agentsGrid.innerHTML += card;
      }
    }

    function renderLogs(logs = []) {
      logsTable.innerHTML = '';
      if (!logs.length) {
        logsTable.innerHTML = '<tr><td colspan="5" class="muted">No hay operaciones registradas aún.</td></tr>';
        return;
      }

      for (const log of logs) {
        const detalle = log.data ? JSON.stringify(log.data).slice(0, 180) : (log.alerta || log.estado || '');
        const fecha = log.timestamp ? new Date(log.timestamp).toLocaleString('es-PE') : 'N/D';
        let row = '<tr>';
        row += '<td class="timestamp">' + fecha + '</td>';
        row += '<td>' + (log.trace_id || '-') + '</td>';
        row += '<td>' + (log.agente || log.ejercito || '-') + '</td>';
        row += '<td>' + (log.operacion || log.alerta || '-') + '</td>';
        row += '<td><span class="muted">' + detalle + '</span></td>';
        row += '</tr>';
        logsTable.innerHTML += row;
      }
    }

    async function fetchState() {
      const res = await fetch('/api/overview');
      const data = await res.json();
      renderSupervisor(data.supervisor);
      renderAgents(data.agentes);
      renderLogs(data.logs);
      if (data.timestamp) {
        lastUpdate.textContent = 'Actualizado: ' + new Date(data.timestamp).toLocaleString('es-PE');
      }
    }

    refreshButton.addEventListener('click', async () => {
      refreshButton.disabled = true;
      refreshButton.textContent = 'Refrescando…';
      try {
        await fetch('/api/supervisor/refresh', { method: 'POST' });
      } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = 'Refrescar contexto';
      }
    });

    const source = new EventSource('/stream');
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'update') {
        renderSupervisor(payload.supervisor);
        renderAgents(payload.agentes);
        renderLogs(payload.logs);
        if (payload.timestamp) {
          lastUpdate.textContent = 'Actualizado: ' + new Date(payload.timestamp).toLocaleString('es-PE');
        }
      }
    };

    source.onerror = () => {
      lastUpdate.textContent = 'Conexión SSE perdida. Reintentando…';
    };

    fetchState();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/logs', async (_req, res) => {
  const logs = await getRecentLogEvents();
  res.json({ logs, timestamp: new Date().toISOString() });
});

app.get('/api/state', async (_req, res) => {
  const state = await fetchSupervisorState();
  res.json({ state, timestamp: new Date().toISOString() });
});

app.get('/api/overview', async (_req, res) => {
  const [state, logs] = await Promise.all([fetchSupervisorState(), getRecentLogEvents()]);
  res.json({
    supervisor: state.supervisor ?? state,
    agentes: state.agentes ?? {},
    metricas: state.metricas ?? {},
    logs,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/supervisor/refresh', async (_req, res) => {
  const resultado = await triggerSupervisorRefresh();
  res.json(resultado);
});

app.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let active = true;
  req.on('close', () => {
    active = false;
  });

  async function pushUpdate() {
    if (!active) return;
    const [state, logs] = await Promise.all([fetchSupervisorState(), getRecentLogEvents()]);
    const payload = {
      type: 'update',
      supervisor: state.supervisor ?? state,
      agentes: state.agentes ?? {},
      metricas: state.metricas ?? {},
      logs,
      timestamp: new Date().toISOString()
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  await pushUpdate();
  const interval = setInterval(pushUpdate, 5000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(DASHBOARD_PORT, () => {
  console.log(`✅ Dashboard Imperial disponible en http://localhost:${DASHBOARD_PORT}`);
  console.log(`   ↳ Lectura de logs: ${LOG_DIR}`);
  console.log(`   ↳ Estado supervisor: ${SUPERVISOR_STATE_ENDPOINT}`);
});