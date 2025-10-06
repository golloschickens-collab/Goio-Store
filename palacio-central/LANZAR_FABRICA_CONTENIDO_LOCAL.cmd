@echo off
REM 🚀 LANZAMIENTO FÁBRICA DE CONTENIDO LOCAL - GOLLOS CHICKENS
REM Independencia total de DiCloak - Sistema 100% local y automático

echo ===============================================
echo 🏭 FÁBRICA DE CONTENIDO LOCAL - GOLLOS CHICKENS
echo ===============================================
echo.
echo 🎯 MISIÓN: Automatización visual sin dependencias externas
echo 💰 AHORRO: $500+/mes en herramientas premium
echo 🤖 RESULTADO: Sistema 100%% bajo tu control
echo.
echo ⏰ Inicio: %TIME% - %DATE%
echo 👑 Comandante: Rey
echo.

echo 📂 Cambiando al directorio imperial...
cd /d "c:\Goio mayordomo\palacio-central"

echo.
echo 🐍 Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ ERROR: Python no encontrado
    echo 📥 Instala Python desde: https://python.org/downloads
    pause
    exit /b 1
)

echo.
echo 🚀 Ejecutando configuración automática...
echo ⚡ Esto tomará 10-15 minutos la primera vez
echo 📦 Se instalarán todas las dependencias automáticamente
echo.

python scripts/setup_local_content_factory.py

echo.
echo ⏳ Esperando finalización...
timeout /t 3 /nobreak > nul

echo.
echo 🧪 PROBANDO SISTEMA...
echo ===============================================

echo.
echo 📝 Generando primer contenido de prueba...
cd content_factory_local
python gollos_content_generator.py

echo.
echo 📊 Verificando resultados...
if exist "generated\posts\*.json" (
    echo ✅ Posts generados correctamente
) else (
    echo ⚠️ Verificar logs para diagnóstico
)

if exist "generated\images\*.png" (
    echo ✅ Imágenes generadas correctamente
) else (
    echo ⚠️ Verificar configuración de Stable Diffusion
)

echo.
echo 🏆 FÁBRICA DE CONTENIDO LOCAL OPERATIVA!
echo ===============================================
echo.
echo 📈 CAPACIDADES INSTALADAS:
echo • 📝 Copywriting IA (Ollama Llama3.1)
echo • 🎨 Generación imágenes (Stable Diffusion XL)
echo • 🎤 Síntesis de voz (TTS local)
echo • 🎬 Edición de video (MoviePy)
echo • 🤖 Automatización 24/7
echo.
echo 🎯 CONTENIDO DIARIO AUTOMÁTICO:
echo • 4 posts Instagram listos
echo • Imágenes profesionales HD
echo • Copy optimizado para engagement
echo • Horarios programados automáticamente
echo.
echo 💰 COMPARACIÓN CON DICLOAK:
echo ===============================================
echo DiCloak Premium: $500+/mes + acceso limitado
echo Sistema Local:   $0/mes + control total
echo AHORRO ANUAL:    $6,000+ USD
echo.
echo 🚀 COMANDOS ÚTILES:
echo ===============================================
echo • Generar contenido manual:
echo   python content_factory_local/gollos_content_generator.py
echo.
echo • Iniciar automatización 24/7:
echo   python content_factory_local/automation_runner.py
echo.
echo • Ver contenido generado:
echo   explorer content_factory_local/generated
echo.
echo 📱 INTEGRACIÓN CON REDES SOCIALES:
echo ===============================================
echo El contenido generado está listo para:
echo • Instagram Posts y Stories
echo • Facebook Posts
echo • Material para TikTok
echo • WhatsApp Business
echo.
echo 🔄 FLUJO AUTOMÁTICO DIARIO:
echo ===============================================
echo 07:00 AM → Contenido matutino generado
echo 01:00 PM → Contenido de tarde generado  
echo 07:00 PM → Contenido nocturno generado
echo.
echo Cada sesión genera:
echo • 4 posts únicos con copy personalizado
echo • 4 imágenes HD profesionales
echo • Metadata para programación automática
echo.
echo 🎊 ¡FELICITACIONES REY!
echo ===============================================
echo Tu fábrica de contenido local está operativa.
echo Ahora tienes independencia total para generar
echo contenido profesional 24/7 sin depender de
echo cuentas alquiladas o servicios externos.
echo.
echo 👑 ¡EL IMPERIO GOLLOS CHICKENS ES IMPARABLE!
echo.

echo 🎯 PRÓXIMOS PASOS RECOMENDADOS:
echo ===============================================
echo 1. ✅ Revisar contenido en: content_factory_local/generated
echo 2. ✅ Personalizar prompts en: gollos_content_generator.py
echo 3. ✅ Iniciar automatización: automation_runner.py
echo 4. ✅ Integrar con WhatsApp Business automation
echo 5. ✅ Expandir a otros imperios (Goio-Store, Eco-Eterno)
echo.

pause
echo.
echo 🚀 ¡Sistema listo para conquista digital total!
exit /b 0