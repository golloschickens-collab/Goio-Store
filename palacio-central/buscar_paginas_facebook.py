#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 ENCONTRAR PÁGINAS FACEBOOK - GOLLOS CHICKENS
===============================================
Buscar y configurar la página correcta
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

def buscar_todas_las_paginas(token):
    """Buscar todas las páginas accesibles con más detalle"""
    print("\n🔍 BUSCANDO TODAS LAS PÁGINAS...")
    
    # Probar diferentes endpoints
    endpoints = [
        f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}",
        f"https://graph.facebook.com/v18.0/me/accounts?fields=name,id,access_token,category,link&access_token={token}",
        f"https://graph.facebook.com/v18.0/me?fields=accounts{{name,id,access_token,category,link}}&access_token={token}"
    ]
    
    for i, url in enumerate(endpoints, 1):
        print(f"\n📡 Probando endpoint {i}...")
        try:
            response = requests.get(url)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Respuesta exitosa")
                
                # Extraer páginas según estructura
                paginas = []
                if 'data' in data:
                    paginas = data['data']
                elif 'accounts' in data:
                    paginas = data['accounts']['data'] if 'data' in data['accounts'] else data['accounts']
                
                if paginas:
                    print(f"   📄 Encontradas {len(paginas)} páginas:")
                    
                    for j, pagina in enumerate(paginas, 1):
                        name = pagina.get('name', 'Sin nombre')
                        page_id = pagina.get('id', 'Sin ID')
                        category = pagina.get('category', 'Sin categoría')
                        link = pagina.get('link', 'Sin enlace')
                        
                        print(f"\n      {j}. 📄 {name}")
                        print(f"         🆔 ID: {page_id}")
                        print(f"         📂 Categoría: {category}")
                        print(f"         🔗 Link: {link}")
                        
                        # Buscar keywords de Gollos Chickens
                        keywords = ['gollos', 'chicken', 'pollo', 'broaster']
                        name_lower = name.lower()
                        
                        matches = [kw for kw in keywords if kw in name_lower]
                        if matches:
                            print(f"         🎯 COINCIDENCIA: {matches}")
                        
                        # Verificar si es página de negocio
                        if category and 'restaurant' in category.lower():
                            print(f"         🍽️ ES RESTAURANTE!")
                    
                    return paginas
                else:
                    print(f"   ⚠️ No se encontraron páginas en la respuesta")
            else:
                print(f"   ❌ Error: {response.text}")
        
        except Exception as e:
            print(f"   ❌ Excepción: {e}")
    
    return []

def buscar_paginas_por_nombre(token, nombre_busqueda="gollos"):
    """Buscar páginas por nombre específico"""
    print(f"\n🔍 BUSCANDO PÁGINAS CON NOMBRE: '{nombre_busqueda}'")
    
    # Buscar en páginas administradas
    url = f"https://graph.facebook.com/v18.0/search?q={nombre_busqueda}&type=page&access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            paginas = data.get('data', [])
            
            print(f"📄 Encontradas {len(paginas)} páginas con '{nombre_busqueda}':")
            for i, pagina in enumerate(paginas, 1):
                name = pagina.get('name', 'Sin nombre')
                page_id = pagina.get('id', 'Sin ID')
                
                print(f"\n   {i}. {name}")
                print(f"      ID: {page_id}")
                
                # Verificar si podemos acceder a esta página
                verificar_acceso_pagina(page_id, token)
            
            return paginas
        else:
            print(f"❌ Error búsqueda: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return []

def verificar_acceso_pagina(page_id, token):
    """Verificar si tenemos acceso a una página específica"""
    url = f"https://graph.facebook.com/v18.0/{page_id}?fields=name,id,category,link&access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"      ✅ Acceso confirmado: {data.get('name', 'Sin nombre')}")
            print(f"      📂 Categoría: {data.get('category', 'Sin categoría')}")
            return True
        else:
            print(f"      ❌ Sin acceso: {response.status_code}")
            return False
    except Exception as e:
        print(f"      ❌ Error verificación: {e}")
        return False

def obtener_token_pagina(page_id, token):
    """Obtener el token específico de una página"""
    print(f"\n🔑 OBTENIENDO TOKEN PARA PÁGINA: {page_id}")
    
    # Primero, obtener todas las páginas con tokens
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            paginas = data.get('data', [])
            
            for pagina in paginas:
                if pagina.get('id') == page_id:
                    page_token = pagina.get('access_token', '')
                    print(f"✅ Token encontrado: {page_token[:20]}...")
                    return page_token
            
            print(f"❌ No se encontró token para página {page_id}")
            return None
        else:
            print(f"❌ Error obteniendo tokens: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None

def main():
    print("🔍 BÚSQUEDA DE PÁGINAS FACEBOOK GOLLOS CHICKENS")
    print("=" * 60)
    
    # Cargar configuración
    config = cargar_configuracion()
    if not config:
        return
    
    token = config.get('page_access_token', '')
    
    if not token:
        print("❌ No hay token disponible")
        return
    
    print(f"🔑 Usando token: {token[:20]}...")
    
    # Buscar páginas
    print("\n🎯 MÉTODO 1: Buscar páginas administradas")
    paginas_admin = buscar_todas_las_paginas(token)
    
    print("\n🎯 MÉTODO 2: Buscar por nombre 'gollos'")
    paginas_gollos = buscar_paginas_por_nombre(token, "gollos")
    
    print("\n🎯 MÉTODO 3: Buscar por nombre 'chicken'")
    paginas_chicken = buscar_paginas_por_nombre(token, "chicken")
    
    # Resumen
    print("\n📋 RESUMEN DE BÚSQUEDA:")
    print("=" * 40)
    
    todas_paginas = []
    if paginas_admin:
        todas_paginas.extend(paginas_admin)
    if paginas_gollos:
        todas_paginas.extend(paginas_gollos)
    if paginas_chicken:
        todas_paginas.extend(paginas_chicken)
    
    if todas_paginas:
        print(f"✅ Total páginas encontradas: {len(todas_paginas)}")
        
        # Buscar la mejor coincidencia
        for pagina in todas_paginas:
            name = pagina.get('name', '').lower()
            if 'gollos' in name or 'chicken' in name:
                page_id = pagina.get('id', '')
                page_token = obtener_token_pagina(page_id, token)
                
                print(f"\n🎯 PÁGINA CANDIDATA:")
                print(f"   📄 Nombre: {pagina.get('name', 'Sin nombre')}")
                print(f"   🆔 ID: {page_id}")
                print(f"   🔑 Token: {page_token[:20] if page_token else 'No disponible'}...")
                
                if page_token:
                    print(f"\n💾 CONFIGURACIÓN RECOMENDADA:")
                    print(f'   "page_id": "{page_id}",')
                    print(f'   "page_access_token": "{page_token}",')
    else:
        print("❌ No se encontraron páginas")
        print("\n💡 SUGERENCIAS:")
        print("   1. Verificar que seas administrador de una página de Facebook")
        print("   2. Crear una página de Facebook para Gollos Chickens")
        print("   3. Asegurarte de tener los permisos correctos")

if __name__ == "__main__":
    main()