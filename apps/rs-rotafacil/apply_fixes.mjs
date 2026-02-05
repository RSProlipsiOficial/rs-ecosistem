import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TARGET_USER_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function executeFixes() {
    console.log('--- EXECUTANDO CORREÇÕES RS ROTA FÁCIL (CORREÇÃO DE DATA) ---');

    console.log('\n[2/3] Gerando mensalidades de Fevereiro/2026 para alunos históricos...');
    const { data: alunos, error: errAl } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', TARGET_USER_ID)
        .eq('ativo', true);

    if (errAl) {
        console.error('Erro ao buscar alunos:', errAl);
    } else {
        const mesAtual = '2026-02';
        const novosLancamentos = alunos.map(aluno => {
            let dia = aluno.dia_vencimento || 10;
            // Fevereiro tem 28 dias em 2026
            if (dia > 28) dia = 28;

            return {
                user_id: TARGET_USER_ID,
                tipo: 'receita',
                origem: 'mensalidade',
                categoria: 'MENSALIDADE',
                aluno_id: aluno.id,
                van_id: aluno.van_id,
                descricao: `Mensalidade: ${aluno.nome_completo}`,
                valor: aluno.valor_mensalidade || 0,
                competencia: mesAtual,
                data_evento: `${mesAtual}-${String(dia).padStart(2, '0')}`,
                status: 'previsto',
                pagamento_status: 'pendente',
                alocacao: 'empresa',
                referencia_id: `mensalidade-${aluno.id}-${mesAtual}`
            };
        });

        const { data: created, error: errGen } = await supabase
            .from('lancamentos_financeiros')
            .upsert(novosLancamentos, { onConflict: 'referencia_id' });

        if (errGen) console.error('Erro na geração de mensalidades:', errGen);
        else console.log(`✅ ${novosLancamentos.length} mensalidades geradas/atualizadas para Fevereiro.`);
    }

    // Auditoria de Vans
    console.log('\n--- AUDITORIA DE VANS ---');
    const { data: vans } = await supabase.from('vans').select('*').eq('user_id', TARGET_USER_ID);
    console.log('Vans encontradas:', vans?.map(v => ({ id: v.id, nome: v.nome })));

    if (vans) {
        for (const van of vans) {
            const { count } = await supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('van_id', van.id).eq('ativo', true);
            console.log(`Van ${van.nome}: ${count} alunos ativos.`);
        }
    }
}

executeFixes();
