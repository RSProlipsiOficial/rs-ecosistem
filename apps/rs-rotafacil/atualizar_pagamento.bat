@echo off
echo Iniciando atualizacao do sistema de pagamento...
echo Por favor, aguarde...
call npx supabase functions deploy mercado-pago-payment --project-ref rptkhrboejbwexseikuo --no-verify-jwt
echo.
echo ==========================================
echo Atualizacao concluida! 
echo Se apareceu "Deployed" acima, o pagamento deve funcionar agora.
echo Pode fechar esta jenela.
echo ==========================================
pause
