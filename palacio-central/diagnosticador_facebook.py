#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 DIAGNOSTICADOR FACEBOOK API
==============================
Verificar y solucionar problemas de conexión
"""

import requests
import json

def verificar_token_completo():
    """Verificación completa del token"""
    
    # Cargar configuración
    with open('config/keys.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    token = config['facebook']['gollos_chickens']['page_access_token']
    page_id = config['facebook']['gollos_chickens']['page_id']
    
    print("🔍 DIAGNÓSTICO COMPLETO DEL TOKEN")
    print("=" * 40)
    
    # Test 1: Verificar token básico
    print("\n1️⃣ Verificando token básico...")
    url = f"https://graph.facebook.com/v18.0/me?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token básico OK - Tipo: {data.get('name', 'Token válido')}")
    else:
        print(f"❌ Token básico FALLA: {response.text}")
        return False
    
    # Test 2: Verificar acceso a página específica
    print(f"\n2️⃣ Verificando acceso a página {page_id}...")
    url = f"https://graph.facebook.com/v18.0/{page_id}?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Acceso a página OK - Nombre: {data.get('name', 'Página encontrada')}")
    else:
        print(f"❌ Acceso a página FALLA: {response.text}")
        return False
    
    # Test 3: Verificar permisos de publicación
    print(f"\n3️⃣ Verificando permisos de publicación...")
    url = f"https://graph.facebook.com/v18.0/{page_id}/feed?access_token={token}&limit=1"
    response = requests.get(url)
    
    if response.status_code == 200:
        print("✅ Permisos de lectura OK")
    else:
        print(f"❌ Permisos de lectura FALLA: {response.text}")
    
    # Test 4: Obtener información de páginas disponibles
    print(f"\n4️⃣ Listando páginas disponibles...")
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        pages = data.get('data', [])
        print(f"📊 Páginas encontradas: {len(pages)}")
        
        for page in pages:
            print(f"   📄 {page['name']} (ID: {page['id']})")
            if page['id'] == page_id:
                print("      ✅ Esta es nuestra página objetivo")
                # Actualizar token con el token específico de página
                page_token = page.get('access_token', token)
                if page_token != token:
                    print(f"      🔄 Token específico de página encontrado")
                    return page_token
    else:
        print(f"❌ No se pueden listar páginas: {response.text}")
    
    return token

def test_publicacion_con_diagnostico():
    """Probar publicación con diagnóstico completo"""
    
    # Verificar token
    token_correcto = verificar_token_completo()
    
    if not token_correcto:
        print("\n❌ No se puede proceder - Token inválido")
        return False
    
    # Cargar página ID
    with open('config/keys.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
    page_id = config['facebook']['gollos_chickens']['page_id']
    
    print(f"\n🧪 PROBANDO PUBLICACIÓN DE PRUEBA...")
    print("-" * 40)
    
    url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
    
    mensaje = """🧪 PRUEBA DE AUTOMATIZACIÓN GOLLOS CHICKENS

🐔 ¡El sistema automático está funcionando!
🚀 Posts automáticos activados
💰 Camino a S/48,000 mensuales iniciado

📱 ¡Ordena YA por WhatsApp!
https://wa.me/51961234567

#GollosChickens #AutomatizacionExitosa #SistemaActivo"""
    
    data = {
        'message': mensaje,
        'access_token': token_correcto
    }
    
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        result = response.json()
        post_id = result.get('id', 'ID_NO_DISPONIBLE')
        print(f"🎉 ¡PUBLICACIÓN EXITOSA! - Post ID: {post_id}")
        print("✅ Sistema completamente funcional")
        
        # Actualizar config con token correcto si es diferente
        if token_correcto != config['facebook']['gollos_chickens']['page_access_token']:
            config['facebook']['gollos_chickens']['page_access_token'] = token_correcto
            with open('config/keys.json', 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            print("🔄 Token actualizado en configuración")
        
        return True
    else:
        print(f"❌ Error en publicación: {response.text}")
        
        # Análisis del error
        try:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message', 'Error desconocido')
            error_code = error_data.get('error', {}).get('code', 'Sin código')
            
            print(f"\n🔍 ANÁLISIS DEL ERROR:")
            print(f"   Código: {error_code}")
            print(f"   Mensaje: {error_msg}")
            
            if "permissions" in error_msg.lower():
                print(f"\n💡 SOLUCIÓN: Problema de permisos")
                print(f"   1. Ve a Facebook Developers")
                print(f"   2. Verifica que la página esté conectada")
                print(f"   3. Regenera el token con permisos correctos")
            elif "does not exist" in error_msg.lower():
                print(f"\n💡 SOLUCIÓN: ID de página incorrecto")
                print(f"   1. Verifica el Page ID en Facebook")
                print(f"   2. Actualiza config/keys.json")
                
        except:
            pass
            
        return False

if __name__ == "__main__":
    test_publicacion_con_diagnostico()