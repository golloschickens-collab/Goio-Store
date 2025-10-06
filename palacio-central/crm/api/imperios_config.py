# =============================================================================
# CONFIGURACIÓN DE IMPERIOS - CRM MULTI-TENANT
# =============================================================================
# 
# Configuración específica para cada imperio del Reino Digital
# Cada imperio tiene su número WhatsApp, personalidad y configuración única
#
# =============================================================================

import json
import os
from typing import Dict, Any, List
from datetime import datetime

# -----------------------------------------------------------------------------
# CONFIGURACIÓN DE IMPERIOS
# -----------------------------------------------------------------------------

IMPERIOS_CONFIG = {
    # =========================================================================
    # 🍗 IMPERIO GOLLOS CHICKENS
    # =========================================================================
    "gollos_chickens": {
        "nombre": "Gollos Chickens",
        "slug": "gollos",
        "descripcion": "La mejor broastería del Perú",
        "color_brand": "#FF6B35",  # Naranja pollo
        "whatsapp": {
            "numero": "+51939431887",  # NÚMERO ACTUAL
            "webhook_token": "gollos_webhook_2025",
            "personalidad": "amigable_comercial",
            "saludo_inicial": "🍗 ¡Hola! Bienvenido a **Gollos Chickens**, la mejor broastería del Perú. ¿Qué delicioso pollo te apetece hoy?",
            "horario_atencion": {
                "lunes_viernes": "10:00-22:00",
                "sabado_domingo": "11:00-23:00"
            },
            "respuestas_automaticas": {
                "menu": "🍗 **MENÚ GOLLOS CHICKENS** 🍗\n\n🔥 *POLLOS ENTEROS*\n• Pollo Clásico - S/28\n• Pollo Picante - S/30\n• Pollo BBQ - S/32\n\n🍟 *COMBOS FAMILIARES*\n• Combo 1: Pollo + Papas + Gaseosa - S/35\n• Combo 2: 1/2 Pollo + Ensalada - S/25\n\n📱 Para ordenar escribe: *PEDIR* seguido de tu elección",
                "delivery": "🚗 **DELIVERY DISPONIBLE**\n\n📍 Zonas de reparto:\n• Centro: S/5\n• Cercado: S/7\n• Distritos: S/10\n\n⏰ Tiempo estimado: 30-45 min\n📱 Para confirmar tu pedido, comparte tu ubicación",
                "horarios": "🕐 **HORARIOS GOLLOS**\n\n📅 Lunes a Viernes: 10:00 AM - 10:00 PM\n📅 Sábados y Domingos: 11:00 AM - 11:00 PM\n\n🔥 ¡Siempre fresquito y delicioso!",
                "promociones": "🎉 **PROMOCIONES GOLLOS** 🎉\n\n💥 Lunes y Martes: 20% descuento en pollos enteros\n💥 Miércoles: 2x1 en gaseosas\n💥 Jueves: Combo familiar desde S/45\n💥 Fines de semana: Pollo + papa + ensalada S/30"
            },
            "palabras_clave": {
                "menu": ["menu", "carta", "precios", "que tienen"],
                "delivery": ["delivery", "envio", "llevar", "domicilio"],
                "horarios": ["horario", "abierto", "cerrado", "cuando"],
                "promociones": ["promocion", "descuento", "oferta", "2x1"],
                "pedir": ["pedir", "ordenar", "quiero", "solicitar"]
            }
        },
        "metricas": {
            "objetivo_mensual": 15000.00,  # S/ 15,000 mensual
            "ticket_promedio": 35.00,
            "clientes_objetivo": 400,
            "conversion_rate": 0.25
        }
    },
    
    # =========================================================================
    # 🛒 IMPERIO GOIO-STORE
    # =========================================================================
    "goio_store": {
        "nombre": "Goio Store",
        "slug": "goio",
        "descripcion": "Tu tienda online de confianza",
        "color_brand": "#4A90E2",  # Azul confianza
        "whatsapp": {
            "numero": "+51939431888",  # NUEVO NÚMERO A OBTENER
            "webhook_token": "goio_webhook_2025",
            "personalidad": "profesional_comercial",
            "saludo_inicial": "🛒 ¡Hola! Bienvenido a **Goio Store**, tu tienda online de confianza. ¿Te ayudo a encontrar algún producto específico?",
            "horario_atencion": {
                "lunes_domingo": "08:00-20:00"
            },
            "respuestas_automaticas": {
                "catalogo": "📦 **CATÁLOGO GOIO STORE** 📦\n\n🏠 *HOGAR Y COCINA*\n• Electrodomésticos\n• Utensilios de cocina\n• Decoración\n\n👕 *MODA Y ACCESORIOS*\n• Ropa para toda la familia\n• Zapatos y carteras\n• Accesorios\n\n📱 *TECNOLOGÍA*\n• Celulares y tablets\n• Audifonos y speakers\n• Accesorios tech\n\n💬 Escribe el nombre del producto que buscas",
                "envios": "🚚 **ENVÍOS GOIO STORE** 🚚\n\n📦 *OPCIONES DE ENVÍO:*\n• Express (24-48h): S/15\n• Regular (3-5 días): S/8\n• Recojo en tienda: GRATIS\n\n🎁 *ENVÍO GRATIS* en compras mayores a S/150\n\n📍 Cobertura nacional",
                "pagos": "💳 **MÉTODOS DE PAGO** 💳\n\n✅ Tarjetas: Visa, Mastercard\n✅ Transferencias bancarias\n✅ Pago contra entrega\n✅ Billeteras digitales\n\n🔒 Compra 100% segura",
                "garantia": "🛡️ **GARANTÍA GOIO** 🛡️\n\n✅ 30 días para devoluciones\n✅ Garantía del fabricante\n✅ Soporte técnico incluido\n✅ Cambios sin costo\n\n📞 Estamos aquí para ayudarte"
            },
            "palabras_clave": {
                "catalogo": ["catalogo", "productos", "que venden", "tienda"],
                "envios": ["envio", "delivery", "enviar", "cuando llega"],
                "pagos": ["pago", "precio", "tarjeta", "transferencia"],
                "garantia": ["garantia", "devolucion", "cambio", "problema"],
                "buscar": ["busco", "necesito", "quiero comprar", "precio de"]
            }
        },
        "metricas": {
            "objetivo_mensual": 25000.00,
            "ticket_promedio": 85.00,
            "clientes_objetivo": 300,
            "conversion_rate": 0.15
        }
    },
    
    # =========================================================================
    # 🌱 IMPERIO ECO-ETERNO (Para la gloria de Yahweh)
    # =========================================================================
    "eco_eterno": {
        "nombre": "Eco-Eterno",
        "slug": "eco-eterno",
        "descripcion": "Ministerio digital para la gloria de Yahweh",
        "color_brand": "#228B22",  # Verde esperanza
        "whatsapp": {
            "numero": "+51939431889",  # NUEVO NÚMERO A OBTENER
            "webhook_token": "eco_eterno_webhook_2025",
            "personalidad": "espiritual_inspiradora",
            "saludo_inicial": "🕊️ ¡Shalom! Bienvenido a **Eco-Eterno**, donde cada día es una bendición. ¿Te gustaría recibir un versículo inspirador de Yahweh hoy?",
            "horario_atencion": {
                "lunes_domingo": "06:00-22:00"  # Disponible para oración
            },
            "respuestas_automaticas": {
                "versiculo": "📖 **VERSÍCULO DEL DÍA** 📖\n\n*\"Porque yo sé los pensamientos que tengo acerca de vosotros, dice Yahweh, pensamientos de paz, y no de mal, para daros el fin que esperáis.\"*\n\n📍 Jeremías 29:11\n\n🙏 Que este versículo bendiga tu día\n💬 Escribe *ORACIÓN* si necesitas oración",
                "contenido": "🎥 **CONTENIDO ECO-ETERNO** 🎥\n\n📺 *YOUTUBE:* Estudios bíblicos diarios\n📱 *SHORTS:* Versículos inspiradores\n📚 *ESTUDIOS:* Torah y profetas\n🎵 *MÚSICA:* Alabanzas a Yahweh\n\n📖 Todo para la gloria del Altísimo\n🔔 Suscríbete para bendiciones diarias",
                "oracion": "🙏 **ALTAR DE ORACIÓN** 🙏\n\n*\"Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Elohim en toda oración y ruego, con acción de gracias.\"*\n\n📍 Filipenses 4:6\n\n✍️ Comparte tu petición y oraremos juntos\n⛪ Únete a nuestro grupo de oración",
                "donaciones": "💝 **OFRENDAS Y DONACIONES** 💝\n\n*\"Dad, y se os dará; medida buena, apretada, remecida y rebosando darán en vuestro seno.\"*\n\n📍 Lucas 6:38\n\n💳 Apoya el ministerio:\n• Yape: 939-431-889\n• Cuenta BCP: [número]\n• PayPal: ecoeterno@ministry.com\n\n🙏 Cada donación multiplica bendiciones"
            },
            "palabras_clave": {
                "versiculo": ["versiculo", "biblia", "palabra", "escritura"],
                "contenido": ["video", "youtube", "contenido", "canal"],
                "oracion": ["oracion", "orar", "peticion", "ayuda espiritual"],
                "donaciones": ["donar", "ofrenda", "contribuir", "apoyar"],
                "estudios": ["estudio", "enseñanza", "predica", "sermon"]
            }
        },
        "metricas": {
            "objetivo_mensual": 8000.00,  # Donaciones + monetización
            "ticket_promedio": 25.00,
            "clientes_objetivo": 1000,  # Seguidores activos
            "conversion_rate": 0.08
        }
    }
}

# -----------------------------------------------------------------------------
# CONFIGURACIÓN GLOBAL DEL REINO
# -----------------------------------------------------------------------------

REINO_CONFIG = {
    "nombre": "Reino Digital Imperial",
    "rey": "Su Majestad",
    "dashboard_unificado": True,
    "reportes_consolidados": True,
    "cross_selling": True,  # Detectar clientes que usan múltiples imperios
    "alertas_tiempo_real": True,
    
    # Configuración de reportes
    "reportes": {
        "frecuencia_envio": "diario",  # diario, semanal, mensual
        "email_rey": "rey@reino.digital",
        "whatsapp_rey": "+51939431887",  # Para reportes críticos
        "horario_reporte": "08:00",
        "metricas_clave": [
            "ingresos_totales",
            "nuevos_clientes",
            "conversion_rates",
            "alertas_criticas",
            "top_productos_servicios"
        ]
    },
    
    # Configuración de cross-selling inteligente
    "cross_selling": {
        "cliente_gollos_sugiere": ["goio_store"],  # Cliente de pollo puede comprar productos
        "cliente_goio_sugiere": ["gollos_chickens", "eco_eterno"],
        "cliente_eco_eterno_sugiere": ["goio_store"],  # Productos cristianos
        "reglas_automaticas": True
    }
}

# -----------------------------------------------------------------------------
# FUNCIONES DE UTILIDAD
# -----------------------------------------------------------------------------

def get_imperio_by_phone(phone_number: str) -> Dict[str, Any]:
    """Identifica qué imperio corresponde a un número de teléfono"""
    for imperio_key, config in IMPERIOS_CONFIG.items():
        if config["whatsapp"]["numero"] == phone_number:
            return {
                "imperio": imperio_key,
                "config": config
            }
    return None

def get_respuesta_automatica(imperio: str, palabra_clave: str) -> str:
    """Obtiene respuesta automática basada en palabra clave"""
    config = IMPERIOS_CONFIG.get(imperio)
    if not config:
        return "Imperio no encontrado"
    
    # Buscar en palabras clave
    for categoria, palabras in config["whatsapp"]["palabras_clave"].items():
        if any(palabra in palabra_clave.lower() for palabra in palabras):
            return config["whatsapp"]["respuestas_automaticas"].get(categoria, "")
    
    # Respuesta por defecto
    return config["whatsapp"]["saludo_inicial"]

def get_metricas_consolidadas() -> Dict[str, Any]:
    """Obtiene métricas consolidadas de todos los imperios"""
    total_objetivo = sum(config["metricas"]["objetivo_mensual"] for config in IMPERIOS_CONFIG.values())
    total_clientes = sum(config["metricas"]["clientes_objetivo"] for config in IMPERIOS_CONFIG.values())
    
    return {
        "objetivo_mensual_total": total_objetivo,
        "clientes_objetivo_total": total_clientes,
        "imperios_activos": len(IMPERIOS_CONFIG),
        "detalle_por_imperio": {
            imperio: config["metricas"] 
            for imperio, config in IMPERIOS_CONFIG.items()
        }
    }

def generar_reporte_real() -> Dict[str, Any]:
    """Genera reporte en tiempo real para El Rey"""
    return {
        "timestamp": datetime.now().isoformat(),
        "rey": REINO_CONFIG["rey"],
        "reino": REINO_CONFIG["nombre"],
        "imperios": {
            imperio: {
                "nombre": config["nombre"],
                "estado": "activo" if config["whatsapp"]["numero"] != "+51939431888" and config["whatsapp"]["numero"] != "+51939431889" else "pendiente_numero",
                "metricas": config["metricas"]
            }
            for imperio, config in IMPERIOS_CONFIG.items()
        },
        "metricas_consolidadas": get_metricas_consolidadas()
    }

# -----------------------------------------------------------------------------
# CONFIGURACIÓN PARA DESARROLLO
# -----------------------------------------------------------------------------

# Para pruebas locales, usar números simulados
if os.getenv("ENVIRONMENT") == "development":
    IMPERIOS_CONFIG["goio_store"]["whatsapp"]["numero"] = "+51939431888_TEST"
    IMPERIOS_CONFIG["eco_eterno"]["whatsapp"]["numero"] = "+51939431889_TEST"

# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Ejemplo de identificación por número
    imperio = get_imperio_by_phone("+51939431887")
    print(f"Imperio identificado: {imperio}")
    
    # Ejemplo de respuesta automática
    respuesta = get_respuesta_automatica("gollos_chickens", "quiero ver el menu")
    print(f"Respuesta: {respuesta}")
    
    # Ejemplo de métricas consolidadas
    metricas = get_metricas_consolidadas()
    print(f"Métricas del Reino: {metricas}")
    
    # Reporte para El Rey
    reporte = generar_reporte_real()
    print(f"Reporte Real: {reporte}")