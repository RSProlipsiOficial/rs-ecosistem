/**
 * RS STUDIO ROUTES - IA e Treinamento
 * Rotas para chat IA, treinamentos e geração de conteúdo
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const studioController = require('../controllers/studio.controller');

// ================================================
// CHAT IA
// ================================================

router.post('/chat', authenticateToken, studioController.sendMessage);
router.get('/chat/history/:userId', authenticateToken, studioController.getChatHistory);
router.delete('/chat/:conversationId', authenticateToken, studioController.deleteConversation);

// ================================================
// TREINAMENTOS
// ================================================

router.get('/trainings', authenticateToken, studioController.listTrainings);
router.get('/trainings/:id', authenticateToken, studioController.getTraining);
router.post('/training/progress', authenticateToken, studioController.updateProgress);
router.get('/training/progress/:userId', authenticateToken, studioController.getUserProgress);

// ================================================
// QUIZZES
// ================================================

router.post('/quiz/submit', authenticateToken, studioController.submitQuiz);
router.get('/quiz/results/:userId', authenticateToken, studioController.getQuizResults);

// ================================================
// CERTIFICADOS
// ================================================

router.get('/certificates/:userId', authenticateToken, studioController.getUserCertificates);
router.get('/certificate/:id/download', authenticateToken, studioController.downloadCertificate);

// ================================================
// GERAÇÃO DE CONTEÚDO
// ================================================

router.post('/content/generate/image', authenticateToken, studioController.generateImage);
router.post('/content/generate/audio', authenticateToken, studioController.generateAudio);
router.post('/content/generate/text', authenticateToken, studioController.generateText);
router.get('/content/history/:userId', authenticateToken, studioController.getContentHistory);

// ================================================
// BASE DE CONHECIMENTO
// ================================================

router.get('/knowledge/search', authenticateToken, studioController.searchKnowledge);
router.get('/knowledge/faq', studioController.getFAQ);
router.post('/knowledge/faq/helpful', authenticateToken, studioController.markFAQHelpful);

// ================================================
// NOTIFICAÇÕES
// ================================================

router.get('/notifications/:userId', authenticateToken, studioController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, studioController.markAsRead);
router.delete('/notifications/:id', authenticateToken, studioController.deleteNotification);

module.exports = router;
