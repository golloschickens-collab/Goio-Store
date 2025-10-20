# 🚀 EJECUTAR AGENTES ELITE - WINDOWS

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🏆 AGENTES ELITE - GOIO STORE" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$expectedPath = "C:\Goio mayordomo\palacio-central"
$currentPath = (Get-Location).Path

if ($currentPath -ne $expectedPath) {
    Write-Host "📁 Cambiando a directorio correcto..." -ForegroundColor Yellow
    Set-Location $expectedPath
}

Write-Host "✅ Directorio: $expectedPath" -ForegroundColor Green
Write-Host ""

# Verificar .env
if (Test-Path ".env") {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "SHOPIFY_STORE_URL" -and $envContent -match "GEMINI_API_KEY") {
        Write-Host "✅ Credenciales configuradas" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Faltan credenciales en .env" -ForegroundColor Red
        Write-Host "   Edita .env y agrega SHOPIFY_STORE_URL y GEMINI_API_KEY" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "   Ejecuta: Copy-Item '.env.example' '.env'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Selecciona el agente a ejecutar:" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔍 AUDITORÍA COMPLETA (solo analiza, no modifica)" -ForegroundColor White
Write-Host "   └─ Genera score 0-100 y plan de acción" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ✍️  OPTIMIZAR DESCRIPCIONES (con IA)" -ForegroundColor White
Write-Host "   └─ Reescribe descripciones para vender más" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 📸 OPTIMIZAR IMÁGENES (genera ALT text)" -ForegroundColor White
Write-Host "   └─ Mejora SEO con descripciones automáticas" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🛡️  CONSTRUIR CONFIANZA (políticas y trust)" -ForegroundColor White
Write-Host "   └─ Genera políticas legales y elementos de confianza" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 🔥 FIX COMPLETO AUTOMÁTICO (TODO)" -ForegroundColor Yellow
Write-Host "   └─ Ejecuta los 4 agentes en secuencia (8-10 min)" -ForegroundColor Gray
Write-Host ""
Write-Host "0. Salir" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Selecciona una opción [1-5]"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan

switch ($opcion) {
    "1" {
        Write-Host "🔍 Ejecutando AUDITORÍA COMPLETA..." -ForegroundColor Cyan
        Write-Host "⏱️  Tiempo estimado: 2-3 minutos" -ForegroundColor Yellow
        Write-Host ""
        node agents/store-perfection-master.js
    }
    "2" {
        Write-Host "✍️  Optimizando DESCRIPCIONES con IA..." -ForegroundColor Cyan
        Write-Host "⏱️  Tiempo estimado: 3-5 minutos" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  Modo AUTO-FIX: Actualizará productos en Shopify" -ForegroundColor Red
        $confirmar = Read-Host "¿Continuar? [S/n]"
        if ($confirmar -eq "" -or $confirmar -match "^[Ss]$") {
            node agents/product-description-writer.js --auto-fix
        } else {
            Write-Host "❌ Cancelado" -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host "📸 Optimizando IMÁGENES..." -ForegroundColor Cyan
        Write-Host "⏱️  Tiempo estimado: 2-3 minutos" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  Modo AUTO-FIX: Generará ALT text automático" -ForegroundColor Red
        $confirmar = Read-Host "¿Continuar? [S/n]"
        if ($confirmar -eq "" -or $confirmar -match "^[Ss]$") {
            node agents/image-optimizer.js --auto-fix
        } else {
            Write-Host "❌ Cancelado" -ForegroundColor Yellow
        }
    }
    "4" {
        Write-Host "🛡️  Construyendo CONFIANZA..." -ForegroundColor Cyan
        Write-Host "⏱️  Tiempo estimado: 3-4 minutos" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  Modo AUTO-GENERATE: Creará políticas legales" -ForegroundColor Red
        $confirmar = Read-Host "¿Continuar? [S/n]"
        if ($confirmar -eq "" -or $confirmar -match "^[Ss]$") {
            node agents/trust-builder.js --auto-generate
        } else {
            Write-Host "❌ Cancelado" -ForegroundColor Yellow
        }
    }
    "5" {
        Write-Host "🔥 MODO AGRESIVO: FIX COMPLETO AUTOMÁTICO" -ForegroundColor Red
        Write-Host "⏱️  Tiempo estimado: 8-10 minutos" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Esto ejecutará:" -ForegroundColor White
        Write-Host "  1. Auditoría inicial" -ForegroundColor Gray
        Write-Host "  2. Optimizar descripciones (AUTO-FIX)" -ForegroundColor Gray
        Write-Host "  3. Optimizar imágenes (AUTO-FIX)" -ForegroundColor Gray
        Write-Host "  4. Construir confianza (AUTO-GENERATE)" -ForegroundColor Gray
        Write-Host "  5. Auditoría final" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  Aplicará cambios sin confirmación" -ForegroundColor Red
        $confirmar = Read-Host "¿Estás seguro? [S/n]"
        if ($confirmar -eq "" -or $confirmar -match "^[Ss]$") {
            node agents/store-auto-fixer.js
        } else {
            Write-Host "❌ Cancelado" -ForegroundColor Yellow
        }
    }
    "0" {
        Write-Host "👋 Hasta luego" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "✅ EJECUCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Reportes guardados en: reports/" -ForegroundColor Yellow
Write-Host ""

# Preguntar si quiere ver el reporte
$verReporte = Read-Host "¿Ver último reporte? [S/n]"
if ($verReporte -eq "" -or $verReporte -match "^[Ss]$") {
    $ultimoReporte = Get-ChildItem -Path "reports" -Recurse -Filter "*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($ultimoReporte) {
        Write-Host ""
        Write-Host "📄 Abriendo: $($ultimoReporte.FullName)" -ForegroundColor Cyan
        code $ultimoReporte.FullName
    } else {
        Write-Host "⚠️  No se encontraron reportes" -ForegroundColor Yellow
    }
}
