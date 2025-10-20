import { promises as fs } from 'fs';
import path from 'path';
import AgenteAutonomoImperial, { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD, RUTINA_PATH, DASHBOARD_ENDPOINT, METRICAS_ENDPOINT, responsablesIncluyen, generarNombreArchivo } from './shared.js';

const REPORTES_DIR = path.join(CWD, 'reports', 'soldados');

export class AgenteSoldadoImperial extends AgenteAutonomoImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Soldado-Imperial-01',
        rango: 'TENIENTE',
        ejercito: 'TECNICO',
        division: 'FORTALEZA'
      },
      trazabilidad: {
        dashboardEndpoint: DASHBOARD_ENDPOINT
      },
      defensa: {
        credenciales: {
          SHOPIFY_ADMIN_TOKEN_PROD: async () => Boolean(process.env.SHOPIFY_ADMIN_TOKEN_PROD),
          SHOPIFY_ADMIN_TOKEN_DEV: async () => Boolean(process.env.SHOPIFY_ADMIN_TOKEN_DEV),
          GEMINI_API_KEY: async () => Boolean(process.env.GEMINI_API_KEY)
        }
      },
      integraciones: {
        metricasStreaming: METRICAS_ENDPOINT
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'VERIFICAR_SEGURIDAD', rangoMinimo: 'SOLDADO' },
          { tipo: 'ROTAR_CREDENCIALES', rangoMinimo: 'TENIENTE' },
          { tipo: 'CIERRE_DIARIO', rangoMinimo: 'TENIENTE' }
        ]
      }
    }, config));

    this.registrarProtocolo('VERIFICAR_SEGURIDAD', this.verificarSeguridad);
    this.registrarProtocolo('ROTAR_CREDENCIALES', this.rotarCredenciales);
    this.registrarProtocolo('CIERRE_DIARIO', this.cierreDiario);
  }

  async inicializar() {
    await super.inicializar();
    await fs.mkdir(REPORTES_DIR, { recursive: true });
    await this.cargarRutinaDesdeArchivo(RUTINA_PATH, (entrada) => {
      if (responsablesIncluyen(entrada, ['técnico', 'tecnico'])) {
        return {
          hora: entrada.hora,
          protocolo: 'VERIFICAR_SEGURIDAD',
          parametros: { actividad: entrada.actividad }
        };
      }
      if (responsablesIncluyen(entrada, ['todos'])) {
        return {
          hora: entrada.hora,
          protocolo: 'CIERRE_DIARIO',
          parametros: { resumen: entrada.salida }
        };
      }
      return null;
    });
  }

  async activar() {
    await this.certificar();
    this.iniciarRelojRutina();
    this.iniciarStreamMetricas();
    await this.ejecutarMision({ motivo: 'inicio_automatico' }).catch((error) => this.handleError('MISION_INICIO_FALLIDA', error));
  }

  async verificarSeguridad(parametros = {}) {
    const resultado = await this.procesoAutonomo(parametros);
    return resultado;
  }

  async rotarCredenciales(parametros = {}) {
    const registro = {
      realizado_por: this.identidad.nombre,
      fecha: new Date().toISOString(),
      parametros
    };
    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('rotacion.json')}`);
    await fs.writeFile(archivo, JSON.stringify(registro, null, 2));
    this.registrarMetrica('rotaciones_credenciales', 1);
    await this.logImperial('ROTACION_CREDENCIALES', { archivo, parametros });
    return registro;
  }

  async cierreDiario(parametros = {}) {
    await this.emitirReporte('soldado-cierre', {
      ...parametros,
      resumenSeguridad: Object.fromEntries(this.metricas.entries())
    });
    return true;
  }

  async procesoAutonomo(parametros = {}) {
    await this.monitorearCredenciales();
    const reporte = {
      timestamp: new Date().toISOString(),
      estadoCredenciales: Object.keys(this.config.defensa.credenciales),
      actividad: parametros.actividad ?? 'Verificación programada'
    };
    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('seguridad.json')}`);
    await fs.writeFile(archivo, JSON.stringify(reporte, null, 2));
    this.registrarMetrica('verificaciones_seguridad', 1);
    await this.logImperial('SEGURIDAD_VERIFICADA', { archivo, parametros });
    return reporte;
  }
}

export default AgenteSoldadoImperial;
