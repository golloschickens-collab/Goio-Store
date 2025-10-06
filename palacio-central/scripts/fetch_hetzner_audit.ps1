<#
fetch_hetzner_audit.ps1
Ejecuta el script remoto de recolección en un servidor Hetzner y descarga el bundle resultante.
Uso:
  .\fetch_hetzner_audit.ps1 -RemoteUser usuario -RemoteHost 1.2.3.4 -SshKeyPath C:\path\to\key -LocalDest C:\ruta\local

Requisitos:
- Cliente OpenSSH (ssh, scp) disponible en la máquina que ejecuta este script (Windows 10/11 tienen cliente OpenSSH opcional).
- El usuario remoto debe poder usar sudo para ejecutar el script si se necesita (o ejecutar sin sudo si ya es root).

Parámetros:
  -RemoteUser (string) Usuario SSH remoto (ej: root)
  -RemoteHost (string) Host/IP del servidor
  -RemoteScriptPath (string) Ruta al script en el servidor (por defecto: palacio-central/scripts/collect_hetzner_audit.sh)
  -SshKeyPath (string) Ruta opcional a la clave privada SSH (sin comillas)
  -SshPort (int) Puerto SSH (por defecto 22)
  -LocalDest (string) Carpeta local destino para guardar el bundle (por defecto: .) 
  -UseSudo (switch) Usar sudo para ejecutar el script remoto
#>

param(
    [Parameter(Mandatory=$true)] [string]$RemoteUser,
    [Parameter(Mandatory=$true)] [string]$RemoteHost,
    [string]$RemoteScriptPath = "palacio-central/scripts/collect_hetzner_audit.sh",
    [string]$SshKeyPath = "",
    [int]$SshPort = 22,
    [string]$LocalDest = ".",
    [switch]$UseSudo
)

function Build-SshCmd($user, $host, $port, $keyPath) {
    $base = "ssh -p $port"
    if ($keyPath -ne "") {
        $base = "$base -i `"$keyPath`""
    }
    return "$base $user@$host"
}

$sshCmd = Build-SshCmd -user $RemoteUser -host $RemoteHost -port $SshPort -keyPath $SshKeyPath

Write-Host "Usando SSH command: $sshCmd" -ForegroundColor Cyan

# Construir comando remoto a ejecutar
$remoteRun = if ($UseSudo) { "sudo bash $RemoteScriptPath" } else { "bash $RemoteScriptPath" }

# Ejecutar el script remoto y pedir el path + sha256
$remoteFullCmd = "$remoteRun && echo '---AUDIT_DONE---' && ls -1 /tmp/hetzner_audit_*.tar.gz | tail -n1 || true"

Write-Host "Ejecutando script remoto..." -ForegroundColor Yellow

try {
    if ($SshKeyPath -ne "") {
        $runOutput = & ssh -i $SshKeyPath -p $SshPort $RemoteUser@$RemoteHost "$remoteFullCmd"
    } else {
        $runOutput = & ssh -p $SshPort $RemoteUser@$RemoteHost "$remoteFullCmd"
    }
} catch {
    Write-Error "Error al ejecutar SSH: $_"
    exit 2
}

if (-not $runOutput) {
    Write-Error "No se recibió salida del servidor. Revisa conectividad o permisos.";
    exit 3
}

Write-Host "Salida remota (resumen):" -ForegroundColor Green
$runOutput | Select-Object -First 200 | ForEach-Object { Write-Host $_ }

# Buscar la línea con el path del archive
$archiveLine = ($runOutput | Where-Object { $_ -match '/tmp/hetzner_audit_.*.tar.gz' } | Select-Object -Last 1)
if (-not $archiveLine) {
    Write-Warning "No se detectó el bundle remoto. Asegura que el script remoto se ejecutó correctamente y creó /tmp/hetzner_audit_*.tar.gz"
    exit 4
}
$remoteArchivePath = $archiveLine.Trim()
Write-Host "Archive detectado: $remoteArchivePath" -ForegroundColor Cyan

# Obtener SHA256 remoto (si disponible)
try {
    if ($SshKeyPath -ne "") {
        $shaOutput = & ssh -i $SshKeyPath -p $SshPort $RemoteUser@$RemoteHost "sha256sum '$remoteArchivePath' 2>/dev/null || echo 'NO_SHA'"
    } else {
        $shaOutput = & ssh -p $SshPort $RemoteUser@$RemoteHost "sha256sum '$remoteArchivePath' 2>/dev/null || echo 'NO_SHA'"
    }
} catch {
    Write-Warning "No se pudo obtener SHA remoto: $_"
    $shaOutput = @("NO_SHA")
}

$remoteSha = ($shaOutput | Select-Object -First 1).Split()[0]
if ($remoteSha -eq 'NO_SHA' -or -not $remoteSha) {
    Write-Warning "SHA remoto no disponible. Continuando de todos modos."
} else {
    Write-Host "SHA remota: $remoteSha" -ForegroundColor Green
}

# Preparar destino local
a = $LocalDest
if (-not (Test-Path $LocalDest)) { New-Item -ItemType Directory -Path $LocalDest | Out-Null }
$localFileName = Split-Path $remoteArchivePath -Leaf
$localPath = Join-Path -Path $LocalDest -ChildPath $localFileName

# Descargar con scp
Write-Host "Descargando $remoteArchivePath -> $localPath" -ForegroundColor Yellow
try {
    if ($SshKeyPath -ne "") {
        & scp -i $SshKeyPath -P $SshPort $RemoteUser@$RemoteHost:"$remoteArchivePath" "$localPath"
    } else {
        & scp -P $SshPort $RemoteUser@$RemoteHost:"$remoteArchivePath" "$localPath"
    }
} catch {
    Write-Error "Error en scp: $_"
    exit 5
}

if (-not (Test-Path $localPath)) {
    Write-Error "El archivo local no fue descargado correctamente."; exit 6
}

# Calcular SHA local y comparar
try {
    $localHash = Get-FileHash -Path $localPath -Algorithm SHA256
    $localSha = $localHash.Hash
    Write-Host "SHA local: $localSha" -ForegroundColor Green
    if ($remoteSha -and $remoteSha -ne 'NO_SHA') {
        if ($localSha -ieq $remoteSha) {
            Write-Host "SHA verificada: OK" -ForegroundColor Green
        } else {
            Write-Warning "SHA mismatch: remoto($remoteSha) != local($localSha)"
        }
    }
} catch {
    Write-Warning "No se pudo calcular SHA local: $_"
}

Write-Host "Bundle descargado en: $localPath" -ForegroundColor Cyan
Write-Host "Listo. Sube o proporciona el archivo para análisis." -ForegroundColor Magenta

exit 0
