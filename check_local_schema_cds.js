const { createClient } = require('@supabase/supabase-js');

// Usando as mesmas chaves do supabaseClient.ts da aplicação
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkLocalSchema() {
    console.log("--- VERIFICANDO COLUNAS DA TABELA user_profiles (LOCAL) ---");
    // Nota: O usuário informou que as aplicações apontam para a mesma base central por enquanto, 
    // mas cada uma pode ter extensões ou tabelas específicas se for local.
    // No caso do marketplace, as credenciais no arquivo são as mesmas da central.

    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);

    if (error) {
        console.error("Erro ao buscar dados:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Colunas existentes:", Object.keys(data[0]));
    } else {
        console.log("Tabela vazia.");
    }
}

checkLocalSchema();
