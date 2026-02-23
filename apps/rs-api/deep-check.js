const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepCheck() {
    try {
        // 1. Verificar se Matheus está em admin_emails
        const { data: admins } = await supabase.from('admin_emails').select('email');
        console.log('Admin Emails:', admins.map(a => a.email));

        // 2. Verificar se o e-mail do Matheus (do RS) está em admin_emails
        const matheusEmail = 'matheusdorneles2804@gmail.com';
        const isMatheusAdmin = admins.some(a => a.email.toLowerCase() === matheusEmail.toLowerCase());
        console.log('Matheus está em admin_emails?', isMatheusAdmin);

        // 3. Verificar patrocinadores dos usuários Rota Fácil
        const { data: routeUsers } = await supabase
            .from('usuarios')
            .select('patrocinador_id')
            .limit(10);

        console.log('Amostra de Patrocinadores (Rota Fácil):', routeUsers);

        // 4. Ver se algum patrocinador do Rota Fácil existe em Consultores
        const sampleSponsors = routeUsers.map(u => u.patrocinador_id).filter(id => id);
        if (sampleSponsors.length > 0) {
            const { data: linkedConsultants } = await supabase
                .from('consultores')
                .select('id, nome')
                .in('id', sampleSponsors);
            console.log('Patrocinadores da Rota que são Consultores RS:', linkedConsultants);
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

deepCheck();
