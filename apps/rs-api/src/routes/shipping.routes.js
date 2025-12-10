const express = require('express');
const router = express.Router();
const axios = require('axios');

// Rota para calcular o frete
router.post('/calculate', async (req, res) => {
  console.log('=== SHIPPING CALCULATE REQUEST ===');
  const { from, to, products } = req.body;

  if (!from || !to || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ 
      error: 'Dados insuficientes. Envie from, to e products (array).'
    });
  }

  // Calcular dimensões totais do pacote
  const totalWeight = products.reduce((sum, p) => sum + (p.weight * (p.quantity || 1)), 0);
  const maxHeight = Math.max(...products.map(p => p.height));
  const maxWidth = Math.max(...products.map(p => p.width));
  const maxLength = Math.max(...products.map(p => p.length));
  const totalValue = products.reduce((sum, p) => sum + (p.insurance_value * (p.quantity || 1)), 0);

  const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
  if (!MELHOR_ENVIO_TOKEN) {
    console.error('ERRO FATAL: MELHOR_ENVIO_TOKEN não encontrado nas variáveis de ambiente.');
    return res.status(500).json({ error: 'Erro de configuração do servidor de frete. [ME-01]' });
  }

  // Preparar payload no formato correto do Melhor Envio
  const payload = {
    from: {
      postal_code: from.postal_code.replace(/[^0-9]/g, '') // Remove hífen
    },
    to: {
      postal_code: to.postal_code.replace(/[^0-9]/g, '')
    },
    package: {
      height: maxHeight,
      width: maxWidth,
      length: maxLength,
      weight: totalWeight
    },
    options: {
      insurance_value: totalValue,
      receipt: false,
      own_hand: false
    }
  };

  console.log('📦 Payload Melhor Envio:', JSON.stringify(payload));

  try {
    const response = await axios.post('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', 
      payload,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'RS Prolipsi (rsprolipsioficial@gmail.com)'
        }
      }
    );

    console.log('✅ Frete calculado com sucesso');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Erro Melhor Envio:', error.response ? error.response.data : error.message);
    
    // Fallback com dados mock se API falhar
    const mockOptions = [
      { id: 1, name: 'PAC', company: { name: 'Correios' }, price: '25.50', delivery_time: 8, currency: 'R$' },
      { id: 2, name: 'SEDEX', company: { name: 'Correios' }, price: '45.90', delivery_time: 3, currency: 'R$' }
    ];
    res.json(mockOptions);
  }
});

module.exports = router;
