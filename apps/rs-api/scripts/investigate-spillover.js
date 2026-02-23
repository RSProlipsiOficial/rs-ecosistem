const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function investigateSpillover() {
    console.log('\n🔍 INVESTIGANDO SPILLOVER INCORRETO\n');
    console.log('='.repeat(70));

    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';
    const emanuelPatrocinadorId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    // 1. Buscar dados do Emanuel
    const { data: emanuel } = await supabase
        .from('consultores')
        .select('*')
        .eq('id', emanuelId)
        .single();

    console.log('📋 EMANUEL:');
    console.log('  ID:', emanuel.id);
    console.log('  Nome:', emanuel.nome);
    console.log('  Username:', emanuel.username);
    console.log('  Patrocinador ID:', emanuel.patrocinador_id);
    console.log('');

    // 2. Buscar quem é o patrocinador do Emanuel
    const { data: patrocinador } = await supabase
        .from('consultores')
        .select('*')
        .eq('id', emanuelPatrocinadorId)
        .single();

    console.log('📋 PATROCINADOR DO EMANUEL:');
    console.log('  ID:', patrocinador.id);
    console.log('  Nome:', patrocinador.nome);
    console.log('  Email:', patrocinador.email);
    console.log('  Username:', patrocinador.username);
    console.log('');

    // 3. Buscar "Rota Fácil Oficial"
    const { data: rotaFacil } = await supabase
        .from('consultores')
        .select('*')
        .ilike('nome', '%rota%facil%')
        .single();

    console.log('📋 ROTA FÁCIL OFICIAL:');
    console.log('  ID:', rotaFacil.id);
    console.log('  Nome:', rotaFacil.nome);
    console.log('  Email:', rotaFacil.email);
    console.log('  Username:', rotaFacil.username);
    console.log('  Patrocinador ID:', rotaFacil.patrocinador_id);
    console.log('  PIN:', rotaFacil.pin_atual);
    console.log('');

    // 4. Verificar se Rota Fácil tem Emanuel como patrocinador (ERRO!)
    if (rotaFacil.patrocinador_id === emanuelId || rotaFacil.patrocinador_id === emanuel.username) {
        console.log('⚠️  PROBLEMA ENCONTRADO:');
        console.log('  Rota Fácil TEM Emanuel como patrocinador!');
        console.log('  Isso está ERRADO (Presidente não pode ter consultor como patrocinador)');
    } else {
        console.log('✅ Rota Fácil NÃO tem Emanuel como patrocinador direto.');
        console.log('   Patrocinador do Rota Fácil:', rotaFacil.patrocinador_id);
    }
    console.log('');

    // 5. Buscar diretos REAIS do Emanuel (pessoas que TÊM ele como patrocinador)
    const { data: diretosReais } = await supabase
        .from('consultores')
        .select('id, nome, email, patrocinador_id')
        .or(`patrocinador_id.eq.${emanuelId},patrocinador_id.eq.${emanuel.username || 'null'}`);

    console.log('📊 DIRETOS REAIS DO EMANUEL (patrocinador_id = Emanuel):');
    console.log(`  Total: ${diretosReais?.length || 0}`);
    if (diretosReais && diretosReais.length > 0) {
        diretosReais.forEach((d, i) => {
            console.log(`  ${i + 1}. ${d.nome} (${d.email})`);
        });
    }
    console.log('');

    // 6. Análise da lógica de spillover
    console.log('🔍 ANÁLISE DA LÓGICA ATUAL:');
    console.log('  O algoritmo em matrix.routes.ts:');
    console.log('  1. Busca TODOS os consultores da tabela');
    console.log('  2. Para cada um, tenta encontrar o patrocinador na árvore');
    console.log('  3. Se encontrar, adiciona como filho (ERRO!)');
    console.log('');
    console.log('  ❌ PROBLEMA:');
    console.log('  Isso inclui consultores que NÃO fazem parte da linha do Emanuel');
    console.log('  incluindo uplines (like Rota Fácil) que acabam sendo encaixados');
    console.log('  erroneamente se houver qualquer match de username/ID.');
    console.log('');

    console.log('💡 SOLUÇÃO:');
    console.log('  Filtrar apenas consultores que:');
    console.log('  1. TÊM Emanuel (ou seus descendentes) como patrocinador');
    console.log('  2. OU derramaram para Emanuel por spillover REAL (ciclo do pai)');
    console.log('  3. NÃO incluir uplines nem crosslines');
    console.log('');

    console.log('='.repeat(70));
}

investigateSpillover()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
