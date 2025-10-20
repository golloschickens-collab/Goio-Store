import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import dayjs from 'dayjs';
import AgenteObreraImperial from '../castas/obrera.js';
import { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD } from '../castas/shared.js';

const SOCIAL_CREDENTIALS_PATH = path.join(CWD, 'config', 'social_credentials.json');
const DEFAULT_SOCIAL_BRAND = 'goio_store';

function seleccionarTokenInstagram(instagramConfig) {
  if (!instagramConfig) return null;
  const agente = Array.isArray(instagramConfig.agents) ? instagramConfig.agents.find((a) => a.token_delegado && a.token_delegado !== 'TO_FILL') : null;
  if (agente?.token_delegado) return agente.token_delegado;
  if (instagramConfig.long_lived_user_token && instagramConfig.long_lived_user_token !== 'TO_FILL') {
    return instagramConfig.long_lived_user_token;
  }
  if (instagramConfig.user_access_token && instagramConfig.user_access_token !== 'TO_FILL') {
    return instagramConfig.user_access_token;
  }
  return null;
}

function seleccionarTokenFacebook(facebookConfig) {
  if (!facebookConfig) return null;
  if (facebookConfig.page_access_token && facebookConfig.page_access_token !== 'TO_FILL') {
    return facebookConfig.page_access_token;
  }
  return null;
}

export class AgenteObreraSocial extends AgenteObreraImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Obrera-Social-Imperial-01',
        division: 'OBRERAS_SOCIALES'
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'PUBLICAR_SOCIAL', rangoMinimo: 'SOLDADO', autoridadesPermitidas: ['ConsejoImperial', 'MarketingImperial'] },
          { tipo: 'PUBLICAR_INSTAGRAM', rangoMinimo: 'SOLDADO' },
          { tipo: 'PUBLICAR_FACEBOOK', rangoMinimo: 'SOLDADO' }
        ]
      }
    }, config));

    this.socialBrand = config.socialBrand || DEFAULT_SOCIAL_BRAND;
    this.socialCredentials = null;

    this.registrarProtocolo('PUBLICAR_SOCIAL', this.publicarSocial);
    this.registrarProtocolo('PUBLICAR_INSTAGRAM', async (params) => this.publicarInstagram(params));
    this.registrarProtocolo('PUBLICAR_FACEBOOK', async (params) => this.publicarFacebook(params));
  }

  async inicializar() {
    await super.inicializar();
    this.socialCredentials = await this.cargarCredencialesRedes(this.socialBrand);
    await this.logImperial('CREDENCIALES_SOCIALES_CARGADAS', { brand: this.socialBrand, scopes: Object.keys(this.socialCredentials || {}) });
  }

  async cargarCredencialesRedes(brand) {
    const traceId = this.generarTraceId('CREDENCIALES_SOCIALES');
    try {
      const contenido = await fs.readFile(SOCIAL_CREDENTIALS_PATH, 'utf8');
      const data = JSON.parse(contenido);
      const instagram = data.instagram?.[brand];
      const facebook = data.facebook?.[brand];

      if (!instagram && !facebook) {
        throw new Error(`No se encontraron credenciales para la marca ${brand}`);
      }

      return {
        instagram,
        facebook,
        traceId
      };
    } catch (error) {
      await this.handleError('CREDENCIALES_SOCIALES_ERROR', error, { brand, traceId });
      return null;
    }
  }

  async publicarInstagram({ mensaje, imagenUrl, igAccountId, token } = {}) {
    if (!this.socialCredentials?.instagram) {
      throw new Error('No hay credenciales de Instagram disponibles.');
    }

    const instagramConfig = this.socialCredentials.instagram;
    const cuentaId = igAccountId || instagramConfig.ig_business_account_id;
    const accessToken = token || seleccionarTokenInstagram(instagramConfig);

    if (!cuentaId || cuentaId === 'TO_FILL') {
      throw new Error('ig_business_account_id no configurado.');
    }

    if (!accessToken) {
      throw new Error('Sin token válido para Instagram.');
    }

    const traceId = this.generarTraceId('INST-PUBLICACION');

    const cuerpo = new URLSearchParams({
      caption: mensaje,
      access_token: accessToken
    });
    if (imagenUrl) cuerpo.append('image_url', imagenUrl);

    try {
      const crear = await fetch(`https://graph.facebook.com/v19.0/${cuentaId}/media`, {
        method: 'POST',
        body: cuerpo
      });
      const crearData = await crear.json();

      if (!crear.ok) {
        throw new Error(`Error creando media: ${JSON.stringify(crearData)}`);
      }

      const creationId = crearData.id;
      const publicar = await fetch(`https://graph.facebook.com/v19.0/${cuentaId}/media_publish`, {
        method: 'POST',
        body: new URLSearchParams({ creation_id: creationId, access_token: accessToken })
      });
      const publicarData = await publicar.json();

      if (!publicar.ok) {
        throw new Error(`Error publicando media: ${JSON.stringify(publicarData)}`);
      }

      this.registrarMetrica('instagram_publicaciones', 1);
      await this.logImperial('INSTAGRAM_PUBLICADO', { traceId, creationId, publicarData });
      const publicacionesPath = path.join(this.paths.publicaciones, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
      await fs.appendFile(publicacionesPath, JSON.stringify({
        trace_id: traceId,
        plataforma: 'instagram',
        mensaje,
        image_url: imagenUrl,
        resultado: publicarData,
        timestamp: new Date().toISOString(),
        agente: this.identidad.nombre
      }) + '\n');
      return { traceId, creationId, publicarData };
    } catch (error) {
      await this.handleError('INSTAGRAM_ERROR', error, { traceId, mensaje });
      throw error;
    }
  }

  async publicarFacebook({ mensaje, link, pageId, token } = {}) {
    if (!this.socialCredentials?.facebook) {
      throw new Error('No hay credenciales de Facebook disponibles.');
    }

    const facebookConfig = this.socialCredentials.facebook;
    const paginaId = pageId || facebookConfig.page_id;
    const accessToken = token || seleccionarTokenFacebook(facebookConfig);

    if (!paginaId || paginaId === 'TO_FILL') {
      throw new Error('page_id no configurado.');
    }

    if (!accessToken) {
      throw new Error('Sin token válido para Facebook.');
    }

    const traceId = this.generarTraceId('FB-PUBLICACION');
    const params = new URLSearchParams({
      message: mensaje,
      access_token: accessToken
    });
    if (link) params.append('link', link);

    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${paginaId}/feed`, {
        method: 'POST',
        body: params
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Error publicando en Facebook: ${JSON.stringify(data)}`);
      }

      this.registrarMetrica('facebook_publicaciones', 1);
      await this.logImperial('FACEBOOK_PUBLICADO', { traceId, data });
      const publicacionesPath = path.join(this.paths.publicaciones, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
      await fs.appendFile(publicacionesPath, JSON.stringify({
        trace_id: traceId,
        plataforma: 'facebook',
        mensaje,
        link,
        resultado: data,
        timestamp: new Date().toISOString(),
        agente: this.identidad.nombre
      }) + '\n');
      return { traceId, data };
    } catch (error) {
      await this.handleError('FACEBOOK_ERROR', error, { traceId, mensaje });
      throw error;
    }
  }

  async publicarSocial(parametros = {}) {
    const mensaje = parametros.mensaje || '🚀 ¡El Imperio Goio se expande sin fronteras!';
    const imagenUrl = parametros.imagenUrl || 'https://goiostore.com/images/producto-estrella.jpg';
    const link = parametros.link || 'https://goiostore.com';

    const resultados = {};
    resultados.instagram = await this.publicarInstagram({ mensaje, imagenUrl });
    resultados.facebook = await this.publicarFacebook({ mensaje, link });

    await this.logImperial('PUBLICACION_SOCIAL_COMPLETADA', { resultados, mensaje, imagenUrl, link });
    return resultados;
  }

  async procesoAutonomo(parametros = {}) {
    return this.publicarSocial(parametros);
  }
}

async function main() {
  const argsConfig = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const agente = new AgenteObreraSocial(mergeDeep({
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

  const cicloMs = parseInt(process.env.OBRERA_SOCIAL_CICLO_MS ?? '1800000', 10);
  const ciclo = setInterval(() => {
    agente
      .ejecutarMision({ motivo: 'ciclo_social' })
      .catch((error) => agente.handleError('MISION_SOCIAL_FALLIDA', error));
  }, cicloMs);

  const shutdown = async () => {
    clearInterval(ciclo);
    agente.detenerRelojRutina();
    agente.detenerStreamMetricas();
    await agente.logImperial('AGENTE_SOCIAL_APAGADO', { motivo: 'signal' });
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  main().catch((error) => {
    console.error('[AgenteObreraSocial] Error critico al iniciar:', error);
    process.exit(1);
  });
}

export default AgenteObreraSocial;
