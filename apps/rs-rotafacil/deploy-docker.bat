@echo off
setlocal enabledelayedexpansion
title RS ROTAFACIL - Deploy Docker para VPS
color 0A

echo ================================================
echo 🚀 ROTAFACIL - DEPLOY DOCKER PARA VPS
echo ================================================
echo.

:: =====================================
:: CONFIGURAÇÕES DO SERVIDOR
:: =====================================
set SSH_HOST=72.60.144.245
set SSH_USER=root
set SSH_PORT=22
set APP_NAME=rotafacil
set REMOTE_DIR=/root/rotafacil
set LOCAL_PORT=8080

echo [1/6] Verificando requisitos...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado! Instale o Docker Desktop primeiro.
    pause
    exit /b 1
)

ssh -V >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ SSH não encontrado! Verifique a instalação do OpenSSH.
    pause
    exit /b 1
)

echo ✅ Requisitos OK
echo.

:: =====================================
:: BUILD LOCAL DA IMAGEM DOCKER
:: =====================================
echo [2/6] Criando imagem Docker localmente...
docker build -t %APP_NAME%:latest .
if %errorlevel% neq 0 (
    echo ❌ Erro ao criar imagem Docker!
    pause
    exit /b 1
)
echo ✅ Imagem criada com sucesso
echo.

:: =====================================
:: SALVAR IMAGEM EM ARQUIVO TAR
:: =====================================
echo [3/6] Exportando imagem Docker...
docker save -o %APP_NAME%-image.tar %APP_NAME%:latest
if %errorlevel% neq 0 (
    echo ❌ Erro ao exportar imagem!
    pause
    exit /b 1
)
echo ✅ Imagem exportada
echo.

:: =====================================
:: CRIAR DIRETÓRIO NO SERVIDOR
:: =====================================
echo [4/6] Preparando servidor remoto...
ssh %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_DIR%"
if %errorlevel% neq 0 (
    echo ❌ Erro ao conectar no servidor SSH!
    echo.
    echo Verifique:
    echo - Se o servidor está acessível
    echo - Se as credenciais estão corretas
    echo - Se a chave SSH está configurada
    pause
    exit /b 1
)
echo ✅ Servidor preparado
echo.

:: =====================================
:: ENVIAR ARQUIVOS PARA O SERVIDOR
:: =====================================
echo [5/6] Enviando arquivos para o servidor...
scp %APP_NAME%-image.tar %SSH_USER%@%SSH_HOST%:%REMOTE_DIR%/
scp docker-compose.yml %SSH_USER%@%SSH_HOST%:%REMOTE_DIR%/
if %errorlevel% neq 0 (
    echo ❌ Erro ao enviar arquivos!
    pause
    exit /b 1
)
echo ✅ Arquivos enviados
echo.

:: =====================================
:: DEPLOY NO SERVIDOR
:: =====================================
echo [6/6] Fazendo deploy no servidor...
ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker load -i %APP_NAME%-image.tar && docker-compose down && docker-compose up -d && rm %APP_NAME%-image.tar"
if %errorlevel% neq 0 (
    echo ❌ Erro ao fazer deploy!
    pause
    exit /b 1
)
echo ✅ Deploy concluído
echo.

:: =====================================
:: LIMPEZA LOCAL
:: =====================================
echo Removendo arquivo temporário...
del %APP_NAME%-image.tar
echo.

:: =====================================
:: FINALIZAÇÃO
:: =====================================
echo ================================================
echo ✅ DEPLOY CONCLUÍDO COM SUCESSO!
echo ================================================
echo.
echo 🌐 Aplicação disponível em: http://%SSH_HOST%:%LOCAL_PORT%
echo.
echo 📋 Comandos úteis no servidor:
echo    - Ver logs: ssh %SSH_USER%@%SSH_HOST% "docker logs -f %APP_NAME%-app"
echo    - Parar app: ssh %SSH_USER%@%SSH_HOST% "docker-compose -f %REMOTE_DIR%/docker-compose.yml stop"
echo    - Reiniciar: ssh %SSH_USER%@%SSH_HOST% "docker-compose -f %REMOTE_DIR%/docker-compose.yml restart"
echo.
pause
