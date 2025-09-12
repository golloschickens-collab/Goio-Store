# encoding: utf-8
import os
import sys
import shopify

# --- Configuración ---
# Lee las credenciales desde los Secretos de GitHub Actions
SHOP_URL = os.environ.get("SHOPIFY_SHOP_URL")
API_VERSION = '2024-04'  # Usar una versión de API reciente
ACCESS_TOKEN = os.environ.get("SHOPIFY_ADMIN_ACCESS_TOKEN")

# --- Validación ---
if not all([SHOP_URL, ACCESS_TOKEN]):
    print("Error: Faltan las variables de entorno SHOPIFY_SHOP_URL o SHOPIFY_ADMIN_ACCESS_TOKEN.")
    print("Asegúrate de configurarlas en los Secretos de tu repositorio de GitHub.")
    sys.exit(1) # Termina el script con un código de error

print(f"Conectando a la tienda: {SHOP_URL}")

# --- Lógica del Agente ---
try:
    # Configurar la sesión de la API de Shopify
    session = shopify.Session(SHOP_URL, API_VERSION, ACCESS_TOKEN)
    shopify.ShopifyResource.activate_session(session)

    print("Conexión exitosa. Obteniendo productos...")

    # Obtener la primera página de productos (hasta 250)
    products = shopify.Product.find()

    if products:
        print(f"¡Éxito! Se encontraron {len(products)} productos:")
        for i, product in enumerate(products):
            print(f"  {i+1}. {product.title} (ID: {product.id})")
    else:
        print("No se encontraron productos en la tienda.")

except Exception as e:
    print(f"Ocurrió un error al conectar o consultar la API de Shopify: {e}")
    sys.exit(1) # Termina el script con un código de error

finally:
    # Limpiar la sesión
    shopify.ShopifyResource.clear_session()
    print("\nSesión finalizada.")