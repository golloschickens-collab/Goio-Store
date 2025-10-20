import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as metaClient from '../clients/meta.js';
import * as tiktokClient from '../clients/tiktok.js';
import * as whatsappClient from '../clients/whatsapp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureAbsolutePlanPath(planPath) {
  if (!planPath) {
    throw new Error('Debe proporcionar la ruta del plan de contenido.');
  }

  return path.isAbsolute(planPath) ? planPath : path.resolve(process.cwd(), planPath);
}

function cargarPlan(planPath) {
  const raw = fs.readFileSync(planPath, 'utf8');
  return JSON.parse(raw);
}

function normalizarEstrategias(plan) {
  if (!plan) return [];

  if (Array.isArray(plan)) {
    return plan.flatMap((item) => {
      if (item?.estrategias?.length) {
        return item.estrategias.map((estrategia) => ({
          canal: estrategia.canal,
          copy: estrategia.copy,
          media: estrategia.media ?? null,
          trace_id: estrategia.trace_id ?? `${(item.productName ?? 'producto').replace(/\s+/g, '-').toLowerCase()}-${estrategia.canal}`,
        }));
      }

      if (item?.canal && item?.copy) {
        return [{
          canal: item.canal,
          copy: item.copy,
          media: item.media ?? null,
          trace_id: item.trace_id ?? `${(item.productName ?? 'plan').replace(/\s+/g, '-').toLowerCase()}-${item.canal}`,
        }];
      }

      return [];
    });
  }

  if (plan?.estrategias && Array.isArray(plan.estrategias)) {
    return plan.estrategias.map((estrategia, index) => ({
      canal: estrategia.canal,
      copy: estrategia.copy,
      media: estrategia.media ?? null,
      trace_id: estrategia.trace_id ?? `estrategia-${index}`,
    }));
  }

  return [];
}

function seleccionarCliente(canal) {
  switch ((canal ?? '').toLowerCase()) {
    case 'meta':
      return {
        nombre: 'meta',
        publicar: (copy, media) => metaClient.publicar(copy, media),
      };
    case 'tiktok':
      return {
        nombre: 'tiktok',
        publicar: (copy, media) => tiktokClient.publicar(copy, media),
      };
    case 'whatsapp':
      return {
        nombre: 'whatsapp',
        publicar: (copy, telefono) => whatsappClient.enviar(copy, telefono),
      };
    default:
      return null;
  }
}

export async function publicarContenido(planPath, opciones = {}) {
  const ruta = ensureAbsolutePlanPath(planPath);
  const plan = cargarPlan(ruta);
  const estrategias = normalizarEstrategias(plan);

  if (!estrategias.length) {
    console.warn('[MultiChannelPublisher] No se encontraron estrategias en el plan proporcionado.');
    return;
  }

  for (const estrategia of estrategias) {
    const { canal, copy, media, trace_id } = estrategia;
    if (!canal || !copy) {
      console.warn(`[MultiChannelPublisher] Estrategia omitida por datos incompletos: ${JSON.stringify(estrategia)}`);
      continue;
    }

    const cliente = seleccionarCliente(canal);
    if (!cliente) {
      console.warn(`[MultiChannelPublisher] Canal desconocido: ${canal}`);
      continue;
    }

    try {
      let resultado;
      if (cliente.nombre === 'whatsapp') {
        const destino = estrategia.telefono || opciones.telefonoWhatsapp || process.env.WHATSAPP_DEFAULT_RECIPIENT || media?.telefono;
        resultado = await cliente.publicar(copy, destino);
      } else {
        resultado = await cliente.publicar(copy, media ?? null);
      }

      console.log(`[${trace_id ?? 'sin-trace'}] Publicado en ${cliente.nombre}:`, resultado);
    } catch (error) {
      console.error(`[${trace_id ?? 'sin-trace'}] Error al publicar en ${cliente?.nombre ?? canal}:`, error.message ?? error);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const [, , planPath] = process.argv;
  publicarContenido(planPath).catch((error) => {
    console.error('[MultiChannelPublisher] Error fatal:', error);
    process.exit(1);
  });
}
