
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- DOWNLOAD MATERIALS
ALTER TABLE IF EXISTS public.download_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read download_materials" ON public.download_materials;
CREATE POLICY "Public Read download_materials" ON public.download_materials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Insert download_materials" ON public.download_materials;
CREATE POLICY "Auth Insert download_materials" ON public.download_materials FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Auth Update download_materials" ON public.download_materials;
CREATE POLICY "Auth Update download_materials" ON public.download_materials FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Auth Delete download_materials" ON public.download_materials;
CREATE POLICY "Auth Delete download_materials" ON public.download_materials FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- CATALOGS
ALTER TABLE IF EXISTS public.catalogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read catalogs" ON public.catalogs;
CREATE POLICY "Public Read catalogs" ON public.catalogs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Insert catalogs" ON public.catalogs;
CREATE POLICY "Auth Insert catalogs" ON public.catalogs FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Auth Update catalogs" ON public.catalogs;
CREATE POLICY "Auth Update catalogs" ON public.catalogs FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Auth Delete catalogs" ON public.catalogs;
CREATE POLICY "Auth Delete catalogs" ON public.catalogs FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- TREINAMENTO MODULOS / AULAS (Just in case)
ALTER TABLE IF EXISTS public.treinamento_modulos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read treinamento_modulos" ON public.treinamento_modulos;
CREATE POLICY "Public Read treinamento_modulos" ON public.treinamento_modulos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth Write treinamento_modulos" ON public.treinamento_modulos;
CREATE POLICY "Auth Write treinamento_modulos" ON public.treinamento_modulos FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.treinamento_aulas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read treinamento_aulas" ON public.treinamento_aulas;
CREATE POLICY "Public Read treinamento_aulas" ON public.treinamento_aulas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth Write treinamento_aulas" ON public.treinamento_aulas;
CREATE POLICY "Auth Write treinamento_aulas" ON public.treinamento_aulas FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
`;

async function runFix() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🐘 Conectado ao Postgres. Aplicando Permissões RLS para Materiais...');
        await client.query(sql);
        console.log('✅ Permissões aplicadas com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao aplicar permissões:', err.message);
    } finally {
        await client.end();
    }
}

runFix();
