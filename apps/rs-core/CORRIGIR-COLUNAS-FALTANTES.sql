-- =====================================================
-- CORRIGIR COLUNAS FALTANTES NAS TABELAS
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. ADICIONAR COLUNA created_by em announcements
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- 2. VERIFICAR SE FOI ADICIONADA
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'announcements'
ORDER BY ordinal_position;

-- 3. ADICIONAR updated_at em todas as tabelas (se não existir)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE agenda_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE download_materials 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CRIAR TRIGGERS PARA ATUALIZAR updated_at
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at 
BEFORE UPDATE ON announcements 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agenda_items_updated_at ON agenda_items;
CREATE TRIGGER update_agenda_items_updated_at 
BEFORE UPDATE ON agenda_items 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
CREATE TRIGGER update_trainings_updated_at 
BEFORE UPDATE ON trainings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalogs_updated_at ON catalogs;
CREATE TRIGGER update_catalogs_updated_at 
BEFORE UPDATE ON catalogs 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_download_materials_updated_at ON download_materials;
CREATE TRIGGER update_download_materials_updated_at 
BEFORE UPDATE ON download_materials 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 6. AGORA TESTE O INSERT
INSERT INTO announcements (type, title, content, is_new, is_published, created_by)
VALUES ('info', 'Teste com created_by', 'Agora deve funcionar', true, true, 'admin');

-- 7. VERIFICAR
SELECT * FROM announcements ORDER BY created_at DESC LIMIT 1;
