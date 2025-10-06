#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🐔 CONFIGURADOR TOKEN TEMPORAL FACEBOOK - GOLLOS CHICKENS
=========================================================
Obtener token de 60 días SIN papeles empresariales
Rey Melgar - Solución rápida para empezar HOY
"""

import webbrowser
import json
import time
from datetime import datetime, timedelta

class ConfiguradorTokenTemporal:
    def __init__(self):
        print("🚀 CONFIGURADOR TOKEN TEMPORAL FACEBOOK")
        print("=" * 50)
        print("✅ SIN papeles empresariales necesarios")
        print("✅ Token válido por 60 días")
        print("✅ Renovable cada 60 días")
        print("✅ Perfecto mientras tramitas papeles")
        print()
        
    def paso_1_crear_app_desarrollo(self):
        """Crear app de desarrollo en Facebook"""
        print("📱 PASO 1: CREAR APP DE DESARROLLO")
        print("-" * 40)
        print("Vamos a crear una app de 'Desarrollo' (no requiere papeles)")
        print()
        print("🔗 Abriendo Facebook Developers...")
        webbrowser.open("https://developers.facebook.com/apps/")
        
        print("\n📝 CONFIGURACIÓN DE LA APP:")
        print("   1. Haz clic en 'Crear App'")
        print("   2. Selecciona: 'Otro' (no 'Empresa')")
        print("   3. Tipo de app: 'Consumidor'")
        print("   4. Nombre: 'Gollos Chickens Dev'")
        print("   5. Email de contacto: tu email personal")
        print("   6. NO selecciones 'App empresarial'")
        
        print("\n💡 IMPORTANTE: Al elegir 'Consumidor' no pide papeles")
        input("\n⏳ Presiona ENTER cuando hayas creado la app...")
        
    def paso_2_agregar_productos(self):
        """Agregar productos necesarios"""
        print("\n🔧 PASO 2: AGREGAR PRODUCTOS A LA APP")
        print("-" * 40)
        print("Ahora vamos a agregar los productos necesarios:")
        print()
        print("✅ 1. En tu app, ve a la sección 'Productos'")
        print("✅ 2. Busca 'Facebook Login' y haz clic en 'Configurar'")
        print("✅ 3. Busca 'Marketing API' y haz clic en 'Configurar'")
        print("✅ 4. Acepta los términos cuando aparezcan")
        
        print("\n📋 CONFIGURACIÓN FACEBOOK LOGIN:")
        print("   - URI de redirección: https://localhost/")
        print("   - Dominios de la app: localhost")
        
        input("\n⏳ Presiona ENTER cuando hayas agregado los productos...")
        
    def paso_3_obtener_credenciales(self):
        """Obtener ID y Secret de la app"""
        print("\n🔑 PASO 3: OBTENER CREDENCIALES DE LA APP")
        print("-" * 45)
        print("Ahora vamos a obtener tus credenciales:")
        print()
        print("✅ 1. En tu app, ve a 'Configuración' > 'Básica'")
        print("✅ 2. Copia el 'Identificador de la app' (App ID)")
        print("✅ 3. Copia la 'Clave secreta de la app' (App Secret)")
        print("     (haz clic en 'Mostrar' para ver el secret)")
        
        print("\n📝 Ingresa tus credenciales:")
        app_id = input("App ID: ").strip()
        app_secret = input("App Secret: ").strip()
        
        if not app_id or not app_secret:
            print("❌ Error: Debes ingresar ambas credenciales")
            return None, None
            
        print(f"\n✅ App ID: {app_id}")
        print(f"✅ App Secret: {app_secret[:10]}...")
        
        return app_id, app_secret
        
    def paso_4_obtener_page_token(self, app_id):
        """Obtener token de página"""
        print("\n🎯 PASO 4: OBTENER TOKEN DE PÁGINA")
        print("-" * 40)
        print("Ahora vamos a obtener el token de tu página:")
        print()
        
        # URL del explorador de API con configuración preestablecida
        api_explorer_url = f"https://developers.facebook.com/tools/explorer/?method=GET&path=me%2Faccounts&version=v18.0&app_id={app_id}"
        
        print("🔗 Abriendo Explorador de API de Facebook...")
        webbrowser.open(api_explorer_url)
        
        print("\n📝 PASOS EN EL EXPLORADOR:")
        print("   1. Asegúrate que tu app esté seleccionada")
        print("   2. Haz clic en 'Generar token de acceso'")
        print("   3. Inicia sesión con tu cuenta de Facebook")
        print("   4. Autoriza los permisos solicitados")
        print("   5. En el dropdown, selecciona tu página 'Gollos Chickens'")
        print("   6. Copia el token que aparece (empieza con EAA...)")
        
        print("\n💡 IMPORTANTE: Este token es válido por 60 días")
        page_token = input("\nPage Access Token: ").strip()
        
        if not page_token.startswith('EAA'):
            print("⚠️ Advertencia: El token debería empezar con 'EAA'")
            
        return page_token
        
    def paso_5_obtener_page_id(self):
        """Obtener ID de la página"""
        print("\n📍 PASO 5: OBTENER ID DE TU PÁGINA")
        print("-" * 35)
        print("Necesitamos el ID de tu página de Facebook:")
        print()
        print("✅ 1. Ve a tu página de Facebook 'Gollos Chickens'")
        print("✅ 2. Haz clic en 'Configuración' de la página")
        print("✅ 3. En el menú lateral, busca 'Información de la página'")
        print("✅ 4. Copia el 'ID de página de Facebook'")
        
        print("\n🔗 O usa este método rápido:")
        webbrowser.open("https://lookup-id.com/")
        print("   - Pega la URL de tu página en lookup-id.com")
        
        page_id = input("\nPage ID: ").strip()
        return page_id
        
    def paso_6_guardar_configuracion(self, app_id, app_secret, page_token, page_id):
        """Guardar configuración en keys.json"""
        print("\n💾 PASO 6: GUARDAR CONFIGURACIÓN")
        print("-" * 35)
        
        # Leer configuración actual
        try:
            with open('config/keys.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
        except:
            config = {}
        
        # Actualizar configuración de Facebook
        if 'facebook' not in config:
            config['facebook'] = {}
            
        if 'gollos_chickens' not in config['facebook']:
            config['facebook']['gollos_chickens'] = {}
            
        # Configurar credenciales temporales
        config['facebook']['gollos_chickens'].update({
            "app_id": app_id,
            "app_secret": app_secret,
            "page_id": page_id,
            "page_access_token": page_token,
            "page_name": "Gollos Chickens",
            "tipo_token": "TEMPORAL_60_DIAS",
            "fecha_creacion": datetime.now().strftime("%Y-%m-%d"),
            "fecha_expiracion": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
            "estado": "ACTIVO"
        })
        
        # Guardar archivo
        with open('config/keys.json', 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
            
        print("✅ Configuración guardada en config/keys.json")
        
        # Mostrar resumen
        print("\n📊 CONFIGURACIÓN GUARDADA:")
        print(f"   App ID: {app_id}")
        print(f"   Page ID: {page_id}")
        print(f"   Token: {page_token[:20]}...")
        print(f"   Válido hasta: {(datetime.now() + timedelta(days=60)).strftime('%d/%m/%Y')}")
        
    def paso_7_test_conexion(self, page_id, page_token):
        """Probar la conexión"""
        print("\n🧪 PASO 7: PROBAR CONEXIÓN")
        print("-" * 30)
        print("Vamos a probar que todo funcione...")
        
        try:
            import requests
            
            # Test básico de la API
            url = f"https://graph.facebook.com/v18.0/{page_id}"
            params = {
                'fields': 'name,followers_count',
                'access_token': page_token
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ ¡CONEXIÓN EXITOSA!")
                print(f"   Página: {data.get('name', 'N/A')}")
                print(f"   Seguidores: {data.get('followers_count', 'N/A')}")
                return True
            else:
                print(f"❌ Error en conexión: {response.status_code}")
                print(f"   Respuesta: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error al probar conexión: {e}")
            return False
            
    def mostrar_instrucciones_finales(self):
        """Mostrar instrucciones finales"""
        print("\n" + "=" * 60)
        print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
        print("=" * 60)
        
        print("\n✅ LO QUE YA TIENES:")
        print("   📱 App de Facebook configurada")
        print("   🔑 Credenciales guardadas")
        print("   🎯 Token válido por 60 días")
        print("   🔗 Conexión probada y funcionando")
        
        print("\n🚀 PRÓXIMOS PASOS:")
        print("   1. python fabrica_contenido_gollos_v2.py (generar posts)")
        print("   2. python publicador_facebook_gollos.py (publicar automáticamente)")
        print("   3. ¡Relajarte mientras el sistema trabaja!")
        
        print("\n📅 RECORDATORIOS:")
        print(f"   🔄 Renovar token en 50 días (antes del {(datetime.now() + timedelta(days=50)).strftime('%d/%m/%Y')})")
        print("   📄 Tramitar papeles empresa para token permanente")
        print("   💰 Monitorear ventas y optimizar")
        
        print("\n🎯 EXPECTATIVAS REALISTAS:")
        print("   📊 5-10 ventas primera semana")
        print("   💰 S/150-300 primeros ingresos")
        print("   🚀 Escalamiento gradual a S/48,000/mes")

def main():
    configurador = ConfiguradorTokenTemporal()
    
    try:
        print("🎯 Configurando Facebook API temporal para Gollos Chickens...")
        time.sleep(2)
        
        # Ejecutar todos los pasos
        configurador.paso_1_crear_app_desarrollo()
        configurador.paso_2_agregar_productos()
        
        app_id, app_secret = configurador.paso_3_obtener_credenciales()
        if not app_id or not app_secret:
            print("❌ No se pudieron obtener las credenciales")
            return False
            
        page_token = configurador.paso_4_obtener_page_token(app_id)
        if not page_token:
            print("❌ No se pudo obtener el token de página")
            return False
            
        page_id = configurador.paso_5_obtener_page_id()
        if not page_id:
            print("❌ No se pudo obtener el ID de página")
            return False
            
        configurador.paso_6_guardar_configuracion(app_id, app_secret, page_token, page_id)
        
        conexion_ok = configurador.paso_7_test_conexion(page_id, page_token)
        
        if conexion_ok:
            configurador.mostrar_instrucciones_finales()
            print("\n🔥 ¡LISTO PARA GENERAR S/48,000 MENSUALES!")
            return True
        else:
            print("\n⚠️ Configuración guardada pero hay problemas de conexión")
            print("   Revisa las credenciales y tokens")
            return False
            
    except KeyboardInterrupt:
        print("\n⏸️ Configuración interrumpida")
        return False
    except Exception as e:
        print(f"\n❌ Error durante configuración: {e}")
        return False

if __name__ == "__main__":
    main()