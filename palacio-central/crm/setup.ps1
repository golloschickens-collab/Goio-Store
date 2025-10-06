# =============================================================================
# CRM AUTÓNOMO - SCRIPT DE CONFIGURACIÓN INICIAL PARA WINDOWS
# =============================================================================
# 
# Este script automatiza la configuración inicial segura del CRM en Windows.
# Genera secretos únicos y configura el entorno de forma segura.
#
# Uso: .\setup.ps1 [environment]
# Entornos: development, staging, production
#
# =============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

# Configuración de colores
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Header {
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host " CRM AUTÓNOMO - CONFIGURACIÓN INICIAL" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS]" -ForegroundColor Green -NoNewline
    Write-Host " $Message"
}

function Write-Info {
    param([string]$Message)  
    Write-Host "[INFO]" -ForegroundColor Cyan -NoNewline
    Write-Host " $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING]" -ForegroundColor Yellow -NoNewline
    Write-Host " $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR]" -ForegroundColor Red -NoNewline
    Write-Host " $Message"
}

# Verificar dependencias
function Test-Dependencies {
    Write-Info "Verificando dependencias..."
    
    # Verificar Docker
    try {
        $null = docker --version
        Write-Success "✓ Docker está disponible"
    }
    catch {
        Write-Error "Docker no está instalado o no está en el PATH"
        exit 1
    }
    
    # Verificar Docker Compose
    try {
        $null = docker-compose --version
        Write-Success "✓ Docker Compose está disponible"
    }
    catch {
        Write-Error "Docker Compose no está instalado o no está en el PATH"
        exit 1
    }
    
    Write-Success "✓ Todas las dependencias están disponibles"
}

# Generar secretos seguros usando .NET crypto
function New-SecureSecret {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    
    return [Convert]::ToBase64String($bytes) -replace '[=+/]', '' | Select-Object -First $Length
}

function New-HexSecret {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] ($Length / 2)
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    
    return ($bytes | ForEach-Object { $_.ToString("x2") }) -join ''
}

# Generar todos los secretos
function New-Secrets {
    Write-Info "Generando secretos seguros..."
    
    $secrets = @{
        DbPassword = New-SecureSecret -Length 24
        ApiSecret = New-HexSecret -Length 32
        NocoDbJwtSecret = New-SecureSecret -Length 32
        WhatsAppVerifyToken = New-HexSecret -Length 16
    }
    
    Write-Success "✓ Secretos generados correctamente"
    return $secrets
}

# Crear archivo .env
function New-EnvFile {
    param(
        [hashtable]$Secrets,
        [string]$Environment
    )
    
    Write-Info "Creando archivo .env para entorno: $Environment"
    
    # Backup del archivo existente si existe
    if (Test-Path ".env") {
        $backupName = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item ".env" $backupName
        Write-Warning "Archivo .env existente respaldado como: $backupName"
    }
    
    # Configuración basada en entorno
    $forceHttps = if ($Environment -eq "production") { "true" } else { "false" }
    $logLevel = if ($Environment -eq "development") { "DEBUG" } else { "INFO" }
    $backupEnabled = if ($Environment -eq "production") { "true" } else { "false" }
    
    # Crear contenido del archivo .env
    $envContent = @"
# =============================================================================
# CRM AUTÓNOMO - CONFIGURACIÓN GENERADA AUTOMÁTICAMENTE
# =============================================================================
# Generado el: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# Entorno: $Environment
# =============================================================================

# Base de datos PostgreSQL
CRM_DB_PASSWORD=$($Secrets.DbPassword)

# API FastAPI
CRM_API_SECRET=$($Secrets.ApiSecret)
ENVIRONMENT=$Environment

# NocoDB
NOCODB_JWT_SECRET=$($Secrets.NocoDbJwtSecret)

# WhatsApp Business (completar manualmente)
WHATSAPP_TOKEN=
WHATSAPP_WEBHOOK_URL=
WHATSAPP_VERIFY_TOKEN=$($Secrets.WhatsAppVerifyToken)
WHATSAPP_PHONE_NUMBER_ID=

# Configuración de seguridad
FORCE_HTTPS=$forceHttps
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8000
ALLOWED_HOSTS=localhost,127.0.0.1

# Logging
LOG_LEVEL=$logLevel
LOG_RETENTION_DAYS=30

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://crm-redis:6379

# Email (configurar manualmente si es necesario)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_TLS=true
SMTP_FROM_EMAIL=

# Backups (habilitar en producción)
BACKUP_ENABLED=$backupEnabled
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=7
"@

    # Escribir archivo
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Success "✓ Archivo .env creado correctamente"
}

# Validar configuración de Docker Compose
function Test-DockerCompose {
    Write-Info "Validando configuración de Docker Compose..."
    
    try {
        $null = docker-compose config 2>$null
        Write-Success "✓ Configuración de Docker Compose válida"
    }
    catch {
        Write-Error "Error en la configuración de Docker Compose"
        Write-Error $_.Exception.Message
        exit 1
    }
}

# Mostrar próximos pasos
function Show-NextSteps {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host " CONFIGURACIÓN COMPLETADA" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "✓ Archivo .env creado con secretos seguros" -ForegroundColor Green
    Write-Host "✓ Configuración validada correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Revisa y completa la configuración en .env:"
    Write-Host "   - WHATSAPP_TOKEN (desde Meta for Developers)"
    Write-Host "   - WHATSAPP_WEBHOOK_URL (tu dominio público)"
    Write-Host "   - WHATSAPP_PHONE_NUMBER_ID (ID del número +51 939431887)"
    Write-Host ""
    Write-Host "2. Inicia el sistema:"
    Write-Host "   docker-compose up -d"
    Write-Host ""
    Write-Host "3. Verifica que todos los servicios estén funcionando:"
    Write-Host "   docker-compose ps"
    Write-Host ""
    Write-Host "4. Accede a las interfaces:"
    Write-Host "   - API Documentation: http://localhost:8000/docs"
    Write-Host "   - NocoDB: http://localhost:8080"
    Write-Host "   - Metabase: http://localhost:3000"
    Write-Host ""
    Write-Host "IMPORTANTE:" -ForegroundColor Red
    Write-Host "- NUNCA subas el archivo .env al repositorio"
    Write-Host "- Cambia las contraseñas regularmente"
    Write-Host "- Habilita HTTPS en producción"
    Write-Host ""
}

# Función principal
function Main {
    Write-Header
    
    Test-Dependencies
    $secrets = New-Secrets
    New-EnvFile -Secrets $secrets -Environment $Environment
    Test-DockerCompose
    Show-NextSteps
    
    Write-Success "¡Configuración inicial completada exitosamente!"
}

# Ejecutar función principal
try {
    Main
}
catch {
    Write-Error "Error durante la configuración: $($_.Exception.Message)"
    exit 1
}