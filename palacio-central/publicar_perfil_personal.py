#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🐔 PUBLICADOR PERFIL PERSONAL - GOLLOS CHICKENS
===============================================
Publicar en perfil personal mientras se crea página
"""

import requests
import json

def cargar_configuracion():
    """Cargar configuración actual"""
    try:
        with open('config/keys.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
        return config['facebook']['gollos_chickens']
    except Exception as e:
        print(f"❌ Error cargando configuración: {e}")
        return None

def publicar_en_perfil(mensaje, token):
    """Publicar en perfil personal"""
    print("📱 PUBLICANDO EN PERFIL PERSONAL...")
    
    url = f"https://graph.facebook.com/v18.0/me/feed"
    
    data = {
        'message': mensaje,
        'access_token': token
    }
    
    try:
        response = requests.post(url, data=data)
        
        if response.status_code == 200:
            result = response.json()
            post_id = result.get('id', 'Sin ID')
            print(f"✅ Post publicado exitosamente!")
            print(f"🆔 ID del post: {post_id}")
            print(f"🔗 Link: https://facebook.com/{post_id}")
            return True
        else:
            print(f"❌ Error publicando: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def generar_post_prueba():
    """Generar post de prueba para Gollos Chickens"""
    post = """🔥 ¡GOLLOS CHICKENS LIMA NORTE!

🍗 La PECHUGA BROASTER más jugosa de San Martín de Porres
💰 Solo S/16 - Recién preparada y crujiente

📍 DELIVERY EN:
• San Martín de Porres
• Los Olivos
• Independencia
• Comas

⏰ Horario: 5:00 PM - 1:00 AM
🚚 Delivery GRATIS en pedidos +S/30

📱 ¡Ordena YA por WhatsApp!
💬 +51 961234567

#GollosChickens #LimaNorte #SanMartinDePortes #PechugaBroaster #DeliveryLima

🍗 ¡El sabor que conquista Lima Norte! 🍗"""
    
    return post

def main():
    print("🐔 PUBLICADOR PERFIL PERSONAL GOLLOS CHICKENS")
    print("=" * 50)
    
    # Cargar configuración
    config = cargar_configuracion()
    if not config:
        return
    
    token = config.get('page_access_token', '')
    
    if not token:
        print("❌ No hay token disponible")
        return
    
    # Generar post de prueba
    mensaje = generar_post_prueba()
    
    print("📝 POST A PUBLICAR:")
    print("-" * 30)
    print(mensaje)
    print("-" * 30)
    
    confirmacion = input("\n¿Publicar este post en tu perfil personal? (s/n): ").lower()
    
    if confirmacion == 's':
        if publicar_en_perfil(mensaje, token):
            print("\n🎉 ¡POST PUBLICADO EXITOSAMENTE!")
            print("\n💡 SIGUIENTES PASOS:")
            print("   1. ✅ Verificar que aparece en tu perfil")
            print("   2. 📱 Probar que la gente puede contactarte por WhatsApp")
            print("   3. 🏗️ Crear página oficial de Gollos Chickens")
            print("   4. 🚀 Migrar a automatización completa")
        else:
            print("\n❌ Error en la publicación")
    else:
        print("\n⏸️ Publicación cancelada")

if __name__ == "__main__":
    main()