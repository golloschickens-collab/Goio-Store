# Sistema de Recolección de Métricas

## Descripción General

Este sistema está diseñado para recolectar métricas de rendimiento (host y Docker) de múltiples servidores de forma remota y periódica. Utiliza un script de despliegue principal que instala y configura un servicio `systemd` en cada servidor objetivo.

## Componentes

El sistema consta de varios archivos que trabajan en conjunto:

-   `deploy_metrics.sh`: El script principal de orquestación. Se ejecuta desde el equipo de control (o un runner de GitHub Actions) para `desplegar`, `desinstalar` o `parsear` las métricas en los servidores remotos.
-   `collect_metrics.sh`: Este script se copia y ejecuta en cada servidor remoto. Es el encargado de recolectar las métricas (uso de CPU, memoria, disco, estadísticas de Docker) y guardarlas en un archivo de log.
-   `parse_metrics.py`: Un script de Python que procesa los logs crudos generados por `collect_metrics.sh` y los convierte en un formato consolidado (summary).
-   `systemd/goio-metrics.service`: La unidad de servicio de `systemd` que ejecuta `collect_metrics.sh`.
-   `systemd/goio-metrics.timer`: La unidad de timer de `systemd` que activa el servicio `goio-metrics.service` periódicamente (cada hora por defecto).
-   `../../.github/workflows/metrics-deploy.yml`: El workflow de GitHub Actions que automatiza la ejecución de `deploy_metrics.sh`.

## Flujo de Ejecución (vía GitHub Actions)

La forma recomendada de operar este sistema es a través del workflow de GitHub Actions "Métricas — Despliegue/Operación".

1.  **Acceso:** Navega a la pestaña "Actions" de tu repositorio en GitHub.
2.  **Seleccionar Workflow:** Elige "Métricas — Despliegue/Operación" en el menú de la izquierda.
3.  **Ejecutar Workflow:** Haz clic en el botón "Run workflow". Se desplegará un formulario con las siguientes opciones:

    -   `action`: La operación a realizar.
        -   `deploy`: (Por defecto) Instala y activa el colector de métricas en los servidores.
        -   `undeploy`: Detiene y deshabilita el colector. Si se marca `purge`, elimina los archivos.
        -   `parse`: Ejecuta el script para procesar los logs en los servidores.
    -   `hosts`: La lista de servidores a operar, con su delay para el timer (ej: `servidor1:2m,servidor2:5m`).
    -   `ssh_user`: El usuario para la conexión SSH (por defecto `root`).
    -   `purge`: (Booleano) Usado con `undeploy` para eliminar todos los archivos del servidor.
    -   `download_artifacts`: (Booleano) Usado con `parse` para descargar los reportes generados y subirlos como un artefacto de GitHub llamado `metrics-summaries`.

## Ejecución Manual

También puedes ejecutar el script `deploy_metrics.sh` directamente desde un terminal que tenga acceso SSH (con llave privada) a los servidores.

```bash
# Ejemplo de despliegue manual
./deploy_metrics.sh --hosts "ai-masterkernel:2m" --user root deploy
```

## Solución de Problemas

Para problemas comunes de conexión o autenticación con los servidores, consulta la guía dedicada:
[**Guía de Solución de Problemas (TROUBLESHOOTING.md)**](./TROUBLESHOOTING.md)
