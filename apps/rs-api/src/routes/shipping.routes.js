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

  // [RS-LOGISTICS] Regra de Frete Local
  const toCEP = to.postal_code.replace(/\D/g, '');
  const fromCEP = from.postal_code.replace(/\D/g, '');

  console.log(`[Shipping] Calculando Rota: ${fromCEP} -> ${toCEP}`);

  // Faixas PR (Curitiba/Piraquara): 80-83
  const isPiraquaraToPiraquara = toCEP.startsWith('833') && fromCEP.startsWith('833');
  const isFromCuritibaRegion = (fromCEP.startsWith('80') || fromCEP.startsWith('81') || fromCEP.startsWith('82') || fromCEP.startsWith('83'));
  const isToCuritibaRegion = (toCEP.startsWith('80') || toCEP.startsWith('81') || toCEP.startsWith('82') || toCEP.startsWith('83'));

  const isRegionalManual = isFromCuritibaRegion && isToCuritibaRegion;

  // Região de Curitiba e Piraquara (80xxx até 83xxx)
  const isLocalDelivery = toCEP.startsWith('80') || toCEP.startsWith('81') || toCEP.startsWith('82') || toCEP.startsWith('83');

  // Opção de Retirada (Grátis) para a região
  const pickupOption = {
    id: 'retirada-cd',
    name: 'Retirada no Centro de Distribuição (Piraquara)',
    company: { name: 'SIGME' },
    price: '0.00',
    delivery_time: 0,
    currency: 'R$',
    custom: true
  };

  const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;

  // Se não tiver token, retornamos os mocks + Retirada se for o caso
  if (!MELHOR_ENVIO_TOKEN) {
    console.warn('⚠️ [Shipping] Token Melhor Envio não configurado. Usando Fallback.');

    const mockOptions = [
      { id: 'correios-pac-mock', name: 'PAC (Estimado)', company: { name: 'Correios' }, price: '12.90', delivery_time: 5, currency: 'R$' },
      { id: 'correios-sedex-mock', name: 'SEDEX (Estimado)', company: { name: 'Correios' }, price: '15.90', delivery_time: 2, currency: 'R$' }
    ];

    const results = [...mockOptions];
    if (isLocalDelivery) {
      results.unshift(pickupOption);
    }

    return res.json(results);
  }

  try {
    const response = await axios.post(
      'https://melhorenvio.com.br/api/v2/me/shipment/calculate',
      { from, to, items: products },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'RS-Prolipsi (operacoes@rsprolipsi.com.br)'
        },
        timeout: 5000
      }
    ).catch(e => {
      console.warn('⚠️ Erro axios Melhor Envio:', e.message);
      return { data: [] }; // Retorna vazio para cair no merge abaixo
    });

    let options = Array.isArray(response.data) ? response.data : [];

    // DEBUG: Log da resposta bruta do Melhor Envio
    console.log(`[Shipping] Melhor Envio retornou ${options.length} opções:`);
    options.forEach(opt => {
      console.log(`  -> ${opt.name || opt.id}: price=${opt.price}, error=${opt.error || 'none'}`);
    });

    // FILTRAR: Remover opções com erro ou preço inválido
    // O Melhor Envio retorna TODOS os serviços, incluso os indisponíveis (com error e price null)
    options = options
      .filter(opt => {
        // Excluir opções com campo error (serviço indisponível para essa rota)
        if (opt.error) return false;
        // Excluir opções sem preço ou com preço não-numérico
        const price = parseFloat(String(opt.price).replace(',', '.'));
        if (isNaN(price) || price < 0) return false;
        return true;
      })
      .map(opt => ({
        ...opt,
        id: String(opt.id),
        // Converter para número e depois para string com 2 decimais
        price: parseFloat(String(opt.price).replace(',', '.')).toFixed(2)
      }));

    console.log(`[Shipping] Após filtro: ${options.length} opções válidas`);

    // Se a API não retornou nada válido, injetamos mocks de Correios
    if (options.length === 0) {
      console.warn('[Shipping] Nenhuma opção válida do Melhor Envio. Usando fallback.');
      options = [
        { id: 'correios-pac-mock', name: 'PAC (Estimado)', company: { name: 'Correios' }, price: '12.90', delivery_time: 5, currency: 'R$' },
        { id: 'correios-sedex-mock', name: 'SEDEX (Estimado)', company: { name: 'Correios' }, price: '15.90', delivery_time: 2, currency: 'R$' }
      ];
    }

    // Injetar frete local (Retirada Grátis) se aplicável
    if (isLocalDelivery) {
      options = [pickupOption, ...options];
    }


    res.json(options);
  } catch (error) {
    console.error('❌ Erro inesperado no shipping calculation:', error.message);
    const fallbackOptions = [
      { id: 'correios-pac-err', name: 'PAC (Estimado)', company: { name: 'Correios' }, price: '12.90', delivery_time: 8, currency: 'R$' },
      { id: 'correios-sedex-err', name: 'SEDEX (Estimado)', company: { name: 'Correios' }, price: '15.90', delivery_time: 4, currency: 'R$' }
    ];
    if (isLocalDelivery) fallbackOptions.unshift(pickupOption);
    res.json(fallbackOptions);
  }
});

module.exports = router;
