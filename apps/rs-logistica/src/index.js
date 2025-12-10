/**
 * RS Prólipsi - Logística Service
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createHealthCheck, getEnvNumber, ServiceHttpClient } = require('rs-ops-config');

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
    const health = createHealthCheck('rs-logistica', '1.0.0');
    res.json(health);
});

// Rotas de Logística
app.post('/v1/logistics/payment-confirmed', async (req, res) => {
    try {
        const { orderId, paymentId, amount, customer, items } = req.body;
        console.log(`💰 Pagamento confirmado: ${orderId} (${amount})`);
        console.log(`📦 Itens a separar:`, items);
        console.log(`👤 Cliente:`, customer);

        // TODO: Salvar no banco de dados (Supabase/Postgres)
        // await supabase.from('logistics_orders').insert({ ... });

        // TODO: Notificar CD responsável

        res.json({
            success: true,
            status: 'preparing',
            message: 'Pedido recebido na logística e em separação'
        });
    } catch (error) {
        console.error('❌ Erro ao processar pagamento:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/v1/logistics/delivery-confirmed', async (req, res) => {
    try {
        const { orderId, consultorId, cycleValue } = req.body;

        // Fechar ciclo no Core (SIGMA)
        const client = new ServiceHttpClient(process.env.NODE_ENV || 'production');

        console.log('🔄 Fechando ciclo no SIGMA...');
        const result = await client.post('rs-core', '/v1/sigma/close-cycle', {
            consultorId,
            orderId,
            cycleValue
        });

        res.json({ success: true, sigma: result });
    } catch (error) {
        console.error('❌ Erro ao fechar ciclo:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = getEnvNumber('PORT', 3005);
app.listen(PORT, () => {
    console.log(`🚛 RS Logística rodando na porta ${PORT}`);
});
