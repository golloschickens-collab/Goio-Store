import { promises as fs } from 'fs';
import path from 'path';
import AgenteAutonomoImperial, { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD, RUTINA_PATH, DASHBOARD_ENDPOINT, METRICAS_ENDPOINT, responsablesIncluyen, generarNombreArchivo } from './shared.js';

const REPORTES_DIR = path.join(CWD, 'reports', 'obreras');

export class AgenteObreraImperial extends AgenteAutonomoImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Obrera-Imperial-01',
        rango: 'SOLDADO',
        ejercito: 'COMERCIAL',
        division: 'OBRERAS'
      },
      trazabilidad: {
        dashboardEndpoint: DASHBOARD_ENDPOINT
      },
      integraciones: {
        metricasStreaming: METRICAS_ENDPOINT
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'EJECUTAR_CAMPANAS', rangoMinimo: 'SOLDADO' },
          { tipo: 'ACTUALIZAR_METRICAS', rangoMinimo: 'SOLDADO' },
          { tipo: 'CIERRE_DIARIO', rangoMinimo: 'SARGENTO' }
        ]
      }
    }, config));

    this.registrarProtocolo('EJECUTAR_CAMPANAS', this.ejecutarCampanas);
    this.registrarProtocolo('ACTUALIZAR_METRICAS', this.actualizarMetricas);
    this.registrarProtocolo('CIERRE_DIARIO', this.cierreDiario);
  }

  async inicializar() {
    await super.inicializar();
    await fs.mkdir(REPORTES_DIR, { recursive: true });
    await this.cargarRutinaDesdeArchivo(RUTINA_PATH, (entrada) => {
      if (responsablesIncluyen(entrada, ['comercial', 'creativo'])) {
        return {
          hora: entrada.hora,
          protocolo: 'EJECUTAR_CAMPANAS',
          parametros: { actividad: entrada.actividad, salida: entrada.salida }
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

  async ejecutarCampanas(parametros = {}) {
    const resultado = await this.procesoAutonomo(parametros);
    return resultado;
  }

  async actualizarMetricas(parametros = {}) {
    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('metricas.json')}`);
    await fs.writeFile(archivo, JSON.stringify({
      generado_en: new Date().toISOString(),
      parametros,
      metricas: Object.fromEntries(this.metricas.entries())
    }, null, 2));
    this.registrarMetrica('metricas_actualizadas', 1);
    await this.logImperial('METRICAS_OBRERAS_ACTUALIZADAS', { archivo });
    return true;
  }

  async cierreDiario(parametros = {}) {
    await this.actualizarMetricas(parametros);
    return true;
  }

  async procesoAutonomo(parametros = {}) {
    const contenido = {
      timestamp: new Date().toISOString(),
      tarea: parametros.actividad ?? 'Campaña automatizada',
      publicaciones: [
        {
          canal: 'shopify-blog',
          mensaje: 'Actualización de catálogo completada.',
          status: 'scheduled'
        },
        {
          canal: 'facebook-organico',
          mensaje: 'Contenido listo para publicar.',
          status: 'en revisión'
        }
      ]
    };

    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('campana.json')}`);
    await fs.writeFile(archivo, JSON.stringify(contenido, null, 2));
    this.registrarMetrica('campanas_ejecutadas', 1);
    await this.logImperial('CAMPANA_EJECUTADA', { archivo, parametros });
    return contenido;
  }
}

export default AgenteObreraImperial;
