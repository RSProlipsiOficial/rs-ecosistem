/**
 * 💰 ROTAS DA WALLET - V1
 * 
 * Endpoints para gestão da carteira digital
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, requireRole, ROLES, isOwnerOrAdmin } from '../../middlewares/supabaseAuth';

const router = express.Router();

// GET /v1/wallet/balance
router.get('/balance', supabaseAuth, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const userId = (req as any).user.id;

    // Buscar saldo da carteira
    const { data: walletData, error } = await supabase
      .from('wallet_accounts')
      .select('balance, available_balance, blocked_balance, currency')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar saldo:', error);

      // Se não encontrar carteira, retorna valores zerados
      return res.json({
        balance: 0,
        available: 0,
        blocked: 0,
        currency: 'BRL'
      });
    }

    res.json({
      balance: walletData.balance || 0,
      available: walletData.available_balance || 0,
      blocked: walletData.blocked_balance || 0,
      currency: walletData.currency || 'BRL'
    });

  } catch (error) {
    console.error('Erro no saldo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// GET /v1/wallet/transactions
router.get('/transactions', supabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Buscar transações com paginação
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: transactions, error, count } = await supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Erro ao buscar transações:', error);
      return res.status(500).json({
        error: 'Erro ao carregar transações',
        code: 'TRANSACTIONS_ERROR'
      });
    }

    res.json({
      transactions: transactions || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Erro nas transações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// POST /v1/wallet/withdraw
router.post('/withdraw', supabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const userId = req.user.id;
    const { amount, bank_account_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valor de saque inválido',
        code: 'INVALID_WITHDRAW_AMOUNT'
      });
    }

    if (!bank_account_id) {
      return res.status(400).json({
        error: 'Conta bancária é obrigatória',
        code: 'BANK_ACCOUNT_REQUIRED'
      });
    }

    // Verificar saldo disponível
    const { data: walletData, error: walletError } = await supabase
      .from('wallet_accounts')
      .select('available_balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !walletData) {
      return res.status(400).json({
        error: 'Erro ao verificar saldo',
        code: 'BALANCE_CHECK_ERROR'
      });
    }

    if (walletData.available_balance < amount) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        code: 'INSUFFICIENT_BALANCE',
        available: walletData.available_balance
      });
    }

    // Criar solicitação de saque
    const { data: withdrawRequest, error: withdrawError } = await supabase
      .from('wallet_withdraw_requests')
      .insert({
        user_id: userId,
        amount: amount,
        bank_account_id: bank_account_id,
        status: 'pending',
        fee: calculateWithdrawFee(amount)
      })
      .select()
      .single();

    if (withdrawError) {
      console.error('Erro ao criar saque:', withdrawError);
      return res.status(500).json({
        error: 'Erro ao solicitar saque',
        code: 'WITHDRAW_REQUEST_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Saque solicitado com sucesso',
      request: withdrawRequest
    });

  } catch (error) {
    console.error('Erro no saque:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * Calcula taxa de saque (2% com mínimo de R$ 5)
 */
function calculateWithdrawFee(amount: number): number {
  const fee = amount * 0.02;
  return Math.max(fee, 5);
}

export default router;