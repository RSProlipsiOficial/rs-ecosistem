@echo off
cd /d "d:\Rs  Ecosystem\rs-ecosystem\apps\rs-rotafacil"

echo ============================================
echo INICIANDO ROTA FACIL (MODO INTEGRADO RSZAP)
echo ============================================
echo.
echo URL API WhatsApp: https://rszap.rsprolipsi.com.br
echo.
echo IMPORTANTE: Voce disse que "precisa subir o deploy".
echo Se o site nao conectar no WhatsApp, e porque voce 
echo precisa rodar o Docker na VPS primeiro!
echo.

REM 1. Verificando .env
IF NOT EXIST .env (
    echo [AVISO] Criando arquivo .env basico...
    copy .env.example .env >nul
)

REM 2. Iniciando Aplicacao
echo [1/1] Iniciando Servidor Frontend (Vite)...
echo.
start "Rota Facil App" cmd /k "npm run dev"

echo.
echo ============================================
echo SISTEMA INICIADO!
echo ============================================
echo.
echo Frontend: http://localhost:8080
echo.
echo Para conectar o WhatsApp:
echo Acesse: http://localhost:8080/configuracoes/whatsapp
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
