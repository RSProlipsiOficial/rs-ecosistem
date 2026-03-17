const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnose() {
    console.log('--- DIAGNÓSTICO PROFUNDO DE PEDIDOS ---');

    // 1. Verificar Orders
    const { data: orders } = await supabase.from('orders').select('*');
    console.log(`- Total Orders: ${orders?.length || 0}`);
    if (orders && orders.length > 0) {
        console.log('- Status encontrados em Orders:', [...new Set(orders.map(o => o.payment_status))]);
    }

    // 2. Verificar CD Orders (CDS)
    const { data: cdOrders } = await supabase.from('cd_orders').select('*');
    console.log(`- Total CD Orders: ${cdOrders?.length || 0}`);
    if (cdOrders && cdOrders.length > 0) {
        console.log('- Status encontrados em CD Orders:', [...new Set(cdOrders.map(o => o.status))]);
        const paidCdOrders = cdOrders.filter(o => o.status === 'pago' || o.status === 'paid');
        console.log(`- CD Orders Pagas: ${paidCdOrders.length}`);
    }

    // 3. Verificar Consultores
    const { data: consultores } = await supabase.from('consultores').select('id, nome, status').limit(5);
    console.log('- Amostra de Consultores:', JSON.stringify(consultores, null, 2));

    console.log('---------------------------------------');
}

diagnose().catch(console.error);
