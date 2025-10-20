import AgenteNodrizaImperial from './castas/nodriza.js';
import { mergeDeep } from './templates/agente-autonomo-imperial.js';

const CICLO_MS = parseInt(process.env.NODRIZA_CICLO_MS ?? '1800000', 10);

(async () => {
  const argsConfig = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const dashboardConfig = argsConfig.dashboard || {};
  const reportEndpoint = process.env.DASHBOARD_ENDPOINT || dashboardConfig.reportEndpoint || 'http://localhost:3002/dashboard/report';
  const metricsEndpoint = process.env.METRICAS_ENDPOINT || dashboardConfig.metricsEndpoint || 'http://localhost:3002/dashboard/metrics';

  const baseConfig = {
    trazabilidad: {
      dashboardEndpoint: reportEndpoint
    },
    integraciones: {
      metricasStreaming: metricsEndpoint
    },
    consejo: argsConfig
  };

  const agente = new AgenteNodrizaImperial(mergeDeep(baseConfig, argsConfig.config || {}));

  await agente.inicializar();
  await agente.activar();

  const ciclo = setInterval(() => {
    agente
      .ejecutarMision({ motivo: 'ciclo_autonomo' })
      .catch((error) => agente.handleError('MISION_CICLO_FALLIDA', error));
    agente.sincronizarIntegraciones().catch((error) => agente.handleError('SINCRONIZACION_FALLIDA', error));
  }, CICLO_MS);

  const apagar = async () => {
    clearInterval(ciclo);
    agente.detenerRelojRutina();
    agente.detenerStreamMetricas();
    await agente.logImperial('AGENTE_APAGADO', { motivo: 'signal' });
    process.exit(0);
  };

  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
})();
