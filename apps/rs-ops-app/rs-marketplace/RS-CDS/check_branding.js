import { createClient } from '@supabase/supabase-js';

const url = 'https://rptkhrboejbwexseikuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(url, key);

async function checkBranding() {
    console.log('\n--- Auditoria de Branding: rsprolipsi ---');

    // Perfil Visual
    const { data: pData } = await supabase
        .from('minisite_profiles')
        .select('*')
        .eq('consultant_id', 'rsprolipsi')
        .maybeSingle();

    console.log('--- MiniSite Profile ---');
    console.log('ID:', pData?.id);
    console.log('Name:', pData?.name);
    console.log('Avatar URL:', pData?.avatar_url);
    console.log('Wallet Balance:', pData?.wallet_balance);
    console.log('Full JSON:', JSON.stringify(pData, null, 2));

    // Consultor Master
    const { data: cData } = await supabase
        .from('consultores')
        .select('*')
        .eq('username', 'rsprolipsi')
        .maybeSingle();

    console.log('\n--- Consultor Real ---');
    console.log('Nome:', cData?.nome);
    console.log('CPF/CNPJ:', cData?.cpf);
    console.log('Email:', cData?.email);
    console.log('Logo:', cData?.logo_url || 'N/A');
    console.log('Razão Social:', cData?.razao_social || 'N/A');
    console.log('Nome Fantasia:', cData?.nome_fantasia || 'N/A');
    console.log('Full JSON:', JSON.stringify(cData, null, 2));
}

checkBranding();
