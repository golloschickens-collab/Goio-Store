#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 OBTENER PAGE ACCESS TOKEN CORRECTO
=========================================
Script para obtener el Page Access Token específico de la página
"""

import json
import requests

def cargar_configuracion():
    """Cargar configuración desde archivo"""
    try:
        with open('config/keys.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
        return config
    except Exception as e:
        print(f"❌ Error cargando configuración: {e}")
        return None

def obtener_page_token(user_token):
    """Obtener Page Access Token específico desde User Token"""
    print("🔄 OBTENIENDO PAGE ACCESS TOKEN...")
    print("=" * 40)
    
    # URL para obtener páginas disponibles
    url = f"https://graph.facebook.com/me/accounts?access_token={user_token}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'error' in data:
            print(f"❌ Error obteniendo páginas: {data['error']['message']}")
            return None
            
        pages = data.get('data', [])
        
        print(f"📄 Páginas disponibles: {len(pages)}")
        print("-" * 30)
        
        for i, page in enumerate(pages, 1):
            page_id = page.get('id')
            page_name = page.get('name')
            page_token = page.get('access_token')
            
            print(f"{i}. {page_name} (ID: {page_id})")
            print(f"   Token: {page_token[:20]}...")
            
            # Si es la página de Gollos Chickens, devolver su token
            if page_id == "377626045425378":
                print(f"\n✅ PÁGINA GOLLOS ENCONTRADA!")
                print(f"📄 Nombre: {page_name}")
                print(f"🆔 ID: {page_id}")
                print(f"🔑 Page Token: {page_token}")
                return {
                    'page_id': page_id,
                    'page_name': page_name,
                    'page_access_token': page_token
                }
        
        print("\n❌ Página de Gollos Chickens no encontrada")
        return None
        
    except Exception as e:
        print(f"❌ Error obteniendo page token: {e}")
        return None

def probar_publicacion_con_page_token(page_token, page_id):
    """Probar publicación con el Page Access Token"""
    print(f"\n🧪 PROBANDO PUBLICACIÓN CON PAGE TOKEN...")
    print("=" * 45)
    
    message = "🧪 PRUEBA DE AUTOMATIZACIÓN GOLLOS CHICKENS\n\n🐔 ¡El sistema automático está funcionando perfectamente!\n\n📱 WhatsApp: +51 939 431 887\n📍 Lima Norte - Delivery 25-35 min\n\n#GollosChickens #LimaNorte #Delivery"
    
    url = f"https://graph.facebook.com/{page_id}/feed"
    
    data = {
        'message': message,
        'access_token': page_token
    }
    
    try:
        response = requests.post(url, data=data)
        result = response.json()
        
        if 'error' in result:
            print(f"❌ Error en publicación: {result['error']['message']}")
            return False
        else:
            post_id = result.get('id')
            print(f"✅ ¡PUBLICACIÓN EXITOSA!")
            print(f"🆔 Post ID: {post_id}")
            print(f"🔗 URL: https://facebook.com/{post_id}")
            return True
            
    except Exception as e:
        print(f"❌ Error probando publicación: {e}")
        return False

def main():
    """Función principal"""
    print("🔧 OBTENER PAGE ACCESS TOKEN GOLLOS CHICKENS")
    print("=" * 50)
    
    # Cargar configuración
    config = cargar_configuracion()
    if not config:
        return
    
    facebook_config = config.get('facebook', {}).get('gollos_chickens', {})
    current_token = facebook_config.get('page_access_token')
    
    if not current_token:
        print("❌ No se encontró token en la configuración")
        return
    
    print(f"🔑 Token actual: {current_token[:20]}...")
    
    # Intentar obtener el Page Token correcto
    page_info = obtener_page_token(current_token)
    
    if page_info:
        # Actualizar configuración con el nuevo token
        nuevo_token = page_info['page_access_token']
        
        if nuevo_token != current_token:
            print(f"\n🔄 ACTUALIZANDO CONFIGURACIÓN...")
            print("-" * 35)
            
            config['facebook']['gollos_chickens']['page_access_token'] = nuevo_token
            config['facebook']['gollos_chickens']['status'] = "PAGE_TOKEN_ACTUALIZADO"
            
            try:
                with open('config/keys.json', 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
                print("✅ Configuración actualizada")
            except Exception as e:
                print(f"❌ Error guardando configuración: {e}")
                return
        else:
            print("\n✅ El token actual ya es el Page Token correcto")
        
        # Probar publicación con el Page Token
        exito = probar_publicacion_con_page_token(
            page_info['page_access_token'], 
            page_info['page_id']
        )
        
        if exito:
            print("\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!")
            print("🚀 Listo para automatización total de Gollos Chickens")
        else:
            print("\n❌ Aún hay problemas con la publicación")
    else:
        print("\n❌ No se pudo obtener el Page Token")

if __name__ == "__main__":
    main()