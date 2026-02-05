@echo off
setlocal enabledelayedexpansion
title RS ROTAFACIL - Deploy Manual
color 0A

echo ================================================
echo 🚀 ROTAFACIL - DEPLOY MANUAL (SSH + SENHA)
echo ================================================
echo.
echo ⚠️  ATENÇÃO: Você precisará digitar a senha quando solicitado!
echo 🔑 SENHA ROOT: Yannis784512@
echo.
echo Copie a senha acima (Ctrl+C não funciona no prompt de senha do SSH, digite ou clique com botão direito se o terminal permitir).
echo.
pause

set SSH_HOST=72.60.144.245
set SSH_USER=root
set REMOTE_DIR=/root/rotafacil

echo [1/3] Criando diretório no servidor...
ssh -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_DIR%"
echo.

echo [2/3] Enviando arquivos (SCP)...
echo Digite a senha novamente se solicitado...
scp -o StrictHostKeyChecking=no -r package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json postcss.config.js tailwind.config.ts components.json .env.example Dockerfile nginx.conf docker-compose.yml .dockerignore src public %SSH_USER%@%SSH_HOST%:%REMOTE_DIR%/
echo.

echo [3/3] Executando Deploy no Servidor...
echo Digite a senha pela ultima vez...
ssh -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose down 2>/dev/null || true && docker-compose build && docker-compose up -d && docker ps | grep rotafacil"
echo.

echo ================================================
echo ✅ PROCESSO FINALIZADO
echo ================================================
echo.
pause
