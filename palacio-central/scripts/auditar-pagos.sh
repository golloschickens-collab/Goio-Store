#!/bin/bash

# 🔍 AUDITAR PAGOS SHOPIFY - IMPERIO GOIO
# Verifica configuración de pagos en las 3 tiendas

echo "🔍 Iniciando auditoría de pagos Shopify..."
echo ""

cd "$(dirname "$0")/.."

node agents/payment-auditor.js

echo ""
echo "✅ Auditoría completada"
echo "📊 Revisa el reporte en: reports/payment-audits/"
