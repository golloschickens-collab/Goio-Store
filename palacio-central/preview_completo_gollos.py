#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 PREVIEW COMPLETO GOLLOS CHICKENS
====================================
Vista previa de todos los posts antes de publicar
Facebook + Instagram + WhatsApp
"""

import json
import os
from datetime import datetime

class PreviewGollos:
    def __init__(self):
        self.cargar_datos()
        
    def cargar_datos(self):
        """Cargar todos los datos generados"""
        try:
            # Cargar contenido visual
            with open('reports/contenido_visual_gollos.json', 'r', encoding='utf-8') as f:
                self.contenido = json.load(f)
            
            # Cargar análisis competitivo
            with open('reports/analisis_competitivo.json', 'r', encoding='utf-8') as f:
                self.analisis = json.load(f)
                
            # Cargar configuración
            with open('config/keys.json', 'r', encoding='utf-8') as f:
                self.config = json.load(f)
                
            print("✅ Todos los datos cargados correctamente")
            
        except Exception as e:
            print(f"❌ Error cargando datos: {e}")

    def mostrar_preview_post(self, post, numero):
        """Mostrar preview detallado de un post"""
        print(f"\n" + "🔥" * 60)
        print(f"📱 POST {numero}: {post['tipo'].replace('_', ' ').upper()}")
        print("🔥" * 60)
        
        copy_data = post['copy_facebook']
        
        # Título del post
        print(f"\n📝 TÍTULO:")
        print(f"   {copy_data['titulo']}")
        
        # Copy principal
        print(f"\n💬 COPY COMPLETO:")
        print("   " + "─" * 50)
        copy_lines = copy_data['copy_principal'].split('\n')
        for line in copy_lines:
            print(f"   {line}")
        print("   " + "─" * 50)
        
        # Hashtags
        print(f"\n🏷️ HASHTAGS:")
        hashtags = copy_data.get('hashtags', [])
        hashtag_text = " ".join(hashtags)
        print(f"   {hashtag_text}")
        
        # Call to Action
        print(f"\n📞 CALL TO ACTION:")
        print(f"   {copy_data['cta']}")
        
        # Descripción visual
        print(f"\n🎨 DESCRIPCIÓN VISUAL:")
        visual_info = post.get('template_visual', {})
        print(f"   📸 Tipo: {visual_info.get('descripcion', 'N/A')}")
        print(f"   🎯 Elementos: {', '.join(visual_info.get('elementos', []))}")
        print(f"   🌈 Colores: {', '.join(visual_info.get('colores', []))}")
        print(f"   ✨ Estilo: {visual_info.get('estilo', 'N/A')}")
        
        # Prompt para imagen
        print(f"\n🤖 PROMPT STABLE DIFFUSION:")
        print("   " + "─" * 50)
        prompt_lines = post['prompt_stable_diffusion'].split('\n')
        for line in prompt_lines[:10]:  # Primeras 10 líneas del prompt
            if line.strip():
                print(f"   {line.strip()}")
        print("   " + "─" * 50)
        
        # Adaptación Instagram
        self.mostrar_adaptacion_instagram(copy_data, numero)
        
        # Métricas esperadas
        self.mostrar_metricas_esperadas(post['tipo'])

    def mostrar_adaptacion_instagram(self, copy_data, numero):
        """Mostrar cómo se verá en Instagram"""
        print(f"\n📷 ADAPTACIÓN INSTAGRAM:")
        print("   " + "│" * 50)
        
        # Instagram tiene límite de caracteres y diferente formato
        instagram_copy = self.adaptar_para_instagram(copy_data)
        
        print(f"   📝 COPY INSTAGRAM:")
        instagram_lines = instagram_copy.split('\n')
        for line in instagram_lines:
            print(f"   │ {line}")
        
        print("   " + "│" * 50)
        print(f"   📊 Caracteres: {len(instagram_copy)}/2200")
        print(f"   🏷️ Hashtags: {len(copy_data.get('hashtags', []))}/30")

    def adaptar_para_instagram(self, copy_data):
        """Adaptar copy para Instagram"""
        titulo = copy_data['titulo']
        copy_principal = copy_data['copy_principal']
        cta = copy_data['cta']
        hashtags = copy_data.get('hashtags', [])
        
        # Formato Instagram
        instagram_post = f"""{titulo}

{copy_principal}

{cta}

• • •

{' '.join(hashtags)}

#golloschickens #limanorte #delivery #pollo #broaster #sanmartindeporres"""
        
        return instagram_post

    def mostrar_metricas_esperadas(self, tipo_post):
        """Mostrar métricas esperadas según tipo de post"""
        metricas = {
            "comparativo_precios": {
                "reach_esperado": "1,500-2,500",
                "engagement_rate": "4-6%",
                "clicks_whatsapp": "25-40",
                "conversiones_estimadas": "8-15 pedidos"
            },
            "velocidad_delivery": {
                "reach_esperado": "1,200-2,000", 
                "engagement_rate": "5-7%",
                "clicks_whatsapp": "30-50",
                "conversiones_estimadas": "10-18 pedidos"
            },
            "identidad_local": {
                "reach_esperado": "2,000-3,500",
                "engagement_rate": "6-9%", 
                "clicks_whatsapp": "40-65",
                "conversiones_estimadas": "15-25 pedidos"
            },
            "producto_hero": {
                "reach_esperado": "1,800-2,800",
                "engagement_rate": "7-10%",
                "clicks_whatsapp": "35-55", 
                "conversiones_estimadas": "12-22 pedidos"
            }
        }
        
        metricas_post = metricas.get(tipo_post, {})
        
        print(f"\n📊 MÉTRICAS ESPERADAS:")
        print(f"   👁️ Reach: {metricas_post.get('reach_esperado', 'N/A')}")
        print(f"   ❤️ Engagement: {metricas_post.get('engagement_rate', 'N/A')}")
        print(f"   📱 Clicks WhatsApp: {metricas_post.get('clicks_whatsapp', 'N/A')}")
        print(f"   💰 Conversiones: {metricas_post.get('conversiones_estimadas', 'N/A')}")

    def mostrar_resumen_general(self):
        """Mostrar resumen general del preview"""
        posts = self.contenido.get('contenido_generado', [])
        
        print("\n" + "🎯" * 60)
        print("📊 RESUMEN GENERAL CAMPAÑA GOLLOS CHICKENS")
        print("🎯" * 60)
        
        print(f"\n📱 TOTAL POSTS: {len(posts)}")
        print(f"📅 Fecha generación: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        print(f"🎯 Plataformas: Facebook + Instagram")
        print(f"📞 WhatsApp: +51 939 431 887")
        print(f"📍 Targeting: Lima Norte (San Martín de Porres)")
        
        print(f"\n💰 PROYECCIÓN TOTAL CAMPAÑA:")
        print(f"   👁️ Reach total: 6,500-10,800 personas")
        print(f"   ❤️ Engagement promedio: 5.5-8%")
        print(f"   📱 Clicks WhatsApp: 130-210")
        print(f"   💵 Conversiones: 45-80 pedidos")
        print(f"   💰 Ingresos estimados: S/1,800-3,200 por campaña")
        
        print(f"\n🎯 COMPETENCIA ATACADA:")
        competidores = self.analisis.get('competidores_analizados', [])
        for comp in competidores:
            print(f"   🎯 {comp.upper()}")
        
        print(f"\n📋 CHECKLIST ANTES DE PUBLICAR:")
        print(f"   ☐ Revisar copy y emojis")
        print(f"   ☐ Verificar precios actualizados")
        print(f"   ☐ Confirmar número WhatsApp")
        print(f"   ☐ Validar horarios delivery")
        print(f"   ☐ Generar imágenes Stable Diffusion")
        print(f"   ☐ Programar horario publicación")

    def generar_reporte_preview(self):
        """Generar reporte completo del preview"""
        posts = self.contenido.get('contenido_generado', [])
        
        reporte = {
            "fecha_preview": datetime.now().isoformat(),
            "total_posts": len(posts),
            "plataformas": ["Facebook", "Instagram"],
            "posts_preview": [],
            "metricas_proyectadas": {
                "reach_total": "6,500-10,800",
                "engagement_promedio": "5.5-8%",
                "clicks_whatsapp": "130-210",
                "conversiones": "45-80 pedidos",
                "ingresos_estimados": "S/1,800-3,200"
            },
            "checklist_pre_publicacion": [
                "Revisar copy y emojis",
                "Verificar precios actualizados", 
                "Confirmar número WhatsApp",
                "Validar horarios delivery",
                "Generar imágenes Stable Diffusion",
                "Programar horario publicación"
            ]
        }
        
        for i, post in enumerate(posts, 1):
            post_preview = {
                "numero": i,
                "tipo": post['tipo'],
                "titulo": post['copy_facebook']['titulo'],
                "copy_facebook": post['copy_facebook']['copy_principal'],
                "copy_instagram": self.adaptar_para_instagram(post['copy_facebook']),
                "hashtags": post['copy_facebook'].get('hashtags', []),
                "cta": post['copy_facebook']['cta'],
                "descripcion_visual": post.get('template_visual', {}).get('descripcion', ''),
                "caracteres_instagram": len(self.adaptar_para_instagram(post['copy_facebook']))
            }
            reporte['posts_preview'].append(post_preview)
        
        # Guardar reporte
        os.makedirs('reports', exist_ok=True)
        with open('reports/preview_completo_gollos.json', 'w', encoding='utf-8') as f:
            json.dump(reporte, f, indent=2, ensure_ascii=False)
        
        return reporte

    def ejecutar_preview_completo(self):
        """Ejecutar preview completo"""
        print("🔍 PREVIEW COMPLETO GOLLOS CHICKENS")
        print("=" * 60)
        print("📱 Facebook + Instagram + WhatsApp")
        print("🎯 Revisión antes de publicar")
        
        posts = self.contenido.get('contenido_generado', [])
        
        # Mostrar cada post
        for i, post in enumerate(posts, 1):
            self.mostrar_preview_post(post, i)
            
            # Pausa entre posts para mejor lectura
            print(f"\n{'⬇️' * 20} SIGUIENTE POST {'⬇️' * 20}")
        
        # Mostrar resumen general
        self.mostrar_resumen_general()
        
        # Generar reporte
        reporte = self.generar_reporte_preview()
        
        print(f"\n💾 Preview guardado en: reports/preview_completo_gollos.json")
        
        # Opciones de acción
        self.mostrar_opciones_accion()
        
        return reporte

    def mostrar_opciones_accion(self):
        """Mostrar opciones de qué hacer después del preview"""
        print(f"\n🎯 ¿QUÉ QUIERES HACER AHORA REY?")
        print("=" * 40)
        print("1. ✅ Publicar todo tal como está")
        print("2. ✏️ Modificar copy específico")
        print("3. 🎨 Cambiar descripción visual")
        print("4. 📱 Solo Instagram o solo Facebook")
        print("5. ⏰ Programar publicación automática")
        print("6. 🔄 Regenerar todo desde cero")
        print("7. 📊 Ver solo métricas proyectadas")
        print("8. 💾 Guardar para después")

def main():
    """Función principal del preview"""
    print("🔍 SISTEMA PREVIEW GOLLOS CHICKENS")
    print("=" * 50)
    print("📱 Vista previa completa antes de publicar")
    
    # Ejecutar preview
    preview = PreviewGollos()
    reporte = preview.ejecutar_preview_completo()
    
    print(f"\n🎉 PREVIEW COMPLETADO")
    print(f"📊 {reporte['total_posts']} posts revisados")
    print(f"📱 Listos para Facebook + Instagram")
    print(f"💰 Potencial: {reporte['metricas_proyectadas']['ingresos_estimados']}")

if __name__ == "__main__":
    main()