$SUPABASE_URL = "https://rptkhrboejbwexseikuo.supabase.co"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo"

Write-Host "Deletando dados antigos de footer..." -ForegroundColor Yellow

# Delete dados antigos
$deleteUri = "$SUPABASE_URL/rest/v1/landing_content?section=eq.footer"
$headers = @{
    "apikey"        = $SERVICE_ROLE_KEY
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
    "Content-Type"  = "application/json"
}

try {
    Invoke-RestMethod -Uri $deleteUri -Method Delete -Headers $headers
    Write-Host "Dados antigos deletados" -ForegroundColor Green
}
catch {
    Write-Host "Aviso ao deletar: $_" -ForegroundColor Yellow
}

Write-Host "Inserindo dados novos..." -ForegroundColor Yellow

# Insert dados novos
$insertUri = "$SUPABASE_URL/rest/v1/landing_content"
$footerData = @(
    @{
        section       = "footer"
        content_key   = "phone"
        content_value = "(41) 9928639-3922"
        content_type  = "text"
    },
    @{
        section       = "footer"
        content_key   = "email"
        content_value = "rsrotafacil@gmail.com"
        content_type  = "text"
    },
    @{
        section       = "footer"
        content_key   = "address"
        content_value = "Piraquara-Pr"
        content_type  = "text"
    }
)

$body = $footerData | ConvertTo-Json -Depth 10
$headers["Prefer"] = "return=representation"

try {
    $result = Invoke-RestMethod -Uri $insertUri -Method Post -Headers $headers -Body $body
    Write-Host "Inseridos registros:" -ForegroundColor Green
    foreach ($r in $result) {
        Write-Host "  $($r.content_key): $($r.content_value)" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "Erro ao inserir: $_" -ForegroundColor Red
    exit 1
}

Write-Host "CONCLUIDO! Recarregue a landing page (Ctrl+F5)" -ForegroundColor Green
