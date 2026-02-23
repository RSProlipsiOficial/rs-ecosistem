const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIntersection() {
    try {
        // 1. Pegar todos os Consultores
        const { data: consultants } = await supabase.from('consultores').select('user_id, email');
        const consEmails = new Set(consultants?.map(c => c.email?.toLowerCase()).filter(e => e));
        const consIds = new Set(consultants?.map(c => c.user_id).filter(id => id));

        // 2. Pegar todos os Perfis (Rota Fácil)
        const { data: profiles } = await supabase.from('user_profiles').select('user_id, email');
        const profEmails = new Set(profiles?.map(p => p.email?.toLowerCase()).filter(e => e));
        const profIds = new Set(profiles?.map(p => p.user_id).filter(id => id));

        // 3. Intersecção
        let emailIntersection = 0;
        consEmails.forEach(e => { if (profEmails.has(e)) emailIntersection++; });

        let idIntersection = 0;
        consIds.forEach(id => { if (profIds.has(id)) idIntersection++; });

        console.log('--- INTERSECÇÃO ---');
        console.log('Total Consultores:', consultants?.length);
        console.log('Total Perfis Rota:', profiles?.length);
        console.log('Intersecção por Email (pessoas em ambos):', emailIntersection);
        console.log('Intersecção por UserID (pessoas em ambos):', idIntersection);

        // União Real (Pessoas Únicas)
        // Se considerarmos o maior entre email ou ID como intersecção
        const intersection = Math.max(emailIntersection, idIntersection);
        const uniqueTotal = (consultants?.length || 0) + (profiles?.length || 0) - intersection;

        console.log('Total Pessoas Únicas (Ecossistema):', uniqueTotal);
        console.log('-------------------');

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkIntersection();
