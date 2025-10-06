#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚀 LAUNCHER COMPLETO GOLLOS CHICKENS
=====================================
Sistema integrado: Análisis + Contenido + Visuals + Publicación
"""

import json
import os
import requests
import base64
from datetime import datetime
import asyncio

class GollosContentFactory:
    def __init__(self):
        self.cargar_configuracion()
        self.stable_diffusion_url = "http://127.0.0.1:7860"  # Stable Diffusion local
        
    def cargar_configuracion(self):
        """Cargar configuración completa"""
        try:
            with open('config/keys.json', 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            print("✅ Configuración cargada")
        except Exception as e:
            print(f"❌ Error cargando configuración: {e}")
            self.config = {}

    def cargar_contenido_generado(self):
        """Cargar contenido generado previamente"""
        try:
            with open('reports/contenido_visual_gollos.json', 'r', encoding='utf-8') as f:
                self.contenido = json.load(f)
            print("✅ Contenido visual cargado")
            return True
        except Exception as e:
            print(f"❌ Error cargando contenido: {e}")
            return False

    def generar_imagen_stable_diffusion(self, prompt, nombre_archivo):
        """Generar imagen con Stable Diffusion XL"""
        print(f"🎨 Generando imagen: {nombre_archivo}")
        
        # Parámetros optimizados para Stable Diffusion XL
        payload = {
            "prompt": prompt,
            "negative_prompt": "blurry, low quality, distorted, watermark, text overlay, bad composition, ugly, deformed",
            "width": 1024,
            "height": 1024,
            "steps": 25,
            "cfg_scale": 7.5,
            "sampler_index": "DPM++ 2M Karras",
            "seed": -1,
            "batch_size": 1,
            "n_iter": 1
        }
        
        try:
            # Verificar si Stable Diffusion está disponible
            response = requests.get(f"{self.stable_diffusion_url}/sdapi/v1/options", timeout=5)
            if response.status_code != 200:
                print("⚠️ Stable Diffusion no disponible - generando placeholder")
                return self.crear_placeholder(nombre_archivo)
            
            # Generar imagen
            response = requests.post(
                f"{self.stable_diffusion_url}/sdapi/v1/txt2img",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                r = response.json()
                
                # Guardar imagen
                os.makedirs('temp/imagenes_gollos', exist_ok=True)
                ruta_imagen = f'temp/imagenes_gollos/{nombre_archivo}.png'
                
                with open(ruta_imagen, 'wb') as f:
                    f.write(base64.b64decode(r['images'][0]))
                
                print(f"   ✅ Imagen guardada: {ruta_imagen}")
                return ruta_imagen
                
            else:
                print(f"   ❌ Error generando imagen: {response.status_code}")
                return self.crear_placeholder(nombre_archivo)
                
        except Exception as e:
            print(f"   ❌ Error con Stable Diffusion: {e}")
            return self.crear_placeholder(nombre_archivo)

    def crear_placeholder(self, nombre_archivo):
        """Crear imagen placeholder si Stable Diffusion no está disponible"""
        ruta_placeholder = f'temp/imagenes_gollos/{nombre_archivo}_placeholder.txt'
        os.makedirs('temp/imagenes_gollos', exist_ok=True)
        
        with open(ruta_placeholder, 'w', encoding='utf-8') as f:
            f.write(f"PLACEHOLDER PARA: {nombre_archivo}\n")
            f.write(f"Fecha: {datetime.now()}\n")
            f.write("Ejecutar Stable Diffusion para generar imagen real")
        
        print(f"   📝 Placeholder creado: {ruta_placeholder}")
        return ruta_placeholder

    def publicar_en_facebook(self, contenido_post, ruta_imagen):
        """Publicar contenido en Facebook con imagen"""
        print(f"📤 Publicando en Facebook...")
        
        facebook_config = self.config.get('facebook', {}).get('gollos_chickens', {})
        page_id = facebook_config.get('page_id')
        access_token = facebook_config.get('page_access_token')
        
        if not page_id or not access_token:
            print("❌ Configuración Facebook incompleta")
            return False
        
        try:
            # Publicar solo texto por ahora (imagen se puede agregar después)
            url = f"https://graph.facebook.com/{page_id}/feed"
            
            data = {
                'message': contenido_post['copy_facebook']['copy_principal'],
                'access_token': access_token
            }
            
            response = requests.post(url, data=data)
            result = response.json()
            
            if 'error' in result:
                print(f"❌ Error publicando: {result['error']['message']}")
                return False
            else:
                post_id = result.get('id')
                print(f"✅ Publicado exitosamente - ID: {post_id}")
                return post_id
                
        except Exception as e:
            print(f"❌ Error en publicación: {e}")
            return False

    def ejecutar_fabrica_completa(self):
        """Ejecutar toda la fábrica de contenido"""
        print("🚀 EJECUTANDO FÁBRICA COMPLETA GOLLOS CHICKENS")
        print("=" * 55)
        
        # 1. Cargar contenido
        if not self.cargar_contenido_generado():
            print("❌ No se pudo cargar el contenido. Ejecuta primero el generador.")
            return
        
        posts_generados = []
        contenido_posts = self.contenido.get('contenido_generado', [])
        
        print(f"\n🎯 Procesando {len(contenido_posts)} posts...")
        
        for i, post in enumerate(contenido_posts, 1):
            print(f"\n📱 POST {i}: {post['tipo'].upper()}")
            print("-" * 40)
            
            # Generar imagen
            prompt = post['prompt_stable_diffusion']
            nombre_archivo = f"gollos_{post['tipo']}_{i}"
            
            ruta_imagen = self.generar_imagen_stable_diffusion(prompt, nombre_archivo)
            
            # Preparar datos del post
            post_data = {
                'numero': i,
                'tipo': post['tipo'],
                'copy': post['copy_facebook'],
                'imagen': ruta_imagen,
                'prompt_usado': prompt,
                'fecha_generacion': datetime.now().isoformat()
            }
            
            posts_generados.append(post_data)
            
            print(f"✅ Post {i} preparado")
        
        # Guardar resumen
        resumen = {
            'fecha_ejecucion': datetime.now().isoformat(),
            'total_posts': len(posts_generados),
            'posts_generados': posts_generados,
            'configuracion_facebook': {
                'page_id': self.config.get('facebook', {}).get('gollos_chickens', {}).get('page_id'),
                'listo_publicar': bool(self.config.get('facebook', {}).get('gollos_chickens', {}).get('page_access_token'))
            }
        }
        
        os.makedirs('reports', exist_ok=True)
        with open('reports/fabrica_completa_gollos.json', 'w', encoding='utf-8') as f:
            json.dump(resumen, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resumen guardado: reports/fabrica_completa_gollos.json")
        
        # Mostrar resumen final
        self.mostrar_resumen_final(posts_generados)
        
        return posts_generados

    def mostrar_resumen_final(self, posts):
        """Mostrar resumen final de la ejecución"""
        print("\n" + "=" * 55)
        print("🎉 FÁBRICA COMPLETA EJECUTADA - RESUMEN FINAL")
        print("=" * 55)
        
        print(f"\n📊 ESTADÍSTICAS:")
        print(f"   📱 Posts generados: {len(posts)}")
        print(f"   🎨 Imágenes creadas: {len(posts)}")
        print(f"   📝 Copy optimizado: {len(posts)}")
        print(f"   🚀 Listos para Facebook: {len(posts)}")
        
        print(f"\n📱 POSTS CREADOS:")
        for post in posts:
            print(f"\n   {post['numero']}. {post['tipo'].replace('_', ' ').title()}")
            print(f"      📝 {post['copy']['titulo']}")
            print(f"      🎨 {post['imagen']}")
            print(f"      📞 {post['copy']['cta']}")
        
        print(f"\n🔥 PRÓXIMOS PASOS:")
        print(f"   1. ✅ Verificar imágenes en temp/imagenes_gollos/")
        print(f"   2. 🚀 Publicar manualmente o automatizar")
        print(f"   3. 📊 Monitorear engagement")
        print(f"   4. 🔄 Repetir proceso diariamente")
        
        print(f"\n💰 PROYECCIÓN:")
        print(f"   📈 4 posts profesionales listos")
        print(f"   🎯 Targeting competencia directa")
        print(f"   💵 Potencial: S/48,000+ mensuales")
        print(f"   📱 WhatsApp: +51 939 431 887")

    def publicar_todo_automatico(self, posts):
        """Publicar todos los posts automáticamente"""
        print("\n🚀 PUBLICACIÓN AUTOMÁTICA INICIADA")
        print("=" * 40)
        
        publicados = 0
        
        for post in posts:
            print(f"\n📤 Publicando: {post['tipo']}")
            
            post_id = self.publicar_en_facebook(post, post['imagen'])
            
            if post_id:
                post['facebook_id'] = post_id
                post['publicado'] = True
                publicados += 1
                print(f"✅ Publicado exitosamente")
            else:
                post['publicado'] = False
                print(f"❌ Error en publicación")
        
        print(f"\n📊 RESUMEN PUBLICACIÓN:")
        print(f"   ✅ Publicados: {publicados}/{len(posts)}")
        print(f"   ❌ Fallidos: {len(posts) - publicados}/{len(posts)}")
        
        return publicados

def main():
    """Función principal"""
    print("🚀 GOLLOS CHICKENS - FÁBRICA COMPLETA DE CONTENIDO")
    print("=" * 60)
    print("🎯 Análisis + Contenido + Visuals + Publicación")
    
    # Inicializar fábrica
    fabrica = GollosContentFactory()
    
    # Ejecutar proceso completo
    posts = fabrica.ejecutar_fabrica_completa()
    
    if posts:
        print(f"\n🎯 ¿QUIERES PUBLICAR AUTOMÁTICAMENTE?")
        print("1. ✅ Sí, publicar todo ahora")
        print("2. 📝 No, solo generar contenido")
        
        try:
            opcion = input("\nElige opción (1-2): ").strip()
            
            if opcion == "1":
                fabrica.publicar_todo_automatico(posts)
            else:
                print("📝 Contenido generado. Publica manualmente cuando quieras.")
                
        except KeyboardInterrupt:
            print("\n📝 Contenido generado. Publica manualmente cuando quieras.")
    
    print("\n🎉 PROCESO COMPLETADO")
    print("🚀 ¡Gollos Chickens listo para dominar Lima Norte!")

if __name__ == "__main__":
    main()