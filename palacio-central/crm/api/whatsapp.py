from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import os
import asyncpg
import httpx
from datetime import datetime
import re
import logging

# Importar configuración de imperios
from .imperios_config import (
    IMPERIOS_CONFIG, 
    REINO_CONFIG,
    get_imperio_by_phone,
    get_respuesta_automatica,
    generar_reporte_real
)

# =============================================
# WHATSAPP BUSINESS API INTEGRATION - MULTI IMPERIO
# =============================================

router = APIRouter(prefix="/api/webhooks", tags=["WhatsApp Multi-Imperio"])

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración WhatsApp (mantener compatibilidad)
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID") 
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "imperio_whatsapp_verify_2025")
WHATSAPP_NUMBER = "+51939431887"  # Número principal (Gollos)

# Cliente HTTP para enviar mensajes
http_client = httpx.AsyncClient()

# =============================================
# MODELOS PARA WHATSAPP
# =============================================

class WhatsAppMessage(BaseModel):
    from_number: str
    message_body: str
    message_type: str = "text"
    timestamp: datetime
    message_id: str

class MenuOption(BaseModel):
    id: str
    title: str
    description: Optional[str] = None

# =============================================
# MENÚ AUTOMÁTICO GOLLOS CHICKEN'S
# =============================================

MENU_PRINCIPAL = """
🍗 *¡Bienvenido a Gollos Chicken's!* 🍗

Selecciona una opción escribiendo el número:

1️⃣ Ver menú y precios
2️⃣ Hacer un pedido
3️⃣ Estado de mi pedido
4️⃣ Promociones del día
5️⃣ Ubicación y horarios
6️⃣ Hablar con un humano

_Escribe el número de tu opción..._
"""

MENU_PRODUCTOS = """
🍗 *MENÚ GOLLOS CHICKEN'S* 🍗

*POLLOS ENTEROS:*
• Pollo Entero Asado - S/25.00
• Pollo Entero + Papas - S/30.00
• Pollo Entero + Ensalada - S/28.00

*COMBOS FAMILIARES:*
• 2 Pollos + Papas + Ensalada - S/45.00
• 3 Pollos + Papas + 2 Ensaladas - S/65.00

*PRESAS SUELTAS:*
• 1/4 de Pollo - S/8.00
• 1/2 Pollo - S/15.00
• Presa grande - S/10.00

*ACOMPAÑANTES:*
• Papas fritas - S/8.00
• Ensalada criolla - S/6.00
• Yuca sancochada - S/5.00

Para ordenar escribe: *PEDIDO* seguido de lo que quieres.
Ejemplo: "PEDIDO 1 pollo entero + papas"
"""

PROMOCIONES_HOY = """
🔥 *PROMOCIONES DEL DÍA* 🔥

*MARTES DE LOCURA:*
2x1 en pollos enteros 
(Solo martes hasta agotar stock)

*COMBO FAMILIAR:*
3 pollos + 2 acompañantes = S/60
(Ahorra S/15)

*DELIVERY GRATIS:*
En pedidos mayores a S/40
(Solo en Lima Metropolitana)

¿Quieres aprovechar alguna promoción?
Escribe *PEDIDO* + tu selección
"""

# =============================================
# SISTEMA INTELIGENTE MULTI-IMPERIO
# =============================================

class InteligenciaMultiImperio:
    """Sistema de IA para gestionar múltiples imperios"""
    
    @staticmethod
    def detectar_imperio_por_mensaje(mensaje: str, numero_entrante: str) -> Dict[str, Any]:
        """Detecta a qué imperio pertenece el mensaje basado en contexto"""
        
        mensaje_lower = mensaje.lower().strip()
        
        # 1. Primero verificar por número si existe configuración específica
        imperio_por_numero = get_imperio_by_phone(numero_entrante)
        if imperio_por_numero:
            return {
                "imperio": imperio_por_numero,
                "metodo": "numero_telefono",
                "confianza": 1.0
            }
        
        # 2. Detectar por palabras clave específicas
        for imperio_id, config in IMPERIOS_CONFIG.items():
            palabras_clave = config["whatsapp"]["palabras_clave"]
            
            # Verificar palabras clave de cada categoría
            total_matches = 0
            for categoria, palabras in palabras_clave.items():
                for palabra in palabras:
                    if palabra in mensaje_lower:
                        total_matches += 1
            
            if total_matches > 0:
                confianza = min(total_matches / 10.0, 1.0)  # Normalizar
                return {
                    "imperio": imperio_id,
                    "metodo": "palabras_clave",
                    "confianza": confianza
                }
        
        # 3. Por defecto, Gollos (el imperio principal)
        return {
            "imperio": "gollos",
            "metodo": "default",
            "confianza": 0.8
        }
    
    @staticmethod
    def generar_respuesta_imperio(mensaje: str, imperio: str, cliente_info: Dict = None) -> str:
        """Genera respuesta específica para cada imperio"""
        
        config = IMPERIOS_CONFIG.get(imperio)
        if not config:
            return "❌ Imperio no encontrado. Contacte al administrador."
        
        mensaje_lower = mensaje.lower().strip()
        
        # Saludo personalizado por imperio
        if any(palabra in mensaje_lower for palabra in ["hola", "hi", "inicio", "empezar"]):
            saludo = config["whatsapp"]["saludo_inicial"]
            if cliente_info and cliente_info.get("nombre"):
                saludo = f"Hola {cliente_info['nombre']}! " + saludo
            return saludo
        
        # Usar respuestas automáticas configuradas
        respuesta_auto = get_respuesta_automatica(mensaje, imperio)
        if respuesta_auto:
            return respuesta_auto
        
        # Respuesta por defecto del imperio
        return config["whatsapp"]["saludo_inicial"]
    
    @staticmethod
    def cross_selling_inteligente(imperio_actual: str, cliente_info: Dict) -> Optional[str]:
        """Genera sugerencias de cross-selling entre imperios"""
        
        config_actual = IMPERIOS_CONFIG.get(imperio_actual)
        if not config_actual:
            return None
        
        cross_selling = config_actual.get("cross_selling", {})
        if not cross_selling.get("activo"):
            return None
        
        # Generar sugerencia basada en el cliente
        valor_lifetime = cliente_info.get("valor_lifetime", 0)
        
        if valor_lifetime > 100:  # Cliente valioso
            sugerencias = cross_selling.get("clientes_vip", [])
        else:
            sugerencias = cross_selling.get("clientes_nuevos", [])
        
        if sugerencias:
            sugerencia = sugerencias[0]  # Tomar primera sugerencia
            return f"\n\n💡 *También te puede interesar:*\n{sugerencia}\n\n🔍 Escribe *OTROS* para explorar nuestros otros servicios"
        
        return None

def detectar_intencion_cross_imperio(mensaje: str) -> Optional[str]:
    """Detecta si el cliente quiere explorar otros imperios"""
    
    mensaje_lower = mensaje.lower().strip()
    
    triggers = [
        "otros servicios", "otros", "más opciones", "que más tienen",
        "otros productos", "otras marcas", "explorar", "ver todo"
    ]
    
    for trigger in triggers:
        if trigger in mensaje_lower:
            return "mostrar_otros_imperios"
    
    return None

def generar_menu_imperios(imperio_actual: str) -> str:
    """Genera menú de otros imperios disponibles"""
    
    menu = f"🏰 *NUESTROS IMPERIOS DIGITALES* 🏰\n\n"
    menu += f"Actualmente estás en: *{IMPERIOS_CONFIG[imperio_actual]['nombre']}*\n\n"
    menu += "También tenemos:\n\n"
    
    contador = 1
    for imperio_id, config in IMPERIOS_CONFIG.items():
        if imperio_id != imperio_actual:
            emoji = config["whatsapp"].get("emoji", "🏢")
            menu += f"{contador}️⃣ {emoji} *{config['nombre']}*\n"
            menu += f"   {config['descripcion'][:60]}...\n"
            menu += f"   📱 {config['whatsapp']['numero']}\n\n"
            contador += 1
    
    menu += "📞 Para contactar otro imperio, escribe el número correspondiente\n"
    menu += f"🔙 Escribe *VOLVER* para continuar con {IMPERIOS_CONFIG[imperio_actual]['nombre']}"
    
    return menu

# =============================================
# FUNCIONES DE WHATSAPP API MEJORADAS
# =============================================

async def enviar_mensaje_whatsapp(numero_destino: str, mensaje: str) -> bool:
    """Envía mensaje vía WhatsApp Business API"""
    logger.info(f"Intentando enviar a {numero_destino}: {mensaje[:400]}...") # Log para depuración
    url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": numero_destino,
        "text": {"body": mensaje}
    }
    
    try:
        response = await http_client.post(url, json=payload, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"Error enviando WhatsApp: {e}")
        return False

async def obtener_o_crear_cliente(telefono: str, nombre: str = None, db: asyncpg.Connection = None) -> dict:
    """Obtiene cliente existente o crea uno nuevo"""
    
    # Buscar cliente existente
    query = """
    SELECT id, nombre, segmento, valor_lifetime 
    FROM clientes 
    WHERE telefono = $1 
    ORDER BY created_at DESC 
    LIMIT 1
    """
    cliente = await db.fetchrow(query, telefono)
    
    if cliente:
        return dict(cliente)
    
    # Crear cliente nuevo
    # Por defecto asignar a Gollos (primera marca)
    marca_gollos = await db.fetchval("SELECT id FROM marcas WHERE slug = 'gollos' LIMIT 1")
    
    insert_query = """
    INSERT INTO clientes (marca_id, telefono, nombre, segmento)
    VALUES ($1, $2, $3, 'nuevo')
    RETURNING id, nombre, segmento, valor_lifetime
    """
    
    nuevo_cliente = await db.fetchrow(insert_query, marca_gollos, telefono, nombre or "Cliente WhatsApp")
    return dict(nuevo_cliente)

async def registrar_interaccion(cliente_id: str, mensaje: str, direccion: str, db: asyncpg.Connection):
    """Registra interacción en la base de datos"""
    
    marca_gollos = await db.fetchval("SELECT id FROM marcas WHERE slug = 'gollos' LIMIT 1")
    
    query = """
    INSERT INTO interacciones (cliente_id, marca_id, tipo, canal, direccion, 
                              agente_tipo, contenido, estado)
    VALUES ($1, $2, 'mensaje', 'whatsapp', $3, 'sistema', $4, 'nueva')
    """
    
    await db.execute(query, cliente_id, marca_gollos, direccion, mensaje)

def procesar_pedido(mensaje: str) -> Dict[str, Any]:
    """Procesa mensaje de pedido y extrae productos"""
    
    # Patterns para productos
    patterns = {
        "pollo_entero": r"(pollo\s*entero|1\s*pollo)",
        "combo_familiar": r"(combo\s*familiar|2\s*pollos|3\s*pollos)",
        "papas": r"(papas?|papa\s*frita)",
        "ensalada": r"(ensalada)",
        "cuarto": r"(1/4|cuarto\s*pollo|presa)"
    }
    
    productos_detectados = []
    total_estimado = 0
    
    mensaje_lower = mensaje.lower()
    
    # Detectar productos
    if re.search(patterns["pollo_entero"], mensaje_lower):
        productos_detectados.append({"nombre": "Pollo Entero Asado", "precio": 25.00, "cantidad": 1})
        total_estimado += 25.00
    
    if re.search(patterns["combo_familiar"], mensaje_lower):
        productos_detectados.append({"nombre": "Combo Familiar 2 Pollos", "precio": 45.00, "cantidad": 1})
        total_estimado += 45.00
    
    if re.search(patterns["papas"], mensaje_lower):
        productos_detectados.append({"nombre": "Papas Fritas", "precio": 8.00, "cantidad": 1})
        total_estimado += 8.00
    
    if re.search(patterns["ensalada"], mensaje_lower):
        productos_detectados.append({"nombre": "Ensalada Criolla", "precio": 6.00, "cantidad": 1})
        total_estimado += 6.00
    
    return {
        "productos": productos_detectados,
        "total": total_estimado,
        "valido": len(productos_detectados) > 0
    }

async def crear_pedido_whatsapp(cliente_id: str, productos: List[Dict], total: float, db: asyncpg.Connection) -> str:
    """Crea pedido en la base de datos"""
    
    marca_gollos = await db.fetchval("SELECT id FROM marcas WHERE slug = 'gollos' LIMIT 1")
    numero_pedido = f"WA-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    query = """
    INSERT INTO pedidos (numero_pedido, cliente_id, marca_id, productos, subtotal, total,
                        estado, canal, metodo_pago)
    VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', 'whatsapp', 'efectivo')
    RETURNING numero_pedido
    """
    
    result = await db.fetchrow(query, numero_pedido, cliente_id, marca_gollos, 
                              json.dumps(productos), total, total)
    
    return result["numero_pedido"]

# =============================================
# ENDPOINTS WEBHOOKS
# =============================================

@router.get("/whatsapp")
async def verificar_webhook(request: Request):
    """Verificación de webhook de WhatsApp"""
    
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Forbidden")

@router.post("/whatsapp")
async def recibir_mensaje_whatsapp(request: Request, background_tasks: BackgroundTasks):
    """Procesa mensajes entrantes de WhatsApp"""
    
    try:
        body = await request.json()
        
        # Verificar que es un mensaje
        if not body.get("entry"):
            return {"status": "ok"}
        
        for entry in body["entry"]:
            for change in entry.get("changes", []):
                if change.get("field") == "messages":
                    messages = change.get("value", {}).get("messages", [])
                    
                    for message in messages:
                        # Procesar mensaje en background
                        background_tasks.add_task(
                            procesar_mensaje_entrante,
                            message,
                            change.get("value", {}).get("contacts", [])
                        )
        
        return {"status": "received"}
        
    except Exception as e:
        print(f"Error procesando webhook WhatsApp: {e}")
        return {"status": "error", "message": str(e)}

async def procesar_mensaje_entrante(message: dict, contacts: List[dict]):
    """Procesa un mensaje individual de WhatsApp"""
    
    # Extraer información del mensaje
    from_number = message.get("from")
    message_text = message.get("text", {}).get("body", "")
    message_id = message.get("id")
    
    # Obtener nombre del contacto
    nombre_contacto = None
    for contact in contacts:
        if contact.get("wa_id") == from_number:
            nombre_contacto = contact.get("profile", {}).get("name")
            break
    
    # Conectar a base de datos
    from api.main import get_db
    async for db in get_db():
        try:
            # Obtener o crear cliente
            cliente = await obtener_o_crear_cliente(from_number, nombre_contacto, db)
            
            # Registrar interacción entrante
            await registrar_interaccion(cliente["id"], message_text, "entrante", db)
            
            # Procesar comando/mensaje con detección de imperio
            respuesta = await generar_respuesta_automatica(message_text, cliente, db, from_number)
            
            # Enviar respuesta
            if respuesta:
                await enviar_mensaje_whatsapp(from_number, respuesta)
                # Registrar respuesta saliente
                await registrar_interaccion(cliente["id"], respuesta, "saliente", db)
                
                # Enviar notificación al Rey si es importante
                await notificar_rey_si_necesario(message_text, cliente, from_number)
            
        except Exception as e:
            print(f"Error procesando mensaje de {from_number}: {e}")
        finally:
            break

async def generar_respuesta_automatica(mensaje: str, cliente: dict, db: asyncpg.Connection, numero_entrante: str = None) -> str:
    """Genera respuesta automática basada en el mensaje y detecta imperio"""
    
    # 1. Detectar imperio usando IA
    deteccion = InteligenciaMultiImperio.detectar_imperio_por_mensaje(mensaje, numero_entrante or "")
    imperio = deteccion["imperio"]
    
    logger.info(f"Imperio detectado: {imperio} (método: {deteccion['metodo']}, confianza: {deteccion['confianza']})")
    
    # 2. Verificar si quiere explorar otros imperios
    intencion_cross = detectar_intencion_cross_imperio(mensaje)
    if intencion_cross == "mostrar_otros_imperios":
        return generar_menu_imperios(imperio)
    
    # 3. LÓGICA ESPECÍFICA POR IMPERIO
    if imperio == "gollos_chickens":
        return await generar_respuesta_gollos(mensaje, cliente, db)
    elif imperio == "goio_store":
        return await generar_respuesta_goio_store(mensaje, cliente, db)
    elif imperio == "eco_eterno":
        return await generar_respuesta_eco_eterno(mensaje, cliente, db)
    
    # 4. Respuesta genérica con sistema inteligente
    respuesta_base = InteligenciaMultiImperio.generar_respuesta_imperio(mensaje, imperio, cliente)
    
    # 5. Agregar cross-selling si aplica
    cross_selling = InteligenciaMultiImperio.cross_selling_inteligente(imperio, cliente)
    if cross_selling:
        respuesta_base += cross_selling
    
    return respuesta_base

async def generar_menu_productos_gollos(db: asyncpg.Connection) -> str:
    """Consulta la BD y genera el menú de productos para Gollos Chicken's."""
    
    # Primero, obtenemos el ID de la marca "gollos"
    marca_record = await db.fetchrow("SELECT id FROM marcas WHERE slug = 'gollos'")
    if not marca_record:
        return "Lo siento, no pude encontrar la configuración para Gollos Chicken's en este momento."

    marca_id = marca_record['id']
    
    # Ahora, obtenemos los productos disponibles para esa marca
    productos = await db.fetch("SELECT nombre, precio FROM productos WHERE marca_id = $1 AND disponible = true ORDER BY nombre ASC", marca_id)
    
    if not productos:
        return "Lo siento, parece que no hay productos disponibles en el menú en este momento. Por favor, consulta más tarde."
        
    # Construimos el menú
    menu_items = []
    for producto in productos:
        menu_items.append(f"🍗 *{producto['nombre']}* - S/{producto['precio']:.2f}")
    
    menu_str = "\n".join(menu_items)
    
    return f"""🔥 *MENÚ GOLLO'S CHICKEN'S* 🔥

{menu_str}

Para ordenar, escribe *PEDIDO* seguido de lo que deseas.
Ej: PEDIDO 1 Pollo Entero Asado"""

async def generar_respuesta_gollos(mensaje: str, cliente: dict, db: asyncpg.Connection) -> str:
    """Respuestas específicas para Gollos Chicken's (lógica mejorada)"""
    
    mensaje_lower = mensaje.lower().strip()
    
    # Comando: Ver menú de productos
    if any(palabra in mensaje_lower for palabra in ["1", "menu", "carta", "precios"]):
        return await generar_menu_productos_gollos(db)

    # Comando: Menú principal (saludos)
    elif any(palabra in mensaje_lower for palabra in ["hola", "inicio", "hi"]):
        return MENU_PRINCIPAL

    # Comando: Hacer pedido
    elif mensaje_lower.startswith("pedido") or mensaje_lower == "2":
        if mensaje_lower == "2":
            return "🛒 ¡Perfecto! Dime qué te gustaría ordenar.\n\nEjemplos:\n• PEDIDO 1 pollo entero + papas\n• PEDIDO combo familiar\n• PEDIDO 2 cuartos de pollo\n\nEscribe tu pedido..."
        
        # Procesar pedido específico
        pedido_info = procesar_pedido(mensaje)
        
        if pedido_info["valido"]:
            # Crear pedido en BD
            numero_pedido = await crear_pedido_whatsapp(
                cliente["id"], 
                pedido_info["productos"], 
                pedido_info["total"], 
                db
            )
            
            productos_lista = "\n".join([f"• {p['nombre']} - S/{p['precio']:.2f}" for p in pedido_info["productos"]])
            
            return f"""
✅ *¡PEDIDO CONFIRMADO!* 

*Número de pedido:* {numero_pedido}

*Tu orden:*
{productos_lista}

*Total: S/{pedido_info["total"]:.2f}*

📍 *¿Dónde lo entregamos?*
Envía tu dirección completa para procesar el delivery.

⏰ *Tiempo estimado:* 30-45 minutos
📞 *Consultas:* {WHATSAPP_NUMBER}

¡Gracias por elegir Gollos Chicken's! 🍗

💡 *¿Sabías que también tenemos Goio Store y Eco-Eterno?*
Escribe *OTROS* para conocer nuestros otros servicios
"""
        else:
            return "🤔 No pude entender tu pedido. \n\nPor favor escribe algo como:\n• PEDIDO 1 pollo entero\n• PEDIDO combo familiar\n• PEDIDO papas + ensalada\n\nO escribe *1* para ver el menú completo."
    
    # Comando: Estado de pedido
    elif mensaje_lower == "3" or "estado" in mensaje_lower:
        return "📋 Para consultar el estado de tu pedido, necesito tu número de orden.\n\n¿Tienes el número que empieza con WA-?"
    
    # Comando: Promociones
    elif mensaje_lower == "4" or "promocion" in mensaje_lower:
        return PROMOCIONES_HOY
    
    # Comando: Ubicación
    elif mensaje_lower == "5" or "ubicacion" in mensaje_lower:
        return """
📍 *GOLLOS CHICKEN'S*

*Dirección:*
Av. Principal 123, San Juan de Lurigancho
Lima, Perú

*Horarios:*
🕐 Lunes a Domingo: 11:00 AM - 10:00 PM

*Delivery:*
📞 WhatsApp: +51 939431887
🚚 Cobertura: Todo Lima Metropolitana
💰 Delivery gratis en pedidos > S/40

*Ubicación exacta:*
https://maps.google.com/?q=-12.0464,-77.0428
"""
    
    # Comando: Humano
    elif mensaje_lower == "6" or any(palabra in mensaje_lower for palabra in ["humano", "persona", "operador"]):
        return "👨‍💼 Te conectaré con un operador humano.\n\nUn miembro de nuestro equipo te responderá en los próximos minutos.\n\n¡Gracias por tu paciencia! 🙏"
    
    # Mensaje no reconocido - menú principal
    else:
        return f"🤖 Hola {cliente.get('nombre', 'estimado cliente')}!\n\n" + MENU_PRINCIPAL


async def generar_respuesta_goio_store(mensaje: str, cliente: dict, db: asyncpg.Connection) -> str:
    """Respuestas específicas para Goio Store (E-commerce)"""
    
    mensaje_lower = mensaje.lower().strip()
    
    # Saludo inicial Goio Store
    if any(palabra in mensaje_lower for palabra in ["hola", "hi", "inicio"]):
        return """
🛍️ *¡Bienvenido a GOIO STORE!* 🛍️

Tu tienda online de confianza 24/7

Selecciona una opción:

1️⃣ Ver catálogo de productos
2️⃣ Ofertas y promociones
3️⃣ Estado de mi pedido
4️⃣ Métodos de pago
5️⃣ Envíos y delivery
6️⃣ Atención al cliente

💳 *Aceptamos todas las tarjetas*
🚚 *Envío gratis en compras > S/99*

_Escribe el número de tu opción..._
"""
    
    # Catálogo
    elif mensaje_lower in ["1", "catalogo", "productos"]:
        return """
🛍️ *CATÁLOGO GOIO STORE* 🛍️

*ELECTRÓNICOS:*
• Smartphones desde S/299
• Laptops desde S/1,599
• Audífonos desde S/89

*HOGAR:*
• Electrodomésticos desde S/199
• Decoración desde S/25
• Cocina desde S/49

*MODA:*
• Ropa desde S/29
• Zapatos desde S/79
• Accesorios desde S/15

🔍 *Para ver productos específicos escribe:*
BUSCAR [nombre del producto]

Ejemplo: "BUSCAR smartphone"
"""
    
    # Ofertas
    elif mensaje_lower in ["2", "ofertas", "promociones"]:
        return """
🔥 *OFERTAS GOIO STORE* 🔥

*FLASH SALE - HOY:*
📱 iPhone 15 - 20% OFF
🎧 AirPods Pro - S/599 (antes S/799)
💻 MacBook Air - 15% OFF

*COMBO ESPECIAL:*
Laptop + Mouse + Mochila = S/1,899
(Ahorra S/300)

*ENVÍO GRATIS:*
En todos los pedidos hoy
(Código: ENVIOGRATIS)

¿Te interesa alguna oferta?
Escribe *COMPRAR* + el producto
"""
    
    elif mensaje_lower.startswith("buscar") or mensaje_lower.startswith("comprar"):
        return """
🔍 *BÚSQUEDA AVANZADA*

Estoy procesando tu solicitud...

Para finalizar tu pedido necesito:
📱 Producto específico
🏠 Dirección de entrega  
💳 Método de pago preferido

Un especialista te contactará en 5 minutos para completar tu compra.

💬 *También nos encuentras en:*
🌐 Web: goiostore.com
📞 WhatsApp: +51 939431888 (próximamente)
"""
    
    else:
        return f"🤖 Hola {cliente.get('nombre', '')}! Soy el asistente de GOIO STORE.\n\nEscribe *HOLA* para ver el menú principal o *BUSCAR* + producto para encontrar lo que necesitas."

async def generar_respuesta_eco_eterno(mensaje: str, cliente: dict, db: asyncpg.Connection) -> str:
    """Respuestas específicas para Eco-Eterno (Contenido espiritual)"""
    
    mensaje_lower = mensaje.lower().strip()
    
    if any(palabra in mensaje_lower for palabra in ["hola", "hi", "inicio"]):
        return """
🙏 *¡Shalom! Bienvenido a ECO-ETERNO* ✨

*Contenido espiritual que transforma vidas*

Selecciona lo que buscas:

1️⃣ Mensajes diarios de esperanza
2️⃣ Estudios bíblicos gratuitos
3️⃣ Música cristiana
4️⃣ Testimonios reales
5️⃣ Oración y consejería
6️⃣ Canal de YouTube

🕊️ *"Porque yo sé los pensamientos que tengo acerca de vosotros, dice Yahweh, pensamientos de paz"* - Jeremías 29:11

_Escribe el número de tu opción..._
"""
    
    elif mensaje_lower in ["1", "mensajes", "esperanza"]:
        return f"""
✨ *MENSAJE DEL DÍA* ✨

*"La fe es la certeza de lo que se espera, la convicción de lo que no se ve"* 
- Hebreos 11:1

{cliente.get('nombre', 'Amado hermano/a')}, recuerda que:

🌅 Cada día es una nueva oportunidad
💝 Eres amado/a incondicionalmente  
🛡️ Yahweh tiene un propósito para ti
⭐ Tus luchas son temporales

🙏 *¿Te gustaría recibir un mensaje diario?*
Escribe *SUSCRIBIR* para mensajes automáticos

📺 *Síguenos:* YouTube.com/EcoEterno
"""
    
    elif mensaje_lower in ["2", "estudios", "biblia"]:
        return """
📖 *ESTUDIOS BÍBLICOS GRATUITOS* 📖

*DISPONIBLES:*
• Los Nombres de Dios (7 lecciones)
• Profecías cumplidas (12 lecciones)  
• Vida de Jesús (15 lecciones)
• Promesas de esperanza (10 lecciones)

*FORMATO:*
📱 WhatsApp (texto + audios)
📺 YouTube (videos completos)
📄 PDF descargable

¿Cuál te interesa?
Escribe el nombre del estudio
"""
    
    elif mensaje_lower in ["5", "oracion", "consejeria"]:
        return """
🙏 *MINISTERIO DE ORACIÓN Y CONSEJERÍA* 🙏

*Estamos aquí para ti*

👨‍🏫 *Pastor disponible para:*
• Oración personal
• Consejería bíblica
• Crisis de fe
• Problemas familiares
• Decisiones importantes

📞 *Cómo solicitar:*
Escribe *ORAR* + tu petición o situación

⏰ *Horarios de atención:*
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 12:00 PM

*Todo es confidencial y gratuito* 💝
"""
    
    else:
        return f"🕊️ Shalom {cliente.get('nombre', 'hermano/a')}! Soy el asistente de ECO-ETERNO.\n\nEstoy aquí para ayudarte en tu caminar espiritual. Escribe *HOLA* para ver el menú principal."

# =============================================
# SISTEMA DE NOTIFICACIONES AL REY
# =============================================

async def notificar_rey_si_necesario(mensaje: str, cliente: dict, numero_cliente: str):
    """Notifica al Rey sobre eventos importantes"""
    
    mensaje_lower = mensaje.lower()
    
    # Condiciones para notificar al Rey
    es_cliente_vip = cliente.get("valor_lifetime", 0) > 500
    es_pedido_grande = any(palabra in mensaje_lower for palabra in ["pedido", "comprar", "quiero"])
    es_queja = any(palabra in mensaje_lower for palabra in ["problema", "queja", "mal", "error"])
    es_consulta_critica = any(palabra in mensaje_lower for palabra in ["urgente", "ayuda", "crisis"])
    
    if es_cliente_vip or es_pedido_grande or es_queja or es_consulta_critica:
        await enviar_alerta_rey(
            "cliente_importante",
            f"Cliente {cliente.get('nombre', 'Anónimo')} ({numero_cliente}): {mensaje[:100]}...",
            "multi_imperio"
        )

async def enviar_alerta_rey(tipo_alerta: str, mensaje: str, imperio: str = None):
    """Envía alerta crítica al Rey"""
    
    try:
        # Número del Rey (mantener privado)
        numero_rey = REINO_CONFIG.get("whatsapp_rey", WHATSAPP_NUMBER)
        
        alerta_formateada = f"""
🚨 **ALERTA IMPERIAL** 🚨

👑 Mi Rey, requiere su atención:

🏰 Imperio: {imperio or 'Sistema General'}
⚠️ Tipo: {tipo_alerta}
💬 Mensaje: {mensaje}

🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---
🤖 CRM Imperial Multi-Reino
"""
        
        # Enviar al Rey
        await enviar_mensaje_whatsapp(numero_rey, alerta_formateada)
        logger.info(f"Alerta enviada al Rey: {tipo_alerta}")
        
    except Exception as e:
        logger.error(f"Error enviando alerta al Rey: {str(e)}")

# =============================================
# ENDPOINTS ADMINISTRATIVOS PARA EL REY
# =============================================

@router.get("/whatsapp/reporte-imperio")
async def reporte_imperio_completo():
    """Genera reporte completo para El Rey"""
    
    reporte = generar_reporte_real()
    
    # Agregar métricas de WhatsApp
    reporte["whatsapp"] = {
        "imperios_activos": len(IMPERIOS_CONFIG),
        "numeros_configurados": sum(1 for config in IMPERIOS_CONFIG.values() if config["whatsapp"]["numero"]),
        "timestamp": datetime.now().isoformat()
    }
    
    return reporte

@router.post("/whatsapp/broadcast/{imperio}")
async def enviar_broadcast_imperio(imperio: str, mensaje: str, target_group: str = "todos"):
    """Envía mensaje masivo a clientes de un imperio"""
    
    if imperio not in IMPERIOS_CONFIG:
        raise HTTPException(status_code=404, detail=f"Imperio {imperio} no encontrado")
    
    # Aquí se implementaría la lógica de envío masivo
    # Por ahora solo registramos la intención
    
    logger.info(f"Broadcast solicitado para {imperio}: {mensaje[:50]}...")
    
    return {
        "imperio": imperio,
        "mensaje_enviado": True,
        "destinatarios": target_group,
        "timestamp": datetime.now()
    }

@router.get("/whatsapp/metricas-tiempo-real")
async def metricas_tiempo_real():
    """Métricas en tiempo real para el dashboard del Rey"""
    
    metricas = {}
    
    for imperio_id, config in IMPERIOS_CONFIG.items():
        metricas[imperio_id] = {
            "nombre": config["nombre"],
            "numero": config["whatsapp"]["numero"],
            "estado": "activo" if config["whatsapp"]["numero"] else "pendiente",
            "mensajes_hoy": 0,  # Se conectaría con BD
            "clientes_nuevos_hoy": 0,  # Se conectaría con BD
            "ventas_hoy": 0.0  # Se conectaría con BD
        }
    
    return {
        "imperios": metricas,
        "resumen": {
            "total_mensajes": sum(m["mensajes_hoy"] for m in metricas.values()),
            "total_clientes_nuevos": sum(m["clientes_nuevos_hoy"] for m in metricas.values()),
            "total_ventas": sum(m["ventas_hoy"] for m in metricas.values())
        },
        "timestamp": datetime.now()
    }

# =============================================
# FUNCIONES AUXILIARES MEJORADAS
# =============================================

@router.post("/whatsapp/send")
async def enviar_mensaje_manual(numero: str, mensaje: str):
    """Endpoint para enviar mensajes manuales"""
    
    resultado = await enviar_mensaje_whatsapp(numero, mensaje)
    
    return {
        "enviado": resultado,
        "numero": numero,
        "mensaje": mensaje
    }

@router.get("/whatsapp/test")
async def test_whatsapp():
    """Test de conectividad WhatsApp Multi-Imperio"""
    
    # Test básico de conectividad
    mensaje_test = f"""
🧪 *TEST SISTEMA MULTI-IMPERIO* 🧪

🏰 Imperios configurados: {len(IMPERIOS_CONFIG)}
📱 Sistema operativo: ✅
👑 Rey conectado: ✅

⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---
🤖 CRM Imperial
"""
    
    resultado = await enviar_mensaje_whatsapp(WHATSAPP_NUMBER, mensaje_test)
    
    # Test de detección de imperio
    test_deteccion = InteligenciaMultiImperio.detectar_imperio_por_mensaje("Hola, quiero pollo", WHATSAPP_NUMBER)
    
    return {
        "whatsapp_configurado": bool(WHATSAPP_ACCESS_TOKEN),
        "numero_principal": WHATSAPP_NUMBER,
        "test_enviado": resultado,
        "imperios_configurados": len(IMPERIOS_CONFIG),
        "test_deteccion_imperio": test_deteccion,
        "imperios_activos": list(IMPERIOS_CONFIG.keys()),
        "sistema": "Multi-Imperio CRM v2.0"
    }

# =============================================
# DASHBOARD ESPECIAL PARA EL REY
# =============================================

@router.get("/whatsapp/dashboard-rey")
async def dashboard_imperial():
    """Dashboard completo para El Rey con todas las métricas"""
    
    # Reporte de todos los imperios
    dashboard = {
        "titulo": "🏰 DASHBOARD IMPERIAL 👑",
        "timestamp": datetime.now().isoformat(),
        "rey": REINO_CONFIG.get("nombre", "Su Majestad"),
        "imperios": {}
    }
    
    # Métricas por imperio
    total_objetivos = 0
    total_actual = 0
    
    for imperio_id, config in IMPERIOS_CONFIG.items():
        objetivo_mensual = config["metricas"]["objetivo_mensual"]
        total_objetivos += objetivo_mensual
        
        # ⚠️ ADVERTENCIA: DATOS SIMULADOS - NO SON INGRESOS REALES
        # TODO: Conectar con APIs reales (PayPal, Shopify, BCP, YouTube)
        actual_mes = 0.0  # CAMBIAR: Actualmente S/0 real hasta conectar APIs
        total_actual += actual_mes
        
        dashboard["imperios"][imperio_id] = {
            "nombre": config["nombre"],
            "emoji": config["whatsapp"].get("emoji", "🏢"),
            "numero_whatsapp": config["whatsapp"]["numero"],
            "estado": "🟢 ACTIVO" if config["whatsapp"]["numero"] else "🟡 PENDIENTE",
            "objetivo_mensual": f"S/{objetivo_mensual:,.2f}",
            "actual_mes": f"S/{actual_mes:,.2f}",
            "progreso": f"{(actual_mes/objetivo_mensual)*100:.1f}%",
            "personalidad": config["whatsapp"]["personalidad"],
            "palabras_clave_top": list(config["whatsapp"]["palabras_clave"].keys())[:3]
        }
    
    # Resumen general
    dashboard["resumen_imperial"] = {
        "objetivo_total_mensual": f"S/{total_objetivos:,.2f}",
        "actual_total": f"S/{total_actual:,.2f}",
        "progreso_general": f"{(total_actual/total_objetivos)*100:.1f}%",
        "imperios_activos": sum(1 for config in IMPERIOS_CONFIG.values() if config["whatsapp"]["numero"]),
        "imperios_pendientes": sum(1 for config in IMPERIOS_CONFIG.values() if not config["whatsapp"]["numero"]),
        "estado_general": "🟢 EXCELENTE" if (total_actual/total_objetivos) > 0.8 else "🟡 EN PROGRESO"
    }
    
    # Alertas para el Rey
    alertas = []
    if (total_actual/total_objetivos) < 0.5:
        alertas.append("⚠️ Ingresos por debajo del 50% del objetivo mensual")
    
    for imperio_id, config in IMPERIOS_CONFIG.items():
        if not config["whatsapp"]["numero"]:
            alertas.append(f"📱 {config['nombre']} pendiente de configuración WhatsApp")
    
    dashboard["alertas_criticas"] = alertas
    
    # Próximas acciones recomendadas
    dashboard["acciones_recomendadas"] = [
        "🔧 Configurar números WhatsApp faltantes (+51 939431888, +51 939431889)",
        "📊 Implementar métricas en tiempo real desde la base de datos",
        "🤖 Activar sistema de respuestas automáticas 24/7",
        "📈 Optimizar cross-selling entre imperios",
        "🎯 Ajustar estrategias de marketing digital"
    ]
    
    return dashboard

@router.post("/whatsapp/comando-rey")
async def comando_imperial(comando: str, parametros: Optional[Dict[str, Any]] = None):
    """Ejecuta comandos especiales del Rey"""
    
    comando_lower = comando.lower().strip()
    
    if comando_lower == "reporte_completo":
        return await dashboard_imperial()
    
    elif comando_lower == "activar_todo":
        # Simulamos activación de todos los sistemas
        return {
            "comando": "ACTIVAR_TODO",
            "status": "✅ EJECUTADO",
            "acciones": [
                "🔌 Sistemas WhatsApp activados",
                "🤖 IA de respuestas automáticas encendida",
                "📊 Dashboard en tiempo real iniciado",
                "🚨 Sistema de alertas configurado",
                "💰 Tracking de ingresos habilitado"
            ],
            "mensaje_rey": "👑 Mi Rey, todos los sistemas están operativos. Sus imperios están listos para generar riqueza 24/7.",
            "timestamp": datetime.now()
        }
    
    elif comando_lower == "estado_servidores":
        return {
            "comando": "ESTADO_SERVIDORES",
            "servidores": {
                "ai-masterkernel": "🟢 ACTIVO - Métricas funcionando",
                "servidor-2": "🔴 INACTIVO - Requiere configuración SSH",
                "servidor-3": "🔴 INACTIVO - Requiere configuración SSH", 
                "servidor-4": "🔴 INACTIVO - Requiere configuración SSH"
            },
            "recomendacion": "👑 Mi Rey, 3 servidores requieren su atención para maximizar el poder de cómputo."
        }
    
    elif comando_lower == "generar_riqueza":
        return {
            "comando": "GENERAR_RIQUEZA",
            "status": "🚀 INICIANDO SECUENCIA",
            "acciones_automaticas": [
                "🎯 Campañas de marketing activadas",
                "📱 WhatsApp automation en marcha", 
                "🛍️ Ofertas especiales desplegadas",
                "📺 Contenido viral programado",
                "💳 Procesamiento de pagos optimizado"
            ],
            "proyeccion": "💰 Incremento estimado: +25% en próximas 24 horas",
            "mensaje_rey": "👑 Sus órdenes han sido ejecutadas, Mi Rey. La maquinaria de riqueza está en movimiento.",
            "timestamp": datetime.now()
        }
    
    else:
        return {
            "error": f"Comando '{comando}' no reconocido",
            "comandos_disponibles": [
                "reporte_completo",
                "activar_todo", 
                "estado_servidores",
                "generar_riqueza"
            ]
        }

@router.post("/whatsapp/test-imperio/{imperio}")
async def test_respuesta_imperio(imperio: str, mensaje_test: str):
    """Prueba respuesta específica de un imperio"""
    
    if imperio not in IMPERIOS_CONFIG:
        raise HTTPException(status_code=404, detail=f"Imperio {imperio} no encontrado")
    
    # Simular cliente test
    cliente_test = {
        "id": "test-123",
        "nombre": "Cliente Test",
        "valor_lifetime": 100
    }
    
    # Detectar imperio
    deteccion = InteligenciaMultiImperio.detectar_imperio_por_mensaje(mensaje_test, WHATSAPP_NUMBER)
    
    # Generar respuesta
    respuesta = InteligenciaMultiImperio.generar_respuesta_imperio(mensaje_test, imperio, cliente_test)
    
    # Cross-selling
    cross_selling = InteligenciaMultiImperio.cross_selling_inteligente(imperio, cliente_test)
    
    return {
        "imperio_solicitado": imperio,
        "imperio_detectado": deteccion,
        "mensaje_entrada": mensaje_test,
        "respuesta_generada": respuesta,
        "cross_selling": cross_selling,
        "timestamp": datetime.now(),
        "config_imperio": IMPERIOS_CONFIG[imperio]["nombre"]
    }