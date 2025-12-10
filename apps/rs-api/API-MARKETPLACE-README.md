# 🚀 API Marketplace RS Prólipsi

## ✅ Status
- **URL**: `http://72.60.144.245:8080`
- **PM2**: `rs-api-test` (auto-start configurado)
- **Credenciais**: Carregadas via `.env` em `/var/www/rs-prolipsi/api/.env`

## 📡 Endpoints Disponíveis

### Health Check
```bash
GET http://72.60.144.245:8080/api/health
```

### Cálculo de Frete
```bash
POST http://72.60.144.245:8080/api/shipping/calculate
Content-Type: application/json

{
  "from": {
    "postal_code": "29146385"
  },
  "to": {
    "postal_code": "01310100"
  },
  "products": [
    {
      "id": "1",
      "width": 20,
      "height": 30,
      "length": 10,
      "weight": 0.5,
      "insurance_value": 150,
      "quantity": 1
    }
  ]
}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "PAC",
    "company": { "name": "Correios" },
    "price": "25.50",
    "delivery_time": 8,
    "currency": "R$"
  },
  {
    "id": 2,
    "name": "SEDEX",
    "company": { "name": "Correios" },
    "price": "45.90",
    "delivery_time": 3,
    "currency": "R$"
  }
]
```

### Pagamento PIX
```bash
POST http://72.60.144.245:8080/api/payment/pix
Content-Type: application/json

{
  "amount": 150.00,
  "customerName": "Roberto Camargo",
  "customerCpf": "12345678900"
}
```

**Resposta:**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "qrCodeText": "00020126330014BR.GOV.BCB.PIX...",
  "expirationDate": "2025-11-09T00:00:00.000Z",
  "paymentId": "mock_123456789"
}
```

### Pagamento Boleto
```bash
POST http://72.60.144.245:8080/api/payment/boleto
Content-Type: application/json

{
  "amount": 150.00,
  "customerName": "Roberto Camargo",
  "customerCpf": "12345678900",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "zipCode": "01310100"
  }
}
```

## 🔧 Configuração Frontend

No seu `.env.local` do marketplace:

```env
VITE_API_URL=http://72.60.144.245:8080
```

## 📝 Notas Importantes

1. **Melhor Envio**: Configurado com fallback mock. Para ativar a API real, ajustar formato do CEP na documentação.

2. **Asaas**: Configurado com fallback mock. Token está correto mas requer configuração adicional na dashboard do Asaas para ativar API.

3. **Ambas APIs retornam dados válidos** para o checkout funcionar imediatamente.

## 🔄 Comandos Úteis

```bash
# Verificar status
ssh root@72.60.144.245 "pm2 status"

# Ver logs
ssh root@72.60.144.245 "pm2 logs rs-api-test"

# Reiniciar
ssh root@72.60.144.245 "pm2 restart rs-api-test"

# Testar health
curl http://72.60.144.245:8080/api/health
```

## 🎯 Próximos Passos

1. ✅ APIs funcionando com mock data
2. ⏳ Integrar Melhor Envio real (ajustar formato do payload)
3. ⏳ Ativar Asaas em produção (verificar configurações na dashboard)
4. ⏳ Testar checkout completo no frontend
