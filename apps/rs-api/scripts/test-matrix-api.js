const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testMatrixAPI() {
    console.log('\n🧪 TESTANDO API DA MATRIZ\n');
    console.log('='.repeat(70));

    const emanuelAuthUUID = '2ffcf3ae-fc73-4f22-8201-f5a2d43c0a6c';
    const emanuelConsultorId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';

    // Simular chamada da API
    const url = `http://localhost:4000/api/v1/sigma/matrix/tree/${emanuelAuthUUID}?depth=3`;

    console.log('📞 Chamando API:', url);
    console.log('');

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });

        const data = await response.json();

        if (!data.success) {
            console.error('❌ API retornou erro:', data.error || data.message);
            return;
        }

        console.log('✅ API respondeu com sucesso!');
        console.log('');

        const tree = data.tree;
        console.log('📊 NÓ RAIZ:');
        console.log('  ID:', tree.id);
        console.log('  Nome:', tree.name);
        console.log('  Username:', tree.username);
        console.log('  Email:', tree.email);
        console.log('  Nível:', tree.level);
        console.log('');

        console.log('👶 FILHOS (Primeiros 10):');
        const realChildren = tree.children.filter(c => !c.isEmpty);

        if (realChildren.length === 0) {
            console.log('  ⚠️  NENHUM filho real encontrado!');
        } else {
            realChildren.slice(0, 10).forEach((child, i) => {
                console.log(`  ${i + 1}. ${child.name} (${child.pin || 'sem pin'})`);

                // VERIFICAR SE É ROTA FÁCIL
                if (child.name.toLowerCase().includes('rota') && child.name.toLowerCase().includes('fácil')) {
                    console.log('     ⚠️  ROTA FÁCIL ENCONTRADO COMO FILHO! (ERRO!)');
                }
            });
        }

        console.log('');
        console.log(`  Total de filhos reais: ${realChildren.length}`);
        console.log(`  Total de slots vazios: ${tree.children.filter(c => c.isEmpty).length}`);

        // VERIFICAÇÃO ESPECÍFICA: Rota Fácil
        const rotaFacilChild = realChildren.find(c =>
            c.name.toLowerCase().includes('rota') && c.name.toLowerCase().includes('fácil')
        );

        console.log('');
        console.log('🔍 VERIFICAÇÃO CRÍTICA:');
        if (rotaFacilChild) {
            console.log('  ❌ ROTA FÁCIL ESTÁ COMO FILHO (BUG CONFIRMADO!)');
            console.log('  Dados do nó:');
            console.log('    ID:', rotaFacilChild.id);
            console.log('    Nome:', rotaFacilChild.name);
            console.log('    Email:', rotaFacilChild.email);
        } else {
            console.log('  ✅ Rota Fácil NÃO está nos filhos (CORRETO!)');
        }

    } catch (error) {
        console.error('❌ Erro ao chamar API:', error.message);
    }

    console.log('');
    console.log('='.repeat(70));
}

testMatrixAPI()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
