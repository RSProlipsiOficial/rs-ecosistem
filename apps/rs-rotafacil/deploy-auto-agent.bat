@echo off
setlocal enabledelayedexpansion
title RS ROTAFACIL - Deploy Agent
color 0A

echo ================================================
echo 🚀 ROTAFACIL - DEPLOY (AGENTE SSH)
echo ================================================

set SSH_HOST=72.60.144.245
set SSH_USER=root
set REMOTE_DIR=/root/rotafacil

echo [1/4] Testando conexao (confiando no seu terminal)...
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 %SSH_USER%@%SSH_HOST% "echo 'Conexao OK'"
if %errorlevel% neq 0 (
    echo ❌ O SSH falhou mesmo sem especificar chave. 
    echo Verifique se voce realmente consegue rodar 'ssh root@72.60.144.245' sem senha neste terminal.
    exit /b 1
)

echo [2/4] Criando diretorio...
ssh -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_DIR%"

echo [3/4] Enviando arquivos...
scp -o StrictHostKeyChecking=no -r package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json postcss.config.js tailwind.config.ts components.json .env.example Dockerfile nginx.conf docker-compose.yml .dockerignore src public %SSH_USER%@%SSH_HOST%:%REMOTE_DIR%/

echo [4/4] Deploy remoto...
ssh -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "cd %REMOTE_DIR% && docker-compose down 2>/dev/null || true && docker-compose build && docker-compose up -d"

echo [5/5] Verificando...
ssh -o StrictHostKeyChecking=no %SSH_USER%@%SSH_HOST% "docker ps | grep rotafacil"

echo ✅ SUCESSO!
