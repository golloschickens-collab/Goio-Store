import { promises as fs } from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import AgenteAutonomoImperial, { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD, RUTINA_PATH, DASHBOARD_ENDPOINT, METRICAS_ENDPOINT, responsablesIncluyen, generarNombreArchivo } from './shared.js';

const REPORTES_DIR = path.join(CWD, 'reports', 'exploradoras');

export class AgenteExploradoraImperial extends AgenteAutonomoImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Exploradora-Imperial-01',
        rango: 'SARGENTO',
        ejercito: 'INTELIGENCIA',
        division: 'EXPLORADORAS'
      },
      trazabilidad: {
        dashboardEndpoint: DASHBOARD_ENDPOINT
      },
      integraciones: {
        metricasStreaming: METRICAS_ENDPOINT,
        dashboard: DASHBOARD_ENDPOINT
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'INVESTIGAR_MERCADO', rangoMinimo: 'SOLDADO' },
          { tipo: 'REGISTRAR_OPORTUNIDADES', rangoMinimo: 'SARGENTO' },
          { tipo: 'CIERRE_DIARIO', rangoMinimo: 'SARGENTO' }
        ]
      }
    }, config));

    this.registrarProtocolo('INVESTIGAR_MERCADO', this.investigarMercado);
    this.registrarProtocolo('REGISTRAR_OPORTUNIDADES', this.registrarOportunidades);
    this.registrarProtocolo('CIERRE_DIARIO', this.cierreDiario);
  }

  async inicializar() {
    await super.inicializar();
    await fs.mkdir(REPORTES_DIR, { recursive: true });
    await this.cargarRutinaDesdeArchivo(RUTINA_PATH, (entrada) => {
      if (responsablesIncluyen(entrada, ['inteligencia'])) {
        return {
          hora: entrada.hora,
          protocolo: 'INVESTIGAR_MERCADO',
          parametros: { objetivo: entrada.salida, actividad: entrada.actividad }
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

  async investigarMercado(parametros = {}) {
    const hallazgos = await this.procesoAutonomo(parametros);
    return hallazgos;
  }

  async registrarOportunidades(parametros = {}) {
    await this.emitirReporte('exploradora-oportunidades', parametros);
    this.registrarMetrica('oportunidades_registradas', 1);
    return true;
  }

  async cierreDiario(parametros = {}) {
    await this.emitirReporte('exploradora-cierre', {
      ...parametros,
      bitacora: this.estado.bitacora.slice(-10)
    });
    this.registrarMetrica('cierres_diarios', 1);
    return true;
  }

  async procesoAutonomo(parametros = {}) {
    const searchDir = path.join(CWD, 'reports', 'research');
    let hallazgos = [];

    try {
      const archivos = await fs.readdir(searchDir);
      const archivosJson = archivos.filter((file) => file.endsWith('.json')).sort().reverse();
      if (archivosJson.length) {
        const contenido = await fs.readFile(path.join(searchDir, archivosJson[0]), 'utf8');
        hallazgos = JSON.parse(contenido);
      }
    } catch (error) {
      await this.handleError('SIN_DATOS_TENDENCIAS', error, { searchDir });
    }

    if (!hallazgos.length) {
      hallazgos = [
        {
          product_name: 'Kit Exploración Imperial',
          description: 'Paquete base para medir pulso de mercado cuando no hay datos recientes.',
          target_audience: 'Analistas del Consejo'
        }
      ];
    }

    const reporte = {
      fecha: new Date().toISOString(),
      hallazgos,
      parametros,
      resumen: `Exploradora registró ${hallazgos.length} oportunidades`
    };

    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('hallazgos.json')}`);
    await fs.writeFile(archivo, JSON.stringify(reporte, null, 2));

    this.registrarMetrica('investigaciones', 1);
    await this.logImperial('EXPLORACION_COMPLETADA', { archivo, total: hallazgos.length, parametros });

    return reporte;
  }
}

export default AgenteExploradoraImperial;
