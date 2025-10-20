import { promises as fs } from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import AgenteSoldadoImperial from '../castas/soldado.js';
import { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD } from '../castas/shared.js';

const SOCIAL_CREDENTIALS_PATH = path.join(CWD, 'config', 'social_credentials.json');
const KEYS_PATH = path.join(CWD, 'config', 'keys.json');
const DEFAULT_SOCIAL_BRAND = 'goio_store';

async function fileExists(ruta) {
  try {
    await fs.access(ruta);
    return true;
  } catch (error) {
    return false;
  }
}

function evaluarToken(nombre, token, expiracion, traceId, agente) {
  const ahora = dayjs();
  const expira = expiracion ? dayjs(expiracion) : null;

  if (!token) {
    agente.registrarMetrica('tokens_inexistentes', 1);
    agente.logImperial('TOKEN_INEXISTENTE', { traceId, nombre });
    return { valido: false, motivo: 'ausente' };
  }

  if (!expira || !expira.isValid()) {
    agente.registrarMetrica('tokens_sin_expiracion', 1);
    agente.logImperial('TOKEN_SIN_EXPIRACION', { traceId, nombre });
    return { valido: true, motivo: 'sin_expiracion' };
  }

  const diferenciaHoras = expira.diff(ahora, 'hour');
  if (diferenciaHoras < 0) {
    agente.registrarMetrica('tokens_expirados', 1);
    agente.logImperial('TOKEN_EXPIRADO', { traceId, nombre, expiracion });
    return { valido: false, motivo: 'expirado' };
  }

  if (diferenciaHoras <= 48) {
    agente.registrarMetrica('tokens_por_vencer', 1);
    agente.logImperial('TOKEN_POR_VENCER', { traceId, nombre, expiracion, diferenciaHoras });
    return { valido: true, motivo: 'por_vencer', horasRestantes: diferenciaHoras };
  }

  agente.registrarMetrica('tokens_vigentes', 1);
  agente.logImperial('TOKEN_VIGENTE', { traceId, nombre, expiracion });
  return { valido: true, motivo: 'vigente', horasRestantes: diferenciaHoras };
}

async function leerSocialCredentials(brand) {
  const contenido = await fs.readFile(SOCIAL_CREDENTIALS_PATH, 'utf8');
  const data = JSON.parse(contenido);
  return {
    instagram: data.instagram?.[brand] || null,
    facebook: data.facebook?.[brand] || null
  };
}

async function leerKeys() {
  try {
    const contenido = await fs.readFile(KEYS_PATH, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    return null;
  }
}

export class AgenteSoldadoDefensa extends AgenteSoldadoImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Soldado-Defensa-Imperial-01',
        division: 'FORTALEZA_DEFENSIVA'
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'VERIFICAR_SEGURIDAD', rangoMinimo: 'SOLDADO' },
          { tipo: 'MONITOREAR_TOKENS', rangoMinimo: 'TENIENTE' },
          { tipo: 'MONITOREAR_ARCHIVOS', rangoMinimo: 'TENIENTE' }
        ]
      }
    }, config));

    this.socialBrand = config.socialBrand || DEFAULT_SOCIAL_BRAND;
    this.recursos = config.recursos || {
      archivos: [SOCIAL_CREDENTIALS_PATH, KEYS_PATH],
      tokens: []
    };

    this.registrarProtocolo('MONITOREAR_TOKENS', this.monitorearTokens);
    this.registrarProtocolo('MONITOREAR_ARCHIVOS', this.monitorearArchivos);
    this.registrarProtocolo('VERIFICAR_SEGURIDAD', async () => this.procesoAutonomo());
  }

  async inicializar() {
    await super.inicializar();

    const social = await leerSocialCredentials(this.socialBrand);
    this.recursos.tokens = [
      {
        nombre: 'Facebook Page',
        token: social.facebook?.page_access_token,
        expiracion: social.facebook?.token_expiration
      },
      {
        nombre: 'Instagram Delegado',
        token: social.instagram?.agents?.[0]?.token_delegado,
        expiracion: social.instagram?.agents?.[0]?.token_expiracion
      },
      {
        nombre: 'Instagram Larga Duracion',
        token: social.instagram?.long_lived_user_token,
        expiracion: social.instagram?.token_expiration
      }
    ].filter((item) => item.token);

    const keys = await leerKeys();
    if (keys?.gemini_api_key) {
      this.recursos.tokens.push({ nombre: 'Gemini API Key', token: keys.gemini_api_key, expiracion: null });
    }

    await this.logImperial('RECURSOS_DEFENSA_CARGADOS', {
      socialBrand: this.socialBrand,
      tokens: this.recursos.tokens.map((t) => t.nombre),
      archivos: this.recursos.archivos
    });
  }

  async monitorearTokens() {
    const traceId = this.generarTraceId('TOKEN-CHECK');
    const resultados = [];
    for (const recurso of this.recursos.tokens) {
      const evaluacion = evaluarToken(recurso.nombre, recurso.token, recurso.expiracion, traceId, this);
      resultados.push({ ...recurso, ...evaluacion });

      if (!evaluacion.valido) {
        await this.handleError('TOKEN_INVALIDO', new Error(`Token ${recurso.nombre} inválido: ${evaluacion.motivo}`), {
          traceId,
          recurso
        });
      }
    }

    await this.emitirReporte('soldado-tokens', { traceId, resultados });
    return resultados;
  }

  async monitorearArchivos() {
    const traceId = this.generarTraceId('ARCHIVO-CHECK');
    const auditoria = [];

    for (const ruta of this.recursos.archivos) {
      const existe = await fileExists(ruta);
      auditoria.push({ ruta, existe });

      if (!existe) {
        await this.handleError('ARCHIVO_FALTANTE', new Error(`Archivo faltante: ${ruta}`), { traceId, ruta });
      } else {
        await this.logImperial('ARCHIVO_VERIFICADO', { traceId, ruta });
      }
    }

    await this.emitirReporte('soldado-archivos', { traceId, auditoria });
    return auditoria;
  }

  async procesoAutonomo() {
    const tokens = await this.monitorearTokens();
    const archivos = await this.monitorearArchivos();
    await this.logImperial('DEFENSA_COMPLETA', { tokens, archivos });
    return { tokens, archivos };
  }
}

async function main() {
  const argsConfig = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const agente = new AgenteSoldadoDefensa(mergeDeep({
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

  const cicloMs = parseInt(process.env.SOLDADO_DEFENSA_CICLO_MS ?? '900000', 10);
  const ciclo = setInterval(() => {
    agente
      .ejecutarMision({ motivo: 'ciclo_defensa' })
      .catch((error) => agente.handleError('MISION_DEFENSA_FALLIDA', error));
  }, cicloMs);

  const shutdown = async () => {
    clearInterval(ciclo);
    agente.detenerRelojRutina();
    agente.detenerStreamMetricas();
    await agente.logImperial('AGENTE_DEFENSA_APAGADO', { motivo: 'signal' });
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  main().catch((error) => {
    console.error('[AgenteSoldadoDefensa] Error critico al iniciar:', error);
    process.exit(1);
  });
}

export default AgenteSoldadoDefensa;
