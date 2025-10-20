# ✅ CHECKLIST: GENERAR TOKENS DE META - PASO A PASO VISUAL

**Página:** Goio Store Peru (ID: 61582527568365)  
**App:** IA Content Publisher (ID: 2161243464696662)  
**Fecha:** 18 de octubre de 2025

---

## 📋 ANTES DE EMPEZAR

- [ ] Página "Goio Store Peru" actualizada (categorías y descripción profesional)
- [ ] Sesión activa en Facebook como administrador de la página
- [ ] App "IA Content Publisher" localizada en developers.facebook.com/apps/

---

## 🔑 PASO 1: OBTENER APP SECRET

### Acciones visuales:

1. [ ] Abrir: https://developers.facebook.com/apps/2161243464696662/settings/basic/
2. [ ] Buscar sección "Secreto de la app" o "App Secret"
3. [ ] Click en botón **"Mostrar"** o **"Show"**
4. [ ] Ingresar tu contraseña de Facebook (verificación de seguridad)
5. [ ] **COPIAR** el App Secret (aparece texto alfanumérico largo)
6. [ ] **PEGAR AQUÍ** (temporal, lo borrarás después):
   ```
   APP_SECRET: _________________________________
   ```

---

## 🎯 PASO 2: GRAPH API EXPLORER - GENERAR TOKEN

### Acciones visuales:

1. [ ] Abrir: https://developers.facebook.com/tools/explorer/

2. [ ] **Dropdown "Meta App"** (esquina superior derecha)
   - [ ] Click en el dropdown
   - [ ] Seleccionar: **"IA Content Publisher"**
   - [ ] Verificar que aparece el ID: 2161243464696662

3. [ ] **Dropdown "User or Page"** (al lado de Meta App)
   - [ ] Click en el dropdown
   - [ ] Debe mostrar tu nombre de usuario
   - [ ] Si no, hacer click en "Get User Access Token"

4. [ ] **Generar Token con Permisos**
   - [ ] Click en botón **"Generate Access Token"** o **"Get User Access Token"**
   - [ ] Aparece popup de permisos

5. [ ] **Marcar Permisos (IMPORTANTE - marca TODOS):**
   
   **Buscar en la lista y marcar:**
   - [ ] `pages_show_list`
   - [ ] `pages_read_engagement`
   - [ ] `pages_manage_posts`
   - [ ] `pages_read_user_content`
   - [ ] `pages_manage_metadata`
   - [ ] `instagram_basic`
   - [ ] `instagram_content_publish`
   - [ ] `publish_video`

   **Tip:** Usa Ctrl+F en el popup para buscar cada permiso por nombre

6. [ ] Click en **"Generate Access Token"** (botón del popup)

7. [ ] Popup de selección de página:
   - [ ] Aparece lista de tus páginas
   - [ ] Buscar y seleccionar: **"Goio Store Peru"**
   - [ ] Click en **"Next"** o **"Continue"**

8. [ ] Confirmar permisos:
   - [ ] Aparece resumen de permisos solicitados
   - [ ] Click en **"Done"** o **"OK"**

9. [ ] **COPIAR TOKEN GENERADO:**
   - [ ] En el campo "Access Token" aparece texto largo (EAAA...)
   - [ ] Click en ícono de **copiar** 📋 (al lado del token)
   - [ ] **PEGAR AQUÍ** (temporal):
   ```
   SHORT_TOKEN: _________________________________
   ```

---

## 🔍 PASO 3: OBTENER PAGE_ID

### En Cloud Shell (o PowerShell):

```bash
# Reemplaza TU_TOKEN con el token copiado arriba
curl "https://graph.facebook.com/v18.0/me/accounts?access_token=TU_TOKEN_AQUI"
```

### Resultado esperado:

```json
{
  "data": [
    {
      "access_token": "EAAxxxxx...",
      "id": "61582527568365",  ← CONFIRMAR QUE ES ESTE ID
      "name": "Goio Store Peru"
    }
  ]
}
```

- [ ] Ejecuté el comando
- [ ] Aparece "Goio Store Peru" con ID: 61582527568365
- [ ] **CONFIRMAR PAGE_ID:**
  ```
  PAGE_ID: 61582527568365
  ```

---

## 📸 PASO 4: OBTENER INSTAGRAM_ACCOUNT_ID

### Prerequisito: ¿Instagram Business conectado?

- [ ] **¿Tu Instagram está en modo "Professional" o "Business"?**
  - SÍ → Continuar
  - NO → Ir a app de Instagram → Settings → Account → Switch to Professional Account

- [ ] **¿Instagram conectado a la página de Facebook?**
  - Verificar en: https://www.facebook.com/61582527568365/settings/?tab=instagram
  - Si NO está conectado:
    1. [ ] Click en "Connect Account"
    2. [ ] Ingresar usuario/contraseña de Instagram
    3. [ ] Autorizar conexión

### Obtener Instagram ID:

```bash
# Reemplaza PAGE_ID y TOKEN
curl "https://graph.facebook.com/v18.0/61582527568365?fields=instagram_business_account&access_token=TU_TOKEN"
```

### Resultado esperado:

```json
{
  "instagram_business_account": {
    "id": "17841XXXXXXXXXX"  ← ESTE ES TU INSTAGRAM_ID
  },
  "id": "61582527568365"
}
```

- [ ] Ejecuté el comando
- [ ] Obtuve Instagram Account ID
- [ ] **PEGAR AQUÍ:**
  ```
  INSTAGRAM_ACCOUNT_ID: _________________________________
  ```

**Si aparece error:**
```json
{
  "error": {
    "message": "(#100) No instagram_business_account",
    ...
  }
}
```
→ Instagram NO está conectado como Business. Volver a prerequisitos.

---

## ⏱️ PASO 5: CONVERTIR A LONG-LIVED TOKEN (60 días)

### Comando:

```bash
curl -G "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d grant_type=fb_exchange_token \
  -d client_id=2161243464696662 \
  -d client_secret=TU_APP_SECRET_AQUI \
  -d fb_exchange_token=TU_SHORT_TOKEN_AQUI
```

### Resultado esperado:

```json
{
  "access_token": "EAAxxxxxxxxxxxxxxxxxxxxx",  ← LONG-LIVED TOKEN
  "token_type": "bearer",
  "expires_in": 5183944  ← ~60 días (5184000 segundos)
}
```

- [ ] Ejecuté el comando
- [ ] Obtuve long-lived token
- [ ] **PEGAR AQUÍ:**
  ```
  LONG_LIVED_TOKEN: _________________________________
  ```

---

## ✅ PASO 6: VALIDAR TOKENS

### Test Facebook:

```bash
curl "https://graph.facebook.com/v18.0/61582527568365?fields=name,username&access_token=TU_LONG_LIVED_TOKEN"
```

**Resultado esperado:**
```json
{
  "name": "Goio Store Peru",
  "id": "61582527568365"
}
```

- [ ] ✅ Facebook API responde OK

### Test Instagram:

```bash
curl "https://graph.facebook.com/v18.0/TU_INSTAGRAM_ID?fields=username,profile_picture_url&access_token=TU_LONG_LIVED_TOKEN"
```

**Resultado esperado:**
```json
{
  "username": "tu_usuario_instagram",
  "profile_picture_url": "https://...",
  "id": "17841XXXXXXXXXX"
}
```

- [ ] ✅ Instagram API responde OK

---

## 🚀 PASO 7: CONFIGURAR EN GCP

### En Cloud Shell:

```bash
cd ~/Goio-Store/palacio-central
bash scripts/gcp/quick-configure-meta.sh
```

### Ingresar cuando te pida:

1. **FACEBOOK_ACCESS_TOKEN:**  
   → Pegar el LONG_LIVED_TOKEN del Paso 5

2. **FACEBOOK_PAGE_ID:**  
   → Pegar: `61582527568365`

3. **INSTAGRAM_ACCOUNT_ID:**  
   → Pegar el ID del Paso 4

4. **INSTAGRAM_ACCESS_TOKEN:**  
   → Presionar Enter (usará el mismo de Facebook)

- [ ] Script ejecutado exitosamente
- [ ] Secrets creados en Secret Manager
- [ ] Cloud Run re-deployed
- [ ] ✅ **MARKETING AUTOMATION ACTIVO**

---

## 📊 RESUMEN FINAL DE TOKENS

Una vez completado todo:

```json
{
  "app": {
    "name": "IA Content Publisher",
    "id": "2161243464696662",
    "secret": "XXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "tokens": {
    "FACEBOOK_ACCESS_TOKEN": "EAAxxxxx... (long-lived, 60 días)",
    "FACEBOOK_PAGE_ID": "61582527568365",
    "FACEBOOK_PAGE_NAME": "Goio Store Peru",
    "INSTAGRAM_ACCOUNT_ID": "17841XXXXXXXXXX",
    "INSTAGRAM_USERNAME": "@tu_usuario",
    "INSTAGRAM_ACCESS_TOKEN": "EAAxxxxx... (mismo que Facebook)"
  },
  "expiracion": "~17 de diciembre de 2025 (60 días)",
  "status": "✅ CONFIGURADO Y OPERACIONAL"
}
```

---

## 🔒 SEGURIDAD

**DESPUÉS de configurar en GCP:**

- [ ] Borrar todos los tokens de este documento
- [ ] Borrar historial del terminal (si tiene tokens visibles)
- [ ] NO compartir tokens en screenshots o chats
- [ ] Los tokens están seguros en Secret Manager (encriptados)

---

## 🆘 ERRORES COMUNES

### "Token expired"
→ Volver a Paso 2, generar nuevo token

### "Instagram account not found"
→ Verificar que Instagram esté en modo Business y conectado a la página

### "Invalid OAuth access token"
→ Asegurarse de usar LONG-LIVED token, no el SHORT token

### "Permissions not granted"
→ Volver a Paso 2, marcar TODOS los permisos de la lista

---

**✅ CHECKLIST COMPLETADO - MARKETING AUTOMATION LISTO** 🎉
