$ErrorActionPreference = 'Stop'
function ParseEnv($path) {
  $vars = @{}
  if (-not (Test-Path -LiteralPath $path)) { return $vars }
  Get-Content -LiteralPath $path | ForEach-Object {
    if ($_ -match '^[A-Za-z0-9_]+=') {
      $k,$v = $_.Split('=',2)
      $vars[$k] = $v
    }
  }
  return $vars
}

function CheckEnv($path, $required, $name) {
  $vars = ParseEnv $path
  $missing = @()
  foreach ($k in $required) {
    if (-not $vars.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($vars[$k])) { $missing += $k }
  }
  if ($missing.Count -gt 0) {
    Write-Host "[MISSING] $name ->" ($missing -join ', ')
    return $false
  } else {
    Write-Host "[OK] $name"
    return $true
  }
}

$root = "rs-ecosystem"
$ok = $true

# Core/tool envs
$ok = (CheckEnv "$root/infra/docker/.env.core" @('NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY') '.env.core') -and $ok
$ok = (CheckEnv "$root/infra/docker/.env.tools" @('OPENHUNTER_API_KEY','ELEVENLABS_API_KEY','MERCADO_PAGO_PUBLIC_KEY','MERCADO_PAGO_ACCESS_TOKEN','MERCADO_PAGO_TOKEN','MELHOR_ENVIO_TOKEN','N8N_ENCRYPTION_KEY','N8N_BASE_URL') '.env.tools') -and $ok

# Apps
$commonFE = @('NODE_ENV','PORT','RS_API_URL','RS_CORE_URL','NEXT_PUBLIC_API_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY')
$payments = @('MERCADO_PAGO_PUBLIC_KEY','MERCADO_PAGO_ACCESS_TOKEN','MELHOR_ENVIO_TOKEN')

$ok = (CheckEnv "$root/apps/rs-site/.env" $commonFE 'rs-site/.env') -and $ok
$ok = (CheckEnv "$root/apps/rs-admin/.env" $commonFE 'rs-admin/.env') -and $ok
$ok = (CheckEnv "$root/apps/rs-consultor/.env" $commonFE 'rs-consultor/.env') -and $ok

$ok = (CheckEnv "$root/apps/rs-marketplace/.env" ($commonFE + $payments) 'rs-marketplace/.env') -and $ok
$ok = (CheckEnv "$root/apps/rs-walletpay/.env" ($commonFE + $payments) 'rs-walletpay/.env') -and $ok

$ok = (CheckEnv "$root/apps/rs-logistica/.env" ($commonFE + @('MELHOR_ENVIO_TOKEN')) 'rs-logistica/.env') -and $ok

$studioReq = @('NODE_ENV','PORT','RS_API_URL','NEXT_PUBLIC_API_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','OPENHUNTER_API_KEY','ELEVENLABS_API_KEY')
$ok = (CheckEnv "$root/apps/rs-studio/.env" $studioReq 'rs-studio/.env') -and $ok

$ok = (CheckEnv "$root/apps/rs-docs/.env" @('NODE_ENV','PORT','RS_API_URL','NEXT_PUBLIC_API_URL') 'rs-docs/.env') -and $ok
$ok = (CheckEnv "$root/apps/rs-template-game/.env" @('NODE_ENV','PORT','RS_API_URL','NEXT_PUBLIC_API_URL') 'rs-template-game/.env') -and $ok
$ok = (CheckEnv "$root/apps/rs-ops-app/.env" @('NODE_ENV','PORT','RS_API_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','NEXT_PUBLIC_API_URL') 'rs-ops-app/.env') -and $ok

$apiReq = @('NODE_ENV','PORT','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_DB_URL') + $payments + @('MERCADO_PAGO_TOKEN','CORS_ALLOWED_ORIGINS')
$ok = (CheckEnv "$root/apps/rs-api/.env" $apiReq 'rs-api/.env') -and $ok

$coreReq = @('NODE_ENV','PORT','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_DB_URL')
$ok = (CheckEnv "$root/apps/rs-core/.env" $coreReq 'rs-core/.env') -and $ok

$configReq = @('NODE_ENV','PORT','RS_CORE_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY')
$ok = (CheckEnv "$root/apps/rs-config/.env" $configReq 'rs-config/.env') -and $ok

# Nginx server_name validation
$nginxMap = @{
  'rs-site.conf' = 'rsprolipsi.com.br'
  'rs-admin.conf' = 'admin.rsprolipsi.com.br'
  'rs-consultor.conf' = 'escritorio.rsprolipsi.com.br'
  'rs-marketplace.conf' = 'marketplace.rsprolipsi.com.br'
  'rs-walletpay.conf' = 'walletpay.rsprolipsi.com.br'
  'rs-logistica.conf' = 'logistica.rsprolipsi.com.br'
  'rs-studio.conf' = 'studio.rsprolipsi.com.br'
  'rs-docs.conf' = 'docs.rsprolipsi.com.br'
  'rs-template-game.conf' = 'game.rsprolipsi.com.br'
  'rs-ops-app.conf' = 'ops.rsprolipsi.com.br'
  'rs-api.conf' = 'api.rsprolipsi.com.br'
  'rs-core.conf' = 'core.rsprolipsi.com.br'
  'rs-config.conf' = 'config.rsprolipsi.com.br'
  'rs-tools.conf' = 'tools.rsprolipsi.com.br'
}

foreach ($pair in $nginxMap.GetEnumerator()) {
  $confPath = "$root/infra/nginx/sites-enabled/" + $pair.Key
  if (-not (Test-Path -LiteralPath $confPath)) { Write-Host "[MISSING] $confPath"; $ok = $false; continue }
  $content = Get-Content -LiteralPath $confPath
  $hasServerName = $false
  foreach ($line in $content) { if ($line -match "server_name\s+" + [regex]::Escape($pair.Value)) { $hasServerName = $true; break } }
  if ($hasServerName) { Write-Host "[OK] nginx $($pair.Key) -> $($pair.Value)" } else { Write-Host "[MISMATCH] nginx $($pair.Key)"; $ok = $false }
}

if ($ok) { Write-Host "All checks passed"; exit 0 } else { Write-Host "Some checks failed"; exit 1 }