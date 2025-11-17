$ErrorActionPreference = 'Stop'
function CheckUrl($url, $method='GET'){
  try {
    $resp = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    [PSCustomObject]@{ url=$url; status=$resp.StatusCode; ok=$true; note='' }
  } catch {
    [PSCustomObject]@{ url=$url; status=0; ok=$false; note=$_.Exception.Message }
  }
}

$domains = @(
  'https://rsprolipsi.com.br',
  'https://admin.rsprolipsi.com.br',
  'https://escritorio.rsprolipsi.com.br',
  'https://marketplace.rsprolipsi.com.br',
  'https://walletpay.rsprolipsi.com.br',
  'https://logistica.rsprolipsi.com.br',
  'https://docs.rsprolipsi.com.br',
  'https://game.rsprolipsi.com.br',
  'https://ops.rsprolipsi.com.br',
  'https://studio.rsprolipsi.com.br',
  'https://studio.rsprolipsi.com.br/dev',
  'https://studio.rsprolipsi.com.br/builder',
  'https://studio.rsprolipsi.com.br/agents',
  'https://studio.rsprolipsi.com.br/automations'
)

$results = @()
foreach($d in $domains){ $results += CheckUrl $d }

# CORS preflight against API
$api = 'https://api.rsprolipsi.com.br'
$origins = @(
  'https://rsprolipsi.com.br','https://admin.rsprolipsi.com.br','https://escritorio.rsprolipsi.com.br','https://walletpay.rsprolipsi.com.br','https://marketplace.rsprolipsi.com.br','https://logistica.rsprolipsi.com.br','https://studio.rsprolipsi.com.br','https://docs.rsprolipsi.com.br','https://game.rsprolipsi.com.br','https://ops.rsprolipsi.com.br'
)

foreach($o in $origins){
  try{
    $resp = Invoke-WebRequest -Uri $api -Method Options -Headers @{Origin=$o;'Access-Control-Request-Method'='GET'} -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    $results += [PSCustomObject]@{ url="CORS $api from $o"; status=$resp.StatusCode; ok=$true; note='' }
  } catch {
    $results += [PSCustomObject]@{ url="CORS $api from $o"; status=0; ok=$false; note=$_.Exception.Message }
  }
}

$ok = ($results | Where-Object {$_.ok}).Count
$fail = ($results | Where-Object {-not $_.ok}).Count
Write-Host "Healthcheck summary: OK=$ok FAIL=$fail"
$results | Format-Table -AutoSize | Out-String | Write-Host