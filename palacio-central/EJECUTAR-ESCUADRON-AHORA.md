# 🔥 ACTIVAR ESCUADRÓN ELITE AHORA

## ⚡ EJECUTAR EN 3 PASOS

### PASO 1: Instalar dependencias (solo la primera vez)

```bash
cd palacio-central
npm install
```

### PASO 2: Configurar variables de entorno

Asegúrate de tener en tu `.env`:

```env
# Shopify (REQUERIDO)
SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu_token_aqui

# Gemini AI (REQUERIDO para IA)
GEMINI_API_KEY=tu_api_key_aqui
```

### PASO 3: Ejecutar

#### Windows PowerShell:
```powershell
.\scripts\ejecutar-escuadron.ps1
```

#### Linux/Mac/Cloud Shell:
```bash
bash scripts/ejecutar-escuadron.sh
```

#### O directamente con Node:
```bash
# Análisis completo (sin cambios)
node agents/store-perfection-master.js

# AUTO-FIX: Aplicar todo automáticamente
node agents/store-auto-fixer.js
```

---

## 🎯 OPCIONES DISPONIBLES

### Opción 1: 🔍 ANÁLISIS COMPLETO
**¿Qué hace?**
- Audita TODA la tienda
- Genera score 0-100
- Identifica issues críticos
- NO hace cambios

**Cuándo usar:** Primera vez, para saber dónde estás

**Tiempo:** 2-3 minutos

---

### Opción 2: 🔧 AUTO-FIX SELECTIVO

#### A) Solo descripciones
```bash
node agents/product-description-writer.js --auto-fix
```
- Reescribe descripciones con IA
- Aplica psicología de venta
- Actualiza en Shopify automáticamente

**Tiempo:** 3-5 minutos  
**Impacto:** +20-30% conversión

#### B) Solo imágenes
```bash
node agents/image-optimizer.js --auto-fix
```
- Genera ALT text para SEO
- Detecta imágenes faltantes
- Sugiere mejoras de calidad

**Tiempo:** 2-3 minutos  
**Impacto:** +10% SEO

#### C) Solo confianza
```bash
node agents/trust-builder.js --auto-generate
```
- Genera políticas legales
- Crea trust signals
- Sugiere elementos de confianza

**Tiempo:** 3-4 minutos  
**Impacto:** +15% conversión

---

### Opción 3: 🔥 MODO AGRESIVO
```bash
node agents/store-auto-fixer.js
```

**¿Qué hace?**
1. Auditoría inicial (score base)
2. Mejorar descripciones (AUTO-FIX)
3. Optimizar imágenes (AUTO-FIX)
4. Construir confianza (AUTO-GENERATE)
5. Auditoría final (score mejorado)

**Tiempo:** 8-10 minutos  
**Mejora esperada:** +15 a +30 puntos en score  
**Impacto:** Tienda lista para vender

⚠️ **ADVERTENCIA:** Aplica cambios sin confirmación. Shopify guarda historial para revertir.

---

## 📊 INTERPRETACIÓN DE RESULTADOS

### Score General
- **90-100:** 🏆 EXCELENTE - Nivel profesional
- **75-89:** ✅ BUENO - Listo para vender
- **60-74:** 🟡 FUNCIONAL - Requiere mejoras
- **40-59:** 🟠 DEFICIENTE - Atención urgente
- **0-39:** 🔴 CRÍTICO - No apto

### Trust Score
- **85+:** 🏆 Confianza máxima
- **70-84:** ✅ Buena confianza
- **50-69:** 🟡 Confianza media
- **30-49:** 🟠 Baja confianza
- **0-29:** 🔴 Confianza crítica

---

## 📁 REPORTES GENERADOS

Todos los reportes se guardan en `reports/`:

```
reports/
├── store-perfection/      # Auditorías generales
├── copywriting/           # Descripciones optimizadas
├── images/                # Análisis de imágenes
├── trust/                 # Score de confianza
└── auto-fix/              # Reportes antes/después
    ├── fix-report-[timestamp].json
    └── fix-report-[timestamp].md  ← LEE ESTE
```

El reporte Markdown (`.md`) tiene:
- Score inicial → final
- Mejoras aplicadas
- Errores (si hubo)
- Siguiente paso recomendado
- Mensaje Candiani 💬

---

## 🔧 TROUBLESHOOTING

### Error: "Cannot find module 'axios'"
```bash
npm install
```

### Error: "Invalid Shopify credentials"
Verifica en `.env`:
```env
SHOPIFY_STORE_URL=https://tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
```

### Error: "Gemini API key not found"
```env
GEMINI_API_KEY=AIzaSy...
```
Obtén una gratis en: https://makersuite.google.com/app/apikey

### Los cambios no se aplican
- Verifica que usaste `--auto-fix` o `--auto-generate`
- Revisa errores en la consola
- Verifica permisos del Shopify token (write_products)

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Día 1 (HOY):
1. ✅ Ejecutar análisis completo
   ```bash
   node agents/store-perfection-master.js
   ```
   
2. ✅ Aplicar auto-fix
   ```bash
   node agents/store-auto-fixer.js
   ```
   
3. ✅ Revisar reportes
   - Leer `reports/auto-fix/fix-report-[último].md`
   - Ver score inicial → final
   
4. ✅ Verificación manual (10 min)
   - Abrir tienda en incógnito
   - Ver 3-4 productos al azar
   - Verificar descripciones se ven bien

### Día 2:
5. ✅ Configurar envíos (si falta)
6. ✅ Test de compra completo
7. ✅ Lanzar tráfico (WhatsApp + redes)

### Día 3-7:
8. ✅ Ejecutar auditoría cada 24h
   ```bash
   node agents/store-perfection-master.js
   ```
9. ✅ Optimizar según nuevos datos
10. ✅ **Alcanzar S/450 en ventas** 🎯

---

## 💬 FILOSOFÍA

> **Candiani diría:**  
> "La perfección es enemiga de la acción. Estos agentes te dan 80% de perfección en 10 minutos.  
> Ese 20% restante lo mejoras con feedback real de clientes.  
> PRIMERO vende, DESPUÉS perfecciona."

**Los agentes NO reemplazan tu criterio.**  
Revisa lo que generan, ajusta si es necesario, pero **NO te quedes en análisis paralysis**.

---

## 🚀 ¿LISTO?

**Ejecuta AHORA:**

```bash
cd palacio-central
node agents/store-auto-fixer.js
```

⏱️ **10 minutos** → Tienda nivel profesional  
🎯 **Objetivo:** Score 75+ y listo para vender  
💰 **Meta:** S/450 en 7 días

**¡ACTIVA EL ESCUADRÓN!** 🏆
