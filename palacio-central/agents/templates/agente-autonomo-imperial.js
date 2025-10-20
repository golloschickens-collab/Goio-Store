import { promises as fs } from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Plantilla base para instanciar nuevos agentes autónomos del Imperio Goio.
 *
 * Principios garantizados:
 * 1. Autonomía Operativa
 * 2. Trazabilidad y Control
 * 3. Defensa y Resiliencia
 * 4. Evolución Continua
 * 5. Replicabilidad y Escalabilidad
 * 6. Integración Estratégica
 * 7. Carácter Imperial
 */
const DEFAULT_CONFIG = {
  identidad: {
    nombre: 'PlantillaImperial',
    rango: 'SOLDADO',
    ejercito: 'INTELIGENCIA',
    division: 'ALFA'
  },
  autonomia: {
    supervisionRequerida: false,
    contingenciaAutomatica: true,
    escalabilidad: 'horizontal',
    maxIntentosRecuperacion: 3
  },
  trazabilidad: {
    dashboardEndpoint: null,
    nivelLog: 'info',
    persistenciaLocal: true
  },
  defensa: {
    credenciales: {},
    servidoresBackup: ['hetzner-1', 'cloudflare-1'],
    alertas: {
      webhook: null,
      canal: 'defensa-imperial'
    }
  },
  evolucion: {
    modulos: {},
    fuentesExternas: ['github', 'apis', 'marketplaces'],
    habilitarAprendizaje: true
  },
  replicabilidad: {
    plantillaConfiguracion: {},
    validacionesPrevias: ['verificar-entorno', 'probar-credenciales']
  },
  integraciones: {
    n8n: null,
    cloudflare: null,
    shopify: null,
    hetzner: null,
    metricasStreaming: null
  },
  protocoloCaracter: {
    lealtad: 'IMPERIO_GOIO',
    disciplina: 'ABSOLUTA',
    protocolosAutorizacion: []
  },
  rutinaDiaria: [],
  reportes: {
    habilitar: true,
    destino: 'reports/imperial/agentes'
  },
  rutinaDistribuida: null
};

const CWD = process.cwd();

export class AgenteAutonomoImperial {
  constructor(config = {}) {
    this.config = mergeDeep(DEFAULT_CONFIG, config);
    this.id = config.id ?? uuidv4();

    this.identidad = {
      ...this.config.identidad,
      agente_id: this.config.identidad.agente_id ?? this.id
    };

    this.estado = {
      misionesCompletadas: 0,
      misionesFallidas: 0,
      alertasEmitidas: 0,
      ultimaActualizacion: null,
      bitacora: []
    };

    this.protocolos = new Map();
    this.metricas = new Map();
    this.rutina = Array.isArray(this.config.rutinaDiaria)
      ? this.config.rutinaDiaria
      : Array.isArray(this.config.rutinaDistribuida)
        ? this.config.rutinaDistribuida
        : [];
    this.rutinaInterval = null;
    this.metricasInterval = null;

    this.paths = {
      logs: path.join(CWD, 'logs', 'imperial', 'agentes', this.identidad.nombre.toLowerCase()),
      reports: path.join(CWD, this.config.reportes.destino),
      operaciones: path.join(CWD, 'logs', 'imperial', 'operations'),
      credenciales: path.join(CWD, 'logs', 'imperial', 'credenciales'),
      publicaciones: path.join(CWD, 'logs', 'imperial', 'publicaciones')
    };
  }

  /**
   * Inicializa diagnóstico, crea carpetas y registra arranque.
   */
  async inicializar() {
    await fs.mkdir(this.paths.logs, { recursive: true });
    if (this.config.reportes.habilitar) {
      await fs.mkdir(this.paths.reports, { recursive: true });
    }
    await fs.mkdir(this.paths.operaciones, { recursive: true });
    await fs.mkdir(this.paths.credenciales, { recursive: true });
    await fs.mkdir(this.paths.publicaciones, { recursive: true });

    const traceId = this.generarTraceId('ARRANQUE');
    await this.logImperial('AGENTE_INICIALIZADO', {
      traceId,
      identidad: this.identidad,
      config: this.config.autonomia
    });

    return traceId;
  }

  async cargarRutinaDesdeArchivo(rutaArchivo, asignadorProtocolos) {
    if (Array.isArray(this.config.rutinaDistribuida) && this.config.rutinaDistribuida.length > 0) {
      this.rutina = this.config.rutinaDistribuida;
      await this.logImperial('RUTINA_ASIGNADA_SUPERVISOR', {
        tareas: this.rutina.length,
        fuente: 'supervisor',
        rutaArchivo
      });
      return;
    }

    try {
      const contenido = await fs.readFile(rutaArchivo, 'utf8');
      const rutina = JSON.parse(contenido);
      const horario = rutina.horario ?? [];

      const tareasAsignadas = horario
        .map((entrada) => {
          const tarea = asignadorProtocolos ? asignadorProtocolos(entrada) : entrada;
          if (!tarea) return null;
          return {
            hora: tarea.hora,
            protocolo: tarea.protocolo,
            parametros: tarea.parametros ?? {},
            contexto: {
              actividad: entrada.actividad,
              responsables: entrada.responsables,
              salida: entrada.salida,
              fase: rutina.fase
            }
          };
        })
        .filter(Boolean);

      this.rutina = tareasAsignadas;
      await this.logImperial('RUTINA_ASIGNADA', { tareas: this.rutina.length, rutaArchivo });
    } catch (error) {
      await this.handleError('RUTINA_NO_CARGADA', error, { rutaArchivo });
    }
  }

  generarTraceId(operacion) {
    const timestamp = dayjs().format('YYYYMMDD-HHmmss');
    const slug = operacion.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return `AG-${this.identidad.ejercito}-${timestamp}-${slug}-${uuidv4().slice(0, 8)}`;
  }

  generarTraceIdRutina(fechaReferencia = new Date()) {
    const fecha = dayjs(fechaReferencia).format('YYYYMMDD');
    const nombre = this.identidad.nombre.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return `RUTINA-${fecha}-${nombre}-${uuidv4().slice(0, 6)}`;
  }

  async logImperial(operacion, data = {}) {
    const traceId = data.traceId ?? this.generarTraceId(operacion);
    const entry = {
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      agente: this.identidad.nombre,
      ejercito: this.identidad.ejercito,
      operacion,
      data,
      imperio: 'GOIO'
    };

    this.estado.bitacora.push(entry);

    if (this.config.trazabilidad.persistenciaLocal) {
      const filePath = path.join(this.paths.logs, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
      await fs.appendFile(filePath, JSON.stringify(entry) + '\n');
    }

    const operationsPath = path.join(this.paths.operaciones, `${dayjs().format('YYYY-MM-DD')}.log.jsonl`);
    await fs.appendFile(operationsPath, JSON.stringify(entry) + '\n');

    if (this.config.trazabilidad.dashboardEndpoint) {
      try {
        await axios.post(this.config.trazabilidad.dashboardEndpoint, entry);
      } catch (error) {
        console.warn(`[${this.identidad.nombre}] No se pudo reportar al dashboard`, error.message);
      }
    }

    return traceId;
  }

  registrarProtocolo(nombre, handler, metadatos = {}) {
    this.protocolos.set(nombre, { handler, metadatos });
  }

  async ejecutarOrden(orden) {
    if (!this.verificarAutorizacion(orden)) {
      await this.logImperial('ORDEN_NO_AUTORIZADA', { orden });
      return { exito: false, motivo: 'autorizacion_rechazada' };
    }

    const protocolo = this.protocolos.get(orden.tipo);
    if (!protocolo) {
      await this.logImperial('PROTOCOLO_NO_ENCONTRADO', { orden });
      return { exito: false, motivo: 'protocolo_inexistente' };
    }

    try {
      const resultado = await protocolo.handler.call(this, orden.parametros, orden);
      this.estado.misionesCompletadas += 1;
      this.estado.ultimaActualizacion = new Date().toISOString();
      const payload = { orden, resultado };
      if (orden.traceId) {
        payload.traceId = orden.traceId;
      }
      await this.logImperial('ORDEN_EJECUTADA', payload);
      return { exito: true, resultado };
    } catch (error) {
      this.estado.misionesFallidas += 1;
      const payload = { orden };
      if (orden.traceId) {
        payload.traceId = orden.traceId;
      }
      await this.handleError('ORDEN_FALLIDA', error, payload);
      return { exito: false, motivo: 'error_ejecucion', error: error.message };
    }
  }

  verificarAutorizacion(orden) {
    const protocolosAutorizacion = this.config.protocoloCaracter.protocolosAutorizacion;
    if (!protocolosAutorizacion.length) return true;

    return protocolosAutorizacion.some((protocolo) => {
      if (protocolo.tipo && protocolo.tipo !== orden.tipo) return false;
      if (protocolo.rangoMinimo && !this.rangoSuficiente(protocolo.rangoMinimo)) return false;
      if (protocolo.autoridadesPermitidas && !protocolo.autoridadesPermitidas.includes(orden.autorizado_por)) return false;
      return true;
    });
  }

  rangoSuficiente(rangoMinimo) {
    const jerarquia = ['SOLDADO', 'SARGENTO', 'TENIENTE', 'CAPITAN', 'GENERAL'];
    const nivelActual = jerarquia.indexOf(this.identidad.rango.toUpperCase());
    const nivelRequerido = jerarquia.indexOf(rangoMinimo.toUpperCase());
    return nivelActual >= nivelRequerido;
  }

  async handleError(contexto, error, payload = {}) {
    const traceId = await this.logImperial(contexto, {
      ...payload,
      error: error.message,
      stack: error.stack
    });

    if (this.config.defensa.alertas.webhook) {
      try {
        await axios.post(this.config.defensa.alertas.webhook, {
          trace_id: traceId,
          contexto,
          agente: this.identidad,
          mensaje: error.message,
          canal: this.config.defensa.alertas.canal
        });
      } catch (alertError) {
        console.warn(`[${this.identidad.nombre}] No se pudo enviar alerta`, alertError.message);
      }
    }

    this.estado.alertasEmitidas += 1;
    return traceId;
  }

  async ejecutarRutina(fechaReferencia = new Date()) {
    if (!this.rutina.length) return;

    const horarioActual = dayjs(fechaReferencia).format('HH:mm');
    const tareas = this.rutina.filter((bloque) => bloque.hora === horarioActual);

    if (!tareas.length) return;

    const traceId = this.generarTraceIdRutina(fechaReferencia);
    await this.logImperial('RUTINA_DISPARADA', { traceId, hora: horarioActual, tareas: tareas.map((t) => t.protocolo) });

    for (const tarea of tareas) {
      const orden = {
        tipo: tarea.protocolo,
        parametros: tarea.parametros ?? {},
        autorizado_por: tarea.autoridad ?? 'ConsejoImperial',
        traceId
      };
      await this.ejecutarOrden(orden);
    }
  }

  iniciarRelojRutina(intervaloMs = 60000) {
    if (this.rutinaInterval) return;
    this.rutinaInterval = setInterval(() => {
      this.ejecutarRutina().catch((error) => this.handleError('RUTINA_ERROR', error));
    }, intervaloMs);
  }

  detenerRelojRutina() {
    if (this.rutinaInterval) {
      clearInterval(this.rutinaInterval);
      this.rutinaInterval = null;
    }
  }

  async monitorearCredenciales() {
    const credenciales = this.config.defensa.credenciales;
    const nombres = Object.keys(credenciales);

    for (const nombre of nombres) {
      const verificador = credenciales[nombre];
      const esValida = await verificador();
      if (!esValida) {
        await this.handleError('CREDENCIAL_INVALIDA', new Error(`Credencial ${nombre} inválida`));
      }
    }
  }

  async evolucionar() {
    if (!this.config.evolucion.habilitarAprendizaje) return;
    await this.logImperial('EVOLUCION_INICIADA', { fuentes: this.config.evolucion.fuentesExternas });
    // Lugar para conectar análisis de logs, IA o scripts externos.
  }

  async sincronizarIntegraciones() {
    const entradas = Object.entries(this.config.integraciones).filter(([_, valor]) => Boolean(valor));
    for (const [servicio, endpoint] of entradas) {
      try {
        await axios.post(endpoint, { agente: this.identidad, timestamp: new Date().toISOString() });
        await this.logImperial('INTEGRACION_EXITOSA', { servicio, endpoint });
      } catch (error) {
        await this.handleError('INTEGRACION_FALLIDA', error, { servicio, endpoint });
      }
    }
  }

  async transmitirMetricas() {
    if (!this.metricas.size) return;
    const payload = Object.fromEntries(this.metricas.entries());
    if (this.config.integraciones.metricasStreaming) {
      try {
        await axios.post(this.config.integraciones.metricasStreaming, {
          agente: this.identidad,
          timestamp: new Date().toISOString(),
          metricas: payload
        });
      } catch (error) {
        await this.handleError('METRICAS_NO_ENVIADAS', error, { payload });
      }
    }

    if (this.config.trazabilidad.dashboardEndpoint && this.config.integraciones.metricasStreaming !== this.config.trazabilidad.dashboardEndpoint) {
      try {
        await axios.post(this.config.trazabilidad.dashboardEndpoint, {
          tipo: 'metricas',
          agente: this.identidad,
          timestamp: new Date().toISOString(),
          metricas: payload
        });
      } catch (error) {
        await this.handleError('DASHBOARD_NO_DISPONIBLE', error, { payload });
      }
    }
  }

  iniciarStreamMetricas(intervaloMs = 5000) {
    if (this.metricasInterval) return;
    this.metricasInterval = setInterval(() => {
      this.transmitirMetricas().catch((error) => this.handleError('STREAM_METRICAS_ERROR', error));
    }, intervaloMs);
  }

  detenerStreamMetricas() {
    if (this.metricasInterval) {
      clearInterval(this.metricasInterval);
      this.metricasInterval = null;
    }
  }

  async emitirReporte(titulo, datos) {
    if (!this.config.reportes.habilitar) return null;
    const safeTitle = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${dayjs().format('YYYYMMDD-HHmm')}-${safeTitle}.json`;
    const filePath = path.join(this.paths.reports, fileName);
    await fs.writeFile(filePath, JSON.stringify({
      titulo,
      generado_en: new Date().toISOString(),
      agente: this.identidad,
      datos
    }, null, 2));
    await this.logImperial('REPORTE_EMITIDO', { titulo, filePath });
    return filePath;
  }

  async clonar(nuevaIdentidad = {}, overrides = {}) {
    const nuevaConfig = mergeDeep(this.config, overrides);
    nuevaConfig.identidad = {
      ...this.config.identidad,
      ...nuevaIdentidad,
      agente_id: nuevaIdentidad.agente_id ?? uuidv4()
    };
    const nuevoAgente = new AgenteAutonomoImperial(nuevaConfig);
    await nuevoAgente.inicializar();
    return nuevoAgente;
  }

  registrarMetrica(nombre, valor = 1) {
    const actual = this.metricas.get(nombre) ?? 0;
    this.metricas.set(nombre, actual + valor);
  }

  async guardarMetricas(titulo = 'metricas-diarias') {
    const datos = Object.fromEntries(this.metricas.entries());
    return this.emitirReporte(titulo, datos);
  }

  /**
   * Ejecuta el protocolo principal de forma autónoma.
   * Sobrescribir `procesoAutonomo` para personalización.
   */
  async ejecutarMision(parametros = {}) {
    let intentos = 0;
    while (intentos <= this.config.autonomia.maxIntentosRecuperacion) {
      try {
        const resultado = await this.procesoAutonomo(parametros);
        this.estado.misionesCompletadas += 1;
        await this.logImperial('MISION_COMPLETADA', { parametros, resultado });
        return resultado;
      } catch (error) {
        intentos += 1;
        this.estado.misionesFallidas += 1;
        await this.handleError('MISION_FALLIDA', error, { intentos, parametros });
        if (intentos > this.config.autonomia.maxIntentosRecuperacion) {
          throw error;
        }
      }
    }
  }

  // Método a redefinir por cada agente concreto
  async procesoAutonomo() {
    throw new Error('procesoAutonomo no implementado');
  }

  async certificar() {
    const resultados = {
      autonomia: this.config.autonomia.supervisionRequerida === false && this.config.autonomia.contingenciaAutomatica === true,
      trazabilidad: Boolean(this.config.trazabilidad.dashboardEndpoint || this.config.trazabilidad.persistenciaLocal),
      defensa: this.config.defensa && Array.isArray(this.config.defensa.servidoresBackup) && this.config.defensa.servidoresBackup.length > 0,
      evolucion: this.config.evolucion && this.config.evolucion.habilitarAprendizaje === true,
      replicabilidad: this.config.replicabilidad && Array.isArray(this.config.replicabilidad.validacionesPrevias) && this.config.replicabilidad.validacionesPrevias.length > 0,
      integracion: Boolean(this.config.integraciones && (this.config.integraciones.metricasStreaming || Object.values(this.config.integraciones).some(Boolean))),
      caracter: this.config.protocoloCaracter && this.config.protocoloCaracter.lealtad === 'IMPERIO_GOIO'
    };

    const aprobado = Object.values(resultados).every(Boolean);
    const carpetaCertificaciones = path.join(CWD, 'logs', 'imperial', 'certificaciones');
    await fs.mkdir(carpetaCertificaciones, { recursive: true });

    const reporte = {
      agente: this.identidad,
      fecha: new Date().toISOString(),
      resultados,
      aprobado
    };

    const archivo = path.join(
      carpetaCertificaciones,
      `${dayjs().format('YYYYMMDD-HHmmss')}-${this.identidad.nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    );

    await fs.writeFile(archivo, JSON.stringify(reporte, null, 2));
    await this.logImperial('CERTIFICACION_COMPLETADA', { aprobado, archivo, resultados });

    return { aprobado, archivo, resultados };
  }
}

export function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        output[key] = source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export default AgenteAutonomoImperial;
