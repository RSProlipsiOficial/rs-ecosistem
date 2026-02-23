require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: config .env não carregada.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateOrders() {
    console.log('🚀 Iniciando geração de consumo para 10 primeiros usuários reais...');

    // 1. Buscar os 10 primeiros REAIS
    const { data: users, error } = await supabase
        .from('consultores')
        .select('id, nome, email, created_at, status')
        .order('created_at', { ascending: true })
        .limit(10);

    if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
    }

    console.log(`✅ ${users.length} usuários encontrados.`);

    for (const [index, user] of users.entries()) {
        console.log(`\nProcessando ${index + 1}/${users.length}: ${user.nome} (${user.id})`);

        // 2. Atualizar Matrix Accumulator
        const { data: acc, error: accErr } = await supabase
            .from('matrix_accumulator')
            .select('*')
            .eq('consultor_id', user.id)
            .single();

        let currentVal = 60.00; // Valor alvo direto

        if (acc) {
            console.log(`   - Acumulador existente: ${acc.accumulated_value}. Atualizando para 60.00...`);
            await supabase
                .from('matrix_accumulator')
                .update({ accumulated_value: currentVal, updated_at: new Date() })
                .eq('id', acc.id);
        } else {
            console.log(`   - Criando novo acumulador com 60.00...`);
            await supabase
                .from('matrix_accumulator')
                .insert({
                    consultor_id: user.id,
                    accumulated_value: currentVal,
                    total_activated: 1
                });
        }

        // 3. Atualizar Status para Ativo (se não estiver)
        if (user.status !== 'ativo') {
            console.log(`   - Ativando usuário (status: ${user.status} -> ativo)...`);
            await supabase
                .from('consultores')
                .update({ status: 'ativo', data_ativacao: new Date() })
                .eq('id', user.id);
        } else {
            console.log('   - Usuário já está ativo.');
        }

        // 4. Inserir Pedido Fake (opcional, só para constar histórico se houver tabela)
        // Como não sei o schema de 'orders' exato, vou pular e focar no acumulador que é o core do SIGMA.

        console.log(`✅ ${user.nome} processado com sucesso.`);
    }

    console.log('\n🏁 Processo finalizado.');
}

generateOrders();
