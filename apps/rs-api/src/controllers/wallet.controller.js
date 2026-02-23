/**
 * WALLET CONTROLLER
 * Lógica de negócio para WalletPay
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Helper: Resolve auth.users.id → consultores.id
 * A tabela wallets usa consultor_id (FK → consultores.id),
 * mas o frontend envia auth.users.id.
 */
async function resolveConsultorId(userId) {
  // 1. Tenta direto em consultores.id
  const { data: direct } = await supabase
    .from('consultores')
    .select('id')
    .eq('id', userId)
    .single();
  if (direct) return direct.id;

  // 2. Busca por consultores.user_id (auth.users.id)
  const { data: byUser } = await supabase
    .from('consultores')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (byUser) {
    console.log(`🔄 [Wallet] Resolvido auth(${userId}) → consultor(${byUser.id})`);
    return byUser.id;
  }

  // 3. Fallback: usa o ID original (pode falhar)
  console.warn(`⚠️ [Wallet] Não encontrou consultor para userId=${userId}`);
  return userId;
}

// ================================================
// SALDO E TRANSAÇÕES
// ================================================

/**
 * Retorna saldo disponível, bloqueado e total
 */
exports.getBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const consultorId = await resolveConsultorId(userId);

    const { data, error } = await supabase
      .from('wallets')
      .select('saldo_disponivel, saldo_bloqueado, saldo_total')
      .eq('consultor_id', consultorId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      balance: {
        available: data.saldo_disponivel,
        blocked: data.saldo_bloqueado,
        total: data.saldo_total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Histórico de transações
 */
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, type } = req.query;

    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      transactions: data,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Extrato detalhado
 */
exports.getStatement = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date } = req.query;

    const { data, error } = await supabase.rpc('get_wallet_statement', {
      p_user_id: userId,
      p_start_date: start_date,
      p_end_date: end_date
    });

    if (error) throw error;

    res.json({
      success: true,
      statement: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// SAQUES
// ================================================

/**
 * Solicitar saque
 */
exports.requestWithdraw = async (req, res) => {
  try {
    const { user_id, amount, method, pix_key, bank_data } = req.body;

    // Validar saldo
    const { data: wallet } = await supabase
      .from('wallets')
      .select('saldo_disponivel')
      .eq('consultor_id', user_id)
      .single();

    if (wallet.saldo_disponivel < amount) {
      return res.status(400).json({
        success: false,
        error: 'Saldo insuficiente'
      });
    }

    // Calcular taxa
    const fee = method === 'pix' ? amount * 0.02 : 5.00;
    const net_amount = amount - fee;

    // Criar saque
    const { data, error } = await supabase
      .from('wallet_withdrawals')
      .insert({
        user_id,
        amount,
        fee,
        net_amount,
        method,
        pix_key,
        bank_data,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Bloquear saldo
    await supabase.rpc('block_balance', {
      p_user_id: user_id,
      p_amount: amount
    });

    res.json({
      success: true,
      withdrawal: data,
      message: 'Saque solicitado com sucesso!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Histórico de saques
 */
exports.getWithdrawals = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('wallet_withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      withdrawals: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Aprovar saque (admin)
 */
exports.approveWithdraw = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar saque
    const { data: withdrawal } = await supabase
      .from('wallet_withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    // Processar pagamento via Asaas
    const asaasResponse = await axios.post(
      'https://www.asaas.com/api/v3/transfers',
      {
        value: withdrawal.net_amount,
        pixAddressKey: withdrawal.pix_key
      },
      {
        headers: {
          'access_token': process.env.ASAAS_API_KEY
        }
      }
    );

    // Atualizar status
    const { data, error } = await supabase
      .from('wallet_withdrawals')
      .update({
        status: 'approved',
        processed_at: new Date(),
        transaction_id: asaasResponse.data.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Debitar saldo
    await supabase.rpc('debit_balance', {
      p_user_id: withdrawal.user_id,
      p_amount: withdrawal.amount
    });

    res.json({
      success: true,
      withdrawal: data,
      message: 'Saque aprovado e processado!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Rejeitar saque (admin)
 */
exports.rejectWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Buscar saque
    const { data: withdrawal } = await supabase
      .from('wallet_withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    // Atualizar status
    const { data, error } = await supabase
      .from('wallet_withdrawals')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        processed_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Desbloquear saldo
    await supabase.rpc('unblock_balance', {
      p_user_id: withdrawal.user_id,
      p_amount: withdrawal.amount
    });

    res.json({
      success: true,
      withdrawal: data,
      message: 'Saque rejeitado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// TRANSFERÊNCIAS
// ================================================

/**
 * Transferir entre contas
 */
exports.transfer = async (req, res) => {
  try {
    const { from_user_id, to_user_id, amount, description } = req.body;

    const { data, error } = await supabase.rpc('transfer_between_wallets', {
      p_from_user_id: from_user_id,
      p_to_user_id: to_user_id,
      p_amount: amount,
      p_description: description
    });

    if (error) throw error;

    res.json({
      success: true,
      transfer: data,
      message: 'Transferência realizada com sucesso!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// PIX
// ================================================

/**
 * Cadastrar chave PIX
 */
exports.createPixKey = async (req, res) => {
  try {
    const { user_id, key_type, key_value } = req.body;

    const { data, error } = await supabase
      .from('wallet_pix_keys')
      .insert({
        user_id,
        key_type,
        key_value,
        is_primary: false
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      pix_key: data,
      message: 'Chave PIX cadastrada!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Listar chaves PIX
 */
exports.listPixKeys = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('wallet_pix_keys')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      pix_keys: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Remover chave PIX
 */
exports.deletePixKey = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('wallet_pix_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Chave PIX removida!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// DEPÓSITOS
// ================================================

/**
 * Criar depósito
 */
exports.createDeposit = async (req, res) => {
  try {
    const { user_id, amount, method } = req.body;

    const { data, error } = await supabase.rpc('process_deposit', {
      p_user_id: user_id,
      p_amount: amount,
      p_method: method
    });

    if (error) throw error;

    res.json({
      success: true,
      deposit: data,
      message: 'Depósito criado!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Confirmar depósito
 */
exports.confirmDeposit = async (req, res) => {
  try {
    const { deposit_id, transaction_id } = req.body;

    const { data, error } = await supabase.rpc('confirm_deposit', {
      p_deposit_id: deposit_id,
      p_transaction_id: transaction_id
    });

    if (error) throw error;

    res.json({
      success: true,
      deposit: data,
      message: 'Depósito confirmado!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// WEBHOOKS
// ================================================

/**
 * Webhook Asaas
 */
exports.webhookAsaas = async (req, res) => {
  try {
    const { event, payment } = req.body;

    if (event === 'PAYMENT_CONFIRMED') {
      // Confirmar depósito
      await supabase.rpc('confirm_deposit', {
        p_deposit_id: payment.externalReference,
        p_transaction_id: payment.id
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Webhook MercadoPago
 */
exports.webhookMercadoPago = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      // Processar pagamento
      const paymentId = data.id;

      // Buscar detalhes do pagamento
      const mpResponse = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
          }
        }
      );

      if (mpResponse.data.status === 'approved') {
        await supabase.rpc('confirm_deposit', {
          p_deposit_id: mpResponse.data.external_reference,
          p_transaction_id: paymentId
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Debitar da carteira para pagamento
 */
exports.debitWallet = async (req, res) => {
  try {
    const { userId, amount, orderId, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'userId e amount são obrigatórios'
      });
    }

    // Resolver consultor_id real
    const consultorId = await resolveConsultorId(userId);

    // Buscar saldo atual
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('saldo_disponivel')
      .eq('consultor_id', consultorId)
      .single();

    if (walletError || !wallet) {
      return res.status(404).json({
        success: false,
        error: 'Carteira não encontrada'
      });
    }

    // Verificar saldo suficiente
    if (wallet.saldo_disponivel < amount) {
      return res.status(400).json({
        success: false,
        error: 'Saldo insuficiente',
        available: wallet.saldo_disponivel,
        required: amount
      });
    }

    // Debitar
    const newBalance = wallet.saldo_disponivel - amount;

    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        saldo_disponivel: newBalance,
        saldo_total: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('consultor_id', consultorId);

    if (updateError) throw updateError;

    // Atualizar status do pedido para 'paid' se orderId foi fornecido
    if (orderId) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_method: 'wallet',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      console.log(`✅ [Wallet] Pedido ${orderId} marcado como pago via saldo.`);

      // PROCESSAR BÔNUS MMN — igual ao webhook do Mercado Pago
      try {
        const { registerSale } = require('../services/salesService');
        const saleResult = await registerSale({
          orderId,
          mpPaymentId: `wallet-${Date.now()}`,
          amount: amount,
          method: 'wallet',
          receivedAt: new Date().toISOString()
        });
        console.log(`✅ [Wallet] Bônus MMN processados:`, {
          sales: saleResult.sales?.length || 0,
          matrixValue: saleResult.totalMatrixValue || 0
        });
      } catch (bonusError) {
        console.error('⚠️ [Wallet] Erro ao processar bônus MMN (pedido já pago):', bonusError.message);
        // Não falha o pagamento — bônus pode ser reprocessado depois
      }
    }


    // Registrar transação
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'debit',
        amount: amount,
        description: description || `Pagamento pedido #${orderId}`,
        order_id: orderId,
        balance_after: newBalance,
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      transactionId: `trx-${Date.now()}`,
      remainingBalance: newBalance,
      message: 'Pagamento realizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
/**
 * Creditar na carteira (Sistema/Bônus)
 */
exports.creditWallet = async (req, res) => {
  try {
    const { userId, amount, description, type, category, referenceId } = req.body;

    // Security Check
    const internalToken = req.headers['x-internal-token'];
    const validToken = process.env.INTERNAL_API_TOKEN || 'rs-internal-secret-123'; // Fallback for dev

    if (internalToken !== validToken) {
      console.warn(`⚠️ Tentativa não autorizada em creditWallet: ${internalToken}`);
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: Token interno inválido'
      });
    }

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'userId e amount são obrigatórios'
      });
    }

    // Buscar saldo atual
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('saldo_disponivel, saldo_total')
      .eq('consultor_id', userId)
      .single();

    if (walletError) {
      // Se não existe, criar carteira
      if (walletError.code === 'PGRST116') {
        await supabase.from('wallets').insert({
          consultor_id: userId,
          saldo_disponivel: amount,
          saldo_total: amount,
          saldo_bloqueado: 0
        });
      } else {
        throw walletError;
      }
    } else {
      // Atualizar saldo
      const newBalance = (wallet.saldo_disponivel || 0) + amount;
      const newTotal = (wallet.saldo_total || 0) + amount;

      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          saldo_disponivel: newBalance,
          saldo_total: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq('consultor_id', userId);

      if (updateError) throw updateError;
    }

    // Registrar transação
    const { data: transaction, error: trxError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: type || 'credit',
        amount: amount,
        description: description || 'Crédito em conta',
        category: category || 'bonus',
        reference_id: referenceId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (trxError) throw trxError;

    res.json({
      success: true,
      transaction,
      message: 'Crédito realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao creditar wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
