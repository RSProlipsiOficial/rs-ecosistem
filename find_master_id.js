const { createClient } = require('@supabase/supabase-js');

const URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(URL, KEY);

async function findMasterUser() {
    console.log("--- BUSCANDO USUÁRIO MASTER ---");
    const { data: consultor, error } = await supabase
        .from('consultores')
        .select('id, user_id, email, nome')
        .eq('email', 'rsprolipsioficial@gmail.com')
        .maybeSingle();

    if (error) {
        console.error("Erro:", error);
        return;
    }

    if (consultor) {
        console.log("Encontrado em consultores:", consultor);
    } else {
        console.log("Não encontrado em consultores pelo email.");
    }
}

findMasterUser();
