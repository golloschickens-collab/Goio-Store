#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 DIAGNÓSTICO FACEBOOK - GOLLOS CHICKENS
========================================
Verificar configuración y permisos
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

def verificar_token_usuario(token):
    """Verificar token de usuario"""
    print("\n🔍 VERIFICANDO TOKEN DE USUARIO...")
    url = f"https://graph.facebook.com/v18.0/me?access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Usuario: {data.get('name', 'Sin nombre')}")
            print(f"✅ ID Usuario: {data.get('id', 'Sin ID')}")
            return True
        else:
            print(f"❌ Error token usuario: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def verificar_permisos(token):
    """Verificar permisos del token"""
    print("\n🔍 VERIFICANDO PERMISOS...")
    url = f"https://graph.facebook.com/v18.0/me/permissions?access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            permisos = data.get('data', [])
            
            print("📋 PERMISOS ACTUALES:")
            for permiso in permisos:
                status = permiso.get('status', 'unknown')
                permission = permiso.get('permission', 'unknown')
                emoji = "✅" if status == 'granted' else "❌"
                print(f"   {emoji} {permission}: {status}")
            
            return permisos
        else:
            print(f"❌ Error permisos: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return []

def listar_paginas(token):
    """Listar páginas accesibles"""
    print("\n🔍 VERIFICANDO PÁGINAS ACCESIBLES...")
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            paginas = data.get('data', [])
            
            print("📄 PÁGINAS ACCESIBLES:")
            for i, pagina in enumerate(paginas, 1):
                name = pagina.get('name', 'Sin nombre')
                page_id = pagina.get('id', 'Sin ID')
                access_token = pagina.get('access_token', 'Sin token')
                
                print(f"\n   {i}. {name}")
                print(f"      📋 ID: {page_id}")
                print(f"      🔑 Token: {access_token[:20]}...")
                
                # Verificar si es Gollos Chickens
                if 'gollos' in name.lower() or 'chicken' in name.lower():
                    print(f"      🎯 ¡POSIBLE PÁGINA GOLLOS CHICKENS!")
            
            return paginas
        else:
            print(f"❌ Error páginas: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return []

def verificar_pagina_especifica(page_id, token):
    """Verificar una página específica"""
    print(f"\n🔍 VERIFICANDO PÁGINA ID: {page_id}")
    url = f"https://graph.facebook.com/v18.0/{page_id}?access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Página encontrada: {data.get('name', 'Sin nombre')}")
            print(f"✅ ID confirmado: {data.get('id', 'Sin ID')}")
            return True
        else:
            print(f"❌ Error página: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def main():
    print("🔧 DIAGNÓSTICO FACEBOOK GOLLOS CHICKENS")
    print("=" * 50)
    
    # Cargar configuración
    config = cargar_configuracion()
    if not config:
        return
    
    token = config.get('page_access_token', '')
    page_id = config.get('page_id', '')
    
    print(f"📋 App ID: {config.get('app_id', 'No configurado')}")
    print(f"📋 Page ID: {page_id}")
    print(f"📋 Token: {token[:20]}..." if token else "❌ Sin token")
    
    # Verificaciones
    if verificar_token_usuario(token):
        permisos = verificar_permisos(token)
        paginas = listar_paginas(token)
        verificar_pagina_especifica(page_id, token)
        
        # Sugerencias
        print("\n💡 SUGERENCIAS:")
        
        if not any('pages_manage_posts' in str(p) for p in permisos):
            print("   ⚠️ Falta permiso 'pages_manage_posts'")
        
        if paginas:
            print("   📝 Páginas disponibles listadas arriba")
            print("   🔄 Considera usar el Page ID y Token correctos")
        
        print("\n🎯 PRÓXIMO PASO:")
        print("   1. Verificar que el Page ID sea correcto")
        print("   2. Usar el Page Access Token específico de la página")
        print("   3. Renovar permisos si es necesario")

if __name__ == "__main__":
    main()