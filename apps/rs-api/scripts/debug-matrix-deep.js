const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debugMatrix() {
    console.log('\n🔬 DEEP DEBUG DA MATRIZ\n');
    console.log('='.repeat(70));

    // 1. Buscar Emanuel
    const { data: emanuel } = await supabase
        .from('consultores')
        .select('id, nome, email, username, pin_atual, status, created_at, patrocinador_id, whatsapp, user_id')
        .eq('id', '179d44cd-3351-4cdb-ad1e-78ac274108c2')
        .single();

    if (!emanuel) {
        console.log('❌ Emanuel não encontrado!');
        return;
    }

    console.log('📋 EMANUEL (ROOT):');
    console.log('  ID:', emanuel.id);
    console.log('  user_id:', emanuel.user_id);
    console.log('  Nome:', emanuel.nome);
    console.log('  Username:', emanuel.username);
    console.log('  Patrocinador ID:', emanuel.patrocinador_id);
    console.log('  Created At:', emanuel.created_at);
    console.log('');

    // 2. Buscar Rota Fácil
    const { data: rotaFacil } = await supabase
        .from('consultores')
        .select('id, nome, email, username, pin_atual, status, created_at, patrocinador_id, user_id')
        .ilike('nome', '%rota%f%cil%')
        .single();

    console.log('📋 ROTA FÁCIL:');
    if (rotaFacil) {
        console.log('  ID:', rotaFacil.id);
        console.log('  user_id:', rotaFacil.user_id);
        console.log('  Nome:', rotaFacil.nome);
        console.log('  Username:', rotaFacil.username);
        console.log('  Patrocinador ID:', rotaFacil.patrocinador_id);
        console.log('  Created At:', rotaFacil.created_at);
    } else {
        console.log('  ❌ Não encontrado!');
    }
    console.log('');

    // 3. Comparar datas
    if (emanuel && rotaFacil) {
        const emanuelDate = new Date(emanuel.created_at);
        const rotaDate = new Date(rotaFacil.created_at);
        console.log('📊 COMPARAÇÃO DE DATAS:');
        console.log('  Emanuel created_at:', emanuel.created_at);
        console.log('  Rota Fácil created_at:', rotaFacil.created_at);
        console.log('  Rota Fácil é mais antiga?', rotaDate < emanuelDate ? 'SIM ✅ (será filtrada)' : 'NÃO ❌ (NÃO será filtrada pela data!)');
        console.log('');

        // 4. Verificar cadeia upline
        console.log('🔗 CADEIA UPLINE DO EMANUEL:');
        console.log('  Emanuel.patrocinador_id =', emanuel.patrocinador_id);
        console.log('  Rota Fácil.id =', rotaFacil.id);
        console.log('  Match?', emanuel.patrocinador_id === rotaFacil.id ? 'SIM ✅' : 'NÃO ❌');
        console.log('  Rota Fácil.username =', rotaFacil.username);
        console.log('  Match por username?', emanuel.patrocinador_id === rotaFacil.username ? 'SIM ✅' : 'NÃO ❌');
        console.log('');
    }

    // 5. Simular a query da API
    console.log('🔍 SIMULANDO QUERY DA API:');
    const { data: filteredConsultants, error: queryErr } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id, created_at')
        .gte('created_at', emanuel.created_at)
        .order('created_at', { ascending: true });

    console.log('  Total consultores retornados (created_at >= Emanuel):', filteredConsultants?.length || 0);

    // Verificar se Rota Fácil está na lista filtrada
    const rotaInFiltered = filteredConsultants?.find(c => c.nome?.toLowerCase().includes('rota'));
    if (rotaInFiltered) {
        console.log('  ⚠️  ROTA FÁCIL ESTÁ NA LISTA FILTRADA! (BUG!)');
        console.log('    ID:', rotaInFiltered.id);
        console.log('    Nome:', rotaInFiltered.nome);
        console.log('    Created At:', rotaInFiltered.created_at);
    } else {
        console.log('  ✅ Rota Fácil NÃO está na lista filtrada (correto)');
    }
    console.log('');

    // 6. Buscar diretos REAIS do Emanuel
    const { data: diretos } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id')
        .or(`patrocinador_id.eq.${emanuel.id},patrocinador_id.eq.${emanuel.username || 'null'}`);

    console.log('👶 DIRETOS REAIS DO EMANUEL (patrocinador_id = Emanuel):');
    console.log('  Total:', diretos?.length || 0);
    diretos?.forEach((d, i) => {
        const flag = d.nome?.toLowerCase().includes('rota') ? ' ⚠️ UPLINE!' : '';
        console.log(`  ${i + 1}. ${d.nome} (patrocinador_id: ${d.patrocinador_id})${flag}`);
    });

    console.log('');
    console.log('='.repeat(70));
}

debugMatrix()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
