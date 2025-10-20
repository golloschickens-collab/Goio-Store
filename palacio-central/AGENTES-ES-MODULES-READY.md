# ✅ AGENTES ELITE - CONVERSIÓN A ES MODULES COMPLETADA

## 🔧 CAMBIOS APLICADOS

Se convirtieron todos los agentes de **CommonJS** (`require`) a **ES Modules** (`import/export`) para compatibilidad con `"type": "module"` en package.json.

### Archivos modificados:
1. ✅ `agents/store-perfection-master.js`
2. ✅ `agents/product-description-writer.js`
3. ✅ `agents/image-optimizer.js`
4. ✅ `agents/trust-builder.js`
5. ✅ `agents/store-auto-fixer.js`

### Dependencias agregadas:
- ✅ `dotenv` (para cargar .env)

---

## 🚀 COMANDOS DISPONIBLES

```powershell
# Auditoría completa (solo analiza, no modifica)
npm run elite:audit

# Optimizar descripciones automáticamente
npm run elite:descriptions

# Optimizar imágenes (genera ALT text)
npm run elite:images

# Construir confianza (genera políticas)
npm run elite:trust

# FIX COMPLETO AUTOMÁTICO (los 4 agentes)
npm run elite:fix-all
```

---

## 📋 VERIFICAR QUE TODO FUNCIONA

### 1. Verificar .env existe
```powershell
cat .env
```

Debe contener MÍNIMO:
```env
SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
GEMINI_API_KEY=AIzaSyxxxxx
```

### 2. Ejecutar auditoría de prueba
```powershell
npm run elite:audit
```

**Resultado esperado:**
- ✅ Se conecta a Shopify
- ✅ Obtiene productos
- ✅ Genera score 0-100
- ✅ Crea reporte en `reports/store-perfection/`

### 3. Ver reporte generado
```powershell
ls reports/store-perfection/
cat reports/store-perfection/audit-*.json | ConvertFrom-Json | Select score_general, estado
```

---

## 🔥 EJECUTAR FIX COMPLETO

Una vez que la auditoría funcione:

```powershell
npm run elite:fix-all
```

**Esto ejecutará:**
1. Auditoría inicial (score base)
2. Mejorar descripciones con IA
3. Generar ALT text para imágenes
4. Crear políticas de confianza
5. Auditoría final (score mejorado)

**Tiempo:** 8-10 minutos  
**Mejora esperada:** +15 a +30 puntos

---

## ❓ TROUBLESHOOTING

### Error: "Cannot find module"
```powershell
npm install
```

### Error: "SHOPIFY_ACCESS_TOKEN is undefined"
Verifica que `.env` existe y tiene las variables correctas.

### Error: "fetch failed" o "ECONNREFUSED"
- Verifica conexión a internet
- Verifica que el token de Shopify sea válido
- Verifica que la URL de Shopify sea correcta

### Gemini API error
Verifica que `GEMINI_API_KEY` en `.env` sea válida.  
Obtén una gratis en: https://makersuite.google.com/app/apikey

---

## 📊 SIGUIENTE PASO

Si `npm run elite:audit` funciona correctamente:

```powershell
npm run elite:fix-all
```

Y espera 10 minutos para tener tu tienda optimizada. 🏆
