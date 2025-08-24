import config from '../scripts/config.js';

/**
 * El Agent.Validator se encarga de las comprobaciones de seguridad y políticas
 * para asegurar una orquestación segura.
 */
export class AgentValidator {
    constructor() {
        this.version = "1.1.0";
        console.log("Agent.Validator: Listo para auditar.");
    }

    /**
     * Ejecuta todas las validaciones críticas antes de que otros agentes operen.
     * @returns {Promise<boolean>} Resuelve a true si todas las validaciones pasan.
     * @throws {Error} Si una validación crítica falla.
     */
    async runChecks() {
        console.log(`\n--- AgentValidator v${this.version} ---`);
        console.log("✅ Ejecutando validaciones previas...");

        const devStore = config.entorno.tiendas.find(t => t.entorno === 'desarrollo');
        if (!devStore || !devStore.dominio || !devStore.api_key) {
            throw new Error("Configuración de la tienda de desarrollo (goio-dev) incompleta o no encontrada en config.js");
        }
        console.log("  -> Configuración de Shopify (Desarrollo): OK");

        if (!config.socialMedia.facebook.pageId || !config.socialMedia.facebook.accessToken) {
            throw new Error("Configuración de Facebook incompleta. Revisa tu archivo .env y config.js");
        }
        console.log("  -> Configuración de Facebook: OK");
        
        console.log("✅ Todas las validaciones pasaron con éxito.");
    }
}
