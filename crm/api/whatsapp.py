from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import os
import asyncpg
import httpx
from datetime import datetime
import re

# =============================================
# WHATSAPP BUSINESS API INTEGRATION
# =============================================

router = APIRouter(prefix="/api/webhooks", tags=["WhatsApp"])

# Configuración WhatsApp
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID") 
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "gollos_whatsapp_verify_2025")
WHATSAPP_NUMBER = "+51939431887"

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
# FUNCIONES DE WHATSAPP API
# =============================================

async def enviar_mensaje_whatsapp(numero_destino: str, mensaje: str) -> bool:
    """Envía mensaje vía WhatsApp Business API"""
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
            
            # Procesar comando/mensaje
            respuesta = await generar_respuesta_automatica(message_text, cliente, db)
            
            # Enviar respuesta
            if respuesta:
                await enviar_mensaje_whatsapp(from_number, respuesta)
                # Registrar respuesta saliente
                await registrar_interaccion(cliente["id"], respuesta, "saliente", db)
            
        except Exception as e:
            print(f"Error procesando mensaje de {from_number}: {e}")
        finally:
            break

async def generar_respuesta_automatica(mensaje: str, cliente: dict, db: asyncpg.Connection) -> str:
    """Genera respuesta automática basada en el mensaje"""
    
    mensaje_lower = mensaje.lower().strip()
    
    # Comando: Menú principal
    if any(palabra in mensaje_lower for palabra in ["hola", "menu", "carta", "inicio", "hi"]):
        return MENU_PRINCIPAL
    
    # Comando: Ver menú
    elif mensaje_lower in ["1", "menu", "carta", "precios"]:
        return MENU_PRODUCTOS
    
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

# =============================================
# FUNCIONES AUXILIARES
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
    """Test de conectividad WhatsApp"""
    
    # Enviar mensaje de prueba a tu número
    mensaje_test = "🧪 Test de conectividad CRM\n\nSistema WhatsApp operativo ✅"
    
    resultado = await enviar_mensaje_whatsapp(WHATSAPP_NUMBER, mensaje_test)
    
    return {
        "whatsapp_configurado": bool(WHATSAPP_ACCESS_TOKEN),
        "numero_registrado": WHATSAPP_NUMBER,
        "test_enviado": resultado
    }