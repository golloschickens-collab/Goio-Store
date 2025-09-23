#!/usr/bin/env python3
"""
Parser de métricas (host + docker) desde /var/log/goio-metrics/*.log

Genera:
- CSV consolidado con métricas clave por snapshot
- Resumen Markdown (p50/p95/p99 de CPU iowait, memoria, load1)

Uso:
  python3 scripts/parse_metrics.py --logs /var/log/goio-metrics --out /var/log/goio-metrics/summary
"""

import argparse
import csv
import os
import re
from pathlib import Path
from statistics import mean


RE_TS = re.compile(r"^timestamp:\s*(?P<ts>[^\n]+)")
RE_HOST = re.compile(r"^host:\s*(?P<host>[^\n]+)")
RE_LOAD = re.compile(r"load average:\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)")
RE_MEM = re.compile(r"^Mem:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)")
RE_ROOTFS = re.compile(r"\s(\d+)%\s+/\s*$")


def parse_iostat(lines):
    """Devuelve (iowait_pct, idle_pct) usando el ÚLTIMO bloque avg-cpu de iostat en el archivo."""
    idx = 0
    last = None
    while idx < len(lines):
        if lines[idx].strip().startswith('avg-cpu:'):
            # Encabezados en la misma línea después de 'avg-cpu:'
            headers_line = lines[idx].split(':', 1)[-1]
            headers = [h.strip().lstrip('%') for h in headers_line.split()]
            # Buscar la línea de valores (siguiente línea no vacía)
            j = idx + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines):
                values = [v.strip() for v in lines[j].split()]
                if len(values) == len(headers):
                    row = dict(zip(headers, values))
                    try:
                        iowait = float(row.get('iowait', 'nan'))
                        idle = float(row.get('idle', 'nan'))
                        last = (iowait, idle)
                    except ValueError:
                        pass
            idx = j
        else:
            idx += 1
    return last


def parse_docker_stats(block_lines):
    """Extrae top CPU% y suma total de CPU% aproximada del bloque docker stats.
    Devuelve (top_name, top_cpu, total_cpu)
    """
    if not block_lines:
        return ("", None, None)
    # Detectar header (línea con 'CPU %') y luego parsear líneas siguientes
    top = ("", 0.0)
    total = 0.0
    header_found = False
    for ln in block_lines:
        if not header_found and 'CPU %' in ln:
            header_found = True
            continue
        if not header_found:
            continue
        parts = re.split(r"\s{2,}", ln.strip())
        if len(parts) < 3:
            continue
        name_guess = parts[1] if len(parts) > 1 else parts[0]
        # Buscar un token tipo "12.34%"
        m = re.search(r"([0-9]+\.?[0-9]*)%", ln)
        if not m:
            continue
        try:
            cpu = float(m.group(1))
        except ValueError:
            continue
        total += cpu
        if cpu > top[1]:
            top = (name_guess, cpu)
    if top[1] == 0.0:
        # No se logró parsear; devolver vacíos
        return ("", None, total if total > 0 else None)
    return (top[0], top[1], total)


def parse_log(filepath: Path):
    data = {
        'timestamp': '',
        'host': '',
        'load1': None,
        'mem_used_pct': None,
        'cpu_iowait_pct': None,
        'cpu_idle_pct': None,
        'rootfs_use_pct': None,
        'docker_top_cpu_name': '',
        'docker_top_cpu_pct': None,
        'docker_cpu_total_pct': None,
    }
    with filepath.open('r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # timestamp y host
    for ln in lines[:50]:  # primeras líneas
        m = RE_TS.search(ln)
        if m:
            data['timestamp'] = m.group('ts').strip()
        m = RE_HOST.search(ln)
        if m:
            data['host'] = m.group('host').strip()
        if data['timestamp'] and data['host']:
            break

    # load average (de salida de uptime)
    for ln in lines:
        m = RE_LOAD.search(ln)
        if m:
            try:
                data['load1'] = float(m.group(1))
            except ValueError:
                pass
            break

    # memoria (free -m)
    for ln in lines:
        m = RE_MEM.search(ln)
        if m:
            try:
                total = float(m.group(1))
                used = float(m.group(2))
                if total > 0:
                    data['mem_used_pct'] = round(100.0 * used / total, 2)
            except ValueError:
                pass
            break

    # rootfs usage (df -h, línea de montado /)
    for ln in lines:
        m = RE_ROOTFS.search(ln)
        if m:
            try:
                data['rootfs_use_pct'] = float(m.group(1))
            except ValueError:
                pass
            break

    # iostat
    io = parse_iostat(lines)
    if io:
        data['cpu_iowait_pct'], data['cpu_idle_pct'] = io

    # docker stats block: entre línea "--- docker: stats (no-stream) ---" y la siguiente sección
    docker_block = []
    in_block = False
    for ln in lines:
        if ln.strip().startswith('--- docker: stats (no-stream) ---'):
            in_block = True
            docker_block = []
            continue
        if in_block and ln.strip().startswith('---'):
            # Próxima sección
            break
        if in_block:
            docker_block.append(ln)

    top_name, top_cpu, total_cpu = parse_docker_stats(docker_block)
    data['docker_top_cpu_name'] = top_name
    data['docker_top_cpu_pct'] = top_cpu
    data['docker_cpu_total_pct'] = total_cpu

    return data


def percentiles(series):
    if not series:
        return {}
    arr = sorted(series)
    def p(k):
        if not arr:
            return None
        idx = int(round((k/100.0) * (len(arr)-1)))
        return arr[idx]
    return {
        'p50': p(50), 'p95': p(95), 'p99': p(99), 'avg': round(mean(arr), 2)
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--logs', default='/var/log/goio-metrics', help='Directorio con logs a parsear')
    ap.add_argument('--out', default=None, help='Directorio de salida (por defecto logs/summary)')
    args = ap.parse_args()

    logs_dir = Path(args.logs)
    if not logs_dir.is_dir():
        raise SystemExit(f"No existe el directorio de logs: {logs_dir}")

    out_dir = Path(args.out) if args.out else logs_dir / 'summary'
    out_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    for fp in sorted(logs_dir.glob('*.log')):
        try:
            rows.append(parse_log(fp))
        except Exception as e:
            print(f"Error parseando {fp}: {e}")

    # CSV consolidado
    csv_path = out_dir / 'metrics.csv'
    fields = [
        'timestamp', 'host', 'load1', 'mem_used_pct', 'cpu_iowait_pct', 'cpu_idle_pct',
        'rootfs_use_pct', 'docker_top_cpu_name', 'docker_top_cpu_pct', 'docker_cpu_total_pct'
    ]
    with csv_path.open('w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow(r)

    # Resumen Markdown
    def col(series_key):
        return [float(r[series_key]) for r in rows if r.get(series_key) is not None]

    mem_stats = percentiles(col('mem_used_pct'))
    load_stats = percentiles(col('load1'))
    io_stats = percentiles(col('cpu_iowait_pct'))
    root_stats = percentiles(col('rootfs_use_pct'))

    md = [
        '# Resumen de métricas',
        '',
        f"Muestras: {len(rows)}",
        '',
        '## Memoria usada (%)',
        str(mem_stats),
        '',
        '## Load average (1m)',
        str(load_stats),
        '',
        '## CPU iowait (%)',
        str(io_stats),
        '',
        '## Uso rootfs (%)',
        str(root_stats),
        '',
        'Notas:',
        '- Los percentiles se calculan sobre snapshots horarios.',
        '- docker_top_cpu_name/%% corresponde al contenedor con mayor CPU en cada snapshot.',
    ]

    with (out_dir / 'summary.md').open('w', encoding='utf-8') as f:
        f.write('\n'.join(md) + '\n')

    print(f"CSV: {csv_path}")
    print(f"MD:  {out_dir / 'summary.md'}")


if __name__ == '__main__':
    main()
