# Test de auditoria - Agentes ELITE
$ServiceURL = "https://agentes-elite-5pk5dgnorq-uc.a.run.app"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PROBANDO AGENTES ELITE EN CLOUD RUN" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$ServiceURL/" -Method Get
Write-Host "   OK - Servicio: $($health.service)" -ForegroundColor Green
Write-Host ""

# 2. Iniciar auditoria
Write-Host "2. Iniciando auditoria..." -ForegroundColor Yellow
$audit = Invoke-RestMethod -Uri "$ServiceURL/audit" -Method Get
Write-Host "   OK - $($audit.message)" -ForegroundColor Green
Write-Host ""

# 3. Monitorear
Write-Host "3. Monitoreando (espera 2-3 minutos)..." -ForegroundColor Yellow
$maxWait = 180
$interval = 15
$elapsed = 0

while ($elapsed -lt $maxWait) {
    $status = Invoke-RestMethod -Uri "$ServiceURL/" -Method Get
    
    if ($status.isRunning -eq $false -and $null -ne $status.lastExecution) {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "AUDITORIA COMPLETADA" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""
        
        if ($status.lastExecution.success) {
            Write-Host "RESULTADO: EXITOSO" -ForegroundColor Green
            Write-Host ""
            
            # Ver reportes
            $reports = Invoke-RestMethod -Uri "$ServiceURL/reports" -Method Get
            
            if ($reports.total -gt 0) {
                $latest = $reports.latest[0]
                Write-Host "==========================================" -ForegroundColor Cyan
                Write-Host "REPORTE DE AUDITORIA" -ForegroundColor Cyan
                Write-Host "==========================================" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "PUNTUACION GENERAL: $($latest.generalScore)/100" -ForegroundColor White
                Write-Host ""
                Write-Host "CATEGORIAS:" -ForegroundColor White
                Write-Host "  Productos: $($latest.scores.products)/100"
                Write-Host "  Copywriting: $($latest.scores.copywriting)/100"
                Write-Host "  Imagenes: $($latest.scores.images)/100"
                Write-Host "  Precios: $($latest.scores.prices)/100"
                Write-Host "  Variantes: $($latest.scores.variants)/100"
                Write-Host "  Stock: $($latest.scores.stock)/100"
                Write-Host "  SEO: $($latest.scores.seo)/100"
                Write-Host "  Politicas: $($latest.scores.policies)/100"
                Write-Host "  Envio: $($latest.scores.shipping)/100"
                Write-Host "  Confianza: $($latest.scores.trust)/100"
                Write-Host ""
                
                if ($latest.generalScore -lt 75) {
                    Write-Host "La puntuacion es menor a 75" -ForegroundColor Yellow
                    Write-Host "Ejecutar auto-fix para mejorar?" -ForegroundColor Yellow
                    Write-Host ""
                    
                    $response = Read-Host "Ejecutar auto-fix ahora? (s/n)"
                    if ($response -eq "s") {
                        Write-Host "Ejecutando auto-fix..." -ForegroundColor Yellow
                        $fix = Invoke-RestMethod -Uri "$ServiceURL/fix" -Method Get
                        Write-Host "OK - Fix iniciado" -ForegroundColor Green
                    }
                } else {
                    Write-Host "TIENDA EN EXCELENTE ESTADO" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "RESULTADO: ERROR" -ForegroundColor Red
            Write-Host "Error: $($status.lastExecution.error)" -ForegroundColor Red
        }
        
        break
    }
    
    $elapsed += $interval
    Write-Host "   En progreso..." -ForegroundColor Cyan
    Start-Sleep -Seconds $interval
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "URLS UTILES:" -ForegroundColor Cyan
Write-Host "  Estado: $ServiceURL/"
Write-Host "  Auditoria: $ServiceURL/audit"
Write-Host "  Reportes: $ServiceURL/reports"
Write-Host "  Fix: $ServiceURL/fix"
Write-Host ""
