
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupTables() {
    console.log("--- Iniciando Setup de Tabelas ---");

    // 1. Check/Create minisite_plans
    const { error: plansError } = await supabase.from('minisite_plans').select('*').limit(1);
    if (plansError && plansError.message.includes('relation "minisite_plans" does not exist')) {
        console.log("Tabela 'minisite_plans' não existe. Por favor, crie-a no SQL Editor do Supabase:");
        console.log(`
CREATE TABLE minisite_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT,
    features TEXT[],
    max_pages INTEGER,
    max_clients INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO minisite_plans (id, name, price, features, max_pages, max_clients) VALUES
('free', 'RS MiniSite Grátis', 'Grátis', ARRAY['1 MiniSite', 'Com marca RS Prólipsi'], 1, 0),
('start', 'RS MiniSite Start', 'R$ 5,90/mês', ARRAY['1 MiniSite', 'Recursos liberados', 'Sem marca RS Prólipsi'], 1, 0),
('pro', 'RS MiniSite Pro', 'R$ 19,90/mês', ARRAY['Até 10 MiniSites', 'Recursos liberados', 'Sem marcas'], 10, 0),
('agency', 'RS MiniSite Agente', 'R$ 125,00/mês', ARRAY['Acessos e Sub-contas', 'Gestão de clientes', 'Marca Própria'], 500, 100);
        `);
    } else {
        console.log("Tabela 'minisite_plans' já existe ou outro erro:", plansError?.message || "Sucesso");
    }

    // 2. Check/Create minisite_settings
    const { error: settingsError } = await supabase.from('minisite_setts').select('*').limit(1);
    if (settingsError && settingsError.message.includes('relation "minisite_setts" does not exist')) {
        console.log("Tabela 'minisite_setts' não existe. SQL para criar:");
        console.log(`
CREATE TABLE minisite_setts (
    id TEXT PRIMARY KEY,
    pix_key TEXT,
    support_email TEXT,
    platform_name TEXT,
    system_notice TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO minisite_setts (id, pix_key, support_email, platform_name) 
VALUES ('global', 'financeiro@rsprolipsi.com.br', 'suporte@rsprolipsi.com.br', 'RS MiniSite');
        `);
    } else {
        console.log("Tabela 'minisite_settings' já existe ou outro erro:", settingsError?.message || "Sucesso");
    }
}

setupTables();
