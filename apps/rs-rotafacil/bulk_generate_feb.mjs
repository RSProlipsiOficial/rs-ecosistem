import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function generateFebruaryBulk() {
    console.log('--- GERAÇÃO EM LOTE: FEVEREIRO 2026 ---');

    // 1. Pegar todos os alunos ativos
    const { data: alunos } = await supabase.from('alunos').select('*').eq('user_id', ROBERTO_ID).eq('ativo', true);
    if (!alunos) return console.log('Nenhum aluno ativo.');

    // 2. Pegar mensalidades que já existem
    const { data: existing } = await supabase.from('pagamentos_mensais').select('aluno_id').eq('mes', 2).eq('ano', 2026);
    const existingIds = new Set(existing?.map(e => e.aluno_id));

    const toCreate = alunos.filter(a => !existingIds.has(a.id));
    console.log(`Gerando para ${toCreate.length} alunos faltantes...`);

    for (const aluno of toCreate) {
        const totalValor = Number(aluno.valor_mensalidade || 0) + Number(aluno.valor_letalidade || 0);
        const diaVenc = aluno.dia_vencimento || 10;
        const dataVenc = `2026-02-${diaVenc.toString().padStart(2, '0')}`;

        // Inserir Pagamento Mensal
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
            console.error(`Erro Aluno ${aluno.nome_completo}:`, errP.message);
            continue;
        }

        // Inserir Lançamento Financeiro (para o Fluxo de Caixa)
        const { error: errL } = await supabase.from('lancamentos_financeiros').insert({
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
            referencia_id: `mensalidade-${pag.id}-2026-02`, // Compatível com lógica do sistema
            van_id: aluno.van_id
        });

        if (errL) console.error(`Erro Lançamento ${aluno.nome_completo}:`, errL.message);
    }

    console.log('Geração concluída.');
}

generateFebruaryBulk();
