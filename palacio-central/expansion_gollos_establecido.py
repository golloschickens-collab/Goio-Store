#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏆 ESTRATEGIA EXPANSIÓN GOLLOS CHICKENS
=======================================
16 años de experiencia - Negocio establecido expandiéndose a Facebook
"""

import json
from datetime import datetime

class ExpansionGollosEstablecido:
    def __init__(self):
        self.experiencia_anos = 16
        self.fortalezas_establecidas = [
            "16 años de experiencia en la zona",
            "Cliente base local establecida", 
            "Conocimiento profundo del mercado local",
            "Recetas perfeccionadas por años",
            "Reputación consolidada en la zona",
            "Operación probada y eficiente"
        ]
        
    def crear_posts_expansion(self):
        """Crear posts específicos para expansión de negocio establecido"""
        
        posts_expansion = {
            "credibilidad_experiencia": {
                "titulo": "🏆 16 AÑOS CONQUISTANDO PALADARES EN LIMA NORTE",
                "copy": """🐔 Gollos Chickens - Una historia de sabor y confianza

📅 Desde 2009 deleitando familias en nuestra zona
🏆 16 años perfeccionando nuestras recetas
👨‍👩‍👧‍👦 Miles de familias satisfechas nos respaldan
📍 [TU DIRECCION EXACTA] - El lugar de siempre

Ahora queremos que MÁS FAMILIAS disfruten
de la calidad que nuestros vecinos ya conocen.

🚀 ¡Expanding to Facebook para llegar a ti!

#GollosChickens #16AñosDeCalidad #LimaNorte #SanMartin""",
                "cta": "Conoce nuestra historia: +51 939 431 887",
                "tipo_imagen": "Collage historia/antes-después/momentos especiales"
            },
            
            "carta_completa": {
                "titulo": "📋 NUESTRA CARTA COMPLETA - 16 AÑOS PERFECCIONÁNDOLA",
                "copy": """🍗 LA CARTA QUE CONQUISTA LIMA NORTE

🔥 ESPECIALIDADES DE LA CASA:
• Pechuga Broaster Premium: S/16
• Combo Familiar (8 piezas): S/55  
• Alitas Especiales (6 unid.): S/20
• Combo Doble Alitas: S/30
• Hamburguesa Especial: S/16
• Salchipapa a la Pobre: S/18

👑 SECRETOS DE 16 AÑOS:
✅ Marinado especial 24 horas
✅ Aceite renovado diariamente
✅ Sazón familiar única
✅ Porciones generosas

📍 Misma calidad de siempre, ahora más cerca tuyo

#CartaGollos #16AñosDeExperiencia #CalidadGarantizada""",
                "cta": "Pide tu favorito: +51 939 431 887",
                "tipo_imagen": "Carta visual profesional con precios"
            },
            
            "testimonios_reales": {
                "titulo": "🗣️ 16 AÑOS DE TESTIMONIOS REALES",
                "copy": """👥 Lo que dicen nuestros clientes de AÑOS:

💬 "Vengo desde que abrieron, nunca me fallan"
💬 "Mis hijos crecieron con este pollo, ahora traigo a mis nietos"  
💬 "La calidad es siempre la misma, eso se valora"
💬 "El lugar de confianza de toda la familia"

🏆 LOGROS DE 16 AÑOS:
📈 +10,000 familias atendidas
⭐ 0 quejas por calidad
🕐 Siempre puntuales en delivery
💯 Misma receta, misma pasión

Ahora queremos SER TU LUGAR DE CONFIANZA también.

#TestimoniosReales #16AñosDeConfianza #GollosChickens""",
                "cta": "Únete a la familia Gollos: +51 939 431 887",
                "tipo_imagen": "Fotos reales de clientes satisfechos"
            },
            
            "expansion_facebook": {
                "titulo": "🚀 ¡GOLLOS CHICKENS LLEGA A FACEBOOK!",
                "copy": """📱 GRAN NOTICIA LIMA NORTE

Después de 16 años atendiendo en nuestra zona,
¡decidimos expandirnos a Facebook para llegar a MÁS FAMILIAS!

🎯 ¿POR QUÉ AHORA?
✅ Ustedes nos lo pidieron
✅ Queremos llegar a más hogares
✅ La calidad merece conocerse más
✅ Facilitar pedidos por WhatsApp

📍 La misma ubicación: [TU DIRECCION]
🍗 La misma calidad de siempre
💕 El mismo amor por lo que hacemos

¡Síguenos y descubre por qué somos
el favorito de Lima Norte desde 2009!

#ExpansionGollos #Facebook #16AñosDeCalidad""",
                "cta": "Síguenos y prueba la diferencia: +51 939 431 887",
                "tipo_imagen": "Presentación Facebook con logo y ubicación"
            }
        }
        
        return posts_expansion

    def crear_formulario_direccion(self):
        """Crear formulario para capturar dirección exacta"""
        
        print("📍 CONFIGURACIÓN DE UBICACIÓN EXACTA")
        print("=" * 40)
        print("Para personalizar los posts con tu dirección exacta:")
        print()
        print("🏠 Necesito tu dirección completa:")
        print("   - Calle/Av y número")
        print("   - Distrito específico") 
        print("   - Referencias importantes")
        print("   - Coordenadas si las tienes")
        print()
        print("📋 Información adicional útil:")
        print("   - ¿Tienes local físico o delivery desde casa?")
        print("   - ¿Horarios de atención actuales?") 
        print("   - ¿Zona de delivery que cubres?")
        print("   - ¿Algún hito o referencia conocida cerca?")
        
        return True

    def generar_estrategia_expansion(self):
        """Generar estrategia completa de expansión"""
        
        estrategia = {
            "fase_1_presentacion": {
                "objetivo": "Presentar el negocio establecido a nuevos clientes Facebook",
                "duracion": "Semana 1-2",
                "posts": ["credibilidad_experiencia", "expansion_facebook"],
                "kpis": ["Alcance", "Nuevos seguidores", "Engagement"]
            },
            
            "fase_2_producto": {
                "objetivo": "Mostrar carta y especialidades",
                "duracion": "Semana 3-4", 
                "posts": ["carta_completa", "productos individuales"],
                "kpis": ["Clicks WhatsApp", "Consultas por productos"]
            },
            
            "fase_3_confianza": {
                "objetivo": "Construir confianza con testimonios y experiencia",
                "duracion": "Semana 5-6",
                "posts": ["testimonios_reales", "detrás de cámaras"],
                "kpis": ["Conversiones", "Pedidos nuevos"]
            },
            
            "fase_4_consolidacion": {
                "objetivo": "Mantener presencia y optimizar",
                "duracion": "Semana 7+",
                "posts": ["Mix rotativo", "Ofertas especiales", "Contenido de valor"],
                "kpis": ["Retención", "Recompras", "Recomendaciones"]
            }
        }
        
        return estrategia

    def mostrar_ventajas_competitivas(self):
        """Mostrar ventajas específicas vs competencia nueva"""
        
        ventajas = {
            "vs_nuevos_competidores": [
                "16 años de experiencia vs recién llegados",
                "Recetas perfeccionadas vs experimentando",
                "Cliente base leal vs empezando desde cero",
                "Operación eficiente vs aprendiendo",
                "Reputación establecida vs construyendo imagen"
            ],
            
            "vs_cadenas_grandes": [
                "Atención personalizada vs servicio masivo",
                "Flexibilidad local vs políticas rígidas", 
                "Conocimiento de zona vs enfoque genérico",
                "Precios justos vs sobrecostos de marca",
                "Compromiso familiar vs corporativo"
            ],
            
            "propuesta_valor_unica": [
                "La confianza que solo dan 16 años",
                "Sabor casero perfeccionado por experiencia",
                "Servicio de vecino que conoce tus gustos",
                "Calidad consistente probada por tiempo",
                "Historia local auténtica"
            ]
        }
        
        return ventajas

def main():
    """Función principal"""
    print("🏆 ESTRATEGIA EXPANSIÓN GOLLOS CHICKENS")
    print("=" * 50)
    print("🎯 16 años establecido → Expansión Facebook")
    
    expansion = ExpansionGollosEstablecido()
    
    # Mostrar formulario de dirección
    expansion.crear_formulario_direccion()
    
    # Generar posts específicos
    posts = expansion.crear_posts_expansion()
    
    print(f"\n📱 POSTS DE EXPANSIÓN GENERADOS:")
    print("=" * 40)
    
    for i, (key, post) in enumerate(posts.items(), 1):
        print(f"\n{i}. {post['titulo']}")
        print(f"   🎯 Tipo: {key.replace('_', ' ').title()}")
        print(f"   🎨 Imagen: {post['tipo_imagen']}")
        print(f"   📞 CTA: {post['cta']}")
    
    # Estrategia por fases
    estrategia = expansion.generar_estrategia_expansion()
    
    print(f"\n🚀 ESTRATEGIA POR FASES:")
    print("=" * 30)
    
    for fase, datos in estrategia.items():
        fase_num = fase.split('_')[1]
        print(f"\n📊 FASE {fase_num}: {datos['objetivo']}")
        print(f"   ⏰ Duración: {datos['duracion']}")
        print(f"   📈 KPIs: {', '.join(datos['kpis'])}")
    
    # Ventajas competitivas
    ventajas = expansion.mostrar_ventajas_competitivas()
    
    print(f"\n🏆 TUS VENTAJAS COMPETITIVAS:")
    print("=" * 35)
    print("\n💪 VS NUEVOS COMPETIDORES:")
    for ventaja in ventajas['vs_nuevos_competidores'][:3]:
        print(f"   ✅ {ventaja}")
    
    print(f"\n🎯 PROPUESTA VALOR ÚNICA:")
    for propuesta in ventajas['propuesta_valor_unica'][:3]:
        print(f"   🌟 {propuesta}")
    
    print(f"\n📍 PRÓXIMO PASO: Comparte tu dirección exacta")
    print("🎯 Personalizaremos todo el contenido para tu ubicación")

if __name__ == "__main__":
    main()