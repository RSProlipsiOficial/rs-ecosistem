import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { validatePlanOrThrow } from "./core/validators";
import { validateAllRules } from "./core/rules";
import { health } from "./routes/health";
import communications from './routes/communications';
import marketplace from './routes/marketplace';
const paymentRoutes = require('./routes/payment.routes');
const webhookRoutes = require('./routes/webhook.routes');
import sigmaSettings from './routes/sigmaSettings';
import sigmaProcess from './routes/sigmaProcess';
import adminConsultants from './routes/adminConsultants';
import reportsRoutes from './routes/reports.routes';
import adminConsultorMisc from './routes/adminConsultorMisc';
import consultantCommunications from './routes/consultantCommunications';
import adminConfig from './routes/adminConfig';
import marketingPixels from './routes/marketingPixels';
import linksRoutes from './routes/links';
import cdsRoutes from './routes/cds';
import consultantsProfile from './routes/consultantsProfile';
import v1Routes from './routes/v1';
import path from 'path';
const walletApiRoutes = require('./routes/wallet.routes');
const shippingRoutes = require('./routes/shipping.routes');

const app = express();

// Boot checks
console.log("🚀 Iniciando RS Prólipsi API...\n");
validatePlanOrThrow(); // Valida config/marketingRules
validateAllRules(); // Valida regras operacionais

// Middlewares globais
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(logger);

// Debug Middleware - Log all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] Request received: ${req.method} ${req.url}`);
  next();
});

// Rotas de Pagamento (Mover para cima para evitar conflito)
console.log('[DEBUG] Mounting payment routes at /api/payment');
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// Outras Rotas
app.use(health);
app.use(communications);
app.use(marketplace);
app.use(sigmaSettings);
app.use(sigmaProcess);
app.use(adminConsultants);
app.use(reportsRoutes);
app.use(adminConsultorMisc);
app.use(consultantCommunications);
app.use(adminConfig); // Novas rotas de config do admin
app.use(marketingPixels);
app.use(linksRoutes);
app.use(cdsRoutes);
app.use(consultantsProfile);
app.use('/api/wallet', walletApiRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rotas V1 - API Oficial
app.use('/v1', v1Routes);

// Error handler por último
app.use(errorHandler);

import { getEnvNumber } from 'rs-ops-config';

const PORT = getEnvNumber('PORT', 8080);
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
