const { createClient } = require('@supabase/supabase-js');

// Configurações
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifySyncLogic() {
    console.log("=== VERIFICAÇÃO MASTER SYNC ===");

    // ID de teste (Usar o ID do usuário oficial ou um conhecido)
    const testUserId = 'rsprolipsi';
    const testEmail = 'rsprolipsioficial@gmail.com';

    console.log(`Testando para User: ${testUserId} | Email: ${testEmail}`);

    // 1. Fetching Data
    console.log("\n1. Buscando dados nas tabelas...");

    // Consultores
    const { data: consultor } = await supabase.from('consultores')
        .select('*')
        .or(`email.eq.${testEmail},username.eq.${testUserId}`)
        .maybeSingle();
    console.log(`- Consultores: ${consultor ? '✅ Encontrado' : '❌ Não encontrado'}`);
    if (consultor) console.log(`  > Nome: ${consultor.nome}, CPF: ${consultor.cpf}`);

    // User Profiles
    const { data: userProfile } = await supabase.from('user_profiles')
        .select('*')
        .or(`email.eq.${testEmail},user_id.eq.${testUserId}`) // Adjust if user_id match fails
        .maybeSingle();
    console.log(`- User Profiles: ${userProfile ? '✅ Encontrado' : '❌ Não encontrado'}`);
    if (userProfile) console.log(`  > Nome: ${userProfile.name || userProfile.nome_completo}, Tel: ${userProfile.telefone}`);

    // Minisite Profiles
    const { data: minisite } = await supabase.from('minisite_profiles')
        .select('*')
        .or(`consultant_id.eq.${testUserId},email.eq.${testEmail}`)
        .maybeSingle();
    console.log(`- Minisite Profiles: ${minisite ? '✅ Encontrado' : '❌ Não encontrado'}`);

    // 2. Consolidation Logic
    console.log("\n2. Consolidando Dados (Lógica do Sync)...");

    const masterData = {
        name: minisite?.name || consultor?.nome || userProfile?.nome_completo || 'N/A',
        email: minisite?.email || consultor?.email || userProfile?.email || 'N/A',
        phone: minisite?.phone || consultor?.whatsapp || consultor?.telefone || userProfile?.telefone || 'N/A',
        cpf: minisite?.cpf || consultor?.cpf || userProfile?.cpf || 'N/A',
        address: minisite?.address_street || consultor?.endereco || userProfile?.endereco || 'N/A'
    };

    console.log("DADOS CONSOLIDADOS (O que será salvo):");
    console.log(masterData);

    console.log("\n=== FIM DA VERIFICAÇÃO ===");
}

verifySyncLogic();
