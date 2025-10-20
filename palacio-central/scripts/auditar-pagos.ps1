# 🔍 AUDITAR PAGOS SHOPIFY - IMPERIO GOIO
# Verifica configuración de pagos en las 3 tiendas

Write-Host "🔍 Iniciando auditoría de pagos Shopify..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath

Set-Location $rootPath

node agents/payment-auditor.js

Write-Host ""
Write-Host "✅ Auditoría completada" -ForegroundColor Green
Write-Host "📊 Revisa el reporte en: reports/payment-audits/" -ForegroundColor Yellow
