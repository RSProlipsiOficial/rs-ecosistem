/**
 * SIGMA ROUTES - Matriz, Rede e Ciclos
 * Rotas para gerenciamento da rede SIGMA 1x6
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const sigmaController = require('../controllers/sigma.controller');

// ================================================
// REDE E MATRIZ
// ================================================

/**
 * GET /api/sigma/network/:userId
 * Retorna a rede completa do usuário (até 9 níveis)
 */
router.get('/network/:userId', authenticateToken, sigmaController.getNetwork);

/**
 * GET /api/sigma/matrix/:userId
 * Retorna a matriz atual do usuário
 */
router.get('/matrix/:userId', authenticateToken, sigmaController.getMatrix);

/**
 * GET /api/sigma/position/:userId
 * Retorna a posição do usuário na matriz
 */
router.get('/position/:userId', authenticateToken, sigmaController.getPosition);

/**
 * GET /api/sigma/downlines/:userId
 * Retorna todos os diretos e indiretos
 */
router.get('/downlines/:userId', authenticateToken, sigmaController.getDownlines);

// ================================================
// CICLOS
// ================================================

/**
 * GET /api/sigma/cycles/:userId
 * Retorna histórico de ciclos completados
 */
router.get('/cycles/:userId', authenticateToken, sigmaController.getCycles);

/**
 * POST /api/sigma/cycle/complete
 * Completa um ciclo e processa bônus
 */
router.post('/cycle/complete', authenticateToken, sigmaController.completeCycle);

/**
 * GET /api/sigma/cycle/status/:userId
 * Status do ciclo atual
 */
router.get('/cycle/status/:userId', authenticateToken, sigmaController.getCycleStatus);

// ================================================
// SPILLOVER E REENTRADA
// ================================================

/**
 * POST /api/sigma/spillover/process
 * Processa spillover automático
 */
router.post('/spillover/process', authenticateToken, sigmaController.processSpillover);

/**
 * POST /api/sigma/reentry/create
 * Cria reentrada automática após ciclo
 */
router.post('/reentry/create', authenticateToken, sigmaController.createReentry);

/**
 * GET /api/sigma/reentry/list/:userId
 * Lista todas as reentradas do usuário
 */
router.get('/reentry/list/:userId', authenticateToken, sigmaController.listReentries);

// ================================================
// BÔNUS
// ================================================

/**
 * GET /api/sigma/bonus/calculate/:userId
 * Calcula bônus de profundidade
 */
router.get('/bonus/calculate/:userId', authenticateToken, sigmaController.calculateBonus);

/**
 * GET /api/sigma/depth/:userId
 * Retorna bônus de profundidade por nível
 */
router.get('/depth/:userId', authenticateToken, sigmaController.getDepthBonus);

/**
 * POST /api/sigma/bonus/distribute
 * Distribui bônus após ciclo completado
 */
router.post('/bonus/distribute', authenticateToken, sigmaController.distributeBonus);

// ================================================
// ESTATÍSTICAS
// ================================================

/**
 * GET /api/sigma/stats/:userId
 * Estatísticas gerais da rede
 */
router.get('/stats/:userId', authenticateToken, sigmaController.getStats);

/**
 * GET /api/sigma/volume/:userId
 * Volume total da rede
 */
router.get('/volume/:userId', authenticateToken, sigmaController.getVolume);

module.exports = router;
