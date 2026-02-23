/**
 * RS Prólipsi - Rotas de Pagamento Mercado Pago
 * Checkout Pro + PIX + Boleto com idempotência
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { mp } = require('../lib/mp');
const { Preference, Payment } = require('mercadopago');

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
