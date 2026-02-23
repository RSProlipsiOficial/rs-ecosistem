-- ============================================================================
-- RS ECOSYSTEM - AUTO-CREATE WALLET PROFILE TRIGGER
-- Trigger para criar perfil na wallet assim que um consultor for cadastrado
-- ============================================================================

-- 1. Create the Function
CREATE OR REPLACE FUNCTION public.handle_new_consultor()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se já existe perfil (pra evitar erro de duplicidade se rodar em dados antigos)
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) THEN
        
        INSERT INTO public.user_profiles (
            user_id,
            nome_completo,
            email, -- Assumindo que user_profiles terá email, se não tiver, remover
            cpf,
            telefone,
            sponsor_id, -- Mapeia Patrocinador
            mmn_id,     -- Mapeia Username como MMN ID
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.nome,
            NEW.email,
            NEW.cpf,
            NEW.whatsapp, -- Mapeia WhatsApp como telefone principal
            (SELECT username FROM public.consultores WHERE id = NEW.patrocinador_uid), -- Busca username do patrocinador pelo ID (assumindo que patrocinador_uid referencia id)
            NEW.username,
            NOW(),
            NOW()
        );
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_consultor_created ON public.consultores;

CREATE TRIGGER on_consultor_created
AFTER INSERT ON public.consultores
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_consultor();

-- 3. (Optional) Backfill for existing users who might be missing profile
-- Uncomment to run manually if needed
/*
INSERT INTO public.user_profiles (user_id, nome_completo, email, cpf, telefone, mmn_id, created_at, updated_at)
SELECT 
    uid, 
    nome, 
    email, 
    cpf, 
    whatsapp, 
    username, 
    created_at, 
    NOW()
FROM public.consultores c
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.user_id = c.uid);
*/
