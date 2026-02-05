@echo off
title RS ROTAFACIL - Atualizar Servidor
color 0A

echo ================================================
echo 🚀 ATUALIZANDO SERVIDOR VIA GITHUB
echo ================================================
echo.
echo Como voce ja tem a chave SSH configurada no seu terminal,
echo este script vai conectar e puxar as ultimas alteracoes do GitHub.
echo.

echo [1/2] Conectando e Atualizando codigo...
ssh root@72.60.144.245 "cd /root/rotafacil && git reset --hard && git pull origin master"

echo.
echo [2/2] Reconstruindo Containers...
ssh root@72.60.144.245 "cd /root/rotafacil && docker-compose up -d --build"

echo.
echo ✅ ATUALIZACAO CONCLUIDA!
pause
