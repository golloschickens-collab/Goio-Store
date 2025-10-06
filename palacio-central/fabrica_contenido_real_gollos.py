#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🐔 FÁBRICA DE CONTENIDO GOLLOS CHICKENS - MENÚ REAL
===================================================
Posts basados en la carta real de Gollos Chickens Broaster
Rey Melgar - Automatización con productos reales
"""

import json
from datetime import datetime
import random

class FabricaContenidoReal:
    def __init__(self):
        print("🐔 FÁBRICA DE CONTENIDO GOLLOS CHICKENS - MENÚ REAL")
        print("=" * 60)
        
        # Productos reales del menú
        self.productos = {
            "broaster": {
                "pechuga": {"precio": 16, "descripcion": "Pechuga Broaster jugosa y crujiente"},
                "contramuslo": {"precio": 11, "descripcion": "Contramuslo Broaster dorado"},
                "cuarto": {"precio": 10, "descripcion": "1/4 Broaster completo"},
                "nuggets": {"precio": 17, "descripcion": "Nuggets crujientes"}
            },
            "hamburguesas": {
                "especial_carne": {"precio": 16, "descripcion": "Hamburguesa Especial De Carne"},
                "pechuga_crispy": {"precio": 13, "descripcion": "Hamburguesa Pechuga Crispy"},
                "royal_pollo": {"precio": 14, "descripcion": "Royal Pollo premium"}
            },
            "salchipapas": {
                "clasica": {"precio": 10, "descripcion": "Salchipapa Clásica"},
                "full_hot_dog": {"precio": 14, "descripcion": "Full Hot Dog completo"},
                "a_la_pobre": {"precio": 18, "descripcion": "Salchipapa A La Pobre"}
            },
            "combos": {
                "combo_familiar": {"precio": 55, "descripcion": "Combo Familiar - 8 piezas pollo + papas + ensalada + arroz + gaseosa Pepsi 1.5L"},
                "alitas_especiales": {"precio": 20, "descripcion": "Alitas Especiales - X6 unidades + papas + gaseosa"},
                "combo_alitas": {"precio": 30, "descripcion": "Combo Alitas - 10 unidades + papas + gaseosa Pepsi 1L"},
                "combo_alitas_bbq": {"precio": 32, "descripcion": "Combo Alitas BBQ - 10 unidades + papas + gaseosa Pepsi 1L"},
                "combo_dos": {"precio": 30, "descripcion": "Combo Dos - 4 piezas pollo + papas + gaseosa Pepsi 1L"},
                "combo_doble": {"precio": 32, "descripcion": "Combo Doble - 2 piezas broaster + 2 piezas BBQ + papas + gaseosa"},
                "combo_doble_alitas": {"precio": 30, "descripcion": "Combo Doble Alitas 10 Unids - 5 alitas broaster + 5 alitas BBQ + papas + gaseosa"}
            },
            "bebidas": {
                "inka_coca_15l": {"precio": 9, "descripcion": "Inka/Coca Cola 1 1/2 Lts"},
                "gordita": {"precio": 5, "descripcion": "Gordita"},
                "inka_coca_personal": {"precio": 4, "descripcion": "Inka/Coca Personal"},
                "pepsi_15l": {"precio": 7, "descripcion": "Pepsi 1 1/2 Lts"},
                "pepsi_500ml": {"precio": 3, "descripcion": "Pepsi 500 Ml"},
                "chicha_1l": {"precio": 8, "descripcion": "Chicha Morada 1 Lts"},
                "chicha_personal": {"precio": 2, "descripcion": "Chicha Morada Personal"}
            }
        }
        
    def generar_posts_reales(self):
        """Generar posts con productos y precios reales"""
        
        posts = []
        horarios = ["08:00", "12:00", "15:30", "19:00", "21:30"]
        
        # POST 1: Broaster destacado
        post1 = {
            "hora": "08:00",
            "tema": "broaster_pechuga",
            "copy": """🔥 ¿ANTOJO DE PECHUGA BROASTER PERFECTA?

🍗 Pechuga Broaster jugosa por dentro, CRUJIENTE por fuera
💰 Solo S/16 - La mejor calidad de Lima Norte
📍 Delivery RÁPIDO en San Martín de Porres
🚀 ¡Ordena YA! WhatsApp: 961234567

#GollosChickens #PechugaBroaster #DeliveryLima #SanMartinDePortes""",
            "imagen_concepto": "Pechuga broaster dorada en plato con guarniciones",
            "estado": "listo"
        }
        
        # POST 2: Combo Familiar (el más grande)
        post2 = {
            "hora": "12:00", 
            "tema": "combo_familiar",
            "copy": """👨‍👩‍👧‍👦 COMBO FAMILIAR PERFECTO PARA TODOS

🍗 8 piezas de pollo + papas + ensalada + arroz + gaseosa Pepsi 1.5L
💰 Solo S/55 - ¡Alcanza para toda la familia!
📍 Delivery express en 25 minutos
🚀 ¡Ordena YA! WhatsApp: 961234567

#GollosChickens #ComboFamiliar #AlmuerzoCompleto #SanMartinDePortes""",
            "imagen_concepto": "Combo familiar completo con 8 piezas de pollo y guarniciones",
            "estado": "listo"
        }
        
        # POST 3: Alitas especiales (promoción)
        post3 = {
            "hora": "15:30",
            "tema": "alitas_especiales", 
            "copy": """🔥 ALITAS ESPECIALES - ¡LA PROMOCIÓN MÁS PEDIDA!

🍗 6 alitas jugosas + papas + gaseosa
💰 Solo S/20 - ¡Precio increíble!
📍 Delivery a tu puerta en minutos
🚀 ¡Ordena YA! WhatsApp: 961234567

#GollosChickens #AlitasEspeciales #PromocionEspecial #LimaNorte""",
            "imagen_concepto": "6 alitas doradas con papas fritas y gaseosa",
            "estado": "listo"
        }
        
        # POST 4: Combo Doble Alitas (nocturno)
        post4 = {
            "hora": "19:00",
            "tema": "combo_doble_alitas",
            "copy": """🌙 COMBO DOBLE ALITAS - ¡LO MEJOR DE DOS MUNDOS!

🍗 5 alitas broaster + 5 alitas BBQ + papas + gaseosa
💰 Solo S/30 - Variedad perfecta
📍 Llevamos hasta tu casa en San Martín de Porres
🚀 ¡Ordena YA! WhatsApp: 961234567

#GollosChickens #ComboDobleAlitas #VariedadPerfecta #CenaSabrosa""",
            "imagen_concepto": "Combo con alitas broaster y BBQ, papas y bebida",
            "estado": "listo"
        }
        
        # POST 5: Salchipapa nocturna
        post5 = {
            "hora": "21:30",
            "tema": "salchipapa_noche",
            "copy": """🌙 ANTOJO NOCTURNO: SALCHIPAPA A LA POBRE

🌭 La salchipapa MÁS COMPLETA de Pucallpa
💰 Solo S/18 - Perfecta para la noche
📍 Delivery hasta las 12 AM
🚀 ¡Ordena YA! WhatsApp: 961234567

#GollosChickens #SalchipapaALaPobre #AntojoNocturno #DeliveryTarde""",
            "imagen_concepto": "Salchipapa A La Pobre con todos los ingredientes",
            "estado": "listo"
        }
        
        posts = [post1, post2, post3, post4, post5]
        
        # Guardar posts
        fecha = datetime.now().strftime("%Y-%m-%d")
        archivo = f"contenidos_gollos_reales_{fecha}.json"
        
        with open(archivo, 'w', encoding='utf-8') as f:
            json.dump(posts, f, ensure_ascii=False, indent=2)
        
        return posts
    
    def mostrar_posts(self, posts):
        """Mostrar posts generados"""
        print("\n📅 POSTS CON TU MENÚ REAL:")
        print("=" * 50)
        
        for i, post in enumerate(posts, 1):
            print(f"\n⏰ POST {i} ({post['hora']}) - {post['tema'].upper()}:")
            print("-" * 30)
            print(post['copy'])
            print(f"🎨 Imagen: {post['imagen_concepto']}")
        
        print(f"\n💾 Posts guardados en: contenidos_gollos_reales_{datetime.now().strftime('%Y-%m-%d')}.json")
        
    def generar_respuestas_whatsapp(self):
        """Generar respuestas automáticas de WhatsApp con menú real"""
        respuestas = {
            "menu": """🍗 MENÚ GOLLOS CHICKENS BROASTER:

🐔 POLLOS BROASTER:
• Pechuga - S/16
• Contramuslo - S/11  
• 1/4 Broaster - S/10
• Nuggets - S/17

🍔 HAMBURGUESAS:
• Especial De Carne - S/16
• Pechuga Crispy - S/13
• Royal Pollo - S/14

🌭 SALCHIPAPAS:
• Clásica - S/10
• Full Hot Dog - S/14
• A La Pobre - S/18

🍽️ COMBOS:
• Combo Familiar (8 piezas) - S/55
• Alitas Especiales (6 unids) - S/20
• Combo Alitas (10 unids) - S/30
• Combo Alitas BBQ (10 unids) - S/32
• Combo Dos (4 piezas) - S/30
• Combo Doble (mix broaster+BBQ) - S/32

🥤 BEBIDAS:
• Inka/Coca 1.5L - S/9
• Pepsi 1.5L - S/7
• Chicha Morada 1L - S/8
• Bebidas personales desde S/2

Escribe PEDIDO + tu elección 📱""",
            
            "delivery": """🚚 DELIVERY GOLLOS CHICKENS:
📍 Toda Pucallpa
⏰ 20-30 minutos
💰 Delivery gratis en pedidos +S/25
🕐 Horario: 10 AM - 12 AM

¿Confirmas tu dirección? 📍""",
            
            "promociones": """🎉 PROMOCIONES HOY:
• Combo Uno S/25 ⭐
• Pechuga Broaster S/16 🔥
• 2 Hamburguesas x S/25 💥

¡Aprovecha! WhatsApp: 961234567"""
        }
        
        return respuestas

def main():
    print("🚀 GENERANDO CONTENIDO CON TU MENÚ REAL")
    print("=" * 45)
    
    fabrica = FabricaContenidoReal()
    
    # Generar posts con productos reales
    posts = fabrica.generar_posts_reales()
    
    # Mostrar posts
    fabrica.mostrar_posts(posts)
    
    # Generar respuestas WhatsApp
    respuestas = fabrica.generar_respuestas_whatsapp()
    
    print("\n🤖 RESPUESTAS WHATSAPP CONFIGURADAS:")
    print("=" * 40)
    print("✅ Menú automático con precios reales")
    print("✅ Info delivery actualizada")  
    print("✅ Promociones del día")
    
    print("\n🎉 ¡CONTENIDO REAL GENERADO EXITOSAMENTE!")
    print("💰 Posts alineados con tu carta real")
    print("🚀 ¡Listo para generar ventas reales!")

if __name__ == "__main__":
    main()