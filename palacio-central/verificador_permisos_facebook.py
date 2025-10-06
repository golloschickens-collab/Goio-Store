#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 VERIFICADOR PERMISOS FACEBOOK TOKEN
============================================
Script para verificar permisos del token de Facebook
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

def verificar_permisos_token(access_token):
    """Verificar qué permisos tiene el token actual"""
    print("🔍 VERIFICANDO PERMISOS DEL TOKEN...")
    print("=" * 50)
    
    # URL para verificar permisos
    url = f"https://graph.facebook.com/me/permissions?access_token={access_token}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'error' in data:
            print(f"❌ Error verificando token: {data['error']['message']}")
            return False
            
        print("✅ PERMISOS ACTUALES:")
        print("-" * 30)
        
        permisos_concedidos = []
        permisos_denegados = []
        
        for permiso in data.get('data', []):
            nombre = permiso['permission']
            status = permiso['status']
            
            if status == 'granted':
                permisos_concedidos.append(nombre)
                print(f"✅ {nombre}")
            else:
                permisos_denegados.append(nombre)
                print(f"❌ {nombre} ({status})")
        
        print("\n📋 RESUMEN:")
        print("-" * 20)
        print(f"✅ Permisos concedidos: {len(permisos_concedidos)}")
        print(f"❌ Permisos denegados: {len(permisos_denegados)}")
        
        # Verificar permisos necesarios para Gollos Chickens
        permisos_necesarios = [
            'pages_manage_posts',
            'pages_read_engagement',
            'pages_show_list'
        ]
        
        print("\n🎯 PERMISOS NECESARIOS PARA GOLLOS:")
        print("-" * 40)
        
        todos_ok = True
        for permiso in permisos_necesarios:
            if permiso in permisos_concedidos:
                print(f"✅ {permiso} - CONCEDIDO")
            else:
                print(f"❌ {permiso} - FALTANTE")
                todos_ok = False
        
        if todos_ok:
            print("\n🎉 ¡TODOS LOS PERMISOS NECESARIOS ESTÁN CONCEDIDOS!")
            print("🚀 El sistema está listo para automatización completa")
        else:
            print("\n⚠️  FALTAN PERMISOS CRÍTICOS")
            print("📝 Necesitas regenerar el token con los permisos faltantes")
            
        return todos_ok
        
    except Exception as e:
        print(f"❌ Error verificando permisos: {e}")
        return False

def verificar_acceso_pagina(access_token, page_id):
    """Verificar acceso específico a la página"""
    print(f"\n🏢 VERIFICANDO ACCESO A PÁGINA {page_id}...")
    print("=" * 50)
    
    url = f"https://graph.facebook.com/{page_id}?fields=name,access_token&access_token={access_token}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'error' in data:
            print(f"❌ Error accediendo a página: {data['error']['message']}")
            return False
            
        print(f"✅ Página encontrada: {data.get('name', 'Sin nombre')}")
        
        if 'access_token' in data:
            print("✅ Page Access Token disponible")
            return True
        else:
            print("❌ Page Access Token no disponible")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando página: {e}")
        return False

def main():
    """Función principal"""
    print("🔍 VERIFICADOR PERMISOS FACEBOOK GOLLOS CHICKENS")
    print("=" * 55)
    
    # Cargar configuración
    config = cargar_configuracion()
    if not config:
        return
    
    facebook_config = config.get('facebook', {}).get('gollos_chickens', {})
    access_token = facebook_config.get('page_access_token')
    page_id = facebook_config.get('page_id')
    
    if not access_token:
        print("❌ No se encontró access token en la configuración")
        return
    
    if not page_id:
        print("❌ No se encontró page ID en la configuración")
        return
    
    print(f"📱 Page ID: {page_id}")
    print(f"🔑 Token: {access_token[:20]}...")
    
    # Verificar permisos del token
    permisos_ok = verificar_permisos_token(access_token)
    
    # Verificar acceso a la página
    pagina_ok = verificar_acceso_pagina(access_token, page_id)
    
    print("\n" + "=" * 55)
    print("📊 DIAGNÓSTICO FINAL:")
    print("-" * 25)
    
    if permisos_ok and pagina_ok:
        print("✅ SISTEMA COMPLETAMENTE FUNCIONAL")
        print("🚀 Listo para automatización de Gollos Chickens")
    else:
        print("❌ SISTEMA NECESITA CONFIGURACIÓN")
        if not permisos_ok:
            print("🔧 Regenerar token con permisos faltantes")
        if not pagina_ok:
            print("🔧 Verificar configuración de página")

if __name__ == "__main__":
    main()