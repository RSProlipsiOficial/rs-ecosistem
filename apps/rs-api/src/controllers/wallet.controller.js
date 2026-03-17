/**
 * WALLET CONTROLLER
 * Lógica de negócio para WalletPay
 * Corrigido para nomes de colunas reais: balance, balance_blocked, consultant_id
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
  if (!userId) return null;
  
  // 1. Tenta direto em consultores.id
  const { data: direct } = await supabase
    .from('consultores')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (direct) return direct.id;

  // 2. Busca por consultores.user_id (auth.users.id)
  const { data: byUser } = await supabase
    .from('consultores')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (byUser) {
    console.log(`🔄 [Wallet] Resolvido auth(${userId}) → consultor(${byUser.id})`);
    return byUser.id;
  }

  // 3. Fallback: usa o ID original
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
      .select('balance, balance_blocked')
      .eq('consultor_id', consultorId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.json({
        success: true,
        balance: { available: 0, blocked: 0, total: 0 }
      });
    }

    res.json({
      success: true,
      balance: {
        available: parseFloat(data.balance || 0),
        blocked: parseFloat(data.balance_blocked || 0),
        total: parseFloat(data.balance || 0) + parseFloat(data.balance_blocked || 0)
      }
    });
  } catch (error) {
    console.error('❌ Erro getBalance:', error);
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
    
    const consultorId = await resolveConsultorId(userId);
    const sedeId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    // 1. Buscar transações da carteira normal
    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('consultant_id', consultorId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: walletTrx, error: walletError } = await query;
    if (walletError) throw walletError;

    // 2. Se for Sede, buscar também cd_transactions
    let combinedTransactions = [...walletTrx];

    const isSede = 
      consultorId === '89c000c0-7a39-4e1e-8dee-5978d846fa89' || 
      consultorId === 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' ||
      userId === '30c74d63-c184-4f7d-898a-8e16b3babd39' ||
      userId === 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    if (isSede) {
      const { data: cdTrx, error: cdError } = await supabase
        .from('cd_transactions')
        .select('*')
        .eq('cd_id', sedeId)
        .order('created_at', { ascending: false });

      if (!cdError && cdTrx) {
        const normalizedCdTrx = cdTrx.map(t => ({
          ...t,
          consultant_id: consultorId,
          type: t.type === 'IN' ? 'credit' : 'debit',
          amount: parseFloat(t.amount),
          description: `[CD Sede] ${t.description}`,
          _is_cd: true
        }));
        combinedTransactions = [...combinedTransactions, ...normalizedCdTrx];
      }
    }

    // Ordenar por data
    combinedTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Aplicar paginação manual
    const paginated = combinedTransactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      transactions: paginated,
      total: combinedTransactions.length
    });
  } catch (error) {
    console.error('❌ Erro getTransactions:', error);
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
    const rawUserId = req.body.user_id || req.user?.id;
    const amount = Number(req.body.amount || 0);
    const method = req.body.method || 'pix';
    const pix_key = req.body.pix_key || req.body.bank_account_id || req.body.pixKeyId || null;
    const bank_data = req.body.bank_data || null;
    const consultorId = await resolveConsultorId(rawUserId);

    // Validar saldo
    const { data: wallet, error: wErr } = await supabase
      .from('wallets')
      .select('balance')
      .eq('consultor_id', consultorId)
      .maybeSingle();

    if (wErr || !wallet || (wallet.balance || 0) < amount) {
      return res.status(400).json({
        success: false,
        error: 'Saldo insuficiente ou carteira não encontrada'
      });
    }

    // Calcular taxa
    const fee = method === 'pix' ? amount * 0.02 : 5.00;
    const net_amount = amount - fee;

    // Criar saque
    const { data, error } = await supabase
      .from('wallet_withdrawals')
      .insert({
        user_id: rawUserId,
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
    // Nota: supomos que as RPCs block_balance/debit_balance existem e usam consultor_id
    await supabase.rpc('block_balance', {
      p_user_id: consultorId,
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

    if (!withdrawal) throw new Error('Saque não encontrado');

    // Processar pagamento via Asaas (simulado/pendente lógica final)
    let transaction_id = `asaas-${Date.now()}`;
    if (process.env.ASAAS_API_KEY) {
      try {
        const asaasResponse = await axios.post(
          'https://www.asaas.com/api/v3/transfers',
          {
            value: withdrawal.net_amount,
            pixAddressKey: withdrawal.pix_key
          },
          {
            headers: { 'access_token': process.env.ASAAS_API_KEY }
          }
        );
        transaction_id = asaasResponse.data.id;
      } catch (axErr) {
        console.error('❌ Erro Asaas:', axErr.response?.data || axErr.message);
        throw new Error('Erro ao processar transferência no Asaas');
      }
    }

    // Atualizar status
    const { data, error } = await supabase
      .from('wallet_withdrawals')
      .update({
        status: 'approved',
        processed_at: new Date(),
        transaction_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Debitar saldo (finaliza o débito do bloqueado)
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

    if (!withdrawal) throw new Error('Saque não encontrado');

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
    const fromUserId = req.body.from_user_id || req.user?.id;
    const toUserId = req.body.to_user_id;
    const amount = Number(req.body.amount || 0);
    const description = req.body.description || req.body.note || '';
    
    const fromConsultorId = await resolveConsultorId(fromUserId);
    const toConsultorId = await resolveConsultorId(toUserId);

    const { data, error } = await supabase.rpc('transfer_between_wallets', {
      p_from_user_id: fromConsultorId,
      p_to_user_id: toConsultorId,
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
    const user_id = req.body.user_id || req.user?.id;
    const key_type = req.body.key_type || req.body.type;
    const key_value = req.body.key_value || req.body.key;

    const { data, error } = await supabase
      .from('wallet_pix_keys')
      .insert({
        user_id,
        key_type,
        key_value,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      pixKey: data,
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
      .eq('status', 'active');

    if (error) throw error;

    res.json({
      success: true,
      pixKeys: data
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
      .update({ status: 'inactive', deleted_at: new Date() })
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
    const user_id = req.body.user_id || req.user?.id;
    const amount = Number(req.body.amount || 0);
    const method = req.body.method || 'pix';

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
    console.error('❌ Erro Webhook MP (Wallet):', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ================================================
// DEBITAR E CREDITAR (USADOS PELO CHECKOUT/MMN)
// ================================================

/**
 * Debitar da carteira para pagamento
 */
exports.debitWallet = async (req, res) => {
  try {
    const { userId, amount, orderId, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, error: 'userId e amount são obrigatórios' });
    }

    const consultorId = await resolveConsultorId(userId);

    const { data: wallet, error: wError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('consultor_id', consultorId)
      .maybeSingle();

    if (wError || !wallet) {
      return res.status(404).json({ success: false, error: 'Carteira não encontrada' });
    }

    if (parseFloat(wallet.balance || 0) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Saldo insuficiente',
        available: wallet.balance
      });
    }

    const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

    const { error: upError } = await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (upError) throw upError;

    // Registrar transação com referência
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      consultant_id: consultorId,
      type: 'debit',
      amount: amount,
      balance_after: newBalance,
      description: description || `Pagamento pedido #${orderId}`,
      reference_id: orderId,
      reference_type: 'order',
      status: 'completed'
    });

    res.json({
      success: true,
      remainingBalance: newBalance,
      message: 'Pagamento realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro debitWallet:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Creditar na carteira (Bônus/MMN)
 */
exports.creditWallet = async (req, res) => {
  try {
    const { userId, amount, description, type, category, referenceId } = req.body;

    // Security check (token interno)
    const internalToken = req.headers['x-internal-token'];
    const validToken = process.env.INTERNAL_API_TOKEN || 'rs-internal-secret-123';
    if (internalToken !== validToken) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    const consultorId = await resolveConsultorId(userId);

    // 1. Buscar wallet
    let { data: wallet, error: fetchErr } = await supabase
      .from('wallets')
      .select('id, balance, total_received')
      .eq('consultor_id', consultorId)
      .maybeSingle();

    if (!wallet) {
      // Auto-criação
      const { data: newWallet, error: insErr } = await supabase
        .from('wallets')
        .insert({
          consultor_id: consultorId,
          balance: amount,
          total_received: amount,
          status: 'active'
        })
        .select()
        .single();
      
      if (insErr) throw insErr;
      wallet = newWallet;
    } else {
      // Atualização
      const { error: upErr } = await supabase
        .from('wallets')
        .update({
          balance: parseFloat(wallet.balance || 0) + parseFloat(amount),
          total_received: parseFloat(wallet.total_received || 0) + parseFloat(amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);
      
      if (upErr) throw upErr;
    }

    // 2. Registrar transação
    const newBalance = parseFloat(wallet.balance || 0) + parseFloat(amount);
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      consultant_id: consultorId,
      type: type || 'credit',
      amount,
      balance_after: newBalance,
      description: description || 'Crédito em conta',
      category: category || 'bonus',
      reference_id: referenceId,
      reference_type: 'order',
      status: 'completed'
    });

    res.json({ success: true, message: 'Crédito realizado!' });
  } catch (error) {
    console.error('❌ Erro creditWallet:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
