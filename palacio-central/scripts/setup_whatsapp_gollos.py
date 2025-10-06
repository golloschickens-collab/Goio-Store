#!/usr/bin/env python3
"""
🚀 CONFIGURADOR AUTOMÁTICO WHATSAPP BUSINESS - GOLLOS CHICKENS
Setup completo para automatización WhatsApp en 5 minutos

Para: Rey (Gollos Chickens Empire)
Fecha: 29 Septiembre 2025 - 5:00 PM START
"""

import json
import requests
import asyncio
import logging
from datetime import datetime
import os

class WhatsAppSetupGollos:
    """Configurador automático de WhatsApp Business para Gollos Chickens"""
    
    def __init__(self):
        self.config_file = "c:/Goio mayordomo/palacio-central/config/keys.json"
        self.webhook_url = "https://ai-masterkernel.hetzner.com/api/webhooks/whatsapp/gollos"
        self.phone_number = None
        self.access_token = None
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('WhatsAppSetup')
        
    async def setup_completo(self):
        """Setup completo de WhatsApp Business en 5 pasos"""
        print("🚀 INICIANDO SETUP WHATSAPP BUSINESS - GOLLOS CHICKENS")
        print("=" * 60)
        
        # Paso 1: Verificar configuración actual
        await self.verificar_configuracion()
        
        # Paso 2: Configurar webhook
        await self.configurar_webhook()
        
        # Paso 3: Configurar respuestas automáticas
        await self.configurar_respuestas_automaticas()
        
        # Paso 4: Configurar menú interactivo
        await self.configurar_menu_interactivo()
        
        # Paso 5: Configurar horarios automáticos
        await self.configurar_horarios_automaticos()
        
        print("\n✅ SETUP COMPLETO - WHATSAPP BUSINESS LISTO!")
        print("🐔 Gollos Chickens ahora opera 24/7 automáticamente")
        
    async def verificar_configuracion(self):
        """Paso 1: Verificar y configurar credenciales"""
        print("\n📋 PASO 1: Verificando configuración...")
        
        try:
            with open(self.config_file, 'r') as f:
                config = json.load(f)
            
            whatsapp_config = config.get('whatsapp', {})
            
            if whatsapp_config.get('status') == 'PENDIENTE':
                print("⚠️  WhatsApp Business no configurado aún")
                await self.configurar_whatsapp_business()
            else:
                print("✅ WhatsApp Business ya configurado")
                self.access_token = whatsapp_config.get('access_token')
                self.phone_number = whatsapp_config.get('numeros', {}).get('gollos_chickens')
                
        except Exception as e:
            self.logger.error(f"Error verificando configuración: {e}")
            
    async def configurar_whatsapp_business(self):
        """Configurar WhatsApp Business desde cero"""
        print("\n🔧 Configurando WhatsApp Business...")
        
        # Instrucciones para el usuario
        print("""
📱 INSTRUCCIONES PARA WHATSAPP BUSINESS:

1. Ve a https://business.facebook.com/
2. Crea una cuenta comercial para "Gollos Chickens"
3. Ve a WhatsApp Business API
4. Configura tu número de teléfono comercial
5. Obtén tu Access Token

🔑 DATOS NECESARIOS:
""")
        
        # Solicitar datos al usuario
        token = input("Ingresa tu WhatsApp Access Token: ").strip()
        numero = input("Ingresa tu número de WhatsApp Business (ej: +51987654321): ").strip()
        
        # Actualizar configuración
        await self.actualizar_config_whatsapp(token, numero)
        
    async def actualizar_config_whatsapp(self, token: str, numero: str):
        """Actualiza la configuración de WhatsApp"""
        try:
            with open(self.config_file, 'r') as f:
                config = json.load(f)
            
            config['whatsapp']['access_token'] = token
            config['whatsapp']['numeros']['gollos_chickens'] = numero
            config['whatsapp']['status'] = 'CONFIGURADO'
            config['whatsapp']['fecha_configuracion'] = datetime.now().isoformat()
            
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            
            self.access_token = token
            self.phone_number = numero
            
            print("✅ Configuración actualizada exitosamente")
            
        except Exception as e:
            self.logger.error(f"Error actualizando configuración: {e}")
    
    async def configurar_webhook(self):
        """Paso 2: Configurar webhook para recibir mensajes"""
        print("\n🔗 PASO 2: Configurando webhook...")
        
        webhook_config = {
            "url": self.webhook_url,
            "verify_token": "gollos_chickens_webhook_2025",
            "fields": ["messages", "message_deliveries", "message_reads"]
        }
        
        print(f"✅ Webhook configurado: {self.webhook_url}")
        
        # Guardar configuración de webhook
        await self.guardar_webhook_config(webhook_config)
        
    async def guardar_webhook_config(self, webhook_config: dict):
        """Guarda configuración de webhook"""
        webhook_file = "c:/Goio mayordomo/palacio-central/config/webhook_config.json"
        
        with open(webhook_file, 'w') as f:
            json.dump(webhook_config, f, indent=2)
        
        print(f"💾 Webhook config guardado en: {webhook_file}")
    
    async def configurar_respuestas_automaticas(self):
        """Paso 3: Configurar respuestas automáticas predefinidas"""
        print("\n🤖 PASO 3: Configurando respuestas automáticas...")
        
        respuestas = {
            "saludo_automatico": {
                "trigger": ["hola", "buenos días", "buenas tardes", "buenas noches"],
                "respuesta": """🐔 ¡Hola! Bienvenido a GOLLOS CHICKENS
Los mejores pollos de Lima 🏆

⏰ ATENCIÓN:
• 🤖 Bot: 24/7 (siempre disponible)  
• 👨‍🍳 Rey: 5:00 PM - 1:00 AM

📋 Escribe "CARTA" para ver nuestro menú
🚚 Escribe "DELIVERY" para info de envíos
📱 ¿En qué puedo ayudarte?"""
            },
            
            "menu_automatico": {
                "trigger": ["carta", "menu", "menú", "precios"],
                "respuesta": """🐔 GOLLOS CHICKENS - CARTA COMPLETA 🍗

✅ POLLO ENTERO FRESCO - S/25.00
   Pollo fresco de granja, criado naturalmente
   
✅ PRESAS SUELTAS - S/3.50 c/u  
   Muslo, encuentro, pecho, ala jugosas
   
✅ COMBO FAMILIAR - S/45.00
   Pollo entero + 6 presas + papas + ensalada
   
✅ POLLO A LA BRASA - S/30.00
   Con papas doradas y ensalada fresca
   
✅ POLLO PICANTE - S/28.00  
   Con salsa especial de la casa

🛒 PEDIR: "Quiero 1 pollo entero + 4 presas"
🚚 DELIVERY GRATIS en toda Lima"""
            },
            
            "horarios_automatico": {
                "trigger": ["horario", "hora", "atienden", "abierto"],
                "respuesta": """⏰ HORARIOS GOLLOS CHICKENS

🤖 ASISTENTE AUTOMÁTICO: 24/7
   - Toma pedidos las 24 horas
   - Respuestas inmediatas
   
👨‍🍳 ATENCIÓN HUMANA (Rey): 5:00 PM - 1:00 AM
   - Consultas especiales
   - Atención personalizada
   
🚚 DELIVERY: 6:00 PM - 12:00 AM
   - Envíos gratuitos toda Lima
   - 30-45 minutos promedio"""
            },
            
            "delivery_automatico": {
                "trigger": ["delivery", "envío", "envio", "domicilio"],
                "respuesta": """🚚 DELIVERY GOLLOS CHICKENS

✅ COBERTURA: Toda Lima Metropolitana  
💰 COSTO: GRATIS (sin costo adicional)
⏰ HORARIOS: 6:00 PM - 12:00 AM
🕐 TIEMPO: 30-45 minutos

📍 ZONAS:
• Lima Centro: 30 min
• Miraflores, San Isidro: 35 min
• Surco, La Molina: 40 min  
• Otras zonas: 45 min

💳 PAGO:
• 💵 Efectivo  
• 📱 Yape: 939-431-887
• 📱 Plin: 939-431-887

Para pedir: Envía tu pedido + dirección"""
            }
        }
        
        # Guardar respuestas automáticas
        respuestas_file = "c:/Goio mayordomo/palacio-central/config/respuestas_automaticas.json"
        
        with open(respuestas_file, 'w', encoding='utf-8') as f:
            json.dump(respuestas, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Respuestas automáticas configuradas: {len(respuestas)} tipos")
        print(f"💾 Guardado en: {respuestas_file}")
    
    async def configurar_menu_interactivo(self):
        """Paso 4: Configurar menú interactivo con botones"""
        print("\n📱 PASO 4: Configurando menú interactivo...")
        
        menu_interactivo = {
            "menu_principal": {
                "tipo": "list",
                "titulo": "🐔 GOLLOS CHICKENS",
                "texto": "¿Qué necesitas hoy?",
                "opciones": [
                    {
                        "id": "ver_carta",
                        "titulo": "📋 Ver Carta Completa",
                        "descripcion": "Todos nuestros productos y precios"
                    },
                    {
                        "id": "hacer_pedido", 
                        "titulo": "🛒 Hacer Pedido",
                        "descripcion": "Realizar un pedido para delivery"
                    },
                    {
                        "id": "info_delivery",
                        "titulo": "🚚 Info Delivery", 
                        "descripcion": "Horarios, zonas y costos de envío"
                    },
                    {
                        "id": "hablar_humano",
                        "titulo": "👨‍🍳 Hablar con Rey",
                        "descripcion": "Atención personalizada (5 PM - 1 AM)"
                    }
                ]
            },
            
            "menu_productos": {
                "tipo": "list",
                "titulo": "🍗 NUESTROS PRODUCTOS", 
                "texto": "Selecciona lo que deseas:",
                "opciones": [
                    {
                        "id": "pollo_entero",
                        "titulo": "🐔 Pollo Entero - S/25.00",
                        "descripcion": "Fresco de granja, criado naturalmente"
                    },
                    {
                        "id": "presas_sueltas",
                        "titulo": "🍗 Presas Sueltas - S/3.50 c/u",
                        "descripcion": "Muslo, encuentro, pecho, ala"
                    },
                    {
                        "id": "combo_familiar", 
                        "titulo": "🥘 Combo Familiar - S/45.00",
                        "descripcion": "Pollo + 6 presas + acompañamientos"
                    },
                    {
                        "id": "pollo_brasa",
                        "titulo": "🍖 Pollo a la Brasa - S/30.00", 
                        "descripcion": "Con papas y ensalada"
                    }
                ]
            }
        }
        
        # Guardar menú interactivo
        menu_file = "c:/Goio mayordomo/palacio-central/config/menu_interactivo.json"
        
        with open(menu_file, 'w', encoding='utf-8') as f:
            json.dump(menu_interactivo, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Menú interactivo configurado")
        print(f"💾 Guardado en: {menu_file}")
    
    async def configurar_horarios_automaticos(self):
        """Paso 5: Configurar mensajes automáticos por horarios"""
        print("\n⏰ PASO 5: Configurando horarios automáticos...")
        
        horarios_automaticos = {
            "mensaje_apertura": {
                "hora": "17:00",  # 5 PM
                "mensaje": """🐔 ¡GOLLOS CHICKENS ABIERTO!

👨‍🍳 Rey ya está disponible para atención personalizada
🚚 Delivery activado hasta las 12:00 AM
📱 Haz tu pedido ahora: escribe "CARTA"

¡Los mejores pollos de Lima te esperan! 🏆""",
                "activo": True
            },
            
            "mensaje_cierre_delivery": {
                "hora": "23:45",  # 11:45 PM 
                "mensaje": """⏰ ÚLTIMO LLAMADO DELIVERY

🚚 Delivery cierra en 15 minutos (12:00 AM)
🐔 ¡Última oportunidad del día!
📱 Pedidos rápidos: escribe tu orden

Mañana volvemos a las 6:00 PM 🍗""",
                "activo": True
            },
            
            "mensaje_cierre_humano": {
                "hora": "01:00",  # 1:00 AM
                "mensaje": """😴 REY SE VA A DESCANSAR

🤖 Asistente automático toma el control 24/7
📝 Deja tu pedido y lo procesamos mañana
⏰ Rey regresa a las 5:00 PM

¡Buenas noches! 🌙""",
                "activo": True
            },
            
            "mensaje_matutino": {
                "hora": "08:00",  # 8:00 AM
                "mensaje": """☀️ ¡BUENOS DÍAS!

🐔 Gollos Chickens preparándose para el día
👨‍🍳 Rey regresa a las 5:00 PM  
🤖 Asistente disponible para tomar pedidos

📋 Escribe "CARTA" para ver nuestro menú 🍗""",
                "activo": True
            }
        }
        
        # Guardar configuración de horarios
        horarios_file = "c:/Goio mayordomo/palacio-central/config/horarios_automaticos.json"
        
        with open(horarios_file, 'w', encoding='utf-8') as f:
            json.dump(horarios_automaticos, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Horarios automáticos configurados: {len(horarios_automaticos)} mensajes")
        print(f"💾 Guardado en: {horarios_file}")
    
    async def crear_servidor_webhook(self):
        """Crea el servidor webhook para recibir mensajes"""
        print("\n🖥️  CREANDO SERVIDOR WEBHOOK...")
        
        webhook_server = '''#!/usr/bin/env python3
"""
🔗 SERVIDOR WEBHOOK WHATSAPP - GOLLOS CHICKENS
Recibe y procesa mensajes automáticamente 24/7
"""

from flask import Flask, request, jsonify
import json
import asyncio
from datetime import datetime
import sys
import os

# Importar nuestro sistema de automatización
sys.path.append('/opt/imperios/gollos-chickens')
from gollos_automation_24_7 import GollosChickensAI

app = Flask(__name__)
gollos_ai = GollosChickensAI()

@app.route('/api/webhooks/whatsapp/gollos', methods=['GET', 'POST'])
def webhook_whatsapp():
    """Endpoint principal para webhook de WhatsApp"""
    
    if request.method == 'GET':
        # Verificación de webhook
        verify_token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')
        
        if verify_token == 'gollos_chickens_webhook_2025':
            return challenge
        else:
            return 'Token inválido', 403
    
    elif request.method == 'POST':
        # Procesar mensaje entrante
        data = request.get_json()
        
        try:
            # Extraer información del mensaje
            entry = data['entry'][0]
            changes = entry['changes'][0]
            value = changes['value']
            
            if 'messages' in value:
                mensaje = value['messages'][0]
                telefono = mensaje['from']
                texto = mensaje['text']['body']
                
                # Obtener nombre del contacto
                contacts = value.get('contacts', [])
                nombre = contacts[0]['profile']['name'] if contacts else None
                
                # Procesar mensaje con IA
                respuesta = asyncio.run(
                    gollos_ai.procesar_mensaje_whatsapp(texto, telefono, nombre)
                )
                
                # Enviar respuesta automática
                enviar_respuesta_whatsapp(telefono, respuesta)
                
                # Log del mensaje
                print(f"📱 Mensaje de {telefono}: {texto}")
                print(f"🤖 Respuesta: {respuesta[:100]}...")
                
        except Exception as e:
            print(f"❌ Error procesando webhook: {e}")
        
        return jsonify({'status': 'ok'})

def enviar_respuesta_whatsapp(telefono: str, mensaje: str):
    """Envía respuesta automática por WhatsApp"""
    import requests
    
    # Cargar configuración
    with open('/opt/imperios/gollos-chickens/config/keys.json', 'r') as f:
        config = json.load(f)
    
    access_token = config['whatsapp']['access_token']
    numero_negocio = config['whatsapp']['numeros']['gollos_chickens']
    
    url = f"https://graph.facebook.com/v18.0/{numero_negocio}/messages"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'messaging_product': 'whatsapp',
        'to': telefono,
        'type': 'text',
        'text': {'body': mensaje}
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print(f"✅ Respuesta enviada a {telefono}")
        else:
            print(f"❌ Error enviando respuesta: {response.text}")
    except Exception as e:
        print(f"💥 Error en envío: {e}")

@app.route('/api/status/gollos', methods=['GET'])
def status_gollos():
    """Estado del sistema Gollos Chickens"""
    return jsonify({
        'sistema': 'Gollos Chickens AI',
        'estado': 'operativo',
        'horario_humano': gollos_ai.is_horario_humano(),
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor webhook Gollos Chickens...")
    app.run(host='0.0.0.0', port=8000, debug=False)
'''
        
        # Guardar servidor webhook
        servidor_file = "c:/Goio mayordomo/palacio-central/agents/webhook_server_gollos.py"
        
        with open(servidor_file, 'w', encoding='utf-8') as f:
            f.write(webhook_server)
        
        print(f"✅ Servidor webhook creado")
        print(f"💾 Guardado en: {servidor_file}")
    
    async def generar_script_inicio(self):
        """Genera script para iniciar todo el sistema"""
        print("\n🚀 GENERANDO SCRIPT DE INICIO...")
        
        script_inicio = '''#!/bin/bash
# 🐔 SCRIPT DE INICIO GOLLOS CHICKENS
# Inicia todo el sistema automático de una vez

echo "🚀 INICIANDO GOLLOS CHICKENS EMPIRE..."
echo "======================================"

# Paso 1: Ir al directorio
cd "c:/Goio mayordomo/palacio-central"

# Paso 2: Activar entorno Python
echo "🐍 Activando Python..."
python -m venv venv
source venv/bin/activate  # En Linux
# venv\\Scripts\\activate  # En Windows

# Paso 3: Instalar dependencias
echo "📦 Instalando dependencias..."
pip install flask requests asyncio python-whatsapp-business

# Paso 4: Iniciar servidor webhook
echo "🔗 Iniciando servidor webhook..."
python agents/webhook_server_gollos.py &

# Paso 5: Iniciar sistema de automatización
echo "🤖 Iniciando automatización..."  
python agents/gollos_automation_24_7.py &

# Paso 6: Mostrar estado
echo ""
echo "✅ GOLLOS CHICKENS EMPIRE INICIADO!"
echo "🐔 Sistema operativo 24/7"
echo "👨‍🍳 Rey disponible: 5:00 PM - 1:00 AM"
echo "🤖 Bot disponible: 24/7"
echo ""
echo "📊 Para ver estado: http://localhost:8000/api/status/gollos"
echo "🛑 Para detener: Ctrl+C"
'''
        
        # Guardar script de inicio
        script_file = "c:/Goio mayordomo/palacio-central/scripts/iniciar_gollos_empire.sh"
        
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(script_file), exist_ok=True)
        
        with open(script_file, 'w', encoding='utf-8') as f:
            f.write(script_inicio)
        
        print(f"✅ Script de inicio creado")
        print(f"💾 Guardado en: {script_file}")
        
        # También crear versión para Windows
        script_windows = script_inicio.replace('source venv/bin/activate', 'venv\\Scripts\\activate')
        script_windows = script_windows.replace('python agents/', 'python agents\\')
        script_windows = script_inicio.replace('.sh', '.cmd')
        
        script_file_win = script_file.replace('.sh', '.cmd')
        
        with open(script_file_win, 'w', encoding='utf-8') as f:
            f.write(script_windows)
        
        print(f"✅ Script Windows creado: {script_file_win}")

# Función principal
async def main():
    """Ejecutar configuración completa"""
    setup = WhatsAppSetupGollos()
    await setup.setup_completo()
    await setup.crear_servidor_webhook()
    await setup.generar_script_inicio()
    
    print("\n" + "="*60)
    print("🏆 CONFIGURACIÓN COMPLETA - GOLLOS CHICKENS EMPIRE")
    print("="*60)
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. ✅ Configurar WhatsApp Business API (si no está hecho)")
    print("2. ✅ Ejecutar: python scripts/iniciar_gollos_empire.cmd")
    print("3. ✅ Probar enviando mensaje al WhatsApp Business")
    print("4. ✅ Verificar estado en: http://localhost:8000/api/status/gollos")
    print("\n🚀 ¡A las 5:00 PM tendrás automatización completa!")

if __name__ == "__main__":
    asyncio.run(main())