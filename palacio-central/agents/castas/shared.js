import path from 'path';
import dayjs from 'dayjs';

export const CWD = process.cwd();
export const RUTINA_PATH = path.join(CWD, 'consejo-imperial', 'estrategia-hormiguero', 'rutina-diaria-fase-1.json');
export const DASHBOARD_ENDPOINT = process.env.DASHBOARD_ENDPOINT || 'http://localhost:3002/dashboard/report';
export const METRICAS_ENDPOINT = process.env.METRICAS_ENDPOINT || 'http://localhost:3002/dashboard/metrics';

export function responsablesIncluyen(entrada, palabrasClave = []) {
  if (!Array.isArray(entrada.responsables)) return false;
  const normalizados = entrada.responsables.map((item) => item.toLowerCase());
  return palabrasClave.some((palabra) => normalizados.some((res) => res.includes(palabra.toLowerCase())));
}

export function generarNombreArchivo(base) {
  return `${dayjs().format('YYYYMMDD-HHmmss')}-${base}`;
}
