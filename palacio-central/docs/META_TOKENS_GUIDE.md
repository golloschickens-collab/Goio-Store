# 🔐 GUÍA COMPLETA: OBTENER TOKENS DE META (Facebook/Instagram)

**Última actualización:** 17 de octubre de 2025  
**Tiempo estimado:** 5-10 minutos  
**Nivel:** Principiante - No requiere conocimientos técnicos

---

## 📋 OPCIÓN 1: Método Rápido Visual (Recomendado)

### ✅ Pre-requisitos
- [ ] Cuenta de Facebook personal
- [ ] Página de Facebook creada (negocio)
- [ ] Cuenta de Instagram profesional/empresa conectada a la página

---

### 🎯 PASO A PASO CON CAPTURAS

#### **PASO 1: Crear/Seleccionar App en Meta Developers**

1. **Accede a:** https://developers.facebook.com/apps/
   
2. **Si NO tienes apps creadas:**
   - Click en **"Create App"** (botón verde)
   - Selecciona **"Business"** → Click **"Next"**
   - Nombre: `Goio Marketing Automation`
   - Email de contacto: tu email
   - Click **"Create App"**
   - **IMPORTANTE:** Guarda el **App ID** y **App Secret** (Settings → Basic)

3. **Si YA tienes apps:**
   - Selecciona la que usarás (preferiblemente la más reciente)
   - Anota el nombre y App ID

---

#### **PASO 2: Agregar Productos Necesarios**

En el dashboard de tu app:

1. Click en **"Add Product"** (panel izquierdo)
2. Busca **"Facebook Login"** → Click **"Set Up"**
3. Busca **"Instagram Graph API"** → Click **"Set Up"**
4. (Opcional) Busca **"Instagram Basic Display"** → Click **"Set Up"**

---

#### **PASO 3: Generar Access Token**

1. **Abre Graph API Explorer:**
   - URL: https://developers.facebook.com/tools/explorer/
   - O desde tu app: Tools → Graph API Explorer

2. **Configurar:**
   - **Meta App:** Selecciona tu app (dropdown arriba)
   - **User or Page:** Click en **"Get User Access Token"**

3. **Seleccionar Permisos (IMPORTANTE):**
   
   Marca estos checkboxes:
   ```
   ☑️ pages_show_list          (Ver lista de páginas)
   ☑️ pages_manage_posts        (Publicar en página)
   ☑️ pages_read_engagement     (Ver métricas)
   ☑️ instagram_basic           (Datos básicos IG)
   ☑️ instagram_content_publish (Publicar en IG)
   ☑️ publish_video             (Publicar videos)
   ```

4. **Generar Token:**
   - Click **"Generate Access Token"**
   - Popup: Selecciona tu **página de Facebook**
   - Click **"OK"** o **"Continue"**
   - Aparece popup de permisos → Click **"Continue as [Tu Nombre]"**

5. **COPIAR TOKEN:**
   - En el campo "Access Token" aparece un texto largo (empieza con `EAAA...`)
   - Click en el ícono de **copiar** o selecciona todo y Ctrl+C
   - **GUÁRDALO TEMPORALMENTE** en un bloc de notas

---

#### **PASO 4: Obtener Page ID**

**Método A: Con curl (en Cloud Shell)**

```bash
# Reemplaza TU_TOKEN con el token copiado
curl "https://graph.facebook.com/v18.0/me/accounts?access_token=TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "access_token": "EAAxxxxx...",
      "category": "Brand",
      "id": "123456789012345",  ← ESTE ES TU PAGE_ID
      "name": "Nombre de Tu Página"
    }
  ]
}
```

**Método B: Visual (sin comandos)**

1. Ve a tu página de Facebook
2. Click en **"About"** (Acerca de)
3. Scroll hasta el final
4. Busca **"Page ID"** - es un número largo

---

#### **PASO 5: Obtener Instagram Account ID**

**Con el PAGE_ID del paso anterior:**

```bash
# Reemplaza PAGE_ID y TU_TOKEN
curl "https://graph.facebook.com/v18.0/PAGE_ID?fields=instagram_business_account&access_token=TU_TOKEN"
```

**Respuesta esperada:**
```json
{
  "instagram_business_account": {
    "id": "17841400000000000"  ← ESTE ES TU INSTAGRAM_ACCOUNT_ID
  },
  "id": "123456789012345"
}
```

**Si aparece error "instagram_business_account not found":**
- Tu Instagram NO está conectado como Business a la página
- Ve a Configuración de Página → Instagram → Conectar cuenta
- Cambia Instagram a "Professional/Business" (en app de Instagram)

---

#### **PASO 6: Extender Token a Long-Lived (60 días)**

**IMPORTANTE:** Los tokens generados duran solo 1-2 horas. Necesitas extenderlos:

```bash
# Reemplaza APP_ID, APP_SECRET y SHORT_TOKEN
curl -G "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d grant_type=fb_exchange_token \
  -d client_id=APP_ID \
  -d client_secret=APP_SECRET \
  -d fb_exchange_token=SHORT_TOKEN
```

**Respuesta:**
```json
{
  "access_token": "EAAxxxxxxxxxxxxx",  ← ESTE ES EL LONG-LIVED TOKEN
  "token_type": "bearer",
  "expires_in": 5183944  ← ~60 días
}
```

**Usa ESTE token (long-lived) en los siguientes pasos.**

---

#### **PASO 7: Validar Tokens**

**Test Facebook:**
```bash
curl "https://graph.facebook.com/v18.0/PAGE_ID?fields=name,username&access_token=LONG_LIVED_TOKEN"
```

**Test Instagram:**
```bash
curl "https://graph.facebook.com/v18.0/INSTAGRAM_ID?fields=username,profile_picture_url&access_token=LONG_LIVED_TOKEN"
```

Si ambos responden con datos, ¡los tokens funcionan! ✅

---

## 📝 RESUMEN DE TOKENS OBTENIDOS

Al final deberías tener:

```
✅ FACEBOOK_ACCESS_TOKEN (long-lived):  EAAxxxxxxxxxxxxxxxxx
✅ FACEBOOK_PAGE_ID:                    123456789012345
✅ INSTAGRAM_ACCOUNT_ID:                17841400000000000
✅ INSTAGRAM_ACCESS_TOKEN:              EAAxxxxxxxxxxxxxxxxx (mismo que Facebook)
```

---

## 🚀 CONFIGURAR EN GCP SECRET MANAGER

### **OPCIÓN A: Script Automatizado**

En Cloud Shell:
```bash
cd ~/Goio-Store/palacio-central
bash scripts/gcp/configure-meta-tokens.sh
```

### **OPCIÓN B: Manual (Comandos)**

```bash
# 1. Crear/actualizar secrets
echo -n "TU_TOKEN_LONG_LIVED" | gcloud secrets create META_ACCESS_TOKEN --data-file=-
echo -n "TU_PAGE_ID" | gcloud secrets create FACEBOOK_PAGE_1_ID --data-file=-
echo -n "TU_INSTAGRAM_ID" | gcloud secrets create INSTAGRAM_ACCOUNT_ID --data-file=-
echo -n "TU_TOKEN_LONG_LIVED" | gcloud secrets create INSTAGRAM_TOKEN --data-file=-

# 2. Verificar
gcloud secrets list --filter="name~META OR name~FACEBOOK OR name~INSTAGRAM"

# 3. Re-deploy con nuevos tokens
cd ~/Goio-Store/palacio-central
bash scripts/gcp/deploy-palacio.sh
```

---

## ❓ SOLUCIÓN DE PROBLEMAS

### **Error: "App not set up for Instagram"**
**Solución:**
1. Ve a tu app en developers.facebook.com
2. Add Product → Instagram Graph API → Set Up
3. Settings → Basic → Add platform → Website → URL: https://tudominio.com
4. Modo de desarrollo → Switch to Live (si está listo)

### **Error: "Instagram account not connected"**
**Solución:**
1. Abre tu página de Facebook (escritorio)
2. Settings → Instagram → Connect Account
3. En app de Instagram: Profile → Settings → Account → Switch to Professional Account

### **Error: "Token expired"**
**Solución:**
- Los tokens duran 60 días
- Repite PASO 6 para generar nuevo long-lived token
- Considera configurar un servidor para auto-refresh (próxima fase)

### **Error: "Permissions not granted"**
**Solución:**
1. Ve a Graph API Explorer
2. User Access Token → Click "Get User Access Token"
3. Marca TODOS los permisos necesarios
4. Regenera token

---

## 🎯 PRÓXIMOS PASOS

Una vez configurados los tokens:

1. **Verificar integración:**
   ```bash
   gcloud run services logs tail palacio-central --region=us-central1 | grep "Publisher"
   ```

2. **Publicar primer post de prueba:**
   ```bash
   curl -X POST https://palacio-central-416927190535.us-central1.run.app/api/test/publish \
     -H "Content-Type: application/json" \
     -d '{"platform":"facebook","message":"🎉 Test desde Cloud Run"}'
   ```

3. **Activar publicaciones automáticas:** Ya funciona con el scheduler cada 6 horas

---

## 📚 RECURSOS ADICIONALES

- **Meta Developers:** https://developers.facebook.com/
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Instagram API Docs:** https://developers.facebook.com/docs/instagram-api
- **Token Debugger:** https://developers.facebook.com/tools/debug/accesstoken/

---

## 🆘 ¿NECESITAS AYUDA?

Si después de seguir esta guía tienes problemas:

1. **Copia el error exacto** que aparece
2. **Indica en qué paso estás** (1-7)
3. **Pega la respuesta** que obtuviste (sin mostrar tokens completos)
4. Pégalo en el chat y te ayudo a resolverlo

---

**✅ Checklist Final:**
- [ ] App creada en Meta Developers
- [ ] Productos agregados (Facebook Login + Instagram API)
- [ ] Token long-lived generado (60 días)
- [ ] PAGE_ID obtenido
- [ ] INSTAGRAM_ID obtenido
- [ ] Tokens validados con curl
- [ ] Secrets creados en GCP
- [ ] Cloud Run re-deployed
- [ ] Primer post de prueba publicado

**¡Cuando completes todo, tendrás marketing automation completo!** 🚀
