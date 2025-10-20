# Operativa del Agente Shopify – GOIO Store

Este playbook detalla cómo preparar la tienda GOIO en Shopify, ejecutar la
integración técnica y orquestar al agente mediante prompts controlados.

## 1. Requisitos

1. **Tienda y dominio confirmados** – Ejemplo: `goio-store.myshopify.com`.
2. **App personalizada con token Admin API** – Scopes mínimos:
   - `write_products`
   - `write_orders`
   - `read_customers`
   - (Opcional) `read_all_orders` para historial >60 días.
3. **Python 3.10+ y dependencias instaladas** (ver sección 3).
4. **Archivo `config/products.json`** con los productos que el agente debe
   sincronizar. Cada item necesita al menos: `title`, `body_html`, `vendor`,
   `product_type`, `handle`, variantes e inventario inicial.

## 2. Variables de entorno

Define las variables en tu sesión o crea un archivo `.env` junto al script.

```bash
export SHOPIFY_STORE_DOMAIN="goio-store.myshopify.com"
export SHOPIFY_ACCESS_TOKEN="shpat_xxxxxxxxxxxxxxxxx"
# Opcional si quieres fijar otra versión de API
export SHOPIFY_API_VERSION="2025-10"
```

## 3. Instalar dependencias

Dentro de `palacio-central`:

```bash
source venv/bin/activate  # o python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

## 4. Flujos principales

### 4.1 Sincronizar catálogo

```bash
python scripts/shopify_integration.py --sync-products config/products.json
```

- Crea o actualiza cada producto según su `handle`.
- Respeta la versión de API configurada.
- Registra errores por producto sin detener el lote completo.

### 4.2 Descargar pedidos y métricas

```bash
python scripts/shopify_integration.py --fetch-orders --metrics --save-csv reports/orders.csv
```

- Descarga todos los pedidos disponibles (límites Shopify aplican).
- Calcula ingresos totales y ticket promedio.
- Guarda un CSV para dashboards o análisis BI.

## 5. Prompt canon para el agente Shopify

Entrega este prompt al agente (adaptando la sección *Objetivos de la sesión*).
Mantén el token seguro utilizando variables de entorno o secretos compartidos,
nunca en texto plano del prompt.

```
Eres el Agente Shopify de GOIO Store.
Tu misión es mantener la tienda rentable y operativa 24/7 siguiendo este flujo:

1. Preparación
   - Verifica que las variables SHOPIFY_STORE_DOMAIN y SHOPIFY_ACCESS_TOKEN
     estén definidas en el entorno de ejecución.
   - Carga config/products.json para conocer el catálogo objetivo.

2. Sincronización
   - Ejecuta scripts/shopify_integration.py --sync-products config/products.json
     para crear/actualizar el catálogo.
   - Reporta cualquier producto con error y propone una corrección.

3. Inteligencia comercial
   - Obtén pedidos reales con scripts/shopify_integration.py --fetch-orders --metrics
     --save-csv reports/orders.csv.
   - Resume ingresos totales, ticket promedio y productos más vendidos.

4. Acciones proactivas
   - Si hay inventario bajo, sugiere re-stock o promociones específicas.
   - Si el volumen de pedidos cae por debajo del promedio semanal, propone
     campañas (email, ads, bundles) indicando objetivos y presupuestos sugeridos.

5. Reporte final
   - Entrega un informe breve con: catálogo sincronizado, estado de pedidos,
     métricas clave y próximas acciones recomendadas.
   - Incluye enlaces o rutas locales a los archivos generados (CSV, logs, reportes).

Reglas:
- No compartas tokens ni secretos. Usa placeholders si necesitas referirte a ellos.
- Si la API devuelve un error, registra la respuesta exacta y sugiere cómo resolverlo.
- Prioriza decisiones que incrementen ingresos netos y mantengan la experiencia del cliente.
```

## 6. Checklist antes de cada ejecución

- [ ] Token Admin vigente pegado a la app personalizada.
- [ ] `config/products.json` actualizado con precios, stock y SEO.
- [ ] `reports/` con espacio para generar CSV/JSON.
- [ ] `DRY_RUN=false` (o variable equivalente) para permitir acciones mutables.
- [ ] Acceso a marketing stack (ads/email) si se requieren campañas.

## 7. Próximas extensiones sugeridas

- Migrar a GraphQL Admin API para aprovechar Bulk Operations y Webhooks.
- Conectar con fuentes de tráfico (Meta Ads, Google Ads, email) mediante los
  demás agentes de Palacio Central.
- Publicar un dashboard en tiempo real (ej. Streamlit o Superset) consumiendo los
  CSV generados.
- Añadir tests automatizados (pytest + responses) para validar las integraciones
  sin tocar Shopify real durante el desarrollo.

---

Con este playbook el agente dispone de instrucciones claras, comandos concretos y
artefactos de soporte para ejecutar y monitorear la tienda GOIO Store de forma
programática.
