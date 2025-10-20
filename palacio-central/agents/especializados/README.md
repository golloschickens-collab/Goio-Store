# 🛠️ Agentes Especializados del Imperio

Este directorio aloja implementaciones específicas que extienden las castas imperiales base. Cada agente hereda de `AgenteAutonomoImperial` (directamente o a través de una casta) y cumple protocolos adicionales definidos por el Consejo.

## `agente-obrera.js`
Agente obrera enfocada en **publicar contenido en Instagram y Facebook** utilizando la Graph API de Meta.

### Flujo principal
1. Carga credenciales desde `config/social_credentials.json` (marca por defecto: `goio_store`).
2. Ejecuta el protocolo `PUBLICAR_SOCIAL`, que:
   - Crea y publica un contenedor en Instagram (`/media` + `/media_publish`).
   - Publica un post en Facebook (`/feed`).
3. Genera logs con `trace_id` (`INST-PUBLICACION`, `FB-PUBLICACION`) y registra métricas que se reportan al dashboard imperial.

### Configuración necesaria
- Completar `config/social_credentials.json` con tokens válidos.
- Opcional: establecer variables de entorno `DASHBOARD_ENDPOINT`, `METRICAS_ENDPOINT`, `OBRERA_SOCIAL_CICLO_MS`.
- Alternativamente, el `Supervisor` enviará automáticamente `dashboard.reportEndpoint` y `dashboard.metricsEndpoint` al instanciar el agente.

### Ejecución directa
```powershell
cd "c:\Goio mayordomo\palacio-central"
node agents\especializados\agente-obrera.js
```

Parámetros opcionales vía JSON en la línea de comandos (útil para pruebas):
```powershell
node agents\especializados\agente-obrera.js "{\"socialBrand\":\"gollos_chickens\",\"config\":{\"trazabilidad\":{\"nivelLog\":\"debug\"}}}"
```

### Integración con el Supervisor
Para habilitarlo desde `agents/supervisor.js`, añade el agente al arreglo `config.agentes` en `scripts/config.js` (ya disponible como `Agent.Obrera` con rol social). El supervisor enviará la configuración y el agente se registrará en el dashboard automáticamente.

---

> 📌 **Nota:** Los tokens de Meta tienen caducidad. Revisa `scripts/credenciales/programar-renovacion-tokens.js` y el protocolo `config/README-CREDENCIALES-REDES.md` para mantenerlos vigentes.

## `agente-soldado.js`
Soldado defensivo dedicado a **vigilar tokens, credenciales y archivos críticos** del Imperio.

### Flujo principal
1. Carga credenciales sociales y claves desde `config/social_credentials.json` y `config/keys.json`.
2. Evalúa tokens registrados (Facebook, Instagram, Gemini) según vigencia y proximidad de expiración.
3. Verifica existencia de archivos esenciales y genera reportes JSON en `reports/soldados/`.
4. Emite logs con `trace_id` (`TOKEN-CHECK`, `ARCHIVO-CHECK`) y alertas vía `handleError` para integrarse al dashboard.

### Configuración necesaria
- Completar `config/social_credentials.json` y `config/keys.json` con datos reales.
- Opcional: variables de entorno `DASHBOARD_ENDPOINT`, `METRICAS_ENDPOINT`, `SOLDADO_DEFENSA_CICLO_MS`.
- El supervisor inyectará automáticamente los endpoints de dashboard cuando ejecute el agente.

### Ejecución directa
```powershell
cd "c:\Goio mayordomo\palacio-central"
node agents\especializados\agente-soldado.js
```

Parámetros opcionales (marca alternativa, configuración específica):
```powershell
node agents\especializados\agente-soldado.js "{\"socialBrand\":\"gollos_chickens\"}"
```

### Integración con el Supervisor
`Agent.Soldado` ya se encuentra definido en `scripts/config.js`. Al activar el supervisor, este agente recibirá su configuración y comenzará a monitorear en ciclos definidos.

## `agente-nodriza.js`
Nodriza logística cuyo propósito es **gestionar inventarios de credenciales, rotar tokens y nutrir a otros agentes** con claves actualizadas.

### Flujo principal
1. Carga credenciales desde `config/social_credentials.json` para la marca especificada (por defecto `goio_store`).
2. Ejecuta rotaciones simuladas de tokens (Facebook, Instagram y extras) registrando historial y emitendo reportes.
3. Entrega paquetes de credenciales a agentes (`NUTRIR_AGENTES`) dejando trazabilidad en logs y reportes JSON.
4. Mantiene inventario histórico en `logs/imperial/tokens/` y métricas transmitidas al dashboard imperial.

### Configuración necesaria
- Confirmar que `config/social_credentials.json` contiene las secciones `instagram` y `facebook` para la marca elegida.
- Opcional: variables `DASHBOARD_ENDPOINT`, `METRICAS_ENDPOINT`, `NODRIZA_LOGISTICA_CICLO_MS`.
- El supervisor proveerá endpoints de dashboard cuando se ejecute dentro del ciclo imperial.

### Ejecución directa
```powershell
cd "c:\Goio mayordomo\palacio-central"
node agents\especializados\agente-nodriza.js
```

Parámetros opcionales (personalizar marca o inyectar configuración):
```powershell
node agents\especializados\agente-nodriza.js "{\"socialBrand\":\"gollos_chickens\",\"config\":{\"integraciones\":{\"metricasStreaming\":\"https://imperio.local/metrics\"}}}"
```

### Integración con el Supervisor
El Consejo ya contempla `Agent.Nodriza` en `scripts/config.js`. Al iniciarse el supervisor, la nodriza logística recibirá la configuración necesaria y comenzará su rutina de nutrición.
