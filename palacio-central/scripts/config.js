import dotenv from 'dotenv';
import path from 'path';

// Cargar las variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const {
    // Credenciales de Tienda Principal (Producción)
    SHOPIFY_DOMAIN_PROD,
    SHOPIFY_ADMIN_TOKEN_PROD,
    SHOPIFY_API_KEY_PROD,


    // Credenciales de Tienda de Desarrollo
    SHOPIFY_DOMAIN_DEV,
    SHOPIFY_ADMIN_TOKEN_DEV,

    // Otras APIs
    FACEBOOK_PAGE_ID,
    FACEBOOK_ACCESS_TOKEN,
    GEMINI_API_KEY
} = process.env;

// --- Validación de Variables Críticas ---
if (!SHOPIFY_DOMAIN_PROD || !SHOPIFY_ADMIN_TOKEN_PROD) {
    throw new Error("Credenciales de producción de Shopify no definidas. Asegúrate de tener SHOPIFY_DOMAIN_PROD y SHOPIFY_ADMIN_TOKEN_PROD en .env");
}
if (!SHOPIFY_DOMAIN_DEV || !SHOPIFY_ADMIN_TOKEN_DEV) {
    throw new Error("Credenciales de desarrollo de Shopify no definidas. Asegúrate de tener SHOPIFY_DOMAIN_DEV y SHOPIFY_ADMIN_TOKEN_DEV en .env");
}
if (!GEMINI_API_KEY) {
    console.warn("Advertencia: GEMINI_API_KEY no está definida. Los agentes que la necesiten fallarán.");
}


// --- Configuración Estructural de Agentes y Entornos ---
export const config = {
  entorno: {
    nombre: "Shopify",
    tiendas: [
      {
        nombre: "principal",
        dominio: SHOPIFY_DOMAIN_PROD,
        admin_token: SHOPIFY_ADMIN_TOKEN_PROD,
        api_key: SHOPIFY_API_KEY_PROD,
        entorno: "producción",
        validaciones: [
          "Usar Admin API y Checkout Kit exclusivamente",
          "No ejecutar pagos automáticos",
          "No scrapear tiendas externas sin permiso",
        ],
      },
      {
        nombre: "goio-dev",
        dominio: SHOPIFY_DOMAIN_DEV,
        admin_token: SHOPIFY_ADMIN_TOKEN_DEV,
        entorno: "desarrollo",
        validaciones: [
          "Permitir pruebas de flujo sin publicar productos",
          "Registrar logs de errores en GitHub",
          "Simular respuestas de clientes para testeo",
        ],
      },
    ],
  },
  agentes: [
    {
      nombre: "Agent.TrendHunter",
      tiendas: [],
      tareas: ["Ejecutar script de Python para obtener las últimas tendencias de búsqueda globales."],
      restricciones: ["Requiere que Python y la librería 'pytrends' estén instalados en el sistema."],
    },
    {
      nombre: "Agent.Research",
      tiendas: [],
      tareas: ["Analizar resultados de búsqueda para encontrar productos en tendencia."],
      restricciones: ["Requiere un archivo 'temp/search_results.json' con datos."],
    },
    {
      nombre: "Agent.Creative",
      tiendas: [],
      tareas: ["Generar contenido de marketing para los productos encontrados por el agente de investigación."],
      restricciones: ["Depende de los informes generados por Agent.Research."],
    },
    {
      nombre: "Agent.Listing",
      tiendas: ["principal"],
      tareas: [
        "Crear productos como borrador en la tienda principal",
      ],
      restricciones: ["No publica directamente, solo crea borradores"],
    },
    {
      nombre: "Agent.ContentStrategist",
      tiendas: [],
      tareas: [
        "Generar 5 ángulos de marketing de contenido orgánico para cada producto",
      ],
      restricciones: ["Requiere una API Key de Gemini válida"],
    },
    {
      nombre: "Agent.Publisher",
      tiendas: [], // No opera directamente sobre una tienda Shopify
      tareas: [
        "Tomar contenido creativo de los reportes y publicarlo en Facebook",
      ],
      restricciones: ["Requiere credenciales de Facebook con permisos de publicación"],
    }
  ],
  checks: [
    "¿El agente está operando en la tienda correcta según su rol? → ✅",
    "¿Se está usando la API correcta (prod vs dev)? → ✅",
    "¿Se están respetando las políticas de Shopify? → ✅",
    "¿Hay intentos de scraping o pagos automáticos? → ⚠️ Detener y alertar",
  ],
  socialMedia: {
      facebook: {
          pageId: FACEBOOK_PAGE_ID,
          accessToken: FACEBOOK_ACCESS_TOKEN,
      }
  },
  apiKeys: {
      gemini: GEMINI_API_KEY,
  }
};

export default config;