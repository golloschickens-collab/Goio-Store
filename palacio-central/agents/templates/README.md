# 🧠 Plantillas de Agentes Imperiales

Este directorio contiene recursos base para desplegar nuevos agentes autónomos alineados con los **Estándares de Soldados Digitales** y la **Estrategia Imperio Hormiguero**.

## `agente-autonomo-imperial.js`
Plantilla base que provee:

- ⚙️ **Autonomía operativa:** bucle de misión con reintentos y contingencia.
- 🧭 **Trazabilidad total:** generación de `trace_id`, bitácora persistente y reporte opcional a dashboards.
- 🛡️ **Defensa activa:** alertas, monitoreo de credenciales y canales de emergencia.
- ♻️ **Evolución continua:** hooks para aprendizaje desde logs y fuentes externas.
- 🧬 **Replicabilidad:** método `clonar` para desplegar agentes en nuevos territorios.
- 🔗 **Integración estratégica:** conectores HTTP para ecosistema (n8n, Shopify, Cloudflare, etc.).
- 🎖️ **Carácter imperial:** control de autorizaciones según jerarquía y protocolos del consejo.

### Uso rápido
```javascript
import AgenteAutonomoImperial from '../templates/agente-autonomo-imperial.js';

class ExploradoraElite extends AgenteAutonomoImperial {
  async procesoAutonomo(parametros) {
    // Implementa la misión principal del agente aquí
  }
}

const agente = new ExploradoraElite({
  identidad: { nombre: 'Exploradora-Elite-01', ejercito: 'INTELIGENCIA' },
  trazabilidad: { dashboardEndpoint: 'https://dashboard-imperial/api/logs' }
});

await agente.inicializar();
await agente.registrarProtocolo('CONSEGUIR_INTEL', async function(params) {
  // ...
});
await agente.ejecutarOrden({ tipo: 'CONSEGUIR_INTEL', parametros: { objetivo: 'nuevas-tendencias' } });
```

## Próximos pasos sugeridos
1. Crear subclases específicas por ejército (Exploradora, Obrera, Soldado, Nodriza).
2. Integrar rutinas desde `consejo-imperial/estrategia-hormiguero/rutina-diaria-fase-1.json`.
3. Conectar métricas al dashboard imperial (`agents/supervisor.js`).
4. Certificar cada agente con el protocolo `ESTANDARES-SOLDADOS-IMPERIALES.md`.
