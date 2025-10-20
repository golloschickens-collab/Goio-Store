import { promises as fs } from 'fs';
import path from 'path';
import AgenteAutonomoImperial, { mergeDeep } from '../templates/agente-autonomo-imperial.js';
import { CWD, RUTINA_PATH, DASHBOARD_ENDPOINT, METRICAS_ENDPOINT, responsablesIncluyen, generarNombreArchivo } from './shared.js';

const REPORTES_DIR = path.join(CWD, 'reports', 'nodrizas');
const INVENTARIO_TOKENS = path.join(CWD, 'logs', 'imperial', 'tokens');

export class AgenteNodrizaImperial extends AgenteAutonomoImperial {
  constructor(config = {}) {
    super(mergeDeep({
      identidad: {
        nombre: 'Nodriza-Imperial-01',
        rango: 'CAPITAN',
        ejercito: 'ACADEMIA',
        division: 'NODRIZAS'
      },
      trazabilidad: {
        dashboardEndpoint: DASHBOARD_ENDPOINT
      },
      integraciones: {
        metricasStreaming: METRICAS_ENDPOINT
      },
      protocoloCaracter: {
        protocolosAutorizacion: [
          { tipo: 'ADMINISTRAR_RECURSOS', rangoMinimo: 'SARGENTO' },
          { tipo: 'DOCUMENTAR_LECCIONES', rangoMinimo: 'CAPITAN' },
          { tipo: 'CIERRE_DIARIO', rangoMinimo: 'CAPITAN' }
        ]
      }
    }, config));

    this.registrarProtocolo('ADMINISTRAR_RECURSOS', this.administrarRecursos);
    this.registrarProtocolo('DOCUMENTAR_LECCIONES', this.documentarLecciones);
    this.registrarProtocolo('CIERRE_DIARIO', this.cierreDiario);
  }

  async inicializar() {
    await super.inicializar();
    await fs.mkdir(REPORTES_DIR, { recursive: true });
    await fs.mkdir(INVENTARIO_TOKENS, { recursive: true });
    await this.cargarRutinaDesdeArchivo(RUTINA_PATH, (entrada) => {
      if (responsablesIncluyen(entrada, ['academia'])) {
        return {
          hora: entrada.hora,
          protocolo: 'ADMINISTRAR_RECURSOS',
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

  async administrarRecursos(parametros = {}) {
    const resultado = await this.procesoAutonomo(parametros);
    return resultado;
  }

  async documentarLecciones(parametros = {}) {
    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('lecciones.json')}`);
    await fs.writeFile(archivo, JSON.stringify({
      generado_en: new Date().toISOString(),
      parametros,
      notas: parametros.notas || 'Lecciones registradas.'
    }, null, 2));
    this.registrarMetrica('lecciones_documentadas', 1);
    await this.logImperial('LECCION_DOCUMENTADA', { archivo, parametros });
    return true;
  }

  async cierreDiario(parametros = {}) {
    await this.emitirReporte('nodriza-cierre', {
      ...parametros,
      inventario: await this.obtenerEstadoInventario()
    });
    this.registrarMetrica('cierres_diarios', 1);
    return true;
  }

  async procesoAutonomo(parametros = {}) {
    const resumen = {
      timestamp: new Date().toISOString(),
      tokensVerificados: await this.obtenerEstadoInventario(),
      actividad: parametros.actividad ?? 'Gestión de recursos'
    };
    const archivo = path.join(REPORTES_DIR, `${generarNombreArchivo('administracion.json')}`);
    await fs.writeFile(archivo, JSON.stringify(resumen, null, 2));
    this.registrarMetrica('recursos_gestionados', 1);
    await this.logImperial('RECURSOS_ADMINISTRADOS', { archivo, parametros });
    return resumen;
  }

  async obtenerEstadoInventario() {
    try {
      const archivos = await fs.readdir(INVENTARIO_TOKENS);
      return archivos.map((archivo) => ({ archivo }));
    } catch (error) {
      await this.handleError('INVENTARIO_NO_DISPONIBLE', error, { ruta: INVENTARIO_TOKENS });
      return [];
    }
  }
}

export default AgenteNodrizaImperial;
