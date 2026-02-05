Write-Host "Aplicando migration no Supabase..." -ForegroundColor Cyan

$sql = Get-Content "c:\Users\Asus\Desktop\rs-rotafacil-main\rs-rotafacil\supabase\migrations\20241225_fix_financeiro_tables.sql" -Raw

Write-Host "SQL lido: $($sql.Length) caracteres" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCOES:" -ForegroundColor Yellow
Write-Host "1. Abra: https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new"
Write-Host "2. Copie o arquivo: 20241224_complete_migration.sql"
Write-Host "3. Cole no editor SQL"
Write-Host "4. Clique em RUN"
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir o navegador..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new"
