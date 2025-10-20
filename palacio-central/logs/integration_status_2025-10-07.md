# Integrations Check – 7 Oct 2025

| Servicio         | Identificador                                            | Resultado | Detalle |
|------------------|----------------------------------------------------------|-----------|---------|
| Meta Ads (Gollos)| act_13673068853                                          | ❌ Error  | Falta token de acceso / permisos para consultar el estado de la cuenta publicitaria. |
| Meta Ads (Goio)  | act_8003343226                                           | ❌ Error  | Falta token de acceso / permisos para consultar el estado de la cuenta publicitaria. |
| GA4              | G-XMGNN5S03M                                             | ⚠️ Pendiente | Se requiere Measurement Protocol API secret para validar recepción de eventos. |
| Merchant Center  | 5666383419                                               | ⚠️ Pendiente | Sin credenciales de la API Content / acceso OAuth para confirmar vinculación. |
| Klaviyo          | Public: QRLkkZ / Private: pk_995683199699b1c12ab4aef1c9c31dde9b | ❌ Error  | Falta verificar autenticidad mediante petición API (se necesita endpoint y entorno). |
| WhatsApp Business| +51 958550325                                            | ⚠️ Pendiente | Requiere token Meta WA y phone_id para validar número activo. |
| TikTok Ads       | (placeholders)                                           | 🕒 En espera | Aún no se han recibido Pixel IDs ni API keys. |

## Observaciones
- El archivo `meta_config.env` contiene los IDs pero todavía falta recibir los tokens/secrets necesarios para autenticar contra cada API.
- No se ejecutó ninguna campaña ni mutación; se dejó todo en modo verificación.
- En cuanto se entreguen los tokens (Meta Marketing API, GA4 Measurement Protocol secret, Google Merchant OAuth, Klaviyo Server-side key, WhatsApp Business token), se re-ejecutará este chequeo.
