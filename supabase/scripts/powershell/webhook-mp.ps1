# Script para configurar Webhook Mercado Pago
$headers = @{
    "Authorization" = "Bearer APP_USR-7775914435593768-080212-ca91c8f829c87e5885ae7b4bf6ed74c5-2069869679"
    "Content-Type" = "application/json"
}

$body = @{
    url = "https://api.rsprolipsi.com.br/api/webhook/mercadopago"
    events = @(
        @{ topic = "payment" }
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/webhooks" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Webhook configurado com sucesso!" -ForegroundColor Green
    Write-Host "ID: $($response.id)"
    Write-Host "URL: $($response.url)"
} catch {
    Write-Host "❌ Erro ao configurar webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Configure manualmente em:" -ForegroundColor Yellow
    Write-Host "https://www.mercadopago.com.br/developers/panel/webhooks"
}
