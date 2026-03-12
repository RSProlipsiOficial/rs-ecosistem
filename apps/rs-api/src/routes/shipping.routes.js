const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabaseAdmin } = require('../lib/supabaseClient');

const SHIPPING_SETTINGS_KEY = 'marketplace_shipping_settings';

async function readShippingSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_configs')
      .select('value')
      .eq('key', SHIPPING_SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      console.warn('[Shipping] Falha ao ler configuracoes de frete:', error.message);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.warn('[Shipping] Excecao ao ler configuracoes de frete:', error.message);
    return null;
  }
}

function buildFallbackCarrierOptions(settings, isLocalDelivery, totalWeight, totalValue) {
  const options = [];
  const safeWeight = Math.max(Number(totalWeight || 0), 0.3);
  const safeValue = Math.max(Number(totalValue || 0), 0);

  const maybeAdd = (enabled, id, name, basePrice, deliveryTime) => {
    if (!enabled) return;
    const calculated = Math.max(basePrice + safeWeight * 8 + safeValue * 0.005, 0);
    options.push({
      id,
      name,
      company: { name },
      price: calculated.toFixed(2),
      delivery_time: deliveryTime,
      currency: 'R$',
      custom: true
    });
  };

  maybeAdd(settings?.correios?.enabled, 'correios-pac', 'PAC', isLocalDelivery ? 14.9 : 19.9, isLocalDelivery ? 3 : 7);
  maybeAdd(settings?.correios?.enabled, 'correios-sedex', 'SEDEX', isLocalDelivery ? 24.9 : 32.9, isLocalDelivery ? 1 : 3);
  maybeAdd(settings?.jadlog?.enabled, 'jadlog', 'Jadlog', isLocalDelivery ? 18.9 : 26.9, isLocalDelivery ? 2 : 5);
  maybeAdd(settings?.loggi?.enabled, 'loggi', 'Loggi', isLocalDelivery ? 16.9 : 23.9, isLocalDelivery ? 1 : 3);
  maybeAdd(settings?.superFrete?.enabled, 'superfrete', 'SuperFrete', isLocalDelivery ? 17.9 : 25.9, isLocalDelivery ? 2 : 4);
  maybeAdd(settings?.frenet?.enabled, 'frenet', 'Entrega Padrao', isLocalDelivery ? 15.9 : 22.9, isLocalDelivery ? 2 : 6);

  if (options.length === 0) {
    options.push(
      {
        id: 'fallback-pac',
        name: 'PAC',
        company: { name: 'Correios' },
        price: (isLocalDelivery ? 14.9 : 19.9).toFixed(2),
        delivery_time: isLocalDelivery ? 3 : 7,
        currency: 'R$',
        custom: true
      },
      {
        id: 'fallback-sedex',
        name: 'SEDEX',
        company: { name: 'Correios' },
        price: (isLocalDelivery ? 24.9 : 32.9).toFixed(2),
        delivery_time: isLocalDelivery ? 1 : 3,
        currency: 'R$',
        custom: true
      }
    );
  }

  return options;
}

router.post('/calculate', async (req, res) => {
  console.log('=== SHIPPING CALCULATE REQUEST ===');
  const { from, to, products } = req.body;

  if (!from || !to || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      error: 'Dados insuficientes. Envie from, to e products (array).'
    });
  }

  const totalWeight = products.reduce((sum, p) => sum + ((Number(p.weight) || 0) * (p.quantity || 1)), 0);
  const totalValue = products.reduce((sum, p) => sum + ((Number(p.insurance_value) || 0) * (p.quantity || 1)), 0);

  const toCEP = String(to.postal_code || '').replace(/\D/g, '');
  const fromCEP = String(from.postal_code || '').replace(/\D/g, '');

  console.log(`[Shipping] Calculando rota: ${fromCEP} -> ${toCEP}`);

  const isFromCuritibaRegion = /^(80|81|82|83)/.test(fromCEP);
  const isToCuritibaRegion = /^(80|81|82|83)/.test(toCEP);
  const isLocalDelivery = isFromCuritibaRegion && isToCuritibaRegion;

  const pickupOption = {
    id: 'retirada-cd',
    name: 'Retirada no Centro de Distribuicao (Piraquara)',
    company: { name: 'SIGME' },
    price: '0.00',
    delivery_time: 0,
    currency: 'R$',
    custom: true
  };

  const shippingSettings = await readShippingSettings();
  const melhorEnvioToken =
    process.env.MELHOR_ENVIO_TOKEN ||
    (shippingSettings?.melhorEnvio?.enabled ? shippingSettings?.melhorEnvio?.apiToken : '');

  if (!melhorEnvioToken) {
    console.warn('[Shipping] Token Melhor Envio nao configurado. Usando fallback configurado.');
    const carrierOptions = buildFallbackCarrierOptions(shippingSettings, isLocalDelivery, totalWeight, totalValue);
    return res.json(isLocalDelivery ? [pickupOption, ...carrierOptions] : carrierOptions);
  }

  try {
    const response = await axios.post(
      'https://melhorenvio.com.br/api/v2/me/shipment/calculate',
      { from, to, items: products },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${melhorEnvioToken}`,
          'User-Agent': 'RS-Prolipsi (operacoes@rsprolipsi.com.br)'
        },
        timeout: 5000
      }
    ).catch((error) => {
      console.warn('[Shipping] Erro axios Melhor Envio:', error.message);
      return { data: [] };
    });

    let options = Array.isArray(response.data) ? response.data : [];

    console.log(`[Shipping] Melhor Envio retornou ${options.length} opcoes`);

    options = options
      .filter((opt) => {
        if (opt.error) return false;
        const price = parseFloat(String(opt.price).replace(',', '.'));
        if (Number.isNaN(price) || price < 0) return false;
        return true;
      })
      .map((opt) => ({
        ...opt,
        id: String(opt.id),
        price: parseFloat(String(opt.price).replace(',', '.')).toFixed(2)
      }));

    if (options.length === 0) {
      console.warn('[Shipping] Melhor Envio sem opcoes validas. Usando fallback configurado.');
      options = buildFallbackCarrierOptions(shippingSettings, isLocalDelivery, totalWeight, totalValue);
    }

    if (isLocalDelivery) {
      options = [pickupOption, ...options];
    }

    res.json(options);
  } catch (error) {
    console.error('[Shipping] Erro inesperado:', error.message);
    const carrierOptions = buildFallbackCarrierOptions(shippingSettings, isLocalDelivery, totalWeight, totalValue);
    res.json(isLocalDelivery ? [pickupOption, ...carrierOptions] : carrierOptions);
  }
});

module.exports = router;
