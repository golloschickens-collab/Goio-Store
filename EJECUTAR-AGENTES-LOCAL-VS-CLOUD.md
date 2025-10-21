# 🤖 EJECUTAR AGENTES ELITE: Local vs Cloud

## ⚠️ IMPORTANTE: Estás confundiendo entornos

Cuando ves estos errores en Cloud Shell:
```
-bash: cd: palacio-central: No such file or directory
-bash: cd: c:\Goio mayordomo\palacio-central: No such file or directory
```

**Significa que estás intentando ejecutar comandos de WINDOWS en LINUX.**

---

## 🎯 SOLUCIÓN CORRECTA

### OPCIÓN 1: 🔥 EJECUTAR EN LOCAL (RECOMENDADO)

Los agentes ELITE están diseñados para correr **en tu PC Windows**.

#### ✅ En tu PowerShell local:

```powershell
# 1. Abrir PowerShell en Windows
# (Presiona Win + X → Windows PowerShell)

# 2. Navegar a tu proyecto
cd "C:\Goio mayordomo\palacio-central"

# 3. Verificar que estás en el lugar correcto
pwd
# Debe mostrar: C:\Goio mayordomo\palacio-central

# 4. Instalar dependencias (solo primera vez)
npm install

# 5. Verificar .env existe
ls .env
# Si no existe, créalo:
# notepad .env

# 6. EJECUTAR AGENTES
npm run elite:fix-all
```

**Contenido mínimo .env:**
```env
SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_tu_token_aqui
GEMINI_API_KEY=AIzaSy_tu_api_key_aqui
```

---

### OPCIÓN 2: ⚡ EJECUTAR EN CLOUD SHELL

Si prefieres Cloud Shell (no recomendado para desarrollo):

#### En Google Cloud Shell:

```bash
# 1. Clonar repositorio
cd ~
git clone https://github.com/golloschickens-collab/Goio-Store.git
cd Goio-Store/palacio-central

# 2. Instalar dependencias
npm install

# 3. Crear .env
nano .env
# Pegar:
# SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com
# SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
# GEMINI_API_KEY=AIzaSyxxxxx
# Guardar: Ctrl+O, Enter, Ctrl+X

# 4. Ejecutar agentes
npm run elite:audit        # Solo auditar
npm run elite:fix-all      # Fix completo
```

---

## 🤔 ¿LOCAL O CLOUD?

### ✅ EJECUTAR EN LOCAL si:
- Estás desarrollando/testeando
- Quieres ver reportes inmediatamente
- Tienes buena conexión internet
- Prefieres control total

**Ventajas:**
- ✅ Más rápido (sin latencia cloud)
- ✅ Reportes en tu PC
- ✅ Gratis (no usa créditos Cloud)
- ✅ Debugging más fácil

### ☁️ EJECUTAR EN CLOUD si:
- Quieres automatización 24/7
- Ya tienes el servicio desplegado
- Necesitas ejecución programada
- Prefieres centralización

**Ventajas:**
- ✅ Siempre disponible
- ✅ No depende de tu PC
- ✅ Se integra con Cloud Scheduler
- ✅ Logs centralizados

---

## 🎯 RECOMENDACIÓN PARA TI

### AHORA (Desarrollo):
**Ejecuta en LOCAL (tu PC Windows)**

```powershell
cd "C:\Goio mayordomo\palacio-central"
npm install
npm run elite:fix-all
```

**Tiempo:** 10 minutos  
**Resultado:** Tienda optimizada + reportes en `reports/`

### DESPUÉS (Producción):
**Sube a Cloud para automatización 24/7**

Cuando ya tengas todo funcionando en local, puedes:
1. Hacer commit de los agentes
2. Push a GitHub
3. Deploy a Cloud Run
4. Programar con Cloud Scheduler

---

## 📋 CHECKLIST: ¿Dónde ejecutar?

### Estoy en Cloud Shell si veo:
```
golloschickens@cloudshell:~$
```

### Estoy en PowerShell local si veo:
```
PS C:\Goio mayordomo\palacio-central>
```

---

## 🔧 COMANDO CORRECTO SEGÚN ENTORNO

### En Cloud Shell (Linux):
```bash
cd ~/Goio-Store/palacio-central  # Ruta Linux
npm run elite:fix-all
```

### En PowerShell local (Windows):
```powershell
cd "C:\Goio mayordomo\palacio-central"  # Ruta Windows
npm run elite:fix-all
```

---

## ⚡ EJECUTAR AHORA (LOCAL)

Copia y pega esto en **PowerShell de Windows**:

```powershell
# Navegar a palacio-central
Set-Location "C:\Goio mayordomo\palacio-central"

# Verificar ubicación
Get-Location

# Instalar dependencias
npm install

# Verificar .env existe
if (Test-Path .env) {
    Write-Host "✅ .env encontrado" -ForegroundColor Green
    Get-Content .env | Select-String "SHOPIFY|GEMINI"
} else {
    Write-Host "❌ .env no encontrado" -ForegroundColor Red
    Write-Host "Créalo con: notepad .env" -ForegroundColor Yellow
}

# Ejecutar agentes
npm run elite:fix-all
```

---

## 🚨 ERROR COMÚN

**NO hagas esto en Cloud Shell:**
```bash
cd "c:\Goio mayordomo\palacio-central"  # ❌ Ruta Windows en Linux
```

**Tampoco esto en PowerShell:**
```powershell
cd ~/Goio-Store/palacio-central  # ❌ Ruta Linux en Windows
```

---

## ✅ SOLUCIÓN INMEDIATA

### 1️⃣ Abre PowerShell en tu PC Windows
- Win + X → Windows PowerShell

### 2️⃣ Ejecuta:
```powershell
cd "C:\Goio mayordomo\palacio-central"
npm install
npm run elite:fix-all
```

### 3️⃣ Espera 10 minutos

### 4️⃣ Lee el reporte:
```powershell
Get-Content reports\auto-fix\fix-report-*.md | Select-Object -Last 50
```

---

## 💡 TIP FINAL

**Cloud Shell es para:**
- Desplegar servicios (Cloud Run)
- Configurar infraestructura
- Ejecutar gcloud commands

**PowerShell local es para:**
- Desarrollo
- Testing
- Ejecutar agentes ELITE
- Ver resultados inmediatos

**Usa AMBOS:**
- Desarrolla en local 💻
- Despliega a cloud ☁️
- Automatiza con Scheduler ⏰

---

## 🎯 TU PRÓXIMO PASO

**Cierra Cloud Shell y abre PowerShell local:**

```powershell
cd "C:\Goio mayordomo\palacio-central"
npm run elite:fix-all
```

**¡Ejecuta los agentes en 10 minutos y tendrás tu tienda optimizada!** 🚀
