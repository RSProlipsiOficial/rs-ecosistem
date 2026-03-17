const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkIds() {
    console.log('--- MAPEAMENTO DE IDS ---');

    // 1. Pegar um consultor de exemplo
    const { data: consultores } = await supabase.from('consultores').select('id, user_id, nome').limit(5);
    console.log('Consultores (id vs user_id):', JSON.stringify(consultores, null, 2));

    // 2. Tentar bater com o buyer_id de um pedido
    const { data: orders } = await supabase.from('orders').select('buyer_id, buyer_name').eq('payment_status', 'Pago').limit(3);
    console.log('Pedidos Pagos (buyer_id):', JSON.stringify(orders, null, 2));

    // 3. Verificar o que está no matrix_accumulator agora
    const { data: acc } = await supabase.from('matrix_accumulator').select('*').limit(3);
    console.log('Conteúdo Atual de matrix_accumulator:', JSON.stringify(acc, null, 2));

    console.log('-------------------------');
}

checkIds().catch(console.error);
