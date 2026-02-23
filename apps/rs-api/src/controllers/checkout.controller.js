/**
 * RS PRÓLIPSI - CHECKOUT CONTROLLER
 * Integra Marketplace + Pagamento + Matriz SIGMA
 */

const { createClient } = require('@supabase/supabase-js');
const { createOrder } = require('../services/salesService');
const { mp } = require('../lib/mp');
const { Preference, Payment } = require('mercadopago');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * POST /api/checkout/create
 * Cria pedido E já gera pagamento
 */
exports.createCheckout = async (req, res) => {
  try {
    const {
      // Dados do comprador
      buyerId,
      buyerEmail,
      buyerName,
      buyerPhone,
      buyerCpf,
      buyerType = 'cliente',
      referredBy, // Patrocinador/indicador

      // Itens do pedido
      items, // [{ product_id, quantity }]

      // Entrega
      shippingAddress,
      shippingMethod,
      shippingCost = 0,

      // Pagamento
      paymentMethod = 'pix', // 'pix', 'boleto', 'checkout-pro'

      // Notas
      customerNotes
    } = req.body;

    console.log('🛒 Criando checkout:', { buyerEmail, itemsCount: items?.length, paymentMethod });

    // 1. Validações
    if (!buyerEmail || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados insuficientes (buyerEmail, items)'
      });
    }

    // 2. Criar pedido (já integrado com matriz)
    const order = await createOrder({
      buyerId,
      buyerEmail,
      buyerName,
      buyerPhone,
      buyerType,
      referredBy,
      items,
      shippingAddress,
      shippingMethod,
      shippingCost,
      customerNotes
    });

    console.log('✅ Pedido criado:', order.id);

    // 3. Gerar pagamento baseado no método escolhido
    let paymentData = null;

    if (paymentMethod === 'pix') {
      paymentData = await gerarPIX(order, { buyerEmail, buyerName, buyerCpf });
    } else if (paymentMethod === 'boleto') {
      paymentData = await gerarBoleto(order, { buyerEmail, buyerName, buyerCpf });
    } else if (paymentMethod === 'checkout-pro') {
      paymentData = await gerarCheckoutPro(order, { buyerEmail, buyerName, buyerCpf }, items);
    } else if (paymentMethod === 'wallet') {
      // Pagamento com saldo: pedido criado, débito é feito separadamente via /api/wallet/debit
      paymentData = { method: 'wallet', status: 'awaiting_debit' };
      console.log('💰 Pedido criado para pagamento com saldo. Débito será feito via wallet/debit.');
    }

    console.log('✅ Pagamento gerado (Objeto Final):', JSON.stringify(paymentData, null, 2));

    // 4. Retornar pedido + dados de pagamento
    res.json({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        status: order.status
      },
      payment: paymentData
    });

  } catch (error) {
    console.error('❌ Erro no checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Gera pagamento PIX
 */
async function gerarPIX(order, buyer) {
  const idemKey = crypto.createHash('sha256')
    .update(`mp-pix-${order.id}`)
    .digest('hex');

  const payment = new Payment(mp);
  const resp = await payment.create({
    body: {
      transaction_amount: Number(order.total),
      description: `Pedido #${order.id} - RS Prólipsi`,
      payment_method_id: 'pix',
      external_reference: String(order.id),
      payer: {
        email: buyer.buyerEmail,
        first_name: buyer.buyerName || 'Cliente',
        identification: buyer.buyerCpf ? {
          type: 'CPF',
          number: buyer.buyerCpf.replace(/[^0-9]/g, '')
        } : undefined
      }
    },
    requestOptions: { idempotencyKey: idemKey }
  });

  const trx = resp.point_of_interaction?.transaction_data;

  // Atualizar pedido com payment_id
  await supabase
    .from('orders')
    .update({ payment_id: resp.id })
    .eq('id', order.id);

  return {
    method: 'pix',
    paymentId: resp.id,
    status: resp.status,
    qr_code: trx?.qr_code,
    qr_code_base64: trx?.qr_code_base64,
    ticket_url: trx?.ticket_url
  };
}

/**
 * Gera pagamento Boleto
 */
async function gerarBoleto(order, buyer) {
  const idemKey = crypto.createHash('sha256')
    .update(`mp-boleto-${order.id}`)
    .digest('hex');

  const nameParts = (buyer.buyerName || 'Cliente').split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || 'Silva';

  const payment = new Payment(mp);
  const resp = await payment.create({
    body: {
      transaction_amount: Number(order.total),
      description: `Pedido #${order.id} - RS Prólipsi`,
      payment_method_id: 'bolbradesco',
      external_reference: String(order.id),
      payer: {
        email: buyer.buyerEmail,
        first_name: firstName,
        last_name: lastName,
        identification: buyer.buyerCpf ? {
          type: 'CPF',
          number: buyer.buyerCpf.replace(/[^0-9]/g, '')
        } : undefined
      }
    },
    requestOptions: { idempotencyKey: idemKey }
  });

  const trx = resp.point_of_interaction?.transaction_data;

  await supabase
    .from('orders')
    .update({ payment_id: resp.id })
    .eq('id', order.id);

  return {
    method: 'boleto',
    paymentId: resp.id,
    status: resp.status,
    boleto_url: trx?.ticket_url,
    external_resource_url: resp.transaction_details?.external_resource_url
  };
}

/**
 * Gera Checkout Pro (redirect)
 */
async function gerarCheckoutPro(order, buyer, items) {
  const preference = new Preference(mp);

  // Formatar itens para MP
  const mpItems = items.map(item => ({
    id: item.product_id,
    title: item.product_name || 'Produto',
    quantity: item.quantity,
    unit_price: item.price_final,
    currency_id: 'BRL'
  }));

  const pref = await preference.create({
    body: {
      items: mpItems,
      payer: {
        name: buyer.buyerName,
        email: buyer.buyerEmail,
        identification: (buyer.buyerCpf && buyer.buyerCpf.replace(/[^0-9]/g, '').length === 11) ? {
          type: 'CPF',
          number: buyer.buyerCpf.replace(/[^0-9]/g, '')
        } : undefined
      },
      external_reference: String(order.id),
      notification_url: process.env.MP_WEBHOOK_URL || 'https://api.rsprolipsi.com.br/api/webhook/mercadopago',
      auto_return: 'approved',
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/sucesso?order=${order.id}`,
        pending: `${process.env.FRONTEND_URL}/checkout/pendente?order=${order.id}`,
        failure: `${process.env.FRONTEND_URL}/checkout/erro?order=${order.id}`
      },
      statement_descriptor: 'RS-PROLIPSI'
    }
  });

  return {
    method: 'checkout-pro',
    preferenceId: pref.id,
    init_point: pref.init_point,
    sandbox_init_point: pref.sandbox_init_point
  };
}

/**
 * GET /api/checkout/status/:orderId
 * Verifica status do pedido e pagamento
 */
exports.getCheckoutStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    // Se tiver payment_id, buscar status no MP
    let paymentStatus = null;
    if (order.payment_id) {
      try {
        const payment = new Payment(mp);
        const mpPayment = await payment.get({ id: order.payment_id });
        paymentStatus = {
          status: mpPayment.status,
          status_detail: mpPayment.status_detail,
          payment_method: mpPayment.payment_method_id
        };
      } catch (e) {
        console.error('Erro ao buscar pagamento MP:', e);
      }
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        payment_status: order.payment_status,
        total: order.total,
        created_at: order.created_at
      },
      payment: paymentStatus
    });

  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exports;
