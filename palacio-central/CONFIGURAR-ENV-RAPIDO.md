# 🚀 CONFIGURACIÓN RÁPIDA - AGENTES ELITE

## ⚠️ NECESITAS CONFIGURAR .env

Los agentes necesitan credenciales para funcionar. Sigue estos pasos:

### PASO 1: Crear `.env` en palacio-central

```powershell
cd "C:\Goio mayordomo\palacio-central"
Copy-Item ".env.example" ".env"
notepad .env
```

### PASO 2: Configurar variables MÍNIMAS

Edita `.env` y agrega estas líneas al PRINCIPIO:

```env
# AGENTES ELITE - CONFIGURACIÓN MÍNIMA
SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com
SHOPIFY_ACCESS_TOKEN=TU_TOKEN_AQUI
GEMINI_API_KEY=TU_API_KEY_AQUI
```

---

## 🔑 OBTENER CREDENCIALES

### Shopify Access Token

1. Ir a: https://admin.shopify.com/store/goio-store-gollos/settings/apps/development
2. Click "Create an app"
3. Nombre: "Agentes ELITE"
4. Click "Create app"
5. Tab "API credentials"
6. Click "Install app"
7. Configurar permisos:
   - `read_products`
   - `write_products`
   - `read_content`
   - `write_content`
8. Copiar "Admin API access token"
9. Pegar en `.env` como `SHOPIFY_ACCESS_TOKEN=`

### Gemini API Key (GRATIS)

1. Ir a: https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copiar la key
4. Pegar en `.env` como `GEMINI_API_KEY=`

---

## ✅ VERIFICAR CONFIGURACIÓN

```powershell
cd "C:\Goio mayordomo\palacio-central"

# Ver si .env existe
cat .env | Select-String "SHOPIFY|GEMINI"

# Debe mostrar:
# SHOPIFY_STORE_URL=https://goio-store-gollos.myshopify.com
# SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
# GEMINI_API_KEY=AIzaSyxxxxx
```

---

## 🚀 EJECUTAR AGENTES

Una vez configurado `.env`:

```powershell
# Auditoría (solo analiza)
npm run elite:audit

# Fix completo (optimiza TODO)
npm run elite:fix-all
```

---

## 🔧 TROUBLESHOOTING

### Error: "Cannot find .env"
```powershell
cd "C:\Goio mayordomo\palacio-central"
Copy-Item ".env.example" ".env"
notepad .env
```

### Error: "SHOPIFY_ACCESS_TOKEN is undefined"
Verifica que en `.env` tengas:
```env
SHOPIFY_ACCESS_TOKEN=shpat_tu_token_real_aqui
```

### Error: "Failed to fetch products"
- Token inválido → Regenera en Shopify
- Permisos insuficientes → Asegura `read_products` y `write_products`
- URL incorrecta → Verifica `SHOPIFY_STORE_URL` sin `/admin`

### No me muestra output del comando
Es normal en la primera ejecución. El agente necesita:
1. Conectarse a Shopify
2. Obtener productos
3. Analizar cada uno con Gemini IA
4. Esto puede tomar 2-5 minutos

**Espera pacientemente** y verás el output final con el score.

---

## ⏱️ TIEMPO ESPERADO

- **Auditoría simple:** 2-3 minutos
- **Fix completo:** 8-10 minutos

Si tarda más de 15 minutos, cancela (Ctrl+C) y revisa el error.

---

## 🎯 SIGUIENTE PASO

```powershell
# 1. Configurar .env
notepad "C:\Goio mayordomo\palacio-central\.env"

# 2. Pegar credenciales

# 3. Ejecutar
npm run elite:audit
```

**¡Una vez configurado, tendrás tus agentes listos!** 🤖🏆
