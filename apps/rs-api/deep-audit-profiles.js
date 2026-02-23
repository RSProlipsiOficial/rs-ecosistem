const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAudit() {
    try {
        console.log('--- AUDITORIA PROFUNDA ROTA FÁCIL ---');

        // 1. Buscar Aryn Rodrigues para ver seu perfil completo
        const { data: aryn } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('nome_completo', '%Aryn%');

        console.log('Perfil Aryn:', aryn);

        // 2. Analisar distribuição de campos que podem filtrar os "70 e poucos"
        // Vamos contar quantos têm empresa, slug, pix_key, ou mmn_active
        const { data: allProfs } = await supabase
            .from('user_profiles')
            .select('empresa, slug, pix_key, mmn_active, mmn_id');

        const withEmpresa = allProfs.filter(p => p.empresa).length;
        const withSlug = allProfs.filter(p => p.slug).length;
        const withPix = allProfs.filter(p => p.pix_key).length;
        const withMmnActive = allProfs.filter(p => p.mmn_active).length;
        const withMmnId = allProfs.filter(p => p.mmn_id).length;

        console.log('\nEstatísticas user_profiles (Total 379):');
        console.log('- Com empresa:', withEmpresa);
        console.log('- Com slug:', withSlug);
        console.log('- Com pix_key:', withPix);
        console.log('- Com MMN Active:', withMmnActive);
        console.log('- Com MMN ID:', withMmnId);

        // 3. Verificar duplicidades entre Consultores e Rota Fácil
        const { data: rs } = await supabase.from('consultores').select('user_id, email, cpf');
        const { data: rt } = await supabase.from('user_profiles').select('user_id, cpf');

        const rsCpfs = new Set(rs.map(c => c.cpf).filter(c => c));
        const duplicateCpfs = rt.filter(p => p.cpf && rsCpfs.has(p.cpf));

        console.log('\nDuplicidades por CPF (RS vs Rota):', duplicateCpfs.length);

    } catch (error) {
        console.error('Erro:', error);
    }
}

deepAudit();
