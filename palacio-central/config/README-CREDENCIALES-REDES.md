# 📑 Protocolo de Credenciales para Agentes en Redes Sociales

## 1. Objetivo

Garantizar que cada soldado digital tenga acceso autorizado y trazable a las cuentas de Instagram, Facebook y WhatsApp Business del Imperio Goio.

## 2. Estructura de archivos

| Archivo | Uso |
| --- | --- |
| `config/keys.json` | Claves maestras (Apps, tokens generales). Mantener en bóveda cifrada. |
| `config/social_credentials.example.json` | Plantilla de credenciales por agente y plataforma. |
| `config/social_credentials.json` | Archivo operativo con datos reales (no versionar). |
| `config/README-CREDENCIALES-REDES.md` | Este protocolo.
| `scripts/credenciales/programar-renovacion-tokens.js` | Automatiza programación de renovación de tokens y genera bitácoras.

> ⚠️ **Importante:** Nunca versionar `config/social_credentials.json`. Añadirlo a `.gitignore`.

## 3. Pasos para otorgar acceso a un agente

### 3.1 Instagram Business
1. Vincular la cuenta de Instagram a la página de Facebook correspondiente.
2. En Meta Business Suite → Usuarios → Personas, asignar al agente el rol "Administrador" o "Editor".
3. Generar un `user_access_token` con permisos:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_manage_posts`
   - `pages_read_engagement`
4. Intercambiar por token de larga duración (válido ~60 días).
5. Registrar en `social_credentials.json`:
   - `ig_business_account_id`
   - `linked_facebook_page_id`
   - `long_lived_user_token`
   - Fecha de expiración.
6. Configurar autenticación 2FA para el agente (app autenticadora).

### 3.2 Facebook Pages
1. Verificar que la página esté dentro del Business Manager.
2. Asignar el agente a la página con permisos `Publicar`, `Responder`.
3. Generar `page_access_token` a partir del token del usuario.
4. Registrar en `social_credentials.json` bajo `facebook.pages`.

### 3.3 WhatsApp Business API
1. Completar la verificación de la empresa en Meta Business.
2. Generar `phone_number_id` y `waba_id`.
3. Solicitar "Permisos de Mensajería" para plantillas.
4. Registrar claves en `social_credentials.json`.
5. Actualizar `status` a `VERIFICADO_META` cuando corresponda.

## 4. Flujo de alta de un nuevo agente

1. **Solicitud:** Área de Operaciones envía formulario con nombre, rol, plataformas.
2. **Aprobación:** MAYORDOMO IMPERIAL verifica necesidad y alcance.
3. **Creación:** Equipo Técnico genera tokens y credenciales, documenta en `social_credentials.json`.
4. **Entrega:** Se entrega al agente credenciales por canal seguro (Vault, 1Password, Bitwarden).
5. **Registro:** Se actualiza auditoría con fecha, responsable y vigencia.
6. **Revisión:** Cada 30 días se revisa expiración de tokens y actividad del agente.

## 5. Auditoría y Trazabilidad

- Cada entrada en `agents[].auditoria` debe tener:
  - `ultimo_refresh`: ISO8601
  - `responsable`: quien generó el token
  - `observaciones`: notas (p.ej. "Token renovado tras MFA").
- Guardar bitácora en `logs/imperial/operations/` con trace_id `CREDENCIALES_RED_SOCIAL-YYYYMMDD` (se genera automáticamente al ejecutar `node scripts/credenciales/programar-renovacion-tokens.js`).
- Revisar semanalmente el reporte generado y actualizar `social_credentials.json` con los nuevos `token_renovacion_programada`.

## 6. Buenas prácticas de seguridad

- Usar 2FA en todas las cuentas.
- Renovar tokens antes de 7 días a su expiración.
- Revocar accesos de agentes inactivos.
- No compartir credenciales por correo o chats no cifrados.
- Respaldar tokens en bóveda con rotación semanal.

## 7. Próximos pasos pendientes

- [ ] Completar `app_secret` de `facebook.goio_store` en `keys.json`.
- [ ] Generar `long_lived_user_token` para la página `GoioStore`.
- [ ] Cargar datos reales en `config/social_credentials.json`.
- [ ] Configurar webhook Meta (URL + verify token) para alertas automáticas.
- [ ] Sincronizar con Dashboard para alertar expiraciones de tokens.
- [ ] Agendar ejecución (cron / Task Scheduler) del script `node scripts/credenciales/programar-renovacion-tokens.js`.

---

👑 **Imperio Goio** — Seguridad y Trazabilidad sobre todas las cosas.
