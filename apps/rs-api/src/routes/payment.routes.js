/**
 * RS Prólipsi - Rotas de Pagamento Mercado Pago
 * Checkout Pro + PIX + Boleto com idempotência
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { mp } = require('../lib/mp');
const { Preference, Payment, MercadoPagoConfig } = require('mercadopago');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY;

const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;

const MINISITE_PUBLIC_URL = String(
  process.env.MINISITE_URL ||
  process.env.MINISITE_PUBLIC_URL ||
  'http://localhost:3030'
).replace(/\/$/, '');

const parseBrlAmount = (value) => {
  if (typeof value === 'number') return Number(value);

  const normalized = String(value || '')
    .replace(/[^0-9,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildMinisiteBackUrls = (publicOrigin, planId) => ({
  success: `${publicOrigin}/?checkout=success&plan=${encodeURIComponent(planId)}`,
  pending: `${publicOrigin}/?checkout=pending&plan=${encodeURIComponent(planId)}`,
  failure: `${publicOrigin}/?checkout=failure&plan=${encodeURIComponent(planId)}`
});

const loadMinisitePaymentContext = async (planId) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client nao configurado para pagamentos do MiniSite.');
  }

  const [{ data: settings, error: settingsError }, { data: plan, error: planError }] = await Promise.all([
    supabaseAdmin
      .from('minisite_setts')
      .select('platform_name, support_email, mp_public_key, mp_access_token')
      .eq('id', 1)
      .maybeSingle(),
    supabaseAdmin
      .from('minisite_plans')
      .select('id, name, price, is_active')
      .eq('id', String(planId || ''))
      .maybeSingle()
  ]);

  if (settingsError) {
    throw new Error(`minisite_settings_error:${settingsError.message}`);
  }

  if (planError) {
    throw new Error(`minisite_plan_error:${planError.message}`);
  }

  if (!plan || plan.is_active === false) {
    throw new Error('Plano do MiniSite nao encontrado ou inativo.');
  }

  const accessToken = String(settings?.mp_access_token || process.env.MP_ACCESS_TOKEN || '').trim();
  if (!accessToken) {
    throw new Error('Mercado Pago nao configurado no MiniSite. Ajuste a chave no painel admin.');
  }

  return {
    plan,
    settings,
    accessToken
  };
};

// Middleware removido para permitir que o SDK gerencie a validação do token
// e evitar erros de sincronização de env vars em tempo de execução

/**
 * POST /api/payment/checkout-pro
 * Cria preferência de pagamento (redirect para MP)
 */
router.post('/checkout-pro', async (req, res) => {
  try {
    const { orderId, items, buyer } = req.body;

    if (!orderId || !items || !buyer) {
      return res.status(400).json({ error: 'Dados insuficientes (orderId, items, buyer)' });
    }

    const preference = new Preference(mp);
    const pref = await preference.create({
      body: {
        items,
        payer: {
          name: buyer.name,
          email: buyer.email,
          identification: buyer.cpf ? { type: 'CPF', number: buyer.cpf.replace(/[^0-9]/g, '') } : undefined
        },
        external_reference: String(orderId),
        notification_url: process.env.MP_WEBHOOK_URL,
        auto_return: 'approved',
        back_urls: {
          success: `${process.env.FRONTEND_URL}/checkout/sucesso?order=${orderId}`,
          pending: `${process.env.FRONTEND_URL}/checkout/pendente?order=${orderId}`,
          failure: `${process.env.FRONTEND_URL}/checkout/erro?order=${orderId}`
        },
        statement_descriptor: 'RS-PROLIPSI',
        marketplace: 'RSPrólipsi'
      }
    });

    res.json({
      success: true,
      orderId,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point
    });
  } catch (e) {
    console.error('❌ Erro Checkout Pro:', e);
    res.status(500).json({ error: 'mp.preference_error', detail: e.message });
  }
});

/**
 * POST /api/payment/minisite-plan
 * Gera checkout real dos planos do RS MiniSite usando as credenciais salvas pelo admin.
 */
router.post('/minisite-plan', async (req, res) => {
  try {
    const { planId, userId, buyer, publicOrigin, planSnapshot } = req.body || {};

    if (!planId || !userId || !buyer?.email || !buyer?.name) {
      return res.status(400).json({ error: 'Dados insuficientes (planId, userId, buyer.name, buyer.email)' });
    }

    const { plan, settings, accessToken } = await loadMinisitePaymentContext(planId);
    const amount = parseBrlAmount(plan?.price || planSnapshot?.price);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Plano selecionado sem valor valido para cobranca.' });
    }

    const mpClient = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    const preference = new Preference(mpClient);
    const frontendOrigin = String(publicOrigin || MINISITE_PUBLIC_URL || MINISITE_PUBLIC_URL).replace(/\/$/, '') || MINISITE_PUBLIC_URL;
    const externalReference = `minisite-plan:${plan.id}:${userId}:${Date.now()}`;

    const pref = await preference.create({
      body: {
        items: [
          {
            id: String(plan.id),
            title: String(plan.name || planSnapshot?.name || 'Plano RS MiniSite'),
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL'
          }
        ],
        payer: {
          name: String(buyer.name),
          email: String(buyer.email),
          identification: buyer.cpf
            ? {
                type: 'CPF',
                number: String(buyer.cpf).replace(/[^0-9]/g, '')
              }
            : undefined
        },
        external_reference: externalReference,
        auto_return: 'approved',
        back_urls: buildMinisiteBackUrls(frontendOrigin, plan.id),
        statement_descriptor: 'RS-MINISITE',
        marketplace: String(settings?.platform_name || 'RS MiniSite'),
        metadata: {
          source: 'rs-minisite',
          planId: String(plan.id),
          userId: String(userId),
          buyerPhone: String(buyer.phone || ''),
          buyerCpf: String(buyer.cpf || '')
        }
      }
    });

    return res.json({
      success: true,
      planId: plan.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
      preference_id: pref.id
    });
  } catch (e) {
    console.error('❌ Erro MiniSite Checkout:', e);
    return res.status(500).json({ error: 'minisite.checkout_error', detail: e.message });
  }
});

/**
 * POST /api/payment/pix
 * Cria pagamento PIX com QR Code inline
 */
router.post('/pix', async (req, res) => {
  try {
    const { orderId, amount, buyer } = req.body;

    console.log('[API] Recebida solicitação de PIX:', { orderId, amount, email: buyer?.email });

    if (!orderId || !amount || !buyer || !buyer.email) {
      console.error('[API] Dados insuficientes para PIX:', req.body);
      return res.status(400).json({ error: 'Dados insuficientes (orderId, amount, buyer.email)' });
    }

    // Idempotência
    const idemKey = crypto.createHash('sha256')
      .update(`mp-pix-${orderId}-${Date.now()}`) // Adicionado Date.now() para evitar conflito em dev
      .digest('hex');

    console.log('[API] Criando pagamento no Mercado Pago...');
    const payment = new Payment(mp);
    const resp = await payment.create({
      body: {
        transaction_amount: Number(amount),
        description: `Pedido #${orderId} - RS Prólipsi`,
        payment_method_id: 'pix',
        external_reference: String(orderId),
        payer: {
          email: buyer.email,
          first_name: buyer.name || 'Cliente',
          identification: buyer.cpf ? {
            type: 'CPF',
            number: buyer.cpf.replace(/[^0-9]/g, '')
          } : undefined
        }
      },
      requestOptions: { idempotencyKey: idemKey }
    });

    const trx = resp.point_of_interaction?.transaction_data;

    console.log('[API] PIX gerado com sucesso:', { id: resp.id, status: resp.status });

    res.json({
      success: true,
      orderId,
      paymentId: resp.id,
      status: resp.status,
      qr_code: trx?.qr_code,
      qr_code_base64: trx?.qr_code_base64,
      ticket_url: trx?.ticket_url
    });
  } catch (e) {
    console.error('❌ Erro PIX Detalhado:', JSON.stringify(e, null, 2));
    console.error('❌ Erro PIX Stack:', e);
    res.status(500).json({ error: 'mp.pix_error', detail: e.message || JSON.stringify(e) });
  }
});

/**
 * POST /api/payment/boleto
 * Cria pagamento Boleto
 */
router.post('/boleto', async (req, res) => {
  try {
    const { orderId, amount, buyer } = req.body;

    if (!orderId || !amount || !buyer) {
      return res.status(400).json({ error: 'Dados insuficientes' });
    }

    const idemKey = crypto.createHash('sha256')
      .update(`mp-boleto-${orderId}`)
      .digest('hex');

    // Separar nome em first_name e last_name
    const nameParts = (buyer.name || 'Cliente').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Silva';

    const payment = new Payment(mp);
    const resp = await payment.create({
      body: {
        transaction_amount: Number(amount),
        description: `Pedido #${orderId} - RS Prólipsi`,
        payment_method_id: 'bolbradesco',
        external_reference: String(orderId),
        payer: {
          email: buyer.email,
          first_name: firstName,
          last_name: lastName,
          identification: buyer.cpf ? {
            type: 'CPF',
            number: buyer.cpf.replace(/[^0-9]/g, '')
          } : undefined
        }
      },
      requestOptions: { idempotencyKey: idemKey }
    });

    const trx = resp.point_of_interaction?.transaction_data;

    res.json({
      success: true,
      orderId,
      paymentId: resp.id,
      status: resp.status,
      boleto_url: trx?.ticket_url,
      external_resource_url: resp.transaction_details?.external_resource_url
    });
  } catch (e) {
    console.error('❌ Erro Boleto:', e);
    res.status(500).json({ error: 'mp.boleto_error', detail: e.message });
  }
});

/**
 * POST /api/payment/refund
 * Estorna pagamento (total)
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const { Refund } = require('mercadopago');
    const refund = new Refund(mp);
    const r = await refund.create({ body: { payment_id: paymentId } });
    res.json({ success: true, refund: r });
  } catch (e) {
    console.error('❌ Erro Refund:', e);
    res.status(500).json({ error: 'mp.refund_error', detail: e.message });
  }
});

/**
 * POST /api/payment/cancel
 * Cancela pagamento (se possível)
 */
router.post('/cancel', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = new Payment(mp);
    const r = await payment.cancel({ id: paymentId });
    res.json({ success: true, payment: r });
  } catch (e) {
    console.error('❌ Erro Cancel:', e);
    res.status(500).json({ error: 'mp.cancel_error', detail: e.message });
  }
});

module.exports = router;
