#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 VERIFICADOR RÁPIDO - PÁGINAS CONECTADAS
==========================================
Ahora que la app está conectada, obtener Page ID correcto
"""

import requests
import json

def verificar_paginas_conectadas():
    """Verificar páginas ahora que la app está conectada"""
    
    # Token actual (de usuario pero con app conectada)
    token = "EAAeto7T8g1YBPtmaFLZBh0xiQIBZAm7OeGfePwQMgskBwTspDalprnau6LZCrcZCXyMmhb1ZCYj8L8EZCYXlO1rMIPauc1ZCEqK3GBOr1SheKcGZCI84Wntpu155gAepMUzFznsZADXAiwtXBUkE8UiS90rh9FEdna1KeSwzN5z4wyLeFxgsh5xDcQlQbPk0unpre"
    
    print("🔍 VERIFICANDO PÁGINAS CONECTADAS")
    print("=" * 40)
    
    # Verificar token básico
    print("\n1️⃣ Verificando token...")
    url = f"https://graph.facebook.com/v18.0/me?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token válido - Usuario: {data.get('name', 'Usuario')}")
        print(f"   ID: {data.get('id', 'Sin ID')}")
    else:
        print(f"❌ Token inválido: {response.text}")
        return False
    
    # Obtener páginas administradas
    print("\n2️⃣ Obteniendo páginas administradas...")
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        pages = data.get('data', [])
        
        print(f"📊 Páginas encontradas: {len(pages)}")
        
        if len(pages) == 0:
            print("❌ No se encontraron páginas")
            print("\n💡 Esto puede significar:")
            print("   - Las páginas no están conectadas a la app específica")
            print("   - Necesitas permisos adicionales")
            print("   - El token sigue siendo de usuario general")
            return False
        
        print("\n📄 PÁGINAS DISPONIBLES:")
        print("-" * 50)
        
        for i, page in enumerate(pages, 1):
            name = page.get('name', 'Sin nombre')
            page_id = page.get('id', 'Sin ID')
            category = page.get('category', 'Sin categoría')
            page_token = page.get('access_token', 'Sin token específico')
            
            print(f"{i}. {name}")
            print(f"   📍 ID: {page_id}")
            print(f"   📂 Categoría: {category}")
            print(f"   🔑 Token específico: {'SÍ' if page_token else 'NO'}")
            
            if 'gollos' in name.lower() or 'chicken' in name.lower():
                print("   🎯 ¡ESTA ES LA PÁGINA OBJETIVO!")
                
                # Guardar información correcta
                config_data = {
                    "page_id": page_id,
                    "page_name": name,
                    "page_access_token": page_token if page_token else token,
                    "category": category,
                    "status": "ENCONTRADA_Y_CONFIGURADA"
                }
                
                print(f"\n✅ CONFIGURACIÓN CORRECTA:")
                print(f"   Page ID: {page_id}")
                print(f"   Page Name: {name}")
                print(f"   Token específico: {'SÍ' if page_token else 'Usando token general'}")
                
                return config_data
            
            print()
        
        return pages
        
    else:
        print(f"❌ Error obteniendo páginas: {response.text}")
        
        # Análisis del error
        try:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message', '')
            
            if "permissions" in error_msg.lower():
                print("\n💡 SOLUCIÓN: Problema de permisos")
                print("   1. Ve al Graph Explorer")
                print("   2. Asegúrate de tener: pages_show_list, pages_manage_posts")
                print("   3. Regenera el token con estos permisos")
            
        except:
            pass
            
        return False

def main():
    print("🚀 VERIFICADOR DE PÁGINAS CONECTADAS")
    print("=" * 45)
    
    resultado = verificar_paginas_conectadas()
    
    if resultado and isinstance(resultado, dict):
        print("\n🎉 ¡PÁGINA ENCONTRADA Y CONFIGURADA!")
        print("✅ Lista para automatización")
        
        # Actualizar configuración
        try:
            with open('config/keys.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Actualizar con datos correctos
            config['facebook']['gollos_chickens']['page_id'] = resultado['page_id']
            config['facebook']['gollos_chickens']['page_name'] = resultado['page_name']
            config['facebook']['gollos_chickens']['page_access_token'] = resultado['page_access_token']
            config['facebook']['gollos_chickens']['status'] = resultado['status']
            
            with open('config/keys.json', 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print("\n💾 Configuración actualizada en keys.json")
            print("🚀 ¡Sistema listo para automatización!")
            
        except Exception as e:
            print(f"\n⚠️ Error actualizando config: {e}")
            print("📋 Datos para actualizar manualmente:")
            print(f"   page_id: {resultado['page_id']}")
            print(f"   page_name: {resultado['page_name']}")
        
    elif resultado and isinstance(resultado, list):
        print("\n📋 PÁGINAS DISPONIBLES:")
        for page in resultado:
            print(f"   - {page.get('name', 'Sin nombre')} (ID: {page.get('id', 'Sin ID')})")
        
    else:
        print("\n❌ No se pudieron obtener las páginas")
        print("💡 Revisa la conexión de la app con tu página")

if __name__ == "__main__":
    main()