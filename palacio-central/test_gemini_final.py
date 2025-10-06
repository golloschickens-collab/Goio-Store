import os
import google.generativeai as genai

# Configurar API key
genai.configure(api_key="AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU")

# Probar con modelo más reciente disponible
print("🚀 Probando con modelo Gemini 2.5 Flash...")
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("¡Hola Mi Rey! Confirma que la API de Gemini está funcionando perfectamente para tus agentes imperiales.")
    print(f"✅ ÉXITO: {response.text}")
    print("\n🎊 ¡API KEY CONFIRMADA Y FUNCIONANDO!")
    print("🤖 Los agentes imperiales están listos para generar riqueza 24/7")
except Exception as e:
    print(f"❌ Error: {e}")