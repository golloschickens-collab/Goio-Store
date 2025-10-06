#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 DESCUBRIDOR DE PÁGINAS FACEBOOK
==================================
Encontrar los Page IDs correctos
"""

import requests
import json

def descubrir_paginas():
    """Descubrir todas las páginas disponibles con el token"""
    
    # Cargar token
    with open('config/keys.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    token = config['facebook']['gollos_chickens']['page_access_token']
    
    print("🔍 DESCUBRIENDO PÁGINAS DISPONIBLES")
    print("=" * 40)
    
    # Obtener información del usuario/app
    print("\n1️⃣ Información del token...")
    url = f"https://graph.facebook.com/v18.0/me?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token válido para: {data.get('name', 'Usuario desconocido')}")
        print(f"   ID: {data.get('id', 'ID no disponible')}")
    else:
        print(f"❌ Error con token: {response.text}")
        return False
    
    # Obtener páginas administradas
    print("\n2️⃣ Páginas que puedes administrar...")
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        pages = data.get('data', [])
        
        if len(pages) == 0:
            print("❌ No se encontraron páginas administradas")
            print("\n💡 POSIBLES SOLUCIONES:")
            print("   1. Asegúrate de ser administrador de las páginas")
            print("   2. Regenera el token incluyendo permisos de páginas")
            print("   3. Verifica que las páginas estén conectadas a tu cuenta")
            return False
        
        print(f"✅ Páginas encontradas: {len(pages)}")
        print("\n📄 LISTA DE PÁGINAS:")
        print("-" * 50)
        
        paginas_info = []
        
        for i, page in enumerate(pages, 1):
            page_info = {
                'nombre': page.get('name', 'Sin nombre'),
                'id': page.get('id', 'Sin ID'),
                'category': page.get('category', 'Sin categoría'),
                'access_token': page.get('access_token', 'Sin token'),
                'permisos': page.get('perms', [])
            }
            
            paginas_info.append(page_info)
            
            print(f"{i}. {page_info['nombre']}")
            print(f"   📍 ID: {page_info['id']}")
            print(f"   📂 Categoría: {page_info['category']}")
            print(f"   🔑 Token específico: {'SÍ' if page_info['access_token'] else 'NO'}")
            print(f"   🛡️ Permisos: {', '.join(page_info['permisos'])}")
            print()
        
        return paginas_info
        
    else:
        print(f"❌ Error obteniendo páginas: {response.text}")
        return False

def actualizar_configuracion(paginas_info):
    """Actualizar configuración con IDs correctos"""
    
    if not paginas_info or len(paginas_info) == 0:
        return False
    
    print("🔧 ACTUALIZANDO CONFIGURACIÓN...")
    print("-" * 35)
    
    # Cargar configuración actual
    with open('config/keys.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    # Buscar Gollos Chickens y Goio Store
    gollos_page = None
    goio_page = None
    
    for page in paginas_info:
        nombre = page['nombre'].lower()
        if 'gollos' in nombre or 'chicken' in nombre:
            gollos_page = page
        elif 'goio' in nombre or 'store' in nombre:
            goio_page = page
    
    actualizado = False
    
    # Actualizar Gollos Chickens
    if gollos_page:
        print(f"✅ Gollos Chickens encontrado: {gollos_page['nombre']}")
        config['facebook']['gollos_chickens']['page_id'] = gollos_page['id']
        config['facebook']['gollos_chickens']['page_name'] = gollos_page['nombre']
        if gollos_page['access_token']:
            config['facebook']['gollos_chickens']['page_access_token'] = gollos_page['access_token']
        actualizado = True
    else:
        print("⚠️ Gollos Chickens no encontrado automáticamente")
    
    # Actualizar Goio Store
    if goio_page:
        print(f"✅ Goio Store encontrado: {goio_page['nombre']}")
        config['facebook']['goio_store']['page_id'] = goio_page['id']
        config['facebook']['goio_store']['page_name'] = goio_page['nombre']
        if goio_page['access_token']:
            config['facebook']['goio_store']['page_access_token'] = goio_page['access_token']
        actualizado = True
    else:
        print("⚠️ Goio Store no encontrado automáticamente")
    
    # Guardar configuración
    if actualizado:
        with open('config/keys.json', 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print("\n💾 Configuración actualizada exitosamente")
        return True
    else:
        print("\n❌ No se pudo actualizar la configuración automáticamente")
        
        # Mostrar opciones manuales
        print("\n📝 ACTUALIZACIÓN MANUAL NECESARIA:")
        print("Copia estos datos a tu config/keys.json:")
        print()
        
        for i, page in enumerate(paginas_info, 1):
            print(f"{i}. {page['nombre']} (ID: {page['id']})")
        
        return False

def test_publicacion_con_id_correcto():
    """Probar publicación con ID correcto"""
    
    print("\n🧪 PROBANDO PUBLICACIÓN CON CONFIGURACIÓN ACTUALIZADA")
    print("=" * 55)
    
    # Cargar configuración actualizada
    with open('config/keys.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    page_id = config['facebook']['gollos_chickens']['page_id']
    token = config['facebook']['gollos_chickens']['page_access_token']
    page_name = config['facebook']['gollos_chickens']['page_name']
    
    print(f"📄 Página: {page_name}")
    print(f"🆔 ID: {page_id}")
    
    # Probar publicación
    url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
    
    mensaje = """🎉 ¡AUTOMATIZACIÓN GOLLOS CHICKENS ACTIVADA!

🐔 El sistema automático está funcionando perfectamente
🚀 Posts automáticos programados para todo el día
💰 Camino a S/48,000 mensuales iniciado

📱 ¡Ordena tu pollo crujiente YA!
WhatsApp: https://wa.me/51961234567

#GollosChickens #AutomatizacionExitosa #PolloJugoso #DeliveryPucallpa"""
    
    data = {
        'message': mensaje,
        'access_token': token
    }
    
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        result = response.json()
        post_id = result.get('id', 'ID_NO_DISPONIBLE')
        print(f"\n🎉 ¡PUBLICACIÓN EXITOSA!")
        print(f"📍 Post ID: {post_id}")
        print(f"✅ Sistema completamente funcional")
        print(f"🚀 ¡Listo para automatización completa!")
        return True
    else:
        print(f"\n❌ Error en publicación: {response.text}")
        return False

def main():
    print("🚀 CONFIGURADOR AUTOMÁTICO DE PÁGINAS FACEBOOK")
    print("=" * 50)
    
    # Descubrir páginas
    paginas = descubrir_paginas()
    
    if not paginas:
        print("\n❌ No se pueden configurar las páginas automáticamente")
        return False
    
    # Actualizar configuración
    if actualizar_configuracion(paginas):
        # Probar publicación
        if test_publicacion_con_id_correcto():
            print("\n🎉 ¡CONFIGURACIÓN COMPLETA Y EXITOSA!")
            print("💰 Sistema listo para generar S/48,000 mensuales")
            return True
    
    return False

if __name__ == "__main__":
    main()