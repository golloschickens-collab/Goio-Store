import os
import google.generativeai as genai

# Configurar API key directamente
genai.configure(api_key="AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU")

# Listar modelos disponibles
print("🔍 Verificando modelos disponibles...")
try:
    models = genai.list_models()
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ Modelo disponible: {model.name}")
except Exception as e:
    print(f"❌ Error listando modelos: {e}")

# Probar con modelo básico
print("\n🚀 Probando API key con modelo básico...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Di 'Hola, Mi Rey! API funcionando perfectamente'")
    print(f"✅ ÉXITO: {response.text}")
    print("🎊 ¡API KEY FUNCIONANDO CORRECTAMENTE!")
except Exception as e:
    print(f"❌ Error con gemini-1.5-flash: {e}")
    
    # Intentar con otro modelo
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content("Di 'Hola, Mi Rey! API funcionando perfectamente'")
        print(f"✅ ÉXITO con gemini-1.5-pro: {response.text}")
        print("🎊 ¡API KEY FUNCIONANDO CORRECTAMENTE!")
    except Exception as e2:
        print(f"❌ Error con gemini-1.5-pro: {e2}")
        print("⚠️ Verificar que la API key esté activa en Google AI Studio")