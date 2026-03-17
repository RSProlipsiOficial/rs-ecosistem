require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncCompras() {
    console.log('🔄 Sincronizando Compras MMN com Acumulador...');
    const { data: vendas, error: errVendas } = await supabase
        .from('sales')
        .select('*')
        .eq('payment_status', 'completed')
        .eq('contributes_to_matrix', true);

    if (errVendas) return console.error(errVendas);
    console.log(`Encontradas ${vendas.length} vendas de produtos MMN faturadas.`);

    const userMap = {};

    for (const sale of vendas) {
        if (!sale.buyer_id) continue;
        userMap[sale.buyer_id] = (userMap[sale.buyer_id] || 0) + Number(sale.total_amount);
    }

    for (const [userId, amount] of Object.entries(userMap)) {
        console.log(`-> Usuário ${userId} gastou R$ ${amount} na Matriz.`);
        
        // Update Acumulador
        let { data: acc } = await supabase.from('matrix_accumulator').select('*').eq('consultor_id', userId).single();
        if (!acc) {
            await supabase.from('matrix_accumulator').insert({
                consultor_id: userId,
                accumulated_value: amount,
                total_activated: Math.floor(amount / 60)
            });
        } else {
            await supabase.from('matrix_accumulator').update({
                accumulated_value: amount,
                total_activated: Math.floor(amount / 60)
            }).eq('consultor_id', userId);
        }

        // Se gastou pelo menos R$ 60, abre o ciclo 1 dele caso não tenha ciclo aberto
        if (amount >= 60) {
            let { data: cyc } = await supabase.from('matriz_cycles').select('id').eq('consultor_id', userId).eq('status', 'open').maybeSingle();
            if (!cyc) {
                const { data: ultCiclo } = await supabase.from('matriz_cycles').select('cycle_number').eq('consultor_id', userId).order('cycle_number', {ascending: false}).limit(1).maybeSingle();
                const nextNum = ultCiclo ? ultCiclo.cycle_number + 1 : 1;
                console.log(`   Abrindo Ciclo ${nextNum} para ${userId}...`);
                const { data: newC } = await supabase.from('matriz_cycles').insert({ consultor_id: userId, cycle_number: nextNum, status: 'open' }).select().single();
                if (newC) {
                    await supabase.from('cycle_events').insert({
                        cycle_id: newC.id, consultor_id: userId, event_type: 'cycle_opened', event_data: { cycle_number: nextNum }
                    });
                }
            }
        }
    }
    console.log('✅ Sincronização concluída!');
}

syncCompras().catch(console.error);
