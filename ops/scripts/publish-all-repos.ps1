$ErrorActionPreference = "Continue"

$GITHUB_TOKEN = "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"
$GITHUB_ORG = "RSProlipsiOficial"
$BASE_DIR = "G:\Rs  Ecosystem"

$repos = @(
    "rs-ecosystem",
    "bolt.new",
    "n8n",
    "evolution-api",
    "openhunter"
)

foreach ($repo in $repos) {
    Write-Host "=== Publicando $repo ===" -ForegroundColor Cyan
    
    $repoPath = Join-Path $BASE_DIR $repo
    
    if (!(Test-Path $repoPath)) {
        Write-Host "Diretorio $repo nao encontrado, pulando..." -ForegroundColor Yellow
        continue
    }
    
    Set-Location $repoPath
    
    if (!(Test-Path ".git")) {
        Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
        git init
        git add -A
        git commit -m "Initial commit - RS Prolipsi"
    }
    
    Write-Host "Criando repositorio no GitHub..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "token $GITHUB_TOKEN"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $body = @{
        "name" = $repo
        "private" = $false
        "auto_init" = $false
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "https://api.github.com/orgs/$GITHUB_ORG/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "Repositorio criado no GitHub" -ForegroundColor Green
    } catch {
        Write-Host "Repositorio ja existe ou erro ao criar, continuando..." -ForegroundColor Yellow
    }
    
    Write-Host "Configurando remote..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_ORG/$repo.git"
    
    Write-Host "Publicando no GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main --force
    
    Write-Host "Repositorio $repo publicado com sucesso!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=== Todos os repositorios publicados ===" -ForegroundColor Green