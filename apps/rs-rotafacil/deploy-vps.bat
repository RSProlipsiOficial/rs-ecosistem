@echo off
setlocal enabledelayedexpansion
title RS ROTAFACIL - Deploy para VPS (SSH)
color 0A

echo ================================================
echo 🚀 ROTAFACIL - DEPLOY PARA VPS VIA SSH
echo ================================================
echo.
echo Este script vai:
echo 1. Enviar arquivos para o servidor
echo 2. Fazer build e deploy no servidor via Docker
echo.

:: =====================================
:: CONFIGURAÇÕES DO SERVIDOR
:: =====================================
set SSH_HOST=72.60.144.245
set SSH_USER=root
set SSH_PORT=22
set APP_NAME=rotafacil
set REMOTE_DIR=/root/rotafacil
set SSH_KEY=C:\Users\Asus\.ssh\antigravity_deploy

echo [1/5] Testando conexão SSH...
ssh -i "%SSH_KEY%" -o ConnectTimeout=10 -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "echo 'Conexao SSH OK'" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Erro ao conectar no servidor SSH!
    echo.
    echo Verifique:
    echo - Se o servidor %SSH_HOST% está acessível
    echo - Se você tem acesso SSH configurado
    echo - Se a chave SSH está correta
    echo.
    pause
    exit /b 1
)
echo ✅ Conexão SSH OK
echo.

:: =====================================
:: CRIAR DIRETÓRIO NO SERVIDOR
:: =====================================
echo [2/5] Preparando servidor...
ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_DIR%"
echo ✅ Servidor preparado
echo.

:: =====================================
:: ENVIAR ARQUIVOS PARA O SERVIDOR
:: =====================================
echo [3/5] Enviando arquivos (isso pode demorar)...
scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no -r ^
  package.json ^
  package-lock.json ^
  index.html ^
  vite.config.ts ^
  tsconfig.json ^
  tsconfig.app.json ^
  tsconfig.node.json ^
  postcss.config.js ^
  tailwind.config.ts ^
  components.json ^
  .env.example ^
  Dockerfile ^
  nginx.conf ^
  docker-compose.yml ^
  .dockerignore ^
  src ^
  public ^
  %SSH_USER%@%SSH_HOST%:%REMOTE_DIR%/

if %errorlevel% neq 0 (
    echo ❌ Erro ao enviar arquivos!
    pause
    exit /b 1
)
echo ✅ Arquivos enviados
echo.

:: =====================================
:: BUILD E DEPLOY NO SERVIDOR
:: =====================================
echo [4/5] Fazendo build e deploy no servidor...
echo (Este processo pode demorar alguns minutos)
echo.

ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose down 2>/dev/null || true && docker-compose build && docker-compose up -d"

if %errorlevel% neq 0 (
    echo ❌ Erro ao fazer deploy!
    echo.
    echo Deseja ver os logs do servidor? (S/N)
    set /p VER_LOGS=
    if /i "!VER_LOGS!"=="S" (
        ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose logs"
    )
    pause
    exit /b 1
)
echo ✅ Deploy concluído
echo.

:: =====================================
:: VERIFICAR STATUS
:: =====================================
echo [5/5] Verificando status da aplicação...
ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "docker ps | grep %APP_NAME%"
echo.

:: =====================================
:: FINALIZAÇÃO
:: =====================================
echo ================================================
echo ✅ DEPLOY CONCLUÍDO COM SUCESSO!
echo ================================================
echo.
echo 🌐 Aplicação disponível em: http://%SSH_HOST%:8080
echo.
echo 📋 Comandos úteis:
echo.
echo Ver logs em tempo real:
echo   ssh %SSH_USER%@%SSH_HOST% "docker logs -f %APP_NAME%-app"
echo.
echo Ver status:
echo   ssh %SSH_USER%@%SSH_HOST% "docker ps"
echo.
echo Parar aplicação:
echo   ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose stop"
echo.
echo Reiniciar:
echo   ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose restart"
echo.
pause
