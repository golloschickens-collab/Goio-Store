# =============================================
# 🔑 INSTRUCCIONES RÁPIDAS: GEMINI API KEY
# =============================================

## 🎯 **PASOS PARA OBTENER NUEVA API KEY (5 MINUTOS):**

### **1. 🌐 IR AL SITIO OFICIAL:**
👉 **LINK DIRECTO:** https://makersuite.google.com/app/apikey

### **2. 🔐 CREAR/USAR CUENTA GOOGLE:**
- Usar su cuenta Gmail personal o crear nueva
- NO requiere tarjeta de crédito
- ✅ GRATIS hasta 60 requests por minuto

### **3. 📝 GENERAR API KEY:**
- Click "Create API Key"  
- Select "Create API key in new project"
- Copiar la key (empieza con AIza...)

### **4. ⚡ CONFIGURAR EN SU SISTEMA:**
**OPCIÓN A - Archivo Config (RECOMENDADO):**
```bash
# Editar: c:\Goio mayordomo\palacio-central\config\keys.json
{
  "GEMINI_API_KEY": "TU_NUEVA_KEY_AQUI",
  "FACEBOOK_PAGE_ID": "PON_AQUI_PAGE_ID",
  "FACEBOOK_ACCESS_TOKEN": "PON_AQUI_TOKEN_LARGO"
}
```

**OPCIÓN B - Variable Entorno:**
```powershell
# En PowerShell:
$env:GEMINI_API_KEY="TU_NUEVA_KEY_AQUI"
```

**OPCIÓN C - Archivo .env:**
```bash
# Añadir a: c:\Goio mayordomo\palacio-central\.env
GEMINI_API_KEY=TU_NUEVA_KEY_AQUI
```

---

## 🔥 **DESPUÉS DE CONFIGURAR:**

### **✅ PROBAR API KEY:**
```powershell
cd "c:\Goio mayordomo\palacio-central"
$env:GEMINI_API_KEY="TU_NUEVA_KEY"
python test_gemini.py
```

### **🚀 ACTIVAR TODOS LOS AGENTES:**
```powershell
cd "c:\Goio mayordomo\palacio-central"
$env:GEMINI_API_KEY="TU_NUEVA_KEY"
node activate_all_agents.js
```

---

## 💡 **ALTERNATIVAS SI NO FUNCIONA:**

### **🔄 USAR OTRA API DE IA:**
- **OpenAI GPT-4:** https://platform.openai.com/api-keys
- **Anthropic Claude:** https://console.anthropic.com/
- **Local Ollama:** Ya configurado en su sistema

### **🛠️ MODIFICAR AGENTES SIN IA:**
- Product research manual con Google Trends
- Templates de contenido predefinidos
- Automatización básica sin IA generativa

---

## ⚡ **ACCIÓN INMEDIATA RECOMENDADA:**

1. **Abrir:** https://makersuite.google.com/app/apikey
2. **Crear API Key** (5 minutos)
3. **Configurar** en keys.json
4. **Ejecutar:** `node activate_all_agents.js`
5. **¡AGENTES FUNCIONANDO 100%!**

---

**🎊 ¡CON LA API KEY CORRECTA TENDRÁ 13 AGENTES TRABAJANDO 24/7!**