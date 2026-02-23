
import { createClient } from '@supabase/supabase-js';

// URL found in rs-consultor/.env
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
// ANON Key found in rs-consultor/.env (Simulates Frontend)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarAcessoAnonimo() {
    console.log("Teste de Acesso Anônimo à Tabela minisite_profiles...");

    // Tentar ler o perfil do emclaro (que sabemos que existe users_profiles, mas minisite_profiles é view)
    const { data, error } = await supabase
        .from('minisite_profiles')
        .select('*')
        .eq('email', 'emclaro@hotmail.com');

    if (error) {
        console.error("ERRO DE PERMISSÃO (RLS) CONFIRMADO:", error.message);
        console.log("Isso explica por que o Frontend não consegue ler os dados.");
    } else {
        console.log("Sucesso! Dados lidos:", data);
        if (data.length === 0) console.log("A leitura funcionou, mas não retornou linhas (Filtro incorreto?)");
    }
}

testarAcessoAnonimo();
