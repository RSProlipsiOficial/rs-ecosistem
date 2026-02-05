@echo off
echo ====================================
echo  DEPLOY EDGE FUNCTION - ADMIN USERS
echo ====================================
echo.

cd /d "%~dp0"

echo [1/3] Criando bundle...
cd supabase\functions\admin-users

echo [2/3] Fazendo upload...
curl -L -X POST "https://api.supabase.com/v1/projects/rptkhrboejbwexseikuo/functions/admin-users" ^
  -H "Authorization: Bearer sbp_18a25c8813bbcdd9ba8f43d3c1d66d394a4f7bd7" ^
  -H "Content-Type: application/json" ^
  --data-raw "{\"name\":\"admin-users\",\"verify_jwt\":false,\"import_map\":false}"

echo.
echo [3/3] Enviando código...
curl -L -X PUT "https://api.supabase.com/v1/projects/rptkhrboejbwexseikuo/functions/admin-users" ^
  -H "Authorization: Bearer sbp_18a25c8813bbcdd9ba8f43d3c1d66d394a4f7bd7" ^
  -H "Content-Type: application/json" ^
  --data-raw @index.ts

echo.
echo ====================================
echo  DEPLOY CONCLUIDO!
echo ====================================
pause
