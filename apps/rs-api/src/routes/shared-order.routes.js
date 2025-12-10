/**
 * RS Prólipsi - Rotas de Pedidos Compartilhados
 * Sistema de multi-entrega com divisão de pagamento
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Armazenamento temporário (substituir por banco de dados)
const sharedOrders = new Map();
const participants = new Map();

/**
 * POST /api/shared-order/create
 * Cria um pedido compartilhado
 */
router.post('/create', async (req, res) => {
  try {
    const { 
      orderId, 
      totalAmount, 
      items, 
      deliveryAddress,
      organizer,
      maxParticipants = 6
    } = req.body;

    if (!orderId || !totalAmount || !deliveryAddress || !organizer) {
      return res.status(400).json({ 
        error: 'Dados insuficientes (orderId, totalAmount, deliveryAddress, organizer)' 
      });
    }

    // Gerar código único para compartilhamento
    const shareCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const sharedOrder = {
      id: orderId,
      shareCode,
      totalAmount: Number(totalAmount),
      items: items || [],
      deliveryAddress,
      organizer: {
        name: organizer.name,
        email: organizer.email,
        cpf: organizer.cpf
      },
      maxParticipants,
      participants: [],
      paidAmount: 0,
      status: 'pending', // pending, partial, completed, delivered
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h
    };

    sharedOrders.set(shareCode, sharedOrder);

    res.json({
      success: true,
      shareCode,
      shareUrl: `${process.env.FRONTEND_URL}/checkout/compartilhado/${shareCode}`,
      order: sharedOrder
    });

  } catch (e) {
    console.error('❌ Erro ao criar pedido compartilhado:', e);
    res.status(500).json({ error: 'shared_order.create_error', detail: e.message });
  }
});

/**
 * GET /api/shared-order/:shareCode
 * Busca informações de um pedido compartilhado
 */
router.get('/:shareCode', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const sharedOrder = sharedOrders.get(shareCode.toUpperCase());

    if (!sharedOrder) {
      return res.status(404).json({ error: 'Pedido compartilhado não encontrado' });
    }

    // Verificar se expirou
    if (new Date(sharedOrder.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'Este pedido compartilhado expirou' });
    }

    // Calcular informações
    const remainingAmount = sharedOrder.totalAmount - sharedOrder.paidAmount;
    const remainingSlots = sharedOrder.maxParticipants - sharedOrder.participants.length;

    res.json({
      success: true,
      order: {
        ...sharedOrder,
        remainingAmount,
        remainingSlots,
        percentagePaid: ((sharedOrder.paidAmount / sharedOrder.totalAmount) * 100).toFixed(2)
      }
    });

  } catch (e) {
    console.error('❌ Erro ao buscar pedido compartilhado:', e);
    res.status(500).json({ error: 'shared_order.fetch_error', detail: e.message });
  }
});

/**
 * POST /api/shared-order/:shareCode/join
 * Participante entra no pedido compartilhado
 */
router.post('/:shareCode/join', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { participant, paymentAmount, paymentMethod } = req.body;

    if (!participant || !paymentAmount || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Dados insuficientes (participant, paymentAmount, paymentMethod)' 
      });
    }

    const sharedOrder = sharedOrders.get(shareCode.toUpperCase());

    if (!sharedOrder) {
      return res.status(404).json({ error: 'Pedido compartilhado não encontrado' });
    }

    // Verificar vagas
    if (sharedOrder.participants.length >= sharedOrder.maxParticipants) {
      return res.status(400).json({ error: 'Número máximo de participantes atingido' });
    }

    // Verificar valor
    const remainingAmount = sharedOrder.totalAmount - sharedOrder.paidAmount;
    if (paymentAmount > remainingAmount) {
      return res.status(400).json({ 
        error: 'Valor maior que o restante',
        remainingAmount 
      });
    }

    // Adicionar participante
    const participantData = {
      id: crypto.randomBytes(8).toString('hex'),
      name: participant.name,
      email: participant.email,
      cpf: participant.cpf,
      amount: Number(paymentAmount),
      paymentMethod,
      paymentStatus: 'pending',
      joinedAt: new Date().toISOString()
    };

    sharedOrder.participants.push(participantData);
    sharedOrder.paidAmount += Number(paymentAmount);

    // Atualizar status
    if (sharedOrder.paidAmount >= sharedOrder.totalAmount) {
      sharedOrder.status = 'completed';
    } else if (sharedOrder.paidAmount > 0) {
      sharedOrder.status = 'partial';
    }

    sharedOrders.set(shareCode.toUpperCase(), sharedOrder);

    res.json({
      success: true,
      participant: participantData,
      order: {
        totalAmount: sharedOrder.totalAmount,
        paidAmount: sharedOrder.paidAmount,
        remainingAmount: sharedOrder.totalAmount - sharedOrder.paidAmount,
        status: sharedOrder.status
      }
    });

  } catch (e) {
    console.error('❌ Erro ao adicionar participante:', e);
    res.status(500).json({ error: 'shared_order.join_error', detail: e.message });
  }
});

/**
 * POST /api/shared-order/:shareCode/payment
 * Processa pagamento de um participante
 */
router.post('/:shareCode/payment', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { participantId, paymentData } = req.body;

    const sharedOrder = sharedOrders.get(shareCode.toUpperCase());

    if (!sharedOrder) {
      return res.status(404).json({ error: 'Pedido compartilhado não encontrado' });
    }

    const participant = sharedOrder.participants.find(p => p.id === participantId);

    if (!participant) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }

    // Aqui você integraria com a API de pagamento real
    // Por enquanto, simularemos aprovação
    participant.paymentStatus = 'approved';
    participant.paymentId = paymentData.paymentId || `MOCK_${Date.now()}`;
    participant.paidAt = new Date().toISOString();

    sharedOrders.set(shareCode.toUpperCase(), sharedOrder);

    res.json({
      success: true,
      participant,
      message: 'Pagamento processado com sucesso'
    });

  } catch (e) {
    console.error('❌ Erro ao processar pagamento:', e);
    res.status(500).json({ error: 'shared_order.payment_error', detail: e.message });
  }
});

/**
 * GET /api/shared-order/:shareCode/status
 * Verifica status do pedido compartilhado
 */
router.get('/:shareCode/status', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const sharedOrder = sharedOrders.get(shareCode.toUpperCase());

    if (!sharedOrder) {
      return res.status(404).json({ error: 'Pedido compartilhado não encontrado' });
    }

    const approvedParticipants = sharedOrder.participants.filter(
      p => p.paymentStatus === 'approved'
    );

    const totalApproved = approvedParticipants.reduce(
      (sum, p) => sum + p.amount, 
      0
    );

    res.json({
      success: true,
      status: sharedOrder.status,
      progress: {
        totalAmount: sharedOrder.totalAmount,
        paidAmount: totalApproved,
        remainingAmount: sharedOrder.totalAmount - totalApproved,
        percentagePaid: ((totalApproved / sharedOrder.totalAmount) * 100).toFixed(2)
      },
      participants: {
        total: sharedOrder.participants.length,
        approved: approvedParticipants.length,
        pending: sharedOrder.participants.length - approvedParticipants.length
      }
    });

  } catch (e) {
    console.error('❌ Erro ao verificar status:', e);
    res.status(500).json({ error: 'shared_order.status_error', detail: e.message });
  }
});

/**
 * DELETE /api/shared-order/:shareCode
 * Cancela um pedido compartilhado (apenas organizador)
 */
router.delete('/:shareCode', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { organizerEmail } = req.body;

    const sharedOrder = sharedOrders.get(shareCode.toUpperCase());

    if (!sharedOrder) {
      return res.status(404).json({ error: 'Pedido compartilhado não encontrado' });
    }

    if (sharedOrder.organizer.email !== organizerEmail) {
      return res.status(403).json({ error: 'Apenas o organizador pode cancelar' });
    }

    sharedOrders.delete(shareCode.toUpperCase());

    res.json({
      success: true,
      message: 'Pedido compartilhado cancelado com sucesso'
    });

  } catch (e) {
    console.error('❌ Erro ao cancelar pedido:', e);
    res.status(500).json({ error: 'shared_order.cancel_error', detail: e.message });
  }
});

module.exports = router;
