$ErrorActionPreference = 'Stop'

# Entrar na pasta dos arquivos .env e docker-compose
Set-Location "$PSScriptRoot/../infra/docker"

# Carregar variáveis do .env.core
Get-Content ".env.core" | ForEach-Object {
  if ($_ -match '^(?<k>[A-Z0-9_]+)=(?<v>.*)$') { $env[$Matches.k] = $Matches.v }
}

# Carregar variáveis do .env.tools
Get-Content ".env.tools" | ForEach-Object {
  if ($_ -match '^(?<k>[A-Z0-9_]+)=(?<v>.*)$') { $env[$Matches.k] = $Matches.v }
}

# Compose tools
Write-Host "→ docker compose -f docker-compose.tools.yml up -d"
docker compose -f docker-compose.tools.yml up -d
Write-Host "→ docker compose -f docker-compose.tools.yml ps"
docker compose -f docker-compose.tools.yml ps
Write-Host "→ docker compose -f docker-compose.tools.yml logs --tail 100"
docker compose -f docker-compose.tools.yml logs --tail 100
Write-Host "Tools stack deployed"