# RecolecciÃ³n de mÃ©tricas (host + docker) â€” guÃ­a rÃ¡pida

Objetivo: capturar snapshots periÃ³dicos (host + docker) durante 3â€“7 dÃ­as para evaluar rightsizing.

## 1) Instalar dependencias (una vez)
- sysstat para iostat
- permisos para escribir logs en /var/log/goio-metrics

```bash
# Ubuntu/Debian (como root)
apt-get update && apt-get install -y sysstat
```

## 2) Ejecutar manualmente (prueba)
Instala el script en la ruta estandarizada y pruÃ©balo:
```bash
install -m 0755 -o root -g root scripts/collect_metrics.sh /usr/local/bin/collect_metrics.sh
sudo /usr/local/bin/collect_metrics.sh
```
Salida en: `/var/log/goio-metrics/<host>-<timestamp>.log`

## 3) Automatizar con systemd (cada hora)
Copia las unidades de ejemplo y actÃ­valas:
```bash
cp scripts/systemd/goio-metrics.service /etc/systemd/system/
cp scripts/systemd/goio-metrics.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now goio-metrics.timer
systemctl status goio-metrics.timer --no-pager
```

Activa y arranca:
```bash
systemctl daemon-reload
systemctl enable --now goio-metrics.timer
systemctl status goio-metrics.timer
```

## 4) Recolectar y consolidar
- Tras 3â€“7 dÃ­as, ejecuta el parser para generar CSV y un resumen:
```bash
python3 scripts/parse_metrics.py --logs /var/log/goio-metrics --out /var/log/goio-metrics/summary
```
- Entrega `/var/log/goio-metrics/summary/metrics.csv` y `/var/log/goio-metrics/summary/summary.md`.

## 5) Notas
- El script es read-only. No cambia configuraciÃ³n.
- Si alguna herramienta falta (docker/iostat), el log lo indicarÃ¡.
- Para detener, `systemctl disable --now goio-metrics.timer`.
