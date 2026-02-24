@echo off
setlocal enabledelayedexpansion
title RS ROTAFACIL - Deploy Auto
color 0A

echo ================================================
echo 🚀 ROTAFACIL - DEPLOY AUTOMATICO
echo ================================================

set SSH_HOST=72.60.144.245
set SSH_USER=root
set REMOTE_DIR=/root/rotafacil
set SSH_KEY=C:\Users\Asus\.ssh\antigravity_deploy

echo [1/5] Testando conexao SSH...
ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no -o ConnectTimeout=10 %SSH_USER%@%SSH_HOST% "echo 'Conexao SSH OK'"
if %errorlevel% neq 0 (
    echo ❌ Falha no SSH. Tentando metodo fallback (chave padrao)...
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 %SSH_USER%@%SSH_HOST% "echo 'Conexao SSH Fallback OK'"
    if !errorlevel! neq 0 (
        echo ❌ Erro critico: Nao foi possivel conectar via SSH com a chave especifica nem a padrao.
        echo Verifique se a chave privada existe em %SSH_KEY%
        exit /b 1
    )
)

echo [2/5] Preparando servidor...
ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_DIR%"

echo [3/5] Enviando arquivos...
scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no -r package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json postcss.config.js tailwind.config.ts components.json .env.example Dockerfile nginx.conf docker-compose.yml .dockerignore src public %SSH_USER%@%SSH_HOST%:%REMOTE_DIR%/

echo [4/5] Deploy remoto...
ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose down 2>/dev/null || true && docker-compose build && docker-compose up -d"

echo [5/5] Verificando...
ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "docker ps | grep rotafacil"

echo ✅ SUCESSO!
