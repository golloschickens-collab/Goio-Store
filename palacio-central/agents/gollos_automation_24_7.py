#!/usr/bin/env python3
"""
🐔 GOLLOS CHICKENS - AUTOMATIZACIÓN IMPERIAL
Automatización completa para funcionar 24/7 respetando horario humano 5 PM - 1 AM

Desarrollado para: Rey (Gollos Chickens Empire)
Fecha: 29 Septiembre 2025
Objetivo: Automatizar completamente las operaciones mientras Rey duerme
"""

import asyncio
import json
import logging
from datetime import datetime, time, timedelta
from typing import Dict, List, Optional
import os
import sys

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/opt/imperios/gollos-chickens/logs/automation.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('GollosAutomation')

class GollosChickensAI:
    """Sistema principal de automatización para Gollos Chickens"""
    
    def __init__(self):
        self.horario_humano_inicio = 17  # 5 PM
        self.horario_humano_fin = 1      # 1 AM
        self.is_running = True
        self.pedidos_pendientes = []
        self.clientes_db = {}
        self.menu_actual = self.cargar_menu()
        
        logger.info("🐔 Gollos Chickens AI iniciado - Modo Emperador Automático")
    
    def cargar_menu(self) -> Dict:
        """Carga el menú actual de Gollos Chickens"""
        return {
            "🐔 POLLO ENTERO FRESCO": {
                "precio": 25.00,
                "descripcion": "Pollo entero fresco de granja, criado naturalmente",
                "tiempo_prep": 15,
                "disponible": True
            },
            "🍗 PRESAS SUELTAS": {
                "precio": 3.50,
                "descripcion": "Presas jugosas: muslo, encuentro, pecho, ala",
                "tiempo_prep": 10,
                "disponible": True
            },
            "🥘 COMBO FAMILIAR": {
                "precio": 45.00,
                "descripcion": "Pollo entero + 6 presas + papas + ensalada",
                "tiempo_prep": 25,
                "disponible": True
            },
            "🍖 POLLO A LA BRASA": {
                "precio": 30.00,
                "descripcion": "Pollo a la brasa con papas y ensalada",
                "tiempo_prep": 30,
                "disponible": True
            },
            "🌶️ POLLO PICANTE": {
                "precio": 28.00,
                "descripcion": "Pollo con salsa especial picante de la casa",
                "tiempo_prep": 20,
                "disponible": True
            }
        }
    
    def is_horario_humano(self) -> bool:
        """Verifica si Rey está disponible (5 PM - 1 AM)"""
        hora_actual = datetime.now().hour
        
        # Horario cruzado: 17-23 (5 PM - 11 PM) y 0-1 (12 AM - 1 AM)
        if hora_actual >= self.horario_humano_inicio or hora_actual <= self.horario_humano_fin:
            return True
        return False
    
    async def procesar_mensaje_whatsapp(self, mensaje: str, telefono: str, nombre: str = None) -> str:
        """Procesa mensaje de WhatsApp y genera respuesta automática"""
        mensaje_lower = mensaje.lower()
        
        # Saludos y presentación
        if any(word in mensaje_lower for word in ['hola', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches']):
            return await self.respuesta_saludo(telefono, nombre)
        
        # Solicitar menú/carta
        if any(word in mensaje_lower for word in ['carta', 'menu', 'menú', 'precios', 'qué tienen']):
            return await self.enviar_menu_completo()
        
        # Consultar horarios
        if any(word in mensaje_lower for word in ['horario', 'hora', 'abierto', 'cerrado', 'atienden']):
            return await self.respuesta_horarios()
        
        # Delivery/envío
        if any(word in mensaje_lower for word in ['delivery', 'envío', 'envio', 'llevar', 'domicilio']):
            return await self.respuesta_delivery()
        
        # Pedidos (números)
        if any(char.isdigit() for char in mensaje) and any(word in mensaje_lower for word in ['quiero', 'pedido', 'orden', 'llevo']):
            return await self.procesar_pedido(mensaje, telefono, nombre)
        
        # Respuesta general
        return await self.respuesta_general()
    
    async def respuesta_saludo(self, telefono: str, nombre: str = None) -> str:
        """Genera respuesta de saludo personalizada"""
        hora_actual = datetime.now().hour
        
        if self.is_horario_humano():
            saludo_tiempo = "¡Hola! Rey está disponible para atenderte"
        else:
            if 5 <= hora_actual < 12:
                saludo_tiempo = "¡Buenos días! Soy el asistente automático de Gollos Chickens"
            elif 12 <= hora_actual < 18:
                saludo_tiempo = "¡Buenas tardes! Soy el asistente automático de Gollos Chickens"
            else:
                saludo_tiempo = "¡Buenas noches! Soy el asistente automático de Gollos Chickens"
        
        nombre_cliente = nombre if nombre else "amigo"
        
        return f"""🐔 {saludo_tiempo}, {nombre_cliente}!

Bienvenido a **GOLLOS CHICKENS** - Los mejores pollos de Lima 🏆

⏰ **ATENCIÓN ACTUAL:**
{'👨‍🍳 Humano disponible (Rey)' if self.is_horario_humano() else '🤖 Asistente automático 24/7'}

¿En qué puedo ayudarte?
📋 Escribe "CARTA" para ver nuestro menú
🚚 Escribe "DELIVERY" para información de envíos
⏰ Escribe "HORARIOS" para horarios de atención

¡Estamos aquí para servirte! 🍗"""
    
    async def enviar_menu_completo(self) -> str:
        """Envía el menú completo con precios y descripciones"""
        menu_text = "🐔 **GOLLOS CHICKENS - CARTA COMPLETA** 🍗\n\n"
        
        for item, detalles in self.menu_actual.items():
            estado = "✅" if detalles["disponible"] else "❌"
            menu_text += f"{estado} **{item}**\n"
            menu_text += f"💰 S/{detalles['precio']:.2f}\n"
            menu_text += f"📝 {detalles['descripcion']}\n"
            menu_text += f"⏱️ Tiempo prep: {detalles['tiempo_prep']} min\n\n"
        
        menu_text += """🛒 **CÓMO PEDIR:**
Escribe tu pedido así:
"Quiero 1 pollo entero + 4 presas sueltas"

🚚 **DELIVERY GRATIS** en toda Lima
💰 **PAGO:** Efectivo, Yape, Plin
📱 **RESPUESTA:** Inmediata 24/7"""
        
        return menu_text
    
    async def respuesta_horarios(self) -> str:
        """Información detallada de horarios"""
        return """⏰ **HORARIOS GOLLOS CHICKENS**

🤖 **ASISTENTE AUTOMÁTICO:** 24/7
- Toma pedidos las 24 horas
- Respuestas inmediatas
- Información completa del menú

👨‍🍳 **ATENCIÓN HUMANA (Rey):** 5:00 PM - 1:00 AM
- Consultas especiales
- Pedidos personalizados
- Atención directa del dueño

🚚 **DELIVERY:** 6:00 PM - 12:00 AM
- Envíos gratuitos
- Cobertura: Toda Lima
- Tiempo promedio: 30-45 minutos

🏪 **PREPARACIÓN:** 24 horas
- Pollos siempre frescos
- Preparación continua
- Sin demoras en pedidos"""
    
    async def respuesta_delivery(self) -> str:
        """Información completa de delivery"""
        return """🚚 **DELIVERY GOLLOS CHICKENS**

✅ **COBERTURA:** Toda Lima Metropolitana
💰 **COSTO:** GRATIS (sin costo adicional)
⏰ **HORARIOS:** 6:00 PM - 12:00 AM
🕐 **TIEMPO:** 30-45 minutos promedio

📍 **ZONAS DE ENTREGA:**
• Lima Centro: 30 min
• San Isidro, Miraflores: 35 min  
• Surco, La Molina: 40 min
• Callao: 45 min
• Otras zonas: Consultar

💳 **MÉTODOS DE PAGO:**
• 💵 Efectivo
• 📱 Yape: 939-431-887
• 📱 Plin: 939-431-887
• 💳 Tarjeta (solo delivery)

📱 **PARA PEDIR:**
Envía tu pedido + dirección completa
Ejemplo: "1 combo familiar para Av. Arequipa 123, Lince" """
    
    async def procesar_pedido(self, mensaje: str, telefono: str, nombre: str = None) -> str:
        """Procesa un pedido específico del cliente"""
        try:
            # Extraer items del pedido
            items_pedido = self.extraer_items_pedido(mensaje)
            
            if not items_pedido:
                return """❓ **No pude entender tu pedido**

✅ **FORMATO CORRECTO:**
"Quiero 1 pollo entero + 2 presas sueltas"
"1 combo familiar para delivery"

📋 Escribe "CARTA" para ver el menú completo"""
            
            # Calcular total y tiempo
            total, tiempo_total, detalle = self.calcular_pedido(items_pedido)
            
            # Generar ID de pedido
            pedido_id = f"G{datetime.now().strftime('%d%m%H%M')}"
            
            # Guardar pedido
            pedido = {
                "id": pedido_id,
                "telefono": telefono,
                "nombre": nombre or "Cliente",
                "items": items_pedido,
                "total": total,
                "tiempo_prep": tiempo_total,
                "timestamp": datetime.now().isoformat(),
                "estado": "pendiente_direccion",
                "horario_humano": self.is_horario_humano()
            }
            
            self.pedidos_pendientes.append(pedido)
            
            respuesta = f"""✅ **PEDIDO CONFIRMADO** - ID: {pedido_id}

{detalle}

💰 **TOTAL:** S/{total:.2f}
⏱️ **TIEMPO PREP:** {tiempo_total} minutos
👨‍🍳 **PREPARACIÓN:** {'Inmediata con Rey' if self.is_horario_humano() else 'Programada para horario disponible'}

🏠 **PARA CONTINUAR:**
Envía tu dirección completa para delivery
Ejemplo: "Av. Arequipa 123, Lince - Ref: Frente al banco"

🚚 Delivery GRATIS en toda Lima"""
            
            return respuesta
            
        except Exception as e:
            logger.error(f"Error procesando pedido: {e}")
            return "❌ Error procesando pedido. Intenta nuevamente o escribe 'CARTA' para ver el menú."
    
    def extraer_items_pedido(self, mensaje: str) -> List[Dict]:
        """Extrae items del mensaje de pedido"""
        items = []
        mensaje_lower = mensaje.lower()
        
        # Buscar cada item del menú en el mensaje
        for item_menu, detalles in self.menu_actual.items():
            item_lower = item_menu.lower()
            
            # Buscar por palabras clave del item
            if "pollo entero" in item_lower and any(word in mensaje_lower for word in ["pollo entero", "entero"]):
                cantidad = self.extraer_cantidad(mensaje, ["pollo entero", "entero"])
                if cantidad > 0:
                    items.append({"nombre": item_menu, "cantidad": cantidad, "precio_unitario": detalles["precio"]})
            
            elif "presas" in item_lower and any(word in mensaje_lower for word in ["presas", "presa"]):
                cantidad = self.extraer_cantidad(mensaje, ["presas", "presa"])
                if cantidad > 0:
                    items.append({"nombre": item_menu, "cantidad": cantidad, "precio_unitario": detalles["precio"]})
            
            elif "combo" in item_lower and "combo" in mensaje_lower:
                cantidad = self.extraer_cantidad(mensaje, ["combo"])
                if cantidad > 0:
                    items.append({"nombre": item_menu, "cantidad": cantidad, "precio_unitario": detalles["precio"]})
            
            elif "brasa" in item_lower and "brasa" in mensaje_lower:
                cantidad = self.extraer_cantidad(mensaje, ["brasa"])
                if cantidad > 0:
                    items.append({"nombre": item_menu, "cantidad": cantidad, "precio_unitario": detalles["precio"]})
            
            elif "picante" in item_lower and "picante" in mensaje_lower:
                cantidad = self.extraer_cantidad(mensaje, ["picante"])
                if cantidad > 0:
                    items.append({"nombre": item_menu, "cantidad": cantidad, "precio_unitario": detalles["precio"]})
        
        return items
    
    def extraer_cantidad(self, mensaje: str, palabras_clave: List[str]) -> int:
        """Extrae cantidad de un item específico"""
        import re
        
        # Buscar números antes o después de las palabras clave
        for palabra in palabras_clave:
            pattern = rf'(\d+)\s*{palabra}|{palabra}\s*(\d+)'
            match = re.search(pattern, mensaje.lower())
            if match:
                return int(match.group(1) or match.group(2))
        
        # Si no encuentra número específico, asumir 1
        for palabra in palabras_clave:
            if palabra in mensaje.lower():
                return 1
        
        return 0
    
    def calcular_pedido(self, items: List[Dict]) -> tuple:
        """Calcula total, tiempo y detalle del pedido"""
        total = 0
        tiempo_total = 0
        detalle = "📋 **DETALLE DEL PEDIDO:**\n\n"
        
        for item in items:
            subtotal = item["cantidad"] * item["precio_unitario"]
            total += subtotal
            
            # Buscar tiempo de preparación
            for menu_item, menu_detalles in self.menu_actual.items():
                if menu_item == item["nombre"]:
                    tiempo_total = max(tiempo_total, menu_detalles["tiempo_prep"])
                    break
            
            detalle += f"• {item['cantidad']}x {item['nombre']}\n"
            detalle += f"  S/{item['precio_unitario']:.2f} c/u = S/{subtotal:.2f}\n\n"
        
        return total, tiempo_total, detalle
    
    async def respuesta_general(self) -> str:
        """Respuesta general para consultas no específicas"""
        return """🐔 **GOLLOS CHICKENS - ASISTENTE AUTOMÁTICO**

¿En qué puedo ayudarte?

📋 **OPCIONES DISPONIBLES:**
• Escribe "CARTA" → Ver menú completo
• Escribe "HORARIOS" → Horarios de atención  
• Escribe "DELIVERY" → Info de entregas
• Escribe tu pedido → Ejemplo: "1 pollo entero"

🤖 **DISPONIBLE 24/7** para tomar tu pedido
👨‍🍳 **REY DISPONIBLE:** 5:00 PM - 1:00 AM

📱 **CONTACTO DIRECTO:** 939-431-887
🏆 **Los mejores pollos de Lima desde 2020**"""
    
    async def notificar_pedido_humano(self, pedido: Dict):
        """Notifica pedido a Rey durante horario humano"""
        if self.is_horario_humano():
            # Enviar notificación inmediata a Rey
            logger.info(f"🔔 PEDIDO INMEDIATO para Rey: {pedido['id']}")
            
            # Aquí se integraría con sistema de notificaciones
            # (Telegram, SMS, WhatsApp personal, etc.)
        else:
            # Programar para horario humano
            logger.info(f"📅 PEDIDO PROGRAMADO para revisión humana: {pedido['id']}")
    
    async def run_automation(self):
        """Loop principal de automatización"""
        logger.info("🚀 Iniciando automatización 24/7 de Gollos Chickens")
        
        while self.is_running:
            try:
                # Verificar pedidos pendientes
                await self.procesar_pedidos_pendientes()
                
                # Enviar reportes automáticos
                await self.generar_reportes_automaticos()
                
                # Actualizar estado de sistema
                await self.actualizar_estado_sistema()
                
                # Esperar 30 segundos antes del siguiente ciclo
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error en loop principal: {e}")
                await asyncio.sleep(60)  # Esperar más tiempo si hay error
    
    async def procesar_pedidos_pendientes(self):
        """Procesa pedidos que están pendientes"""
        for pedido in self.pedidos_pendientes:
            if pedido["estado"] == "pendiente_direccion":
                # Verificar si ha pasado mucho tiempo sin dirección
                tiempo_pedido = datetime.fromisoformat(pedido["timestamp"])
                if datetime.now() - tiempo_pedido > timedelta(minutes=10):
                    # Enviar recordatorio automático
                    await self.enviar_recordatorio_direccion(pedido)
    
    async def enviar_recordatorio_direccion(self, pedido: Dict):
        """Envía recordatorio para completar pedido"""
        mensaje = f"""⏰ **RECORDATORIO - PEDIDO {pedido['id']}**

Tu pedido está listo para procesar:
💰 Total: S/{pedido['total']:.2f}

🏠 **FALTA TU DIRECCIÓN**
Para continuar con el delivery, envía tu dirección completa:
Ejemplo: "Av. Arequipa 123, Lince - Ref: Frente al banco"

⏱️ Este pedido expira en 10 minutos
📱 ¿Necesitas ayuda? Escribe "AYUDA" """
        
        # Aquí se enviaría el mensaje por WhatsApp
        logger.info(f"📤 Recordatorio enviado para pedido: {pedido['id']}")
    
    async def generar_reportes_automaticos(self):
        """Genera reportes automáticos cada hora"""
        hora_actual = datetime.now().hour
        
        # Reporte cada 2 horas
        if hora_actual % 2 == 0 and datetime.now().minute < 5:
            reporte = await self.generar_reporte_ventas()
            logger.info(f"📊 Reporte automático generado: {reporte}")
    
    async def generar_reporte_ventas(self) -> Dict:
        """Genera reporte de ventas actual"""
        return {
            "timestamp": datetime.now().isoformat(),
            "pedidos_activos": len(self.pedidos_pendientes),
            "horario_humano": self.is_horario_humano(),
            "estado_sistema": "operativo"
        }
    
    async def actualizar_estado_sistema(self):
        """Actualiza estado del sistema"""
        estado = {
            "ultima_actualizacion": datetime.now().isoformat(),
            "modo": "humano" if self.is_horario_humano() else "automatico",
            "pedidos_pendientes": len(self.pedidos_pendientes),
            "sistema_operativo": True
        }
        
        # Guardar estado en archivo
        with open('/opt/imperios/gollos-chickens/estado_sistema.json', 'w') as f:
            json.dump(estado, f, indent=2)

# Función principal para ejecutar
async def main():
    """Función principal de ejecución"""
    gollos_ai = GollosChickensAI()
    
    logger.info("🐔 Gollos Chickens AI - Sistema Imperial Iniciado")
    logger.info(f"⏰ Horario humano: {'ACTIVO' if gollos_ai.is_horario_humano() else 'INACTIVO'}")
    
    # Iniciar automatización
    await gollos_ai.run_automation()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Sistema detenido por usuario")
    except Exception as e:
        logger.error(f"💥 Error crítico: {e}")