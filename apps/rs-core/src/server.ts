/**
 * RS Prólipsi - Core Service (SIGMA)
 */

import express from 'express';
import cors from 'cors';
import { createHealthCheck, getEnvNumber, ServiceHttpClient, SigmaCloseCyclePayload, getRule, setConfigProvider } from 'rs-ops-config';
import { SupabaseConfigProvider } from './config/supabaseProvider';

// Initialize Dynamic Config
setConfigProvider(new SupabaseConfigProvider());

// Mock ou Import real logic
// import { closeCycle } from './engine/sigmeCycle'; 

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
    const health = createHealthCheck('rs-core', '1.0.0');
    res.json(health);
});

// Rotas SIGMA
app.post('/v1/sigma/close-cycle', async (req, res) => {
    try {
        const payload: SigmaCloseCyclePayload = req.body;
        console.log(`🔄 Processando fechamento de ciclo para: ${payload.consultorId}`);

        // 1. Calcular bônus (Lógica do SIGMA)
        // const result = await closeCycle(payload.consultorId, payload.orderId);

        // MOCK: Simulando cálculo
        const cycleValue = await getRule<number>('SIGMA', 'CYCLE_VALUE', 360);
        const bonusAmount = cycleValue * 0.10; // 10% de bônus exemplo

        console.log(`💰 Bônus calculado: ${bonusAmount}`);

        // 2. Creditar na Wallet (Chamada ao rs-api)
        const client = new ServiceHttpClient(process.env.NODE_ENV as any || 'production');

        console.log('📞 Creditando bônus via rs-api/wallet...');
        const walletResult = await client.post('rs-api', '/v1/wallet/credit', {
            userId: payload.consultorId,
            amount: bonusAmount,
            description: `Bônus de Ciclo - Pedido ${payload.orderId}`,
            type: 'credit',
            category: 'bonus'
        });

        res.json({
            success: true,
            message: 'Ciclo fechado e bônus distribuído',
            bonus: bonusAmount,
            wallet: walletResult
        });

    } catch (error: any) {
        console.error('❌ Erro no SIGMA:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = getEnvNumber('PORT', 4001); // Porta dedicada ao Core se rodar como serviço
app.listen(PORT, () => {
    console.log(`⚛️ RS Core (SIGMA) rodando na porta ${PORT}`);
});
