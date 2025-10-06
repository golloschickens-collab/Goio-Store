<#
.SYNOPSIS
  Diagnóstico y reparación básica de la extensión "Gemini/Genmini" en VS Code (Windows PowerShell).

  Qué hace:
  - Detecta el CLI de VS Code (code) o Code - Insiders
  - Busca extensiones instaladas que coincidan con gemini|genmini
  - Recopila logs del host de extensiones y carpeta de la extensión
  - Intenta desinstalar e instalar via CLI si está disponible
  - Empaqueta un ZIP con la información en la carpeta del script

  Uso: ejecutar en PowerShell con permisos del usuario que corre VS Code.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "=> repair_gemini_vscode.ps1: empezando diagnóstico..."

function Find-CodeCli {
    # Busca 'code' y 'code-insiders' en PATH
    $candidates = @('code','code-insiders')
    foreach ($c in $candidates) {
        try {
            $ver = & $c --version 2>$null
            if ($LASTEXITCODE -eq 0) { return @{cmd=$c; version=$ver -join " `n"} }
        } catch { }
    }
    return $null
}

$codeCli = Find-CodeCli
if ($null -eq $codeCli) {
    Write-Warning "No se encontró el comando 'code' ni 'code-insiders' en PATH. Para usar la reparación automática instala el comando desde Command Palette: 'Shell Command: Install 'code' command in PATH'.";
} else {
    Write-Host "Encontrado CLI: $($codeCli.cmd)";
}

function Find-ExtensionIds {
    param($cli)
    $pattern = 'gemini|genmini|gen-mini'
    $ids = @()
    if ($cli) {
        try {
            $list = & $cli --list-extensions --show-versions 2>$null
            foreach ($l in $list) {
                if ($l -match $pattern) { $ids += $l.Trim() }
            }
        } catch {
            # ignore
        }
    }
    # Also search in extensions folder
    $extRoot = Join-Path $env:USERPROFILE '.vscode\extensions'
    if (Test-Path $extRoot) {
        Get-ChildItem -Path $extRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            if ($_.Name -match $pattern) {
                $ids += $_.Name
            }
        }
    }
    return $ids | Select-Object -Unique
}

$extIds = Find-ExtensionIds -cli ($codeCli.cmd -as [string])
if (-not $extIds -or $extIds.Count -eq 0) {
    Write-Warning "No se encontró una extensión con nombre que coincida con gemini/genmini en 'code --list-extensions' ni en ~/.vscode/extensions."
} else {
    Write-Host "Encontradas extensiones (id o carpeta):`n$($extIds -join "`n")"
}

# Recolectar logs y datos en un ZIP
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $scriptDir 'gemini_vscode_diag'
if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
New-Item -ItemType Directory -Path $outDir | Out-Null

Write-Host "Recolectando VS Code info y logs..."

# VS Code version
try { $vsVer = (& $codeCli.cmd --version) -join " `n" } catch { $vsVer = 'code CLI no disponible' }
Set-Content -Path (Join-Path $outDir 'code_version.txt') -Value $vsVer

# Copy extension folders that match
$extRoot = Join-Path $env:USERPROFILE '.vscode\extensions'
if (Test-Path $extRoot) {
    Get-ChildItem -Path $extRoot -Directory | Where-Object { $_.Name -match 'gemini|genmini|gen-mini' } | ForEach-Object {
        $target = Join-Path $outDir "extensions\$($_.Name)"
        Write-Host "Copiando extension folder: $($_.FullName) -> $target"
        Copy-Item -Path $_.FullName -Destination $target -Recurse -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No existe carpeta de extensiones en: $extRoot"
}

# Collect logs (AppData\Code\logs)
$logsRoot = Join-Path $env:APPDATA 'Code\logs'
if (-Not (Test-Path $logsRoot)) {
    # Try Insiders path
    $logsRoot = Join-Path $env:APPDATA 'Code - Insiders\logs'
}
if (Test-Path $logsRoot) {
    # copy latest log tree
    $latest = Get-ChildItem $logsRoot | Sort-Object LastWriteTime -Descending | Select-Object -First 3
    foreach ($l in $latest) {
        $dest = Join-Path $outDir "logs\$($l.Name)"
        Write-Host "Copiando logs: $($l.FullName) -> $dest"
        Copy-Item -Path $l.FullName -Destination $dest -Recurse -Force -ErrorAction SilentlyContinue
    }
} else { Write-Host "No encontré logs de VS Code en $logsRoot" }

# Save list of installed extensions
try { & $codeCli.cmd --list-extensions --show-versions > (Join-Path $outDir 'installed_extensions.txt') } catch { Set-Content -Path (Join-Path $outDir 'installed_extensions.txt') -Value 'code CLI no disponible' }

# Try uninstall/install via CLI
if ($codeCli) {
    foreach ($id in $extIds) {
        Write-Host "Intentando reinstalar: $id"
        try {
            & $codeCli.cmd --uninstall-extension $id 2>&1 | Out-File -FilePath (Join-Path $outDir "uninstall_$($id -replace '[^a-zA-Z0-9_.-]','_').txt") -Encoding UTF8
        } catch { }
        try {
            & $codeCli.cmd --install-extension $id 2>&1 | Out-File -FilePath (Join-Path $outDir "install_$($id -replace '[^a-zA-Z0-9_.-]','_').txt") -Encoding UTF8
        } catch { }
    }
}

# Package into ZIP
$zipPath = Join-Path $scriptDir ('gemini_vscode_diag_{0}.zip' -f (Get-Date -Format 'yyyyMMdd_HHmmss'))
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($outDir, $zipPath)

Write-Host "=> He generado diagnóstico en: $zipPath"
Write-Host "Contenido resumido:"
Get-ChildItem -Path $outDir -Recurse | Select-Object FullName, Length | Sort-Object FullName | Format-Table -AutoSize

Write-Host "Si el CLI no está disponible o la reinstalación falló, abre VS Code, ve a 'Help → Toggle Developer Tools' → Console y pega cualquier error rojo aquí. También adjunta el ZIP que generé."

Write-Host "Terminado."
