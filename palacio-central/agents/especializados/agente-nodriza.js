import { promises as fs } from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import AgenteNodrizaImperial from '../castas/nodriza.js';
import { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD } from '../castas/shared.js';

const SOCIAL_CREDENTIALS_PATH = path.join(CWD, 'config', 'social_credentials.json');
const CREDENCIALES_DIR = path.join(CWD, 'logs', 'imperial', 'credenciales');
const DEFAULT_SOCIAL_BRAND = 'goio_store';

async function readJsonSafe(filePath) {
  const contenido = await fs.readFile(filePath, 'utf8');
  return JSON.parse(contenido);
}

async function guardarInventario(nombre, datos) {
  await fs.mkdir(CREDENCIALES_DIR, { recursive: true });
  const fileName = `${dayjs().format('YYYYMMDD-HHmmss')}-${nombre}.json`;
  const filePath = path.join(CREDENCIALES_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(datos, null, 2));
  const diarioPath = path.join(CREDENCIALES_DIR, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
  await fs.appendFile(diarioPath, JSON.stringify({
    tipo: nombre,
    timestamp: new Date().toISOString(),
    datos
  }) + '\n');
  return filePath;
}

function normalizarAgentesInstagram(instagramConfig) {
  if (!instagramConfig) return [];
  if (Array.isArray(instagramConfig.agents)) return instagramConfig.agents;
  if (instagramConfig.agents && typeof instagramConfig.agents === 'object') {
    return Object.values(instagramConfig.agents);
  }
  return [];
}

export class AgenteNodrizaLogistica extends AgenteNodrizaImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Nodriza-Logistica-Imperial-01',
        division: 'NODRIZAS_LOGISTICA'
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'ADMINISTRAR_RECURSOS', rangoMinimo: 'SARGENTO' },
          { tipo: 'ROTAR_TOKENS', rangoMinimo: 'CAPITAN' },
          { tipo: 'NUTRIR_AGENTES', rangoMinimo: 'CAPITAN' }
        ]
      }
    }, config));

    this.socialBrand = config.socialBrand || DEFAULT_SOCIAL_BRAND;
    this.credencialesSociales = null;
    this.historialRotaciones = [];

    this.registrarProtocolo('ROTAR_TOKENS', this.rotarTokens);
    this.registrarProtocolo('NUTRIR_AGENTES', this.nutrirAgentes);
  }

  async inicializar() {
    await super.inicializar();
    await this.cargarCredenciales();
  }

  async cargarCredenciales() {
    const traceId = this.generarTraceId('CREDENCIALES-CARGA');
    try {
      const data = await readJsonSafe(SOCIAL_CREDENTIALS_PATH);
      const credenciales = {
        instagram: data.instagram?.[this.socialBrand] || null,
        facebook: data.facebook?.[this.socialBrand] || null
      };
      this.credencialesSociales = credenciales;
      await this.logImperial('CREDENCIALES_CARGADAS', { traceId, brand: this.socialBrand });
      return credenciales;
    } catch (error) {
      await this.handleError('CREDENCIALES_ERROR', error, { traceId, brand: this.socialBrand });
      this.credencialesSociales = null;
      return null;
    }
  }

  async rotarTokenSimulado(plataforma, agenteCodigo) {
    const traceId = this.generarTraceId('TOKEN-ROTACION');
    const registro = {
      plataforma,
      agente: agenteCodigo,
      accion: 'Rotacion simulada',
      ejecutado_por: this.identidad.nombre,
      fecha: new Date().toISOString()
    };
    this.historialRotaciones.push(registro);
    await this.logImperial('TOKEN_ROTADO', { traceId, registro });
    return registro;
  }

  async entregarCredenciales(agenteConfig, credenciales) {
    const traceId = this.generarTraceId('NUTRICION-AGENTE');
    const paquete = {
      agente: agenteConfig?.agent_code || agenteConfig?.nombre || 'DESCONOCIDO',
      entregado_en: new Date().toISOString(),
      credenciales: {
        token_delegado: credenciales?.token_delegado ? '***' : null,
        token_expiracion: credenciales?.token_expiracion || null
      }
    };
    await this.logImperial('AGENTE_NUTRIDO', { traceId, paquete });
    return paquete;
  }

  async rotarTokens(parametros = {}) {
    if (!this.credencialesSociales) {
      await this.cargarCredenciales();
    }
    if (!this.credencialesSociales) {
      return [];
    }

    const acciones = [];
    const instagramAgents = normalizarAgentesInstagram(this.credencialesSociales.instagram);

    if (this.credencialesSociales.facebook?.page_access_token) {
      acciones.push(await this.rotarTokenSimulado('Facebook', this.credencialesSociales.facebook.page_name || 'PAGE')); 
    }

    for (const agente of instagramAgents) {
      acciones.push(await this.rotarTokenSimulado('Instagram', agente.agent_code));
    }

    if (parametros.extraTokens) {
      for (const token of parametros.extraTokens) {
        acciones.push(await this.rotarTokenSimulado(token.plataforma, token.agente));
      }
    }

    const filePath = await guardarInventario('rotaciones', { acciones });
    await this.emitirReporte('nodriza-rotaciones', { acciones, filePath });
    return acciones;
  }

  async nutrirAgentes(parametros = {}) {
    if (!this.credencialesSociales) {
      await this.cargarCredenciales();
    }
    if (!this.credencialesSociales) {
      return [];
    }

    const paquetes = [];
    const instagramAgents = normalizarAgentesInstagram(this.credencialesSociales.instagram);
    for (const agente of instagramAgents) {
      paquetes.push(await this.entregarCredenciales(agente, agente));
    }

    if (parametros.agentesAdicionales) {
      for (const agente of parametros.agentesAdicionales) {
        paquetes.push(await this.entregarCredenciales(agente, agente.credenciales));
      }
    }

    await this.emitirReporte('nodriza-nutricion', { paquetes });
    return paquetes;
  }

  async procesoAutonomo(parametros = {}) {
    const credenciales = await this.cargarCredenciales();
    if (!credenciales) {
      return { acciones: [], paquetes: [] };
    }

    const acciones = await this.rotarTokens(parametros);
    const paquetes = await this.nutrirAgentes(parametros);
    await this.logImperial('NUTRICION_COMPLETA', { acciones, paquetes });
    return { acciones, paquetes };
  }
}

async function main() {
  const argsConfig = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const agente = new AgenteNodrizaLogistica(mergeDeep({
    socialBrand: argsConfig.socialBrand || DEFAULT_SOCIAL_BRAND,
    trazabilidad: {
      dashboardEndpoint: argsConfig.dashboard?.reportEndpoint || process.env.DASHBOARD_ENDPOINT
    },
    integraciones: {
      metricasStreaming: argsConfig.dashboard?.metricsEndpoint || process.env.METRICAS_ENDPOINT
    },
    consejo: argsConfig
  }, argsConfig.config || {}));

  await agente.inicializar();
  await agente.activar();

  const cicloMs = parseInt(process.env.NODRIZA_LOGISTICA_CICLO_MS ?? '1800000', 10);
  const ciclo = setInterval(() => {
    agente
      .ejecutarMision({ motivo: 'ciclo_nutricion' })
      .catch((error) => agente.handleError('MISION_NODRIZA_FALLIDA', error));
  }, cicloMs);

  const shutdown = async () => {
    clearInterval(ciclo);
    agente.detenerRelojRutina();
    agente.detenerStreamMetricas();
    await agente.logImperial('AGENTE_NODRIZA_APAGADO', { motivo: 'signal' });
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  main().catch((error) => {
    console.error('[AgenteNodrizaLogistica] Error critico al iniciar:', error);
    process.exit(1);
  });
}

export default AgenteNodrizaLogistica;
