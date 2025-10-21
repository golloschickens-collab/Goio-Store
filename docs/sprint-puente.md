# Sprint Operativo: El Puente al Mundo (Traefik en Producción)

**Objetivo:** Poner en producción el reverse proxy Traefik para exponer de forma segura y unificada los servicios auto-alojados del imperio, con certificados SSL válidos y configuraciones de seguridad robustas.

## Checklist de Ejecución

### Fase 1: Preparación del Reverse Proxy (Traefik)

- [ ] **Pasar a Producción de Let's Encrypt:**
  - Editar `reverse-proxy/docker-compose.yml`.
  - Eliminar la línea `caServer` del proveedor de certificados ACME.
- [ ] **Fortalecer Credenciales del Dashboard:**
  - Generar una contraseña segura para el dashboard de Traefik usando `htpasswd`.
  - Reemplazar las credenciales `admin/admin` por defecto.
- [ ] **Configurar Middlewares Globales:**
  - Asegurar que la redirección HTTP a HTTPS esté activa.
  - Añadir cabeceras de seguridad básicas (HSTS, Frame-Deny, etc.).
  - Configurar `forwardedHeaders.trustedIPs` para confiar en los rangos de Cloudflare y preservar la IP real del cliente.

### Fase 2: Integración de Servicios

- [ ] **`palacio-central`:**
  - Añadir labels de Traefik a su `docker-compose.yml` para el dominio `palacio.goio.store`.
  - Asegurar que se une a la red `edge`.
- [ ] **`ollama`:**
  - Añadir labels de Traefik para el dominio `ollama.goio.store`.
  - Aplicar un middleware de autenticación básica (`basic-auth`) para proteger el acceso.
  - Asegurar que se une a la red `edge`.
- [ ] **Otros Servicios (goio-store, gollos-landing, eco-eterno):**
  - Repetir el proceso de añadir labels y conectar a la red `edge` para sus respectivos dominios (`goio.store`, `gollos.goio.store`, `eco.goio.store`).

### Fase 3: Verificación y Puesta en Marcha

- [ ] Levantar el stack de Traefik en modo producción.
- [ ] Verificar en el dashboard de Traefik que los certificados se han emitido correctamente.
- [ ] Acceder a cada uno de los dominios (`palacio.goio.store`, `ollama.goio.store`, etc.) y confirmar que resuelven al servicio correcto con HTTPS.
- [ ] Realizar una prueba de `curl -I` a las versiones HTTP para confirmar la redirección 301 a HTTPS.

## Entregables

- `docker-compose.yml` del reverse-proxy actualizado para producción.
- Fragmentos de `labels` para cada servicio a integrar.
- Checklist de verificación post-despliegue completado.

## Plan de Rollback

- En caso de fallo, detener el contenedor de Traefik.
- Revertir los cambios en el `docker-compose.yml` a la versión de staging.
- Eliminar el archivo `acme.json` para forzar la reemisión de certificados de staging.
- Reiniciar el stack.
