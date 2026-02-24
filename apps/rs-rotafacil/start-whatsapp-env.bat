@echo off
setlocal enabledelayedexpansion
title RS-IA STUDIO - DevOps Production Center  
color 0B

echo ===================================================
echo 🚀 RS-IA STUDIO - MODO PRODUCAO LOCAL (DEVOPS)
echo ===================================================
echo Iniciando ecossistema WhatsApp Web + Automacao...
echo.

set ROOT_DIR=%~dp0

:: 1. PostgreSQL
echo [1/5] Iniciando PostgreSQL (Porta 5432)...
set PG_BIN="%ROOT_DIR%external\pg\pgsql\bin\postgres.exe"
set PG_DATA="%ROOT_DIR%external\pg\data"
if exist %PG_BIN% (
    start "DEVOPS - PostgreSQL" cmd /k "%PG_BIN% -D %PG_DATA%"
    timeout /t 3 >nul
) else (
    echo [AVISO] PostgreSQL nao encontrado. Pulando...
)

:: 2. Redis
echo [2/5] Iniciando Redis (Porta 6379)...
set REDIS_BIN="%ROOT_DIR%external\redis\redis-server.exe"
set REDIS_CONF="%ROOT_DIR%external\redis\redis.windows.conf"
if exist %REDIS_BIN% (
    start "DEVOPS - Redis" cmd /k "%REDIS_BIN% %REDIS_CONF%"
    timeout /t 2 >nul
) else (
    echo [AVISO] Redis nao encontrado. Pulando...
)

:: 3. Evolution API (Core) - Porta 8081
echo [3/5] Iniciando Evolution API Core (Porta 8081)...
cd /d "%ROOT_DIR%external\evolution-api"

:: Verifica se o build existe
if not exist dist (
    echo [AVISO] Build da API ausente. Usando execucao direta (TSX)...
    if not exist node_modules (
        echo [DevOps] Instalando dependencias da API...
        call npm install
    )
    start "DEVOPS - Evolution API" cmd /k "npx tsx src/main.ts"
) else (
    if not exist node_modules (
        call npm install
    )
    start "DEVOPS - Evolution API" cmd /k "npm run start:prod"
)
cd /d "%ROOT_DIR%"

:: 4. Evolution Manager (UI) - Porta 4433
echo [4/5] Iniciando Gerenciador Evolution UI (Porta 4433)...
start "DEVOPS - Manager UI" cmd /k "node serve-whatsapp-manager.js"
timeout /t 2 >nul

:: 5. n8n (Automacao) - Porta 5678
echo [5/5] Iniciando n8n (Porta 5678)...
cd /d "%ROOT_DIR%external\n8n"
if not exist node_modules (
    echo [DevOps] n8n precisa de dependencias instaladas...
    echo Execute "deploy-local.bat" primeiro para preparar o n8n.
) else (
    start "DEVOPS - n8n" cmd /k "npm run start:windows"
)
cd /d "%ROOT_DIR%"

echo.
echo ===================================================
echo ✅ TODOS OS SERVICOS FORAM DISPARADOS!
echo ===================================================
echo.
echo 💡 PORTAS ATIVAS:
echo    - WhatsApp API Core:  8081
echo    - WhatsApp Manager UI: 4433
echo    - n8n Editor:          5678
echo    - PostgreSQL:          5432
echo    - Redis:               6379
echo.
echo ⚠️  Mantenha as janelas CMD abertas.
echo    Se alguma fechar, verifique a mensagem de erro.
echo.
echo 🔗 Acesse o Admin Panel e navegue para WhatsApp Web
echo    para verificar a conexao.
echo.
pause
