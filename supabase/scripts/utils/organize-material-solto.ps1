$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path -Parent $PSScriptRoot) '..' | Resolve-Path | Select-Object -ExpandProperty Path
$src = Join-Path $root 'Material solto para ajustar'

$paths = @{ 
  sql       = Join-Path $root 'scripts/sql'
  rls       = Join-Path $root 'scripts/rls'
  views     = Join-Path $root 'scripts/views'
  tests     = Join-Path $root 'scripts/tests'
  python    = Join-Path $root 'scripts/python'
  powershell= Join-Path $root 'scripts/powershell'
  deploy    = Join-Path $root 'scripts/deploy'
  utils     = Join-Path $root 'scripts/utils'
  checklists= Join-Path $root 'docs/checklists'
  guias     = Join-Path $root 'docs/guias'
  auditorias= Join-Path $root 'docs/auditorias'
  historico = Join-Path $root 'docs/historico'
  archive   = Join-Path $root 'archive'
}

foreach ($p in $paths.Values) { if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }

function SafeMove($file, $dest) {
  $destFile = Join-Path -Path $dest -ChildPath $file.Name
  if (-not (Test-Path -LiteralPath $destFile)) {
    Move-Item -LiteralPath $file.FullName -Destination $dest -ErrorAction Stop
  }
}

# 1) Por extensão
Get-ChildItem -LiteralPath $src -Filter '*.sql' -File -ErrorAction SilentlyContinue | ForEach-Object { SafeMove $_ $paths.sql }
Get-ChildItem -LiteralPath $src -Filter '*.py'  -File -ErrorAction SilentlyContinue | ForEach-Object { SafeMove $_ $paths.python }
Get-ChildItem -LiteralPath $src -Filter '*.ps1' -File -ErrorAction SilentlyContinue | ForEach-Object { SafeMove $_ $paths.powershell }
Get-ChildItem -LiteralPath $src -Filter '*.sh'  -File -ErrorAction SilentlyContinue | ForEach-Object { SafeMove $_ $paths.deploy }
Get-ChildItem -LiteralPath $src -Filter '*.json'-File -ErrorAction SilentlyContinue | ForEach-Object { SafeMove $_ $paths.tests }
Get-ChildItem -LiteralPath $src -Filter '*.js'  -File -ErrorAction SilentlyContinue | ForEach-Object { SafeMove $_ $paths.utils }

# 2) Classificação de Markdown por nome
$mdFiles = Get-ChildItem -LiteralPath $src -Filter '*.md' -File -ErrorAction SilentlyContinue
foreach ($f in $mdFiles) {
  $name = $f.Name.ToUpper()
  if ($name -match 'CHECKLIST') { SafeMove $f $paths.checklists }
  elseif ($name -match 'AUDITORIA') { SafeMove $f $paths.auditorias }
elseif ($name -match 'GUIA|README|INTEGRACAO|APIS-CONECTADAS|SSO|WEBHOOK|COMUNICACAO|DEPLOY|VPS|SSH|VIEWS|MARKETPLACE|API|PIX|BOLETO') { SafeMove $f $paths.guias }
  else { SafeMove $f $paths.historico }
}

# 3) Restantes
$leftovers = Get-ChildItem -LiteralPath $src -File -ErrorAction SilentlyContinue
foreach ($f in $leftovers) { SafeMove $f $paths.historico }

function CountNonGitKeep($path) { (Get-ChildItem -LiteralPath $path -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne '.gitkeep' }).Count }

$report = @()
$report += '# README do Material Solto'
$report += ''
$report += 'Pastas criadas:'
$report += ('- scripts/sql/ (' + (CountNonGitKeep $paths.sql) + ' arquivos)')
$report += ('- scripts/rls/ (' + (CountNonGitKeep $paths.rls) + ' arquivos)')
$report += ('- scripts/views/ (' + (CountNonGitKeep $paths.views) + ' arquivos)')
$report += ('- scripts/tests/ (' + (CountNonGitKeep $paths.tests) + ' arquivos)')
$report += ('- scripts/python/ (' + (CountNonGitKeep $paths.python) + ' arquivos)')
$report += ('- scripts/powershell/ (' + (CountNonGitKeep $paths.powershell) + ' arquivos)')
$report += ('- scripts/deploy/ (' + (CountNonGitKeep $paths.deploy) + ' arquivos)')
$report += ('- scripts/utils/ (' + (CountNonGitKeep $paths.utils) + ' arquivos)')
$report += ('- docs/checklists/ (' + (CountNonGitKeep $paths.checklists) + ' arquivos)')
$report += ('- docs/guias/ (' + (CountNonGitKeep $paths.guias) + ' arquivos)')
$report += ('- docs/auditorias/ (' + (CountNonGitKeep $paths.auditorias) + ' arquivos)')
$report += ('- docs/historico/ (' + (CountNonGitKeep $paths.historico) + ' arquivos)')
$report += ('- archive/ (' + (CountNonGitKeep $paths.archive) + ' arquivos)')
$report += ''
$report += 'Tipos de conteúdo movidos:'
$report += '- .py → scripts/python/'
$report += '- .ps1 → scripts/powershell/'
$report += '- .sh → scripts/deploy/'
$report += '- .json (tests) → scripts/tests/'
$report += '- .js → scripts/utils/'
$report += '- .md (CHECKLIST) → docs/checklists/'
$report += '- .md (AUDITORIA) → docs/auditorias/'
$report += '- .md (GUIA/README/INTEGRACAO/DEPLOY/VPS/SSH/VIEWS/MARKETPLACE) → docs/guias/'
$report += '- Outros → docs/historico/'
$report += ''
$report += 'Avisos:'
$report += '- Conteúdo sensível (credenciais) deve permanecer em supabase/_material_solto, sem exposição.'
$report += '- Processo 100% reversível: nenhum arquivo excluído ou renomeado.'

$readmePath = Join-Path $root 'README_MATERIAL_SOLTO.md'
Set-Content -LiteralPath $readmePath -Value ($report -join "`n") -Encoding UTF8