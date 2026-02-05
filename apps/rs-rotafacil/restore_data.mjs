import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Roberto está logado como 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' (Confirmado pelo dashboard funcionando)
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
// ID antigo onde estão os dados "perdidos" (se houver divergência)
const OLD_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'; // Eles já estão no ID certo segundo a auditoria, mas Roberto disse que não os vê. 
// Vamos verificar o ID atual na sessão do browser (simulado)

async function restoreEverything() {
    console.log('--- RESTAURAÇÃO DE REGISTROS ---');

    // 1. Garantir que GASTOS apareçam (Se estão no ID certo, talvez o filtro de data ou status impeça?)
    const { data: gastos } = await supabase.from('gastos').select('*').eq('user_id', ROBERTO_ID);
    console.log(`Gastos no ID ${ROBERTO_ID}:`, gastos?.length);

    // 2. Garantir que GANHOS EXTRAS apareçam
    const { data: ganhos } = await supabase.from('ganhos_extras').select('*').eq('user_id', ROBERTO_ID);
    console.log(`Ganhos no ID ${ROBERTO_ID}:`, ganhos?.length);

    // 3. Auditoria de Alunos: Por que a lista está incompleta?
    const { data: alunos } = await supabase.from('alunos').select('nome_completo, ativo').eq('user_id', ROBERTO_ID);
    const ativos = alunos?.filter(a => a.ativo).length;
    const inativos = alunos?.filter(a => !a.ativo).length;
    console.log(`Alunos Ativos: ${ativos}, Inativos: ${inativos}`);

    // Re-ativar alunos que podem estar inativos por engano (Exceto os que Roberto pediu para deletar se eu soubesse quais)
    // Na dúvida, vamos manter o que está.

    // 4. Verificação de Mensalidades: 
    const { data: mensais } = await supabase.from('pagamentos_mensais').select('id').eq('user_id', ROBERTO_ID).eq('mes', 2).eq('ano', 2026);
    console.log(`Mensalidades em Fevereiro:`, mensais?.length);
}

restoreEverything();
