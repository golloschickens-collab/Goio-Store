# Guía de Solución de Problemas - Sistema de Métricas

Esta guía cubre los errores más comunes al intentar desplegar o gestionar el sistema de recolección de métricas.

---

### Problema 1: Falla de Conexión

-   **Síntomas:** El script falla con un mensaje de `Connection timed out`, `Connection closed by remote host`, o similar. El error ocurre rápidamente al intentar conectar con un host.
-   **Causa Probable:** Existe un firewall que está bloqueando la conexión SSH (puerto 22) desde la máquina que ejecuta el script (tu PC o un runner de GitHub Actions) hacia el servidor remoto.
-   **Solución:**
    1.  **Identificar la IP de Origen:** Si ejecutas desde GitHub Actions, puede que necesites identificar el rango de IPs de los runners. Si es desde tu PC, necesitas tu IP pública.
    2.  **Configurar el Firewall:** Accede al panel de control de tu proveedor de hosting (Hetzner, AWS, DigitalOcean, etc.) para el servidor afectado.
    3.  **Añadir Regla:** Crea una nueva regla en el firewall asociado al servidor para permitir el tráfico TCP entrante en el puerto `22` desde la IP de origen identificada.
    4.  **Caso Específico:** Este problema fue identificado en el servidor `goio-store` (IP `78.156.195.120`).

---

### Problema 2: Falla de Autenticación

-   **Síntomas:** El script falla con un mensaje de `Permission denied (publickey)`. Esto significa que la conexión se estableció, pero el servidor rechazó la autenticación.
-   **Causa Probable:** La llave pública SSH (`metrics_deploy_key.pub` o la que estés usando) no se encuentra en el archivo `~/.ssh/authorized_keys` del usuario con el que intentas conectar (ej. `root`) en el servidor remoto.
-   **Solución:**
    1.  **Obtén tu llave pública:** Asegúrate de tener el contenido de tu archivo de llave pública (ej. `~/.ssh/id_rsa.pub`, `metrics_deploy_key.pub`).
    2.  **Accede al Servidor Remoto:** Conéctate al servidor usando un método alternativo (contraseña, o una llave SSH que ya funcione).
    3.  **Añade la Llave:** Edita el archivo `~/.ssh/authorized_keys` (créalo si no existe) y añade el contenido de tu llave pública en una nueva línea.
        ```bash
        # Ejemplo en el servidor remoto
        echo "ssh-rsa AAAAB3NzaC1yc2EAAA..." >> /root/.ssh/authorized_keys
        ```
    4.  **Verifica Permisos:** Asegúrate de que los permisos de los archivos y directorios sean correctos en el servidor.
        ```bash
        chmod 700 ~/.ssh
        chmod 600 ~/.ssh/authorized_keys
        ```
    5.  **Caso Específico:** Este problema fue identificado para los servidores `eco-eterno` y `gollos-server-1`.

---

### Nota Histórica: `scp` vs `rsync`

-   **Problema:** Durante el desarrollo inicial, el comando `scp` fallaba intermitentemente en el entorno de GitHub Actions con errores de "Connection closed".
-   **Solución Implementada:** El script `deploy_metrics.sh` fue modificado para usar `rsync` en lugar de `scp`. `rsync` es más robusto y tolerante a fallos en redes inestables, lo cual es común en entornos de CI/CD. Esto ya está solucionado y se mantiene como una nota de buena práctica.
