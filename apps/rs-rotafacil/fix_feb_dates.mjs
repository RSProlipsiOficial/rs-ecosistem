import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function fixFebDates() {
    console.log('--- CORRIGINDO DATAS INVÁLIDAS FEVEREIRO ---');

    const invalidAlunos = ['Elloa Vargas Camargo', 'Yuri', 'Mariana Marcelino Serbele', 'Maria Cecilia', 'Julia'];

    for (const nome of invalidAlunos) {
        const { data: aluno } = await supabase.from('alunos').select('*').eq('user_id', ROBERTO_ID).ilike('nome_completo', `%${nome}%`).single();
        if (!aluno) continue;

        console.log(`Corrigindo ${aluno.nome_completo}...`);
        const totalValor = Number(aluno.valor_mensalidade || 0) + Number(aluno.valor_letalidade || 0);
        const dataVenc = `2026-02-28`; // Limite para Fevereiro

        const { data: pag, error: errP } = await supabase.from('pagamentos_mensais').insert({
            aluno_id: aluno.id,
            mes: 2,
            ano: 2026,
            valor: totalValor,
            status: 'nao_pago',
            user_id: ROBERTO_ID,
            data_vencimento: dataVenc
        }).select().single();

        if (errP) {
            console.error(`Erro:`, errP.message);
            continue;
        }

        await supabase.from('lancamentos_financeiros').insert({
            user_id: ROBERTO_ID,
            tipo: 'receita',
            origem: 'mensalidade',
            categoria: 'MENSALIDADE',
            descricao: `Mensalidade: ${aluno.nome_completo}`,
            valor: totalValor,
            competencia: '2026-02',
            data_evento: dataVenc,
            status: 'previsto',
            pagamento_status: 'pendente',
            aluno_id: aluno.id,
            referencia_id: `mensalidade-${pag.id}-2026-02`,
            van_id: aluno.van_id
        });
    }

    console.log('Correção finalizada.');
}

fixFebDates();
