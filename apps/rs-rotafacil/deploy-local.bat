@echo off
setlocal enabledelayedexpansion
title RS-IA STUDIO - Builder Deploy (DevOps)
color 0E

echo ===================================================
echo 🛠️  RS-IA STUDIO - BUILDER DEPLOY (MODO DEVOPS)
echo ===================================================
echo Este processo ira compilar os servicos para producao local.
echo.

set ROOT_DIR=%~dp0

:: 1. Verificacao de Dependencias
echo [1/4] Verificando ambiente...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit /b
)
echo.

:: 2. Build Evolution API
echo [2/4] Preparando Evolution API Core...
cd /d "%ROOT_DIR%external\evolution-api"
echo [DevOps] Instalando dependencias da API...
call npm install
echo [DevOps] Gerando build de producao (Compilando TypeScript)...
call npm run build
if exist dist (
    echo ✅ Build da API concluido com sucesso!
) else (
    echo ❌ Falha ao gerar build da API. Verifique os erros acima.
)
echo.

:: 3. Verificacao n8n
echo [3/4] Verificando n8n...
cd /d "%ROOT_DIR%external\n8n"
if not exist node_modules (
    echo [DevOps] Instalando dependencias do n8n (isso pode demorar muito)...
    call npm install
)
echo ✅ n8n esta pronto para execucao.
echo.

:: 4. Finalizacao
cd /d "%ROOT_DIR%"
echo ===================================================
echo ✅ BUILD E DEPLOY LOCAL CONCLUIDO!
echo ===================================================
echo.
echo Agora voce pode usar o "start-whatsapp-env.bat" para
echo iniciar todos os servicos de forma estavel.
echo.
echo 💡 DICA: O "Build" so precisa ser feito UMA VEZ ou
echo    quando o sistema apresentar erros de arquivos ausentes.
echo.
pause
