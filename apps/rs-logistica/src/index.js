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

const { supabase } = require('./lib/supabaseClient');

// Rotas de Logística
app.post('/v1/logistics/payment-confirmed', async (req, res) => {
    try {
        const { orderId, paymentId, amount, customer, items } = req.body;
        console.log(`💰 Pagamento confirmado: ${orderId} (${amount})`);

        // Persistir no banco de dados
        const { data, error } = await supabase
            .from('logistics_orders')
            .upsert({
                order_id: orderId,
                payment_id: paymentId,
                customer_email: customer?.email,
                customer_name: customer?.name,
                total_amount: amount,
                status: 'preparing',
                items: items,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`📦 Pedido registrado na logística: ${data.id}`);

        res.json({
            success: true,
            status: 'preparing',
            message: 'Pedido recebido na logística e em separação',
            logisticsOrderId: data.id
        });
    } catch (error) {
        console.error('❌ Erro ao processar pagamento na logística:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/v1/logistics/delivery-confirmed', async (req, res) => {
    try {
        const { orderId, consultorId, cycleValue } = req.body;

        // 1. Atualizar status no banco
        await supabase
            .from('logistics_orders')
            .update({
                status: 'delivered',
                delivered_at: new Date().toISOString()
            })
            .eq('order_id', orderId);

        // 2. Fechar ciclo no Core (SIGMA)
        const client = new ServiceHttpClient(process.env.NODE_ENV || 'production');

        console.log('🔄 Fechando ciclo no SIGMA...');
        const result = await client.post('rs-core', '/v1/sigma/close-cycle', {
            consultorId,
            orderId,
            cycleValue
        });

        res.json({
            success: true,
            message: 'Entrega confirmada e ciclo processado',
            sigma: result
        });
    } catch (error) {
        console.error('❌ Erro ao confirmar entrega:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = getEnvNumber('PORT', 3005);
app.listen(PORT, () => {
    console.log(`🚛 RS Logística rodando na porta ${PORT}`);
});
