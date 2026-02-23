const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Servidor PIX Iniciando...');
console.log('Supabase:', supabaseUrl);

app.post('/pix', async (req, res) => {
  try {
    const { amount, description, payer } = req.body;
    console.log('🛒 PIX:', { amount, description });

    // 1. Buscar token MP
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('mercadopago_access_token, nome_completo')
      .not('mercadopago_access_token', 'is', null)
      .limit(1);

    if (error || !profiles?.length) {
      console.error('❌ Token MP não encontrado');
      return res.status(500).json({ success: false, error: 'Token MP não configurado' });
    }

    const accessToken = profiles[0].mercadopago_access_token;
    console.log('🔑 Token de:', profiles[0].nome_completo);

    // 2. Chamar API Mercado Pago direto (sem SDK)
    const mpBody = {
      transaction_amount: Number(amount),
      description: description || 'Pedido Marketplace RS Prólipsi',
      payment_method_id: 'pix',
      payer: {
        email: payer?.email || 'cliente@rsprolipsi.com',
        first_name: payer?.first_name || 'Cliente',
        last_name: payer?.last_name || 'RS',
      }
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      },
      body: JSON.stringify(mpBody),
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('❌ MP API erro:', mpResponse.status, errText);
      return res.status(500).json({ success: false, error: `Mercado Pago: ${mpResponse.status}` });
    }

    const mpData = await mpResponse.json();
    console.log('✅ PIX gerado:', mpData.id, '| Status:', mpData.status);

    return res.json({
      success: true,
      id: mpData.id,
      status: mpData.status,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url
    });

  } catch (err) {
    console.error('❌ Erro:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PIX Server: http://localhost:${PORT}`);
  console.log(`👉 POST http://localhost:${PORT}/pix`);
});
