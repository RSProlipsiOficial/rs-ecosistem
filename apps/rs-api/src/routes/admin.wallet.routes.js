const express = require('express');
const router = express.Router();
const adminWalletController = require('../controllers/admin.wallet.controller');

// Middleware de autenticação Supabase JWT
const { supabaseAuth } = require('../middlewares/supabaseAuth');

// Rotas Admin Wallet
router.post('/credit', supabaseAuth, adminWalletController.adminCredit);
router.post('/debit', supabaseAuth, adminWalletController.adminDebit);
router.get('/transactions', supabaseAuth, adminWalletController.getAllTransactions);

module.exports = router;
