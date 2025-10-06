#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🐔 AUTOMATIZADOR FACEBOOK GOLLOS CHICKENS
=========================================
Sistema completo de publicación automática
Rey Melgar - De manual a 100% automático
"""

import requests
import json
import time
from datetime import datetime
import subprocess

class AutomatizadorFacebook:
    def __init__(self):
        print("🚀 AUTOMATIZADOR FACEBOOK GOLLOS CHICKENS")
        print("=" * 50)
        self.cargar_configuracion()
        
    def cargar_configuracion(self):
        """Cargar tokens y configuración"""
        try:
            with open('config/keys.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
                
            self.gollos_config = config['facebook']['gollos_chickens']
            self.token = self.gollos_config['page_access_token']
            self.page_id = self.gollos_config['page_id']
            
            print(f"✅ Configuración cargada para: {self.gollos_config['page_name']}")
            print(f"📅 Token válido hasta: {self.gollos_config['vencimiento']}")
            
        except Exception as e:
            print(f"❌ Error cargando configuración: {e}")
            return False
            
    def verificar_token(self):
        """Verificar que el token funciona"""
        url = f"https://graph.facebook.com/v18.0/me?access_token={self.token}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Token válido - Usuario: {data.get('name', 'Facebook User')}")
                return True
            else:
                print(f"❌ Token inválido: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error verificando token: {e}")
            return False
    
    def publicar_en_facebook(self, mensaje, link_whatsapp="https://wa.me/51961234567"):
        """Publicar un post en Facebook"""
        url = f"https://graph.facebook.com/v18.0/{self.page_id}/feed"
        
        # Agregar call-to-action de WhatsApp al mensaje
        mensaje_completo = f"{mensaje}\n\n📱 ¡Ordena YA por WhatsApp!\n{link_whatsapp}"
        
        data = {
            'message': mensaje_completo,
            'access_token': self.token
        }
        
        try:
            response = requests.post(url, data=data)
            
            if response.status_code == 200:
                result = response.json()
                post_id = result.get('id', 'ID_NO_DISPONIBLE')
                print(f"✅ Post publicado exitosamente - ID: {post_id}")
                return True
            else:
                print(f"❌ Error publicando: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error en publicación: {e}")
            return False
    
    def generar_y_publicar_contenido(self):
        """Generar contenido y publicar automáticamente"""
        print("\n🤖 GENERANDO CONTENIDO AUTOMÁTICO...")
        print("-" * 40)
        
        # Generar contenido del día
        try:
            result = subprocess.run([
                "python", "fabrica_contenido_gollos_v2.py"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Contenido generado exitosamente")
            else:
                print("⚠️ Error generando contenido, usando respaldo")
                
        except Exception as e:
            print(f"⚠️ Error ejecutando generador: {e}")
        
        # Cargar contenidos generados
        try:
            fecha = datetime.now().strftime("%Y-%m-%d")
            archivo_contenidos = f"contenidos_gollos_{fecha}.json"
            
            with open(archivo_contenidos, 'r', encoding='utf-8') as f:
                contenidos = json.load(f)
                
            print(f"📄 Contenidos cargados: {len(contenidos)} posts")
            
        except Exception as e:
            print(f"⚠️ Error cargando contenidos: {e}")
            contenidos = self.get_contenidos_respaldo()
            
        return contenidos
    
    def get_contenidos_respaldo(self):
        """Contenidos de respaldo por si falla la generación"""
        return [
            {
                "hora": "08:00",
                "copy": "🔥 ¿Antojo de pollo CRUJIENTE por fuera y JUGOSO por dentro?\n\n🍗 Nuestro pollo dorado con esa textura perfecta que hace agua la boca\n📍 Delivery RÁPIDO en Pucallpa\n💰 Promoción especial HOY\n🚀 ¡Ordena ya!\n\n#GollosChickens #PolloJugoso #DeliveryPucallpa"
            },
            {
                "hora": "12:00", 
                "copy": "⏰ ALMUERZO EJECUTIVO perfecto para el mediodía\n\n🍗 1/4 pollo + arroz + papas + ensalada\n💰 Solo S/18 - Rapidez garantizada\n📍 Delivery express en 25 minutos\n🚀 ¡Ordena YA!\n\n#GollosChickens #AlmuerzoEjecutivo #ComidaRapida"
            },
            {
                "hora": "19:00",
                "copy": "👨‍👩‍👧‍👦 PACK FAMILIAR que alcanza para todos\n\n🍗 Pollo completo + papas + ensalada + gaseosa\n💰 Solo S/45 (precio normal S/60)\n📍 Llevamos hasta tu puerta en Pucallpa\n🚀 ¡Solo HOY!\n\n#GollosChickens #PackFamiliar #PromocionEspecial"
            }
        ]
    
    def publicar_post_inmediato(self, contenido):
        """Publicar un post inmediatamente"""
        print(f"\n📝 PUBLICANDO POST DE LAS {contenido['hora']}:")
        print("-" * 30)
        print(f"Copy: {contenido['copy'][:100]}...")
        
        resultado = self.publicar_en_facebook(contenido['copy'])
        
        if resultado:
            print(f"🎉 ¡Post de las {contenido['hora']} publicado exitosamente!")
            return True
        else:
            print(f"❌ Error publicando post de las {contenido['hora']}")
            return False
    
    def automatizacion_completa_dia(self):
        """Automatización completa del día"""
        print("\n🚀 INICIANDO AUTOMATIZACIÓN COMPLETA DEL DÍA")
        print("=" * 55)
        
        # Verificar token
        if not self.verificar_token():
            print("❌ Token inválido - No se puede continuar")
            return False
            
        # Generar contenido
        contenidos = self.generar_y_publicar_contenido()
        
        # Publicar todos los posts
        posts_exitosos = 0
        total_posts = len(contenidos)
        
        for contenido in contenidos:
            if self.publicar_post_inmediato(contenido):
                posts_exitosos += 1
                
            # Pausa entre posts (evitar spam)
            time.sleep(2)
        
        # Resumen final
        print(f"\n📊 RESUMEN DE AUTOMATIZACIÓN:")
        print(f"✅ Posts exitosos: {posts_exitosos}/{total_posts}")
        print(f"📈 Tasa de éxito: {(posts_exitosos/total_posts)*100:.1f}%")
        print(f"📅 Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        print(f"🎯 Objetivo diario: Generar ventas automáticamente")
        
        if posts_exitosos == total_posts:
            print("\n🎉 ¡AUTOMATIZACIÓN 100% EXITOSA!")
            print("💰 Sistema trabajando para generar S/48,000 mensuales")
            return True
        else:
            print(f"\n⚠️ Automatización parcial - {posts_exitosos} de {total_posts} posts")
            return False
    
    def test_publicacion_unica(self):
        """Probar una publicación única para verificar funcionamiento"""
        print("\n🧪 PROBANDO PUBLICACIÓN ÚNICA...")
        print("-" * 35)
        
        if not self.verificar_token():
            return False
            
        post_prueba = {
            "hora": "AHORA",
            "copy": "🧪 PRUEBA DE AUTOMATIZACIÓN GOLLOS CHICKENS\n\n🐔 ¡El sistema automático está funcionando perfectamente!\n🚀 Posts automáticos activados\n💰 Camino a S/48,000 mensuales iniciado\n\n#GollosChickens #AutomatizacionExitosa #SistemaActivo"
        }
        
        resultado = self.publicar_post_inmediato(post_prueba)
        
        if resultado:
            print("\n✅ ¡PRUEBA EXITOSA! El sistema está listo para automatización completa")
        else:
            print("\n❌ Prueba fallida - Revisar configuración")
            
        return resultado

def main():
    automatizador = AutomatizadorFacebook()
    
    print("\n🎯 ¿QUÉ QUIERES HACER?")
    print("1. Probar una publicación única")
    print("2. Automatización completa del día (5 posts)")
    print("3. Solo generar contenido (sin publicar)")
    
    try:
        opcion = input("\nElige opción (1-3): ").strip()
        
        if opcion == "1":
            automatizador.test_publicacion_unica()
        elif opcion == "2":
            automatizador.automatizacion_completa_dia()
        elif opcion == "3":
            automatizador.generar_y_publicar_contenido()
        else:
            print("❌ Opción inválida")
            
    except KeyboardInterrupt:
        print("\n⏸️ Automatización pausada por usuario")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()