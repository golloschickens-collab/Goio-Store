#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 CAMPAÑA PUBLICITARIA FACEBOOK GOLLOS CHICKENS
================================================
Publicidad pagada hiperlocalizada desde Los Nísperos
Radio configurable + targeting inteligente
"""

import json
from datetime import datetime, timedelta

class CampanaPublicitariaGollos:
    def __init__(self):
        self.ubicacion_central = {
            "direccion": "Asociación Los Nísperos Mz.V Lte.1",
            "distrito": "San Martín de Porres",
            "referencia": "Paradero Las Vaquitas",
            "coordenadas": "aprox -11.99, -77.08"  # Estimadas para San Martín
        }
        
        self.opciones_radio = {
            "conservador": {"km": 5, "descripcion": "Zona segura delivery", "audiencia_estimada": "15,000-25,000"},
            "moderado": {"km": 8, "descripcion": "Expansión controlada", "audiencia_estimada": "35,000-50,000"},
            "agresivo": {"km": 12, "descripcion": "Máximo alcance", "audiencia_estimada": "70,000-100,000"}
        }

    def crear_posts_publicitarios(self):
        """Posts optimizados para publicidad pagada"""
        
        posts_ads = {
            "post_1_presentacion": {
                "titulo": "🏆 16 AÑOS CONQUISTANDO LIMA NORTE - ¡AHORA MÁS CERCA!",
                "copy_publicitario": """🐔 ¿Conoces GOLLOS CHICKENS Los Nísperos?

✨ 16 años perfeccionando nuestro sabor
📍 Asociación Los Nísperos - Paradero Las Vaquitas  
🚚 Delivery RÁPIDO a tu zona (25-35 min)

🎯 ESPECIALISTAS EN:
• Pechuga Broaster Premium S/16
• Combo Familiar 8 piezas S/55
• Alitas crujientes S/20

💰 DELIVERY GRATIS en pedidos +S/30
📱 Pedidos por WhatsApp ⬇️""",
                "cta": "Pide Ahora",
                "objetivo_facebook": "TRAFFIC",
                "presupuesto_sugerido": "S/15-25/día",
                "duracion": "3 días"
            },
            
            "post_2_delivery": {
                "titulo": "🚚 ¿LLEGAMOS A TU ZONA? - DELIVERY DESDE LOS NÍSPEROS",
                "copy_publicitario": """📍 CONSULTA SI LLEGAMOS A TU DIRECCIÓN

🏠 Desde: Los Nísperos Mz.V Lte.1
🎯 Radio de delivery en expansión
⏰ 25-35 minutos garantizado

✅ ZONAS CONFIRMADAS:
• Los Nísperos y alrededores
• Paradero Las Vaquitas zona
• [Consulta otras áreas]

💬 ¿TU ZONA NO APARECE?
¡Escríbenos! Evaluamos nuevas áreas
según la demanda 📈

🚚 GRATIS +S/30 | 📱 WhatsApp ⬇️""",
                "cta": "Consultar Zona",
                "objetivo_facebook": "MESSAGES",
                "presupuesto_sugerido": "S/20-30/día",
                "duracion": "5 días",
                "objetivo_datos": "MAPEAR DEMANDA POR ZONAS"
            },
            
            "post_3_carta": {
                "titulo": "📋 CARTA COMPLETA - PRECIOS QUE TE SORPRENDERÁN",
                "copy_publicitario": """🍗 CARTA GOLLOS CHICKENS 2025

👑 COMBOS ESTRELLA:
🔥 Combo Familiar (8 piezas): S/55
🔥 Combo Doble Alitas: S/30

🎯 ESPECIALIDADES:
• Pechuga Broaster Premium: S/16
• Alitas Especiales (6u): S/20  
• Hamburguesa Especial: S/16
• Salchipapa a la Pobre: S/18

💰 Precios honestos para familias
🚚 Delivery GRATIS +S/30
📍 16 años de experiencia

📱 Pide por WhatsApp ⬇️""",
                "cta": "Ver Carta Completa",
                "objetivo_facebook": "CONVERSIONS",
                "presupuesto_sugerido": "S/25-35/día",
                "duracion": "7 días"
            },
            
            "post_4_oferta": {
                "titulo": "🔥 OFERTA ESPECIAL - COMBO FAMILIAR S/55",
                "copy_publicitario": """🎉 PROMOCIÓN FACEBOOK GOLLOS CHICKENS

🍗 COMBO FAMILIAR COMPLETO:
✅ 8 piezas de pollo broaster
✅ Papas familiares  
✅ Gaseosa 1.5L
✅ Salsas incluidas

💥 TODO POR SOLO S/55
🚚 + DELIVERY GRATIS

📍 Desde Los Nísperos para tu hogar
⏰ 25-35 minutos garantizado
👨‍👩‍👧‍👦 Perfecto para toda la familia

¡OFERTA LIMITADA! 📱 WhatsApp ⬇️""",
                "cta": "Pedir Combo",
                "objetivo_facebook": "CONVERSIONS",
                "presupuesto_sugerido": "S/30-40/día", 
                "duracion": "4 días",
                "urgencia": "OFERTA LIMITADA"
            }
        }
        
        return posts_ads

    def configurar_targeting_geografico(self, radio_km):
        """Configurar targeting geográfico específico"""
        
        targeting_config = {
            "ubicacion_central": {
                "latitud": -11.99,  # Estimada Los Nísperos
                "longitud": -77.08,
                "nombre": "Asociación Los Nísperos, San Martín de Porres"
            },
            
            "radio_targeting": {
                "radio_km": radio_km,
                "tipo": "RADIUS",
                "incluir_areas": [
                    "San Martín de Porres",
                    "Los Olivos",
                    "Independencia", 
                    "Comas (parcial)"
                ]
            },
            
            "demografico": {
                "edad_minima": 25,
                "edad_maxima": 55,
                "genero": "ALL",
                "idiomas": ["Spanish"]
            },
            
            "intereses": [
                "Food delivery",
                "Fried chicken", 
                "Family restaurants",
                "Local business",
                "Fast food"
            ],
            
            "comportamientos": [
                "Frequent online shoppers",
                "Mobile device users",
                "Family-focused consumers"
            ],
            
            "exclusiones": {
                "zonas_lejanas": "Excluir >15km de Lima Centro",
                "demografico": "Menores de 18 años"
            }
        }
        
        return targeting_config

    def calcular_presupuestos(self, radio_km, duracion_dias):
        """Calcular presupuestos según radio y duración"""
        
        # Factores de costo según radio
        factor_radio = {
            5: 1.0,    # Zona base
            8: 1.3,    # 30% más audiencia
            12: 1.6    # 60% más audiencia  
        }
        
        # Presupuesto base por post
        presupuesto_base = {
            "presentacion": 20,
            "delivery_consulta": 25, 
            "carta_completa": 30,
            "oferta_especial": 35
        }
        
        factor = factor_radio.get(radio_km, 1.3)
        
        presupuestos = {}
        total_campana = 0
        
        for tipo, base in presupuesto_base.items():
            presupuesto_diario = base * factor
            presupuesto_total = presupuesto_diario * duracion_dias
            
            presupuestos[tipo] = {
                "diario": f"S/{presupuesto_diario:.0f}",
                "total": f"S/{presupuesto_total:.0f}",
                "duracion": f"{duracion_dias} días"
            }
            
            total_campana += presupuesto_total
        
        presupuestos["total_campana"] = f"S/{total_campana:.0f}"
        presupuestos["costo_por_km"] = f"S/{total_campana/radio_km:.0f} por km"
        
        return presupuestos

    def generar_cronograma_publicacion(self):
        """Generar cronograma optimizado de publicación"""
        
        cronograma = {
            "semana_1": {
                "lunes": "POST 1: Presentación (Lanzamiento)",
                "martes": "POST 1: Continúa",
                "miercoles": "POST 1: Finaliza + POST 2: Delivery inicia",
                "jueves": "POST 2: Delivery continúa",
                "viernes": "POST 2: Delivery continúa", 
                "sabado": "POST 2: Delivery continúa + POST 3: Carta inicia",
                "domingo": "POST 2: Finaliza + POST 3: Carta continúa"
            },
            
            "semana_2": {
                "lunes": "POST 3: Carta continúa",
                "martes": "POST 3: Carta continúa", 
                "miercoles": "POST 3: Carta continúa + POST 4: Oferta inicia",
                "jueves": "POST 3: Carta continúa + POST 4: Oferta continúa",
                "viernes": "POST 3: Carta continúa + POST 4: Oferta continúa",
                "sabado": "POST 3: Finaliza + POST 4: Oferta continúa", 
                "domingo": "POST 4: Oferta finaliza"
            }
        }
        
        return cronograma

    def configurar_metricas_seguimiento(self):
        """Configurar métricas para seguimiento de campaña"""
        
        metricas = {
            "facebook_ads": {
                "alcance": "Personas únicas alcanzadas por zona",
                "impresiones": "Total visualizaciones",
                "ctr": "Click Through Rate (objetivo >2%)",
                "cpc": "Costo por click (objetivo <S/2)",
                "conversiones": "Clicks a WhatsApp"
            },
            
            "whatsapp_tracking": {
                "mensajes_nuevos": "Consultas desde Facebook",
                "consultas_zona": "Ubicaciones que preguntan delivery",
                "conversiones": "Consultas que se vuelven pedidos",
                "zonas_demanda": "Áreas con más consultas"
            },
            
            "analisis_expansion": {
                "zonas_alta_demanda": "Áreas con >10 consultas/semana",
                "zonas_conversion": "Áreas con >30% conversión consulta→pedido",
                "horarios_pico": "Cuándo llegan más mensajes",
                "productos_populares": "Qué más preguntan por zona"
            },
            
            "roi_campana": {
                "inversion_total": "Presupuesto gastado",
                "pedidos_generados": "Ventas directas de Facebook",
                "ticket_promedio": "Valor promedio por pedido",
                "roi_porcentaje": "Retorno sobre inversión"
            }
        }
        
        return metricas

def main():
    """Función principal - Configurar campaña publicitaria"""
    print("🎯 CAMPAÑA PUBLICITARIA GOLLOS CHICKENS")
    print("=" * 50)
    print("📍 Publicidad pagada hiperlocalizada desde Los Nísperos")
    
    campana = CampanaPublicitariaGollos()
    
    # Mostrar opciones de radio
    print(f"\n🎯 OPCIONES DE RADIO DE TARGETING:")
    print("=" * 40)
    
    for tipo, config in campana.opciones_radio.items():
        print(f"\n📊 {tipo.upper()}:")
        print(f"   📏 Radio: {config['km']} km")
        print(f"   🎯 {config['descripcion']}")
        print(f"   👥 Audiencia: {config['audiencia_estimada']}")
    
    # Recomendación
    print(f"\n💡 RECOMENDACIÓN INICIAL:")
    print("🎯 Empezar con MODERADO (8km) por 2 semanas")
    print("📊 Analizar resultados y ajustar")
    
    # Posts publicitarios
    posts = campana.crear_posts_publicitarios()
    
    print(f"\n📱 POSTS PUBLICITARIOS:")
    print("=" * 30)
    
    for i, (key, post) in enumerate(posts.items(), 1):
        print(f"\n{i}. {post['titulo']}")
        print(f"   🎯 Objetivo: {post['objetivo_facebook']}")
        print(f"   💰 Presupuesto: {post['presupuesto_sugerido']}")
        print(f"   ⏰ Duración: {post['duracion']}")
    
    # Presupuestos por radio
    radio_recomendado = 8  # km
    duracion_recomendada = 5  # días promedio
    
    presupuestos = campana.calcular_presupuestos(radio_recomendado, duracion_recomendada)
    
    print(f"\n💰 PRESUPUESTOS (Radio {radio_recomendado}km):")
    print("=" * 35)
    
    for tipo, presu in presupuestos.items():
        if tipo != "total_campana" and tipo != "costo_por_km":
            print(f"📊 {tipo}: {presu['diario']}/día × {presu['duracion']} = {presu['total']}")
    
    print(f"\n🏆 TOTAL CAMPAÑA: {presupuestos['total_campana']}")
    print(f"📏 {presupuestos['costo_por_km']}")
    
    # Cronograma
    cronograma = campana.generar_cronograma_publicacion()
    
    print(f"\n📅 CRONOGRAMA RECOMENDADO:")
    print("=" * 30)
    print("🚀 SEMANA 1: Presentación + Mapeo zonas")
    print("📊 SEMANA 2: Carta + Ofertas")
    
    # Métricas de seguimiento
    metricas = campana.configurar_metricas_seguimiento()
    
    print(f"\n📈 MÉTRICAS CLAVE A TRACKEAR:")
    print("=" * 35)
    print("📱 Facebook: Alcance, CTR, CPC")
    print("💬 WhatsApp: Consultas por zona")
    print("💰 ROI: Conversión consulta→pedido")
    print("🗺️ Expansión: Zonas alta demanda")
    
    print(f"\n🎯 ¿LISTO PARA LANZAR LA CAMPAÑA REY?")
    print("💰 Inversión recomendada: S/400-600 total")
    print("🎯 ROI esperado: 200-300% en 30 días")
    print("📊 Datos valiosos para expansión futura")

if __name__ == "__main__":
    main()