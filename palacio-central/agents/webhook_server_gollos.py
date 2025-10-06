#!/usr/bin/env python3
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
