/**
 * RS Prólipsi - Webhook Mercado Pago
 * Recebe eventos e reconsulta a API para validação
 */

const express = require('express');
const router = express.Router();
const { mp } = require('../lib/mp');
const { Payment } = require('mercadopago');

/**
 * POST /api/webhook/mercadopago
 * Webhook do Mercado Pago (v1 e v2)
 */
router.post('/mercadopago', async (req, res) => {
  try {
    // Suporta v1 (topic+id) e v2 (type+data.id)
    const topic = (req.query.topic || req.body.type || '').toString();
    const id = (req.query.id || req.body?.data?.id || req.body?.resource?.id || '').toString();

    console.log('🔔 Webhook MP recebido:', { topic, id, query: req.query, body: req.body });

    if (!topic || !id) {
      console.log('⚠️  Webhook ignorado (sem topic/id)');
      return res.status(200).send('ignore');
    }

    if (topic.includes('payment')) {
      const payment = new Payment(mp);
      const p = await payment.get({ id });

      console.log('✅ Pagamento consultado:', {
        id: p.id,
        status: p.status,
        external_reference: p.external_reference,
        amount: p.transaction_amount
      });

      // Aplicar atualização no pedido
      await applyPaymentUpdate({
        orderId: String(p.external_reference),
        mpPaymentId: String(p.id),
        status: String(p.status),
        status_detail: String(p.status_detail),
        amount: Number(p.transaction_amount),
        fee: Number(p.fee_details?.reduce((s, f) => s + Number(f.amount || 0), 0) || 0),
        method: p.payment_method_id,
        received_at: p.date_approved || p.date_created
      });
    }

    res.status(200).send('ok');
  } catch (e) {
    console.error('❌ Erro Webhook MP:', e);
    // Sempre 200 para não perder eventos
    res.status(200).send('ok');
  }
});

/**
 * Aplica atualização do pagamento no sistema
 * VERSÃO COMPLETA - INTEGRA COM MATRIZ SIGMA
 */
async function applyPaymentUpdate(evt) {
  const { orderId, mpPaymentId, status, amount, method, received_at } = evt;
  
  console.log('📝 Processando pagamento:', { orderId, status, amount });

  const { registerSale } = require('../services/salesService');
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    switch (status) {
      case 'approved':
        console.log(`✅ Pagamento aprovado! Pedido ${orderId} - R$ ${amount}`);
        
        // 1. Registrar venda (PROCESSA MATRIZ AUTOMATICAMENTE!)
        const result = await registerSale({
          orderId,
          mpPaymentId,
          amount,
          method,
          receivedAt: received_at
        });
        
        console.log('✅ Venda processada:', {
          sales: result.sales.length,
          matrixValue: result.totalMatrixValue
        });
        
        // 2. Enviar notificação (opcional)
        // await sendNotification(result.order.buyer_id, 'payment_approved');
        
        break;

      case 'pending':
      case 'in_process':
        console.log(`⏳ Pagamento ${status}: ${orderId}`);
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'pending',
            status: 'payment_pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        break;

      case 'rejected':
        console.log(`❌ Pagamento rejeitado: ${orderId}`);
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'rejected',
            status: 'payment_failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        break;

      case 'refunded':
      case 'cancelled':
      case 'charged_back':
        console.log(`🔄 Pagamento ${status}: ${orderId}`);
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'refunded',
            status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        // TODO: Reverter no ledger, reverter matriz
        break;
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    
    // Registrar erro mas não falhar o webhook
    await supabase
      .from('payment_errors')
      .insert({
        payment_id: mpPaymentId,
        order_id: orderId,
        error_message: error.message,
        error_stack: error.stack,
        webhook_data: evt
      });
  }
}

module.exports = router;
