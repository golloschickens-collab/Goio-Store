import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.prod")

# Usar la key directamente o desde variable de entorno
api_key = os.getenv("GEMINI_API_KEY") or "AIzaSyBwyfpgalHaSWRcOYc_aCyuWGPxiTJhHbU"
genai.configure(api_key=api_key)

# Usar modelo correcto disponible
model = genai.GenerativeModel("gemini-pro")
chat = model.start_chat(history=[])

response = chat.send_message("¿Estás activo?")
print("Gemini responde:", response.text)
