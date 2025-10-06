#!/usr/bin/env bash
# =============================================
# WHATSAPP BUSINESS SETUP - INTEGRACIÓN CRM
# Número: +51 939431887
# =============================================

# Configuración para WhatsApp Business API
WHATSAPP_NUMBER="+51939431887"
WEBHOOK_URL="https://your-domain.com/api/webhooks/whatsapp"
VERIFY_TOKEN="gollos_whatsapp_verify_2025"

# Credenciales que necesitarás obtener
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""

echo "=== CONFIGURACIÓN WHATSAPP BUSINESS ==="
echo "Número registrado: $WHATSAPP_NUMBER"
echo "Webhook URL: $WEBHOOK_URL"
echo "Token de verificación: $VERIFY_TOKEN"

# Actualizar .env con configuración WhatsApp
cat >> .env << EOF

# === WHATSAPP BUSINESS CONFIGURATION ===
WHATSAPP_NUMBER=$WHATSAPP_NUMBER
WHATSAPP_BUSINESS_ACCOUNT_ID=$WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_PHONE_NUMBER_ID=$WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN=$WHATSAPP_ACCESS_TOKEN
WHATSAPP_WEBHOOK_URL=$WEBHOOK_URL
WHATSAPP_VERIFY_TOKEN=$VERIFY_TOKEN

# Mensajes automáticos
WHATSAPP_AUTO_WELCOME=true
WHATSAPP_AUTO_MENU=true
WHATSAPP_AUTO_ORDER_CONFIRM=true

EOF

echo "✅ Configuración añadida a .env"