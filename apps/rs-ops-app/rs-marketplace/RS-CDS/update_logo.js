import { createClient } from '@supabase/supabase-js';

const url = 'https://rptkhrboejbwexseikuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(url, key);

async function updateOfficialLogo() {
    const OFFICIAL_LOGO = 'https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6';

    console.log('\n--- Atualizando Logo Oficial da RS Prólipsi ---');

    // Atualizar minisite_profiles
    const { data, error } = await supabase
        .from('minisite_profiles')
        .update({
            avatar_url: OFFICIAL_LOGO,
            updated_at: new Date().toISOString()
        })
        .eq('consultant_id', 'rsprolipsi')
        .select();

    if (error) {
        console.error('❌ Erro ao atualizar:', error);
    } else {
        console.log('✅ Logo atualizada com sucesso!');
        console.log('Resultado:', JSON.stringify(data, null, 2));
    }
}

updateOfficialLogo();
