/**
 * 🚀 ROTAS V1 - API Oficial RS-PROLIPSI
 * 
 * Centraliza todas as rotas versionadas do V1
 */

import express from 'express';
import { V1_ENDPOINTS } from '../../config/v1-endpoints';

const router = express.Router();

// Import das rotas específicas do V1
import authRoutes from './auth.routes';
import consultorRoutes from './consultor.routes';
import walletRoutes from './wallet.routes';
import adminRoutes from './admin.routes';
import consultantsRoutes from './consultants.routes';
import sigmaRoutes from './sigma.routes';
import uploadRoutes from './upload.routes';

import networkRoutes from './network.routes';
import matrixRoutes from './matrix.routes';
import opsRoutes from './ops.routes';
import reportsRoutes from './reports.routes';

// Configuração das rotas V1
// Montagem explícita para garantir compatibilidade com apiUrls.ts e V1_ENDPOINTS

router.use('/auth', authRoutes);
router.use('/consultor', consultorRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);
router.use('/consultants', consultantsRoutes);
router.use('/sigma', sigmaRoutes);
router.use('/matrix', matrixRoutes);
router.use('/network', networkRoutes);
router.use('/ops', opsRoutes);
router.use('/upload', uploadRoutes);
router.use('/reports', reportsRoutes);

// Health check específico do V1
router.get('/system/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: 'v1',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de versão
router.get('/system/version', (req, res) => {
  res.json({
    version: '1.0.0',
    api: 'RS-PROLIPSI V1',
    status: 'active'
  });
});

export default router;
