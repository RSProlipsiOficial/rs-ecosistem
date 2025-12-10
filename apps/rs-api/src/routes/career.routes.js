/**
 * CAREER ROUTES - Carreira e PIN
 * Rotas para gerenciamento de carreira (13 níveis PIN)
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const careerController = require('../controllers/career.controller');

// ================================================
// NÍVEL E PROGRESSO
// ================================================

/**
 * GET /api/career/level/:userId
 * Retorna o nível de carreira atual (PIN)
 */
router.get('/level/:userId', authenticateToken, careerController.getLevel);

/**
 * GET /api/career/progress/:userId
 * Retorna o progresso para o próximo nível
 */
router.get('/progress/:userId', authenticateToken, careerController.getProgress);

/**
 * GET /api/career/requirements/:pin
 * Retorna os requisitos para um PIN específico
 */
router.get('/requirements/:pin', authenticateToken, careerController.getRequirements);

/**
 * GET /api/career/next/:userId
 * Retorna informações do próximo nível
 */
router.get('/next/:userId', authenticateToken, careerController.getNextLevel);

// ================================================
// APURAÇÃO E VMEC
// ================================================

/**
 * POST /api/career/appraisal/run
 * Executa apuração trimestral de carreira
 */
router.post('/appraisal/run', authenticateToken, careerController.runAppraisal);

/**
 * GET /api/career/vmec/:userId
 * Calcula VMEC (Volume Máximo por Equipe Cíclica)
 */
router.get('/vmec/:userId', authenticateToken, careerController.calculateVMEC);

/**
 * GET /api/career/vmec/lines/:userId
 * VMEC detalhado por linha
 */
router.get('/vmec/lines/:userId', authenticateToken, careerController.getVMECByLines);

// ================================================
// BÔNUS DE CARREIRA
// ================================================

/**
 * GET /api/career/bonus/:userId
 * Histórico de bônus de carreira
 */
router.get('/bonus/:userId', authenticateToken, careerController.getCareerBonus);

/**
 * POST /api/career/bonus/distribute
 * Distribui bônus de carreira trimestral
 */
router.post('/bonus/distribute', authenticateToken, careerController.distributeCareerBonus);

// ================================================
// RANKING E ESTATÍSTICAS
// ================================================

/**
 * GET /api/career/ranking
 * Ranking geral de carreira
 */
router.get('/ranking', authenticateToken, careerController.getRanking);

/**
 * GET /api/career/stats/:userId
 * Estatísticas de carreira do usuário
 */
router.get('/stats/:userId', authenticateToken, careerController.getStats);

module.exports = router;
