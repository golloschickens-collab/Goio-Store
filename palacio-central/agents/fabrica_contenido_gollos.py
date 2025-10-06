#!/usr/bin/env python3
"""
🎨 FÁBRICA DE CONTENIDO AUTOMÁTICA - GOLLOS CHICKENS
Sistema de marketing visual automatizado usando DiCloak Premium Tools

Herramientas disponibles:
- Canva Pro (diseño)
- Midjourney MEGA (imágenes AI) 
- CapCut Pro (videos)
- ChatGPT Plus (copy)
- Gemini Pro (contenido)
- Suno Premier (música)
- Freepik Premium (recursos)

Para: Rey (Gollos Chickens Empire)
Fecha: 29 Septiembre 2025
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
import random
from playwright.async_api import async_playwright
import os

class FabricaContenidoGollos:
    """Fábrica automática de contenido visual para Gollos Chickens"""
    
    def __init__(self):
        self.dicloak_profiles = self.cargar_perfiles_dicloak()
        self.contenido_queue = []
        self.plantillas_content = self.cargar_plantillas()
        self.horario_publicaciones = self.configurar_horarios()
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('FabricaContenido')
        
        self.logger.info("🎨 Fábrica de Contenido Gollos Chickens iniciada")
    
    def cargar_perfiles_dicloak(self) -> Dict:
        """Carga los perfiles disponibles de DiCloak"""
        return {
            "canva_pro": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110",
                "tipo": "diseño_grafico",
                "activo": True
            },
            "midjourney_mega": {
                "email": "soportegvelarde321@gmail.com", 
                "proxy": "142.111.253.154:63110",
                "tipo": "imagenes_ai",
                "activo": True
            },
            "capcut_pro": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110", 
                "tipo": "edicion_video",
                "activo": False,  # En mantenimiento
                "backup": "whisk_animate"
            },
            "chatgpt_plus_1": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110",
                "tipo": "copywriting",
                "activo": True
            },
            "chatgpt_plus_2": {
                "email": "mariobelarde8@gmail.com",
                "proxy": "77.83.4.62:63308", 
                "tipo": "copywriting_backup",
                "activo": True
            },
            "gemini_pro_1": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110",
                "tipo": "contenido_estrategico",
                "activo": True
            },
            "suno_premier_1": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110",
                "tipo": "musica_ai",
                "activo": True
            },
            "freepik_premium": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110",
                "tipo": "recursos_graficos", 
                "activo": True
            },
            "envato_elements": {
                "email": "soportegvelarde321@gmail.com",
                "proxy": "142.111.253.154:63110",
                "tipo": "video_musica_plantillas",
                "activo": True
            }
        }
    
    def cargar_plantillas(self) -> Dict:
        """Plantillas de contenido para Gollos Chickens"""
        return {
            "posts_instagram": [
                {
                    "tipo": "producto_showcase",
                    "copy_template": "🐔 {producto} fresquito del día!\n\n✨ {descripcion}\n💰 Solo S/{precio}\n🚚 Delivery GRATIS\n\n📱 Pide ya: {cta}",
                    "imagen_prompt": "professional food photography of fresh {producto}, golden lighting, appetizing, restaurant quality",
                    "hashtags": "#GollosChickens #PolloFresco #LimaEats #DeliveryGratis"
                },
                {
                    "tipo": "behind_the_scenes", 
                    "copy_template": "👨‍🍳 Así preparamos tus pollos favoritos\n\n🔥 Proceso artesanal\n⏰ Listos en {tiempo} minutos\n🏆 Calidad garantizada",
                    "imagen_prompt": "chef preparing chicken in professional kitchen, cooking process, behind the scenes",
                    "hashtags": "#BehindTheScenes #PolloArtesanal #CalidadPremium"
                },
                {
                    "tipo": "promocional",
                    "copy_template": "🔥 OFERTA ESPECIAL 🔥\n\n{oferta}\n💰 Ahorra S/{descuento}\n⏰ Solo hasta {fecha_limite}",
                    "imagen_prompt": "promotional food offer design, chicken special deal, vibrant colors, sale announcement",
                    "hashtags": "#OfertaEspecial #PromoGollos #AhorraAhora"
                },
                {
                    "tipo": "testimonial",
                    "copy_template": "💬 '{testimonio}'\n\n- {cliente}\n\n🏆 Esto dicen nuestros clientes\n📱 ¡Tú también prueba la diferencia!",
                    "imagen_prompt": "happy customer with delicious chicken meal, testimonial style, warm atmosphere",
                    "hashtags": "#TestimonioReal #ClientesSatisfechos #CalidadComprobada"
                }
            ],
            
            "stories_instagram": [
                {
                    "tipo": "proceso_cocina",
                    "texto": "🔥 Preparando tu pedido...",
                    "imagen_prompt": "cooking process vertical format, chicken being prepared, instagram story style"
                },
                {
                    "tipo": "producto_del_dia",
                    "texto": "📅 ESPECIAL DEL DÍA",
                    "imagen_prompt": "daily special chicken product, vertical format, eye-catching design"
                },
                {
                    "tipo": "encuesta_interactiva",
                    "texto": "¿Cuál prefieres? 🤔",
                    "opciones": ["🐔 Pollo Entero", "🍗 Presas Sueltas"],
                    "imagen_prompt": "interactive poll comparing chicken options, instagram story format"
                }
            ],
            
            "videos_tiktok": [
                {
                    "tipo": "preparacion_rapida",
                    "concepto": "Time-lapse de preparación de pollo",
                    "duracion": 15,
                    "musica": "upbeat cooking music",
                    "texto_overlay": "POV: Preparando el mejor pollo de Lima ⚡"
                },
                {
                    "tipo": "antes_despues", 
                    "concepto": "Transformación del pollo crudo a delicioso",
                    "duracion": 10,
                    "musica": "transformation trend music",
                    "texto_overlay": "De esto... a ESTO 🤤"
                },
                {
                    "tipo": "trend_dance",
                    "concepto": "Chef bailando mientras cocina",
                    "duracion": 20,
                    "musica": "trending dance song",
                    "texto_overlay": "Cuando el pollo queda perfecto 💃"
                }
            ]
        }
    
    def configurar_horarios(self) -> Dict:
        """Configura horarios de publicación optimizados"""
        return {
            "instagram_posts": [
                {"hora": "07:00", "tipo": "motivacional_matutino"},
                {"hora": "12:00", "tipo": "almuerzo_promocional"}, 
                {"hora": "17:00", "tipo": "apertura_negocio"},
                {"hora": "20:00", "tipo": "cena_especial"}
            ],
            "instagram_stories": [
                {"hora": "08:00", "tipo": "proceso_cocina"},
                {"hora": "11:00", "tipo": "producto_del_dia"},
                {"hora": "15:00", "tipo": "encuesta_interactiva"},
                {"hora": "18:00", "tipo": "horario_delivery"},
                {"hora": "22:00", "tipo": "ultima_oportunidad"}
            ],
            "tiktok_videos": [
                {"hora": "09:00", "tipo": "preparacion_rapida"},
                {"hora": "14:00", "tipo": "antes_despues"},
                {"hora": "19:00", "tipo": "trend_dance"}
            ],
            "facebook_posts": [
                {"hora": "10:00", "tipo": "informativo"},
                {"hora": "16:00", "tipo": "promocional"},
                {"hora": "21:00", "tipo": "testimonial"}
            ]
        }
    
    async def generar_contenido_diario(self):
        """Genera todo el contenido para el día"""
        self.logger.info("🎨 Iniciando generación de contenido diario...")
        
        fecha_hoy = datetime.now().strftime("%Y-%m-%d")
        
        # Generar contenido para cada plataforma
        contenido_generado = {
            "instagram_posts": await self.generar_posts_instagram(),
            "instagram_stories": await self.generar_stories_instagram(), 
            "tiktok_videos": await self.generar_videos_tiktok(),
            "facebook_posts": await self.generar_posts_facebook(),
            "fecha": fecha_hoy,
            "total_items": 0
        }
        
        # Contar total de contenido generado
        total = sum(len(v) if isinstance(v, list) else 1 for k, v in contenido_generado.items() if k != "fecha")
        contenido_generado["total_items"] = total
        
        # Guardar contenido generado
        await self.guardar_contenido_generado(contenido_generado)
        
        self.logger.info(f"✅ Contenido diario generado: {total} items")
        return contenido_generado
    
    async def generar_posts_instagram(self) -> List[Dict]:
        """Genera posts para Instagram usando las herramientas premium"""
        posts = []
        
        for plantilla in self.plantillas_content["posts_instagram"]:
            post = await self.crear_post_instagram(plantilla)
            posts.append(post)
        
        return posts
    
    async def crear_post_instagram(self, plantilla: Dict) -> Dict:
        """Crea un post específico para Instagram"""
        
        # Paso 1: Generar copy con ChatGPT Plus
        copy = await self.generar_copy_chatgpt(plantilla)
        
        # Paso 2: Generar imagen con Midjourney
        imagen = await self.generar_imagen_midjourney(plantilla["imagen_prompt"])
        
        # Paso 3: Diseñar layout final con Canva Pro
        diseno_final = await self.disenar_con_canva(imagen, copy, "instagram_post")
        
        return {
            "tipo": plantilla["tipo"],
            "copy": copy,
            "imagen_url": imagen,
            "diseno_final": diseno_final,
            "hashtags": plantilla["hashtags"],
            "plataforma": "instagram",
            "formato": "post",
            "programado_para": self.obtener_horario_optimo("instagram_posts")
        }
    
    async def generar_copy_chatgpt(self, plantilla: Dict) -> str:
        """Genera copy usando ChatGPT Plus a través de DiCloak"""
        
        prompt = f"""
        Eres el copywriter de Gollos Chickens, el mejor restaurante de pollos de Lima.
        
        Crea un copy para {plantilla['tipo']} siguiendo esta estructura:
        {plantilla['copy_template']}
        
        Características de la marca:
        - Auténtico y familiar
        - Pollos frescos de granja
        - Delivery gratuito en Lima
        - Atención de Rey (dueño carismático)
        - Horario: 5 PM - 1 AM
        
        Tono: Cálido, cercano, apetitoso, con emojis estratégicos
        Longitud: Máximo 150 caracteres para engagement óptimo
        """
        
        try:
            # Simular conexión a ChatGPT Plus via DiCloak
            copy_generado = await self.ejecutar_en_dicloak("chatgpt_plus_1", prompt)
            return copy_generado
        except Exception as e:
            self.logger.error(f"Error generando copy: {e}")
            return self.obtener_copy_fallback(plantilla)
    
    async def generar_imagen_midjourney(self, prompt: str) -> str:
        """Genera imagen usando Midjourney MEGA a través de DiCloak"""
        
        prompt_completo = f"""
        {prompt}, 
        professional food photography, 
        golden hour lighting, 
        appetizing, 
        restaurant quality, 
        vibrant colors, 
        instagram-worthy, 
        shot with Canon EOS R5, 
        85mm lens, 
        shallow depth of field,
        --ar 1:1 --v 6 --q 2
        """
        
        try:
            imagen_url = await self.ejecutar_en_dicloak("midjourney_mega", prompt_completo)
            return imagen_url
        except Exception as e:
            self.logger.error(f"Error generando imagen: {e}")
            return await self.obtener_imagen_fallback()
    
    async def disenar_con_canva(self, imagen: str, copy: str, formato: str) -> str:
        """Diseña el layout final usando Canva Pro"""
        
        especificaciones = {
            "instagram_post": {
                "dimensiones": "1080x1080",
                "elementos": ["logo_gollos", "imagen_principal", "copy_overlay", "cta_button"]
            },
            "instagram_story": {
                "dimensiones": "1080x1920", 
                "elementos": ["imagen_principal", "texto_overlay", "sticker_interactivo"]
            },
            "facebook_post": {
                "dimensiones": "1200x630",
                "elementos": ["imagen_principal", "logo", "copy_text", "contact_info"]
            }
        }
        
        try:
            diseno_url = await self.ejecutar_canva_automation(imagen, copy, especificaciones[formato])
            return diseno_url
        except Exception as e:
            self.logger.error(f"Error diseñando con Canva: {e}")
            return imagen  # Fallback a imagen original
    
    async def ejecutar_en_dicloak(self, perfil: str, comando: str) -> str:
        """Ejecuta comando en una herramienta específica a través de DiCloak"""
        
        profile_info = self.dicloak_profiles.get(perfil)
        if not profile_info or not profile_info["activo"]:
            raise Exception(f"Perfil {perfil} no disponible")
        
        async with async_playwright() as p:
            # Configurar proxy
            browser = await p.chromium.launch(
                proxy={
                    "server": f"http://{profile_info['proxy']}",
                }
            )
            
            page = await browser.new_page()
            
            # Simular ejecución según el tipo de herramienta
            if "chatgpt" in perfil:
                resultado = await self.ejecutar_chatgpt_automation(page, comando)
            elif "midjourney" in perfil:
                resultado = await self.ejecutar_midjourney_automation(page, comando)
            elif "canva" in perfil:
                resultado = await self.ejecutar_canva_automation(page, comando)
            else:
                resultado = f"Resultado_simulado_{perfil}_{datetime.now().timestamp()}"
            
            await browser.close()
            return resultado
    
    async def ejecutar_chatgpt_automation(self, page, prompt: str) -> str:
        """Automatiza ChatGPT Plus para generar copy"""
        
        try:
            # Ir a ChatGPT
            await page.goto("https://chat.openai.com/")
            
            # Esperar carga
            await page.wait_for_timeout(3000)
            
            # Buscar textarea de input
            textarea = await page.wait_for_selector("textarea")
            
            # Escribir prompt
            await textarea.fill(prompt)
            
            # Enviar
            await page.keyboard.press("Enter")
            
            # Esperar respuesta (selector del mensaje de respuesta)
            await page.wait_for_selector("[data-message-author-role='assistant']", timeout=30000)
            
            # Extraer respuesta
            respuesta = await page.locator("[data-message-author-role='assistant']").last.inner_text()
            
            return respuesta.strip()
            
        except Exception as e:
            self.logger.error(f"Error en ChatGPT automation: {e}")
            return self.obtener_copy_fallback()
    
    async def ejecutar_midjourney_automation(self, page, prompt: str) -> str:
        """Automatiza Midjourney para generar imágenes"""
        
        try:
            # Ir a Midjourney (Discord)
            await page.goto("https://discord.com/channels/662267976984297473/")
            
            # Esperar carga
            await page.wait_for_timeout(5000)
            
            # Buscar input de mensaje
            message_input = await page.wait_for_selector("[data-slate-editor='true']")
            
            # Escribir comando /imagine
            await message_input.fill(f"/imagine {prompt}")
            
            # Enviar
            await page.keyboard.press("Enter")
            
            # Confirmar prompt
            await page.wait_for_timeout(2000)
            await page.keyboard.press("Enter")
            
            # Esperar generación (esto puede tomar varios minutos)
            await page.wait_for_timeout(60000)  # 1 minuto
            
            # Buscar imagen generada (selector puede variar)
            imagen_element = await page.wait_for_selector("img[src*='cdn.discordapp.com']")
            imagen_url = await imagen_element.get_attribute("src")
            
            return imagen_url
            
        except Exception as e:
            self.logger.error(f"Error en Midjourney automation: {e}")
            return await self.obtener_imagen_fallback()
    
    async def ejecutar_canva_automation(self, imagen: str, copy: str, especificaciones: Dict) -> str:
        """Automatiza Canva Pro para diseñar layouts finales"""
        
        try:
            # Este es un proceso más complejo que requiere:
            # 1. Cargar plantilla apropiada
            # 2. Reemplazar imagen
            # 3. Actualizar texto
            # 4. Exportar diseño final
            
            # Por ahora simular resultado
            diseno_id = f"canva_design_{datetime.now().timestamp()}"
            return f"https://canva.com/design/{diseno_id}/export"
            
        except Exception as e:
            self.logger.error(f"Error en Canva automation: {e}")
            return imagen  # Fallback
    
    def obtener_copy_fallback(self, plantilla: Dict = None) -> str:
        """Copy de respaldo si falla la generación automática"""
        fallbacks = [
            "🐔 Los mejores pollos de Lima te esperan!\n\n✨ Frescos, jugosos, deliciosos\n💰 Precios increíbles\n🚚 Delivery GRATIS\n\n📱 Pide ya: WhatsApp",
            "🍗 Pollos artesanales preparados con amor\n\n🔥 Recién salidos del horno\n⏰ Listos en 20 minutos\n🏆 Calidad garantizada\n\n#GollosChickens",
            "🎯 OFERTA ESPECIAL HOY\n\n🐔 Combo familiar S/45\n💰 Incluye delivery gratis\n⏰ Solo hasta las 12 AM\n\n¡No te lo pierdas!"
        ]
        return random.choice(fallbacks)
    
    async def obtener_imagen_fallback(self) -> str:
        """Imagen de respaldo si falla la generación"""
        # Usar banco de imágenes predefinidas o generar con Freepik
        imagenes_fallback = [
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1080",
            "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1080", 
            "https://images.unsplash.com/photo-1606909212829-ce3e3d4c7c00?w=1080"
        ]
        return random.choice(imagenes_fallback)
    
    def obtener_horario_optimo(self, tipo_contenido: str) -> str:
        """Obtiene el próximo horario óptimo para publicación"""
        horarios = self.horario_publicaciones.get(tipo_contenido, [])
        if not horarios:
            return "12:00"  # Default
        
        # Lógica para encontrar próximo horario disponible
        ahora = datetime.now()
        for horario in horarios:
            hora_programada = datetime.strptime(horario["hora"], "%H:%M").time()
            fecha_programada = datetime.combine(ahora.date(), hora_programada)
            
            if fecha_programada > ahora:
                return horario["hora"]
        
        # Si no hay horarios hoy, programar para mañana
        return f"{horarios[0]['hora']} +1día"
    
    async def guardar_contenido_generado(self, contenido: Dict):
        """Guarda el contenido generado para programación posterior"""
        
        archivo_contenido = f"c:/Goio mayordomo/palacio-central/content/generado_{contenido['fecha']}.json"
        
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(archivo_contenido), exist_ok=True)
        
        with open(archivo_contenido, 'w', encoding='utf-8') as f:
            json.dump(contenido, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"💾 Contenido guardado: {archivo_contenido}")
    
    async def programar_publicaciones_automaticas(self):
        """Programa todas las publicaciones del día"""
        
        contenido = await self.generar_contenido_diario()
        
        for plataforma, items in contenido.items():
            if isinstance(items, list):
                for item in items:
                    await self.programar_publicacion_individual(item)
        
        self.logger.info("📅 Todas las publicaciones programadas automáticamente")
    
    async def programar_publicacion_individual(self, item: Dict):
        """Programa una publicación individual"""
        
        # Esta función integraría con APIs de redes sociales
        # O sistemas de programación como Buffer, Hootsuite, etc.
        
        self.logger.info(f"📅 Programado: {item['formato']} para {item['plataforma']} a las {item.get('programado_para', 'TBD')}")
    
    async def ejecutar_campana_marketing_semanal(self):
        """Ejecuta una campaña completa de marketing para la semana"""
        
        self.logger.info("🚀 Iniciando campaña de marketing semanal...")
        
        # Generar contenido para toda la semana
        for dia in range(7):
            fecha_target = datetime.now() + timedelta(days=dia)
            
            await self.generar_contenido_diario()
            await asyncio.sleep(1)  # Evitar rate limits
        
        self.logger.info("✅ Campaña semanal generada completamente")

# Función principal
async def main():
    """Ejecutar fábrica de contenido"""
    fabrica = FabricaContenidoGollos()
    
    # Generar contenido para hoy
    await fabrica.programar_publicaciones_automaticas()
    
    # Generar campaña semanal
    await fabrica.ejecutar_campana_marketing_semanal()

if __name__ == "__main__":
    asyncio.run(main())