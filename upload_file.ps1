
param(
    [string]$LocalPath,
    [string]$RepoPath,
    [string]$CommitMessage
)

$env:Path += ";C:\Program Files\GitHub CLI\bin"
try {
    $fileContent = Get-Content -Path $LocalPath -Raw -ErrorAction Stop
    $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))

    # Primero, intentamos obtener el SHA del archivo por si ya existe
    $sha = ""
    try {
        $existingFile = gh api "/repos/golloschickens-collab/Goio-Store/contents/$RepoPath" --jq .sha
        if ($existingFile) {
            $sha = $existingFile
        }
    } catch {
        # El archivo no existe, lo cual está bien.
    }

    $body = @{
        message = $CommitMessage
        content = $base64Content
    }
    if ($sha) {
        $body.sha = $sha
    }

    $jsonBody = $body | ConvertTo-Json -Compress

    $jsonBody | gh api --method PUT "/repos/golloschickens-collab/Goio-Store/contents/$RepoPath" --input - -H "Accept: application/vnd.github.v3+json"

    Write-Host "Successfully uploaded $RepoPath"
} catch {
    Write-Host "Error processing file $LocalPath : $_"
    exit 1
}
