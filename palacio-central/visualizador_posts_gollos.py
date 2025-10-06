#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
👀 VISUALIZADOR POSTS GOLLOS CHICKENS
====================================
Visualiza cada post individualmente antes de publicar
"""

import json
import os
from datetime import datetime

class VisualizadorPosts:
    def __init__(self):
        self.cargar_posts()
        
    def cargar_posts(self):
        """Cargar posts del preview"""
        try:
            with open('reports/preview_completo_gollos.json', 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            self.posts = self.data.get('posts_preview', [])
            print(f"✅ {len(self.posts)} posts cargados")
        except Exception as e:
            print(f"❌ Error cargando posts: {e}")
            self.posts = []

    def mostrar_post_individual(self, numero_post):
        """Mostrar un post específico"""
        if numero_post < 1 or numero_post > len(self.posts):
            print("❌ Número de post inválido")
            return
        
        post = self.posts[numero_post - 1]
        
        print("\n" + "🎯" * 80)
        print(f"📱 POST {numero_post}/{len(self.posts)}: {post['tipo'].replace('_', ' ').upper()}")
        print("🎯" * 80)
        
        # FACEBOOK VERSION
        print(f"\n📘 FACEBOOK:")
        print("=" * 50)
        print(f"📝 {post['titulo']}")
        print()
        facebook_lines = post['copy_facebook'].split('\n')
        for line in facebook_lines:
            print(f"   {line}")
        print()
        print(f"📞 {post['cta']}")
        
        # INSTAGRAM VERSION  
        print(f"\n📷 INSTAGRAM:")
        print("=" * 50)
        instagram_lines = post['copy_instagram'].split('\n')
        for line in instagram_lines:
            print(f"   {line}")
        
        # INFORMACIÓN ADICIONAL
        print(f"\n📊 INFORMACIÓN:")
        print("=" * 50)
        print(f"🎨 Visual: {post['descripcion_visual']}")
        print(f"📊 Caracteres Instagram: {post['caracteres_instagram']}/2200")
        print(f"🏷️ Hashtags: {len(post['hashtags'])}/30")
        
        return post

    def mostrar_menu_principal(self):
        """Mostrar menú principal"""
        while True:
            print("\n" + "👀" * 50)
            print("VISUALIZADOR POSTS GOLLOS CHICKENS")
            print("👀" * 50)
            
            print(f"\n📱 POSTS DISPONIBLES ({len(self.posts)} total):")
            for i, post in enumerate(self.posts, 1):
                tipo_limpio = post['tipo'].replace('_', ' ').title()
                print(f"   {i}. {tipo_limpio}")
            
            print(f"\n🎯 OPCIONES:")
            print(f"   1-{len(self.posts)}. Ver post específico")
            print(f"   A. Ver TODOS los posts")
            print(f"   R. Resumen ejecutivo")
            print(f"   S. Salir")
            
            try:
                opcion = input(f"\n¿Qué quieres ver? (1-{len(self.posts)}/A/R/S): ").strip().upper()
                
                if opcion == 'S':
                    print("👋 ¡Hasta luego!")
                    break
                elif opcion == 'A':
                    self.mostrar_todos_posts()
                elif opcion == 'R':
                    self.mostrar_resumen_ejecutivo()
                elif opcion.isdigit():
                    numero = int(opcion)
                    self.mostrar_post_individual(numero)
                    self.mostrar_opciones_post()
                else:
                    print("❌ Opción inválida")
                    
            except KeyboardInterrupt:
                print("\n👋 ¡Hasta luego!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

    def mostrar_todos_posts(self):
        """Mostrar todos los posts de una vez"""
        print("\n" + "📱" * 80)
        print("TODOS LOS POSTS - VISTA COMPLETA")
        print("📱" * 80)
        
        for i, post in enumerate(self.posts, 1):
            print(f"\n{'🔥' * 20} POST {i} {'🔥' * 20}")
            print(f"📝 {post['titulo']}")
            print("\n📘 FACEBOOK:")
            print(post['copy_facebook'])
            print(f"\n📞 {post['cta']}")
            print("\n📷 INSTAGRAM:")
            instagram_preview = post['copy_instagram'][:200] + "..."
            print(instagram_preview)
            print(f"\n🎨 Visual: {post['descripcion_visual']}")
            
            if i < len(self.posts):
                input("\nPresiona ENTER para ver el siguiente post...")

    def mostrar_resumen_ejecutivo(self):
        """Mostrar resumen ejecutivo"""
        print("\n" + "📊" * 80)
        print("RESUMEN EJECUTIVO CAMPAÑA")
        print("📊" * 80)
        
        metricas = self.data.get('metricas_proyectadas', {})
        
        print(f"\n🎯 ESTADÍSTICAS CAMPAÑA:")
        print(f"   📱 Total posts: {len(self.posts)}")
        print(f"   👁️ Reach proyectado: {metricas.get('reach_total', 'N/A')}")
        print(f"   ❤️ Engagement: {metricas.get('engagement_promedio', 'N/A')}")
        print(f"   📞 Clicks WhatsApp: {metricas.get('clicks_whatsapp', 'N/A')}")
        print(f"   💰 Conversiones: {metricas.get('conversiones', 'N/A')}")
        print(f"   💵 Ingresos: {metricas.get('ingresos_estimados', 'N/A')}")
        
        print(f"\n📋 POSTS POR TIPO:")
        for i, post in enumerate(self.posts, 1):
            tipo_limpio = post['tipo'].replace('_', ' ').title()
            caracteres = post['caracteres_instagram']
            print(f"   {i}. {tipo_limpio} - {caracteres} caracteres")
        
        print(f"\n📞 CONTACTO:")
        print(f"   WhatsApp: +51 939 431 887")
        print(f"   Zona: Lima Norte")

    def mostrar_opciones_post(self):
        """Mostrar opciones después de ver un post"""
        print(f"\n🎯 ¿QUÉ QUIERES HACER CON ESTE POST?")
        print("=" * 40)
        print("1. ✅ Aprobar este post")
        print("2. ✏️ Necesita cambios")
        print("3. ❌ Rechazar este post")
        print("4. 📱 Ver siguiente post")
        print("5. 🔙 Volver al menú")
        
        try:
            opcion = input("\nElige opción (1-5): ").strip()
            
            if opcion == "1":
                print("✅ Post aprobado!")
            elif opcion == "2":
                print("✏️ Anota los cambios que necesitas y me dices")
            elif opcion == "3":
                print("❌ Post marcado para eliminar")
            elif opcion == "4":
                # Lógica para siguiente post
                pass
            elif opcion == "5":
                return
            
        except KeyboardInterrupt:
            return

    def crear_archivo_revision(self):
        """Crear archivo de texto para revisión offline"""
        print("\n📄 Creando archivo de revisión...")
        
        contenido_revision = []
        contenido_revision.append("📱 POSTS GOLLOS CHICKENS - REVISIÓN")
        contenido_revision.append("=" * 50)
        contenido_revision.append(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        contenido_revision.append(f"Total posts: {len(self.posts)}")
        contenido_revision.append("")
        
        for i, post in enumerate(self.posts, 1):
            contenido_revision.append(f"POST {i}: {post['tipo'].replace('_', ' ').upper()}")
            contenido_revision.append("-" * 30)
            contenido_revision.append(f"TÍTULO: {post['titulo']}")
            contenido_revision.append("")
            contenido_revision.append("FACEBOOK:")
            contenido_revision.append(post['copy_facebook'])
            contenido_revision.append("")
            contenido_revision.append(f"CTA: {post['cta']}")
            contenido_revision.append("")
            contenido_revision.append("INSTAGRAM:")
            contenido_revision.append(post['copy_instagram'])
            contenido_revision.append("")
            contenido_revision.append(f"VISUAL: {post['descripcion_visual']}")
            contenido_revision.append("")
            contenido_revision.append("HASHTAGS:")
            contenido_revision.append(" ".join(post['hashtags']))
            contenido_revision.append("")
            contenido_revision.append("=" * 50)
            contenido_revision.append("")
        
        # Agregar métricas
        metricas = self.data.get('metricas_proyectadas', {})
        contenido_revision.append("MÉTRICAS PROYECTADAS:")
        contenido_revision.append(f"Reach: {metricas.get('reach_total', 'N/A')}")
        contenido_revision.append(f"Engagement: {metricas.get('engagement_promedio', 'N/A')}")
        contenido_revision.append(f"Conversiones: {metricas.get('conversiones', 'N/A')}")
        contenido_revision.append(f"Ingresos: {metricas.get('ingresos_estimados', 'N/A')}")
        
        # Guardar archivo
        os.makedirs('temp', exist_ok=True)
        ruta_archivo = 'temp/revision_posts_gollos.txt'
        
        with open(ruta_archivo, 'w', encoding='utf-8') as f:
            f.write('\n'.join(contenido_revision))
        
        print(f"✅ Archivo creado: {ruta_archivo}")
        print("📖 Puedes abrirlo en cualquier editor de texto")
        
        return ruta_archivo

def main():
    """Función principal"""
    print("👀 VISUALIZADOR POSTS GOLLOS CHICKENS")
    print("=" * 50)
    
    visualizador = VisualizadorPosts()
    
    if not visualizador.posts:
        print("❌ No hay posts para mostrar")
        print("💡 Ejecuta primero: python preview_completo_gollos.py")
        return
    
    print(f"\n🎯 OPCIONES DE VISUALIZACIÓN:")
    print("1. 🖥️ Ver en terminal (interactivo)")
    print("2. 📄 Crear archivo de texto")
    print("3. 📱 Ambos")
    
    try:
        opcion = input("\n¿Cómo quieres ver los posts? (1-3): ").strip()
        
        if opcion in ["1", "3"]:
            visualizador.mostrar_menu_principal()
        
        if opcion in ["2", "3"]:
            archivo = visualizador.crear_archivo_revision()
            print(f"\n📖 Abre el archivo: {archivo}")
            
    except KeyboardInterrupt:
        print("\n👋 ¡Hasta luego!")

if __name__ == "__main__":
    main()