import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.prod")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
chat = model.start_chat(history=[])

response = chat.send_message("¿Estás activo?")
print("Gemini responde:", response.text)
