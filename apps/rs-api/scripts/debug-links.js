const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function investigateLinks() {
    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';
    const rotaFacilId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    console.log('\n🔬 INVESTIGANDO VÍNCULOS\n');
    console.log('='.repeat(70));

    // 1. Quem tem patrocinador_id = emanuelId?
    const { data: byId } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .eq('patrocinador_id', emanuelId);

    console.log(`\n1️⃣ Consultores com patrocinador_id = ${emanuelId} (UUID Emanuel):`);
    console.log('  Total:', byId?.length || 0);
    byId?.slice(0, 5).forEach((c, i) => console.log(`  ${i + 1}. ${c.nome}`));

    // 2. Existem outros campos de vínculo? Verificar tabela
    const { data: sample } = await supabase
        .from('consultores')
        .select('*')
        .limit(1);

    if (sample?.length > 0) {
        console.log('\n2️⃣ COLUNAS DA TABELA consultores:');
        Object.keys(sample[0]).forEach(key => {
            console.log(`  - ${key}: ${typeof sample[0][key]} (${sample[0][key] === null ? 'NULL' : 'has value'})`);
        });
    }

    // 3. Quem tem patrocinador_id = Rota Fácil?
    const { data: byRota } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .eq('patrocinador_id', rotaFacilId);

    console.log(`\n3️⃣ Consultores com patrocinador_id = ${rotaFacilId} (UUID Rota Fácil):`);
    console.log('  Total:', byRota?.length || 0);
    byRota?.slice(0, 10).forEach((c, i) => console.log(`  ${i + 1}. ${c.nome} (ID: ${c.id.substring(0, 8)}...)`));

    // 4. Verificar se "rsprolipsi" é usado como patrocinador_id (string, não UUID)
    const { data: byUsername } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .eq('patrocinador_id', 'rsprolipsi');

    console.log(`\n4️⃣ Consultores com patrocinador_id = "rsprolipsi" (string/username):`);
    console.log('  Total:', byUsername?.length || 0);
    byUsername?.slice(0, 10).forEach((c, i) => console.log(`  ${i + 1}. ${c.nome} (ID: ${c.id.substring(0, 8)}...)`));

    // 5. Verificar se Emanuel ou "179d44cd" é usado como string
    const { data: byEmanuelStr } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .ilike('patrocinador_id', '%179d44cd%');

    console.log(`\n5️⃣ Consultores com patrocinador_id contendo "179d44cd":`);
    console.log('  Total:', byEmanuelStr?.length || 0);
    byEmanuelStr?.slice(0, 5).forEach((c, i) => console.log(`  ${i + 1}. ${c.nome}`));

    // 6. Verificar Rota Fácil completo
    const { data: rotaData } = await supabase
        .from('consultores')
        .select('*')
        .eq('id', rotaFacilId)
        .single();

    console.log('\n6️⃣ ROTA FÁCIL COMPLETO:');
    if (rotaData) {
        console.log('  ID:', rotaData.id);
        console.log('  Nome:', rotaData.nome);
        console.log('  Username:', rotaData.username);
        console.log('  Email:', rotaData.email);
        console.log('  Patrocinador ID:', rotaData.patrocinador_id);
        console.log('  Pin:', rotaData.pin_atual);
        console.log('  Status:', rotaData.status);
        console.log('  Created At:', rotaData.created_at);
        console.log('  user_id:', rotaData.user_id);
    }

    // 7. Quem aparece na árvore atualmente? Buscar os 6 primeiros como a API faz
    const { data: allConsultants } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id, created_at')
        .gte('created_at', '2024-01-01T10:00:00')
        .order('created_at', { ascending: true });

    console.log(`\n7️⃣ SIMULAÇÃO: Consultores com patrocinador_id = emanuelId OU rotaFacilId na lista filtrada:`);
    const relevantOnes = allConsultants?.filter(c =>
        c.patrocinador_id === emanuelId ||
        c.patrocinador_id === rotaFacilId ||
        c.patrocinador_id === 'rsprolipsi'
    );
    console.log('  Total relevantes:', relevantOnes?.length || 0);
    relevantOnes?.slice(0, 15).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.nome} | patrocinador_id: ${c.patrocinador_id}`);
    });

    console.log('\n' + '='.repeat(70));
}

investigateLinks()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
