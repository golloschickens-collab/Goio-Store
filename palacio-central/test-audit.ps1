# 🧪 TEST DE AUDITORÍA - Agentes ELITE
# Monitorea el estado de la auditoría en Cloud Run

$ServiceURL = "https://agentes-elite-5pk5dgnorq-uc.a.run.app"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 PROBANDO AGENTES ELITE EN CLOUD RUN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1️⃣  Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$ServiceURL/" -Method Get
    Write-Host "   ✅ Servicio: $($health.service)" -ForegroundColor Green
    Write-Host "   ✅ Estado: $($health.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Error en health check: $_" -ForegroundColor Red
    exit 1
}

# 2. Iniciar auditoría
Write-Host "2️⃣  Iniciando auditoría completa..." -ForegroundColor Yellow
try {
    $audit = Invoke-RestMethod -Uri "$ServiceURL/audit" -Method Get
    Write-Host "   ✅ Auditoría iniciada: $($audit.message)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Error iniciando auditoría: $_" -ForegroundColor Red
    exit 1
}

# 3. Monitorear progreso
Write-Host "3️⃣  Monitoreando progreso..." -ForegroundColor Yellow
Write-Host "   ⏳ Esto tomará 2-3 minutos..." -ForegroundColor Cyan
Write-Host ""

$maxWait = 180 # 3 minutos
$interval = 10  # Revisar cada 10 segundos
$elapsed = 0

while ($elapsed -lt $maxWait) {
    try {
        $status = Invoke-RestMethod -Uri "$ServiceURL/" -Method Get
        
        if ($status.isRunning -eq $false -and $null -ne $status.lastExecution) {
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host "✅ ¡AUDITORÍA COMPLETADA!" -ForegroundColor Green
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host ""
            
            if ($status.lastExecution.success) {
                Write-Host "📊 RESULTADO: EXITOSO" -ForegroundColor Green
                Write-Host "📅 Timestamp: $($status.lastExecution.timestamp)" -ForegroundColor Cyan
                Write-Host ""
                
                # Ver reportes
                Write-Host "4️⃣  Obteniendo reportes..." -ForegroundColor Yellow
                $reports = Invoke-RestMethod -Uri "$ServiceURL/reports" -Method Get
                
                if ($reports.total -gt 0) {
                    $latest = $reports.latest[0]
                    Write-Host ""
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
                    Write-Host "📈 REPORTE DE AUDITORÍA" -ForegroundColor Cyan
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "🏆 PUNTUACIÓN GENERAL: $($latest.generalScore)/100" -ForegroundColor $(if ($latest.generalScore -ge 75) { "Green" } else { "Yellow" })
                    Write-Host ""
                    Write-Host "📊 CATEGORÍAS:" -ForegroundColor White
                    Write-Host "   - Productos: $($latest.scores.products)/100" -ForegroundColor Cyan
                    Write-Host "   - Copywriting: $($latest.scores.copywriting)/100" -ForegroundColor Cyan
                    Write-Host "   - Imagenes: $($latest.scores.images)/100" -ForegroundColor Cyan
                    Write-Host "   - Precios: $($latest.scores.prices)/100" -ForegroundColor Cyan
                    Write-Host "   - Variantes: $($latest.scores.variants)/100" -ForegroundColor Cyan
                    Write-Host "   - Stock: $($latest.scores.stock)/100" -ForegroundColor Cyan
                    Write-Host "   - SEO: $($latest.scores.seo)/100" -ForegroundColor Cyan
                    Write-Host "   - Politicas: $($latest.scores.policies)/100" -ForegroundColor Cyan
                    Write-Host "   - Envio: $($latest.scores.shipping)/100" -ForegroundColor Cyan
                    Write-Host "   - Confianza: $($latest.scores.trust)/100" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "🎯 ISSUES CRITICOS: $($latest.summary.criticalIssues.Count)" -ForegroundColor Red
                    Write-Host "⚠️  MEJORAS SUGERIDAS: $($latest.summary.improvements.Count)" -ForegroundColor Yellow
                    Write-Host "✅ PUNTOS FUERTES: $($latest.summary.strengths.Count)" -ForegroundColor Green
                    Write-Host ""
                    
                    if ($latest.generalScore -lt 75) {
                        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
                        Write-Host "⚡ EJECUTAR AUTO-FIX" -ForegroundColor Yellow
                        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
                        Write-Host ""
                        Write-Host "La puntuacion es menor a 75. Ejecutar auto-fix?" -ForegroundColor Yellow
                        Write-Host "Esto mejorara:" -ForegroundColor Cyan
                        Write-Host "  - Descripciones de productos (+15 puntos)" -ForegroundColor Cyan
                        Write-Host "  - Optimizacion de imagenes (+10 puntos)" -ForegroundColor Cyan
                        Write-Host "  - Senales de confianza (+8 puntos)" -ForegroundColor Cyan
                        Write-Host ""
                        
                        $response = Read-Host "Ejecutar auto-fix ahora? (s/n)"
                        if ($response -eq "s") {
                            Write-Host ""
                            Write-Host "🚀 Ejecutando auto-fix..." -ForegroundColor Yellow
                            $fix = Invoke-RestMethod -Uri "$ServiceURL/fix" -Method Get
                            Write-Host "   ✅ Fix iniciado: $($fix.message)" -ForegroundColor Green
                            Write-Host "   ⏳ Esto tomará 8-10 minutos" -ForegroundColor Cyan
                        }
                    } else {
                        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
                        Write-Host "🎉 ¡TIENDA EN EXCELENTE ESTADO!" -ForegroundColor Green
                        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
                        Write-Host ""
                        Write-Host "✨ Tu tienda está lista para recibir clientes" -ForegroundColor Green
                    }
                } else {
                    Write-Host "   ⚠️  No se encontraron reportes" -ForegroundColor Yellow
                }
            } else {
                Write-Host "❌ RESULTADO: ERROR" -ForegroundColor Red
                Write-Host "📝 Error: $($status.lastExecution.error)" -ForegroundColor Red
            }
            
            break
        }
        
        # Mostrar progreso
        $elapsed += $interval
        $remaining = $maxWait - $elapsed
        Write-Host "   ⏳ En progreso... ($remaining segundos restantes)" -ForegroundColor Cyan
        Start-Sleep -Seconds $interval
        
    } catch {
        Write-Host "   ❌ Error monitoreando: $_" -ForegroundColor Red
        break
    }
}

if ($elapsed -ge $maxWait) {
    Write-Host ""
    Write-Host "⚠️  Timeout: La auditoría está tomando más tiempo del esperado" -ForegroundColor Yellow
    Write-Host "   Revisa manualmente: $ServiceURL/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 URLs ÚTILES:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   Estado: $ServiceURL/" -ForegroundColor White
Write-Host "   Auditoría: $ServiceURL/audit" -ForegroundColor White
Write-Host "   Reportes: $ServiceURL/reports" -ForegroundColor White
Write-Host "   Fix: $ServiceURL/fix" -ForegroundColor White
Write-Host ""
