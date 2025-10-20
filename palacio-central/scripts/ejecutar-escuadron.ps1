# 🚀 EJECUTAR ESCUADRÓN ELITE COMPLETO (Windows PowerShell)

Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "🏆 ESCUADRÓN ELITE - 10 AGENTES NIVEL DIOS" -ForegroundColor Yellow
Write-Host "🎯 Misión: Tienda impecable, cero dudas del cliente" -ForegroundColor Green
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Selecciona modo de ejecución:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔍 ANÁLISIS COMPLETO (sin cambios)" -ForegroundColor White
Write-Host "   └─ Solo audita y genera reportes" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🔧 AUTO-FIX SELECTIVO (eliges qué aplicar)" -ForegroundColor White
Write-Host "   ├─ A) Solo descripciones" -ForegroundColor Gray
Write-Host "   ├─ B) Solo imágenes (ALT text)" -ForegroundColor Gray
Write-Host "   ├─ C) Solo confianza (políticas)" -ForegroundColor Gray
Write-Host "   └─ D) Todo lo anterior" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🔥 MODO AGRESIVO (fix TODO automático)" -ForegroundColor White
Write-Host "   └─ Ejecuta los 4 agentes con auto-fix" -ForegroundColor Gray
Write-Host ""
Write-Host "0. Salir" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Opción [1-3]"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "🔍 Ejecutando análisis completo..." -ForegroundColor Cyan
        node agents/store-perfection-master.js
    }
    
    "2" {
        Write-Host ""
        Write-Host "Selecciona auto-fix:" -ForegroundColor Cyan
        Write-Host "A) Descripciones" -ForegroundColor White
        Write-Host "B) Imágenes" -ForegroundColor White
        Write-Host "C) Confianza" -ForegroundColor White
        Write-Host "D) Todo" -ForegroundColor White
        $subopcion = Read-Host "Opción [A-D]"
        
        switch ($subopcion.ToUpper()) {
            "A" {
                Write-Host "✍️ Optimizando descripciones..." -ForegroundColor Yellow
                node agents/product-description-writer.js --auto-fix
            }
            "B" {
                Write-Host "📸 Optimizando imágenes..." -ForegroundColor Yellow
                node agents/image-optimizer.js --auto-fix
            }
            "C" {
                Write-Host "🛡️ Construyendo confianza..." -ForegroundColor Yellow
                node agents/trust-builder.js --auto-generate
            }
            "D" {
                Write-Host "🔧 Aplicando todos los fixes..." -ForegroundColor Yellow
                Write-Host ""
                Write-Host "1/3: Descripciones..." -ForegroundColor Cyan
                node agents/product-description-writer.js --auto-fix
                Write-Host ""
                Write-Host "2/3: Imágenes..." -ForegroundColor Cyan
                node agents/image-optimizer.js --auto-fix
                Write-Host ""
                Write-Host "3/3: Confianza..." -ForegroundColor Cyan
                node agents/trust-builder.js --auto-generate
                Write-Host ""
                Write-Host "✅ Todos los fixes aplicados" -ForegroundColor Green
            }
            default {
                Write-Host "❌ Opción inválida" -ForegroundColor Red
                exit 1
            }
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔥 MODO AGRESIVO ACTIVADO" -ForegroundColor Red
        Write-Host ""
        Write-Host "⚠️  ADVERTENCIA:" -ForegroundColor Yellow
        Write-Host "   - Aplicará cambios automáticamente" -ForegroundColor White
        Write-Host "   - No pedirá confirmación" -ForegroundColor White
        Write-Host "   - Tiempo estimado: 5-10 minutos" -ForegroundColor White
        Write-Host ""
        $confirmar = Read-Host "¿Continuar? [S/n]"
        
        if ($confirmar -eq "" -or $confirmar -match "^[Ss]$") {
            node agents/store-auto-fixer.js
        } else {
            Write-Host "❌ Cancelado por el usuario" -ForegroundColor Red
            exit 0
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
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "✅ EJECUCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "📁 Reportes guardados en: reports/" -ForegroundColor Yellow
Write-Host "================================================================================================" -ForegroundColor Cyan
