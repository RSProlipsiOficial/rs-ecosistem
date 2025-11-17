# =====================================================
# RS PROLIPSI - DEPLOY COMPLETO COMUNICACAO NA VPS
# =====================================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY ADMIN + CONSULTOR NA VPS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$VPS_IP = "72.60.144.245"
$VPS_USER = "root"
$VPS_PASSWORD = "Yannis784512@"

# Caminhos
$adminPath = "G:\Rs Prolipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-admin"
$consultorPath = "G:\Rs Prolipsi Oficial v.1 Roberto Camargo\Documentacao RS Prolipsi\rs-consultor"

Write-Host "[1/6] Fazendo build do ADMIN..." -ForegroundColor Yellow
cd $adminPath
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Build do Admin concluido!" -ForegroundColor Green
} else {
    Write-Host "  ERRO no build do Admin!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/6] Fazendo build do CONSULTOR..." -ForegroundColor Yellow
cd $consultorPath
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Build do Consultor concluido!" -ForegroundColor Green
} else {
    Write-Host "  ERRO no build do Consultor!" -ForegroundColor Red
    exit 1
}

Write-Host "[3/6] Conectando na VPS e criando diretorios..." -ForegroundColor Yellow
$createDirs = @"
mkdir -p /var/www/admin
mkdir -p /var/www/consultor
chown -R www-data:www-data /var/www/admin
chown -R www-data:www-data /var/www/consultor
"@

echo $createDirs | ssh ${VPS_USER}@${VPS_IP} "bash -s"
Write-Host "  OK Diretorios criados!" -ForegroundColor Green

Write-Host "[4/6] Enviando build do ADMIN para VPS..." -ForegroundColor Yellow
scp -r "$adminPath\dist\*" ${VPS_USER}@${VPS_IP}:/var/www/admin/
Write-Host "  OK Admin enviado!" -ForegroundColor Green

Write-Host "[5/6] Enviando build do CONSULTOR para VPS..." -ForegroundColor Yellow
scp -r "$consultorPath\dist\*" ${VPS_USER}@${VPS_IP}:/var/www/consultor/
Write-Host "  OK Consultor enviado!" -ForegroundColor Green

Write-Host "[6/6] Configurando permissoes na VPS..." -ForegroundColor Yellow
$setPermissions = @"
chown -R www-data:www-data /var/www/admin
chown -R www-data:www-data /var/www/consultor
chmod -R 755 /var/www/admin
chmod -R 755 /var/www/consultor
"@

echo $setPermissions | ssh ${VPS_USER}@${VPS_IP} "bash -s"
Write-Host "  OK Permissoes configuradas!" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  DEPLOY CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ACESSE:" -ForegroundColor Yellow
Write-Host "  Admin: https://admin.rsprolipsi.com.br" -ForegroundColor Cyan
Write-Host "  Consultor: https://consultor.rsprolipsi.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Execute SQL-VERIFICACAO-AUTOMATICA.sql no Supabase" -ForegroundColor White
Write-Host "2. Teste criar comunicado no Admin" -ForegroundColor White
Write-Host "3. Verifique no Consultor" -ForegroundColor White
Write-Host ""
