/**
 * WALLET ROUTES - Carteira Digital
 * Rotas para gerenciamento financeiro (WalletPay)
 */

const express = require('express');
const router = express.Router();
const { supabaseAuth, isOwnerOrAdmin } = require('../middlewares/supabaseAuth');
const walletController = require('../controllers/wallet.controller');

// ================================================
// SALDO E TRANSAÇÕES
// ================================================

/**
 * GET /api/wallet/balance/:userId
 * Retorna saldo disponível, bloqueado e total
 */
router.get('/balance/:userId', supabaseAuth, isOwnerOrAdmin(), walletController.getBalance);

/**
 * GET /api/wallet/transactions/:userId
 * Histórico de transações
 */
router.get('/transactions/:userId', supabaseAuth, isOwnerOrAdmin(), walletController.getTransactions);

/**
 * GET /api/wallet/statement/:userId
 * Extrato detalhado
 */
router.get('/statement/:userId', supabaseAuth, isOwnerOrAdmin(), walletController.getStatement);

// ================================================
// SAQUES
// ================================================

/**
 * POST /api/wallet/withdraw
 * Solicitar saque
 */
router.post('/withdraw', supabaseAuth, walletController.requestWithdraw);

/**
 * GET /api/wallet/withdrawals/:userId
 * Histórico de saques
 */
router.get('/withdrawals/:userId', supabaseAuth, isOwnerOrAdmin(), walletController.getWithdrawals);

/**
 * PUT /api/wallet/withdraw/:id/approve
 * Aprovar saque (admin)
 */
router.put('/withdraw/:id/approve', supabaseAuth, walletController.approveWithdraw);

/**
 * PUT /api/wallet/withdraw/:id/reject
 * Rejeitar saque (admin)
 */
router.put('/withdraw/:id/reject', supabaseAuth, walletController.rejectWithdraw);

// ================================================
// TRANSFERÊNCIAS
// ================================================

/**
 * POST /api/wallet/transfer
 * Transferir entre contas
 */
router.post('/transfer', supabaseAuth, walletController.transfer);

// ================================================
// PIX
// ================================================

/**
 * POST /api/wallet/pix/create
 * Cadastrar chave PIX
 */
router.post('/pix/create', supabaseAuth, walletController.createPixKey);

/**
 * GET /api/wallet/pix/list/:userId
 * Listar chaves PIX
 */
router.get('/pix/list/:userId', supabaseAuth, isOwnerOrAdmin(), walletController.listPixKeys);

/**
 * DELETE /api/wallet/pix/:id
 * Remover chave PIX
 */
router.delete('/pix/:id', supabaseAuth, walletController.deletePixKey);

// ================================================
// DÉBITO (PAGAMENTO COM SALDO)
// ================================================

/**
 * POST /api/wallet/debit
 * Debitar da carteira para pagamento
 */
router.post('/debit', supabaseAuth, walletController.debitWallet);

/**
 * POST /api/wallet/credit
 * Creditar na carteira (Sistema/Bônus)
 */
router.post('/credit', supabaseAuth, walletController.creditWallet);

// ================================================
// DEPÓSITOS
// ================================================

/**
 * POST /api/wallet/deposit
 * Criar depósito
 */
router.post('/deposit', supabaseAuth, walletController.createDeposit);

/**
 * POST /api/wallet/deposit/confirm
 * Confirmar depósito
 */
router.post('/deposit/confirm', supabaseAuth, walletController.confirmDeposit);

// ================================================
// WEBHOOKS
// ================================================

/**
 * POST /api/wallet/webhook/asaas
 * Webhook Asaas
 */
router.post('/webhook/asaas', walletController.webhookAsaas);

/**
 * POST /api/wallet/webhook/mercadopago
 * Webhook MercadoPago
 */
router.post('/webhook/mercadopago', walletController.webhookMercadoPago);

module.exports = router;
