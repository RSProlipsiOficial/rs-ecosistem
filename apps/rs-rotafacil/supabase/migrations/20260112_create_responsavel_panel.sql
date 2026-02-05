-- Cria tabela de vínculo entre usuários (responsáveis) e alunos
CREATE TABLE IF NOT EXISTS public.responsavel_alunos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    responsavel_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(responsavel_id, aluno_id)
);

-- Ativa RLS
ALTER TABLE public.responsavel_alunos ENABLE ROW LEVEL SECURITY;

-- Políticas para responsavel_alunos
-- O próprio responsável pode ver seus vínculos
CREATE POLICY "Responsáveis podem ver seus vínculos" ON public.responsavel_alunos
    FOR SELECT USING (auth.uid() = responsavel_id);

-- Admins/Owners podem ver tudo (ajustar conforme necessidade, aqui simplificado para owner do aluno)
CREATE POLICY "Owners podem ver vínculos dos seus alunos" ON public.responsavel_alunos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.alunos a
            WHERE a.id = responsavel_alunos.aluno_id
            AND a.van_id IN (
                SELECT id FROM public.vans WHERE user_id = auth.uid()
            )
        )
    );

-- INDEX para performance
CREATE INDEX IF NOT EXISTS idx_responsavel_alunos_responsavel ON public.responsavel_alunos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_responsavel_alunos_aluno ON public.responsavel_alunos(aluno_id);


-- ==============================================================================
-- POLÍTICAS DE ACESSO PARA RESPONSAIS (EM OUTRAS TABELAS)
-- ==============================================================================

-- 1. Tabela ALUNOS
-- Responsável pode ver dados dos alunos vinculados a ele
CREATE POLICY "Responsável vê seus alunos" ON public.alunos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.responsavel_alunos ra
            WHERE ra.aluno_id = alunos.id
            AND ra.responsavel_id = auth.uid()
        )
    );

-- 2. Tabela FINANCEIRO_ENTRADAS (Mensalidades)
-- Responsável pode ver mensalidades dos seus alunos
-- Assumindo que a tabela se chama 'pagamentos_mensais' ou 'financeiro_entradas' (verificando schema, parece ser 'pagamentos_mensais' pelo types.ts ou 'financeiro_entradas' não estava no dump parcial, mas vi 'pagamentos_mensais' no dump)
-- Vamos usar 'pagamentos_mensais' que vi no types.ts

ALTER TABLE public.pagamentos_mensais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responsável vê mensalidades dos filhos" ON public.pagamentos_mensais
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.responsavel_alunos ra
            WHERE ra.aluno_id = pagamentos_mensais.aluno_id
            AND ra.responsavel_id = auth.uid()
        )
    );

-- 3. Tabela CONTRATOS
-- Preciso confirmar se existe tabela 'contratos' ou se é gerado dinamicamente.
-- No dump não vi tabela 'contratos', mas vi 'contratos' no user request. 
-- O código do ContractModal sugere que o contrato é gerado on-the-fly ou salvo em algum lugar?
-- Ah, `save_aluno_signature` salva a assinatura visual.
-- Se não houver tabela de contratos persistidos (apenas template), o responsável vê o template renderizado.
-- Se houver tabela de 'termos de aceite' ou 'contratos_assinados', adicionar politica.
-- Por enquanto, sem tabela de contratos explicita no dump, foco no acesso ao ALUNO que permite gerar o contrato.

-- 4. Tabela PRESENCAS_DIARIAS (Comentado até verificar existência)
-- ALTER TABLE public.presencas_diarias ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Responsável vê presenças dos filhos" ON public.presencas_diarias
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM public.responsavel_alunos ra
--             WHERE ra.aluno_id = presencas_diarias.aluno_id
--             AND ra.responsavel_id = auth.uid()
--         )
--     );



-- ==============================================================================
-- FUNÇÃO PARA VINCULAR AUTOMATICAMENTE PELO CPF/EMAIL NO CADASTRO DO USUARIO
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.auto_link_responsavel()
RETURNS TRIGGER AS $$
DECLARE
    found_aluno_id UUID;
    user_cpf TEXT;
    user_email TEXT;
BEGIN
    -- Tenta pegar CPF e Email dos metadados ou profile
    -- Assumindo que no signup o user_metadata vem com 'cpf' ou 'email'
    user_email := NEW.email;
    user_cpf := NEW.raw_user_meta_data->>'cpf';

    -- Se tiver CPF, busca alunos onde (cpf_responsavel = user_cpf OR whatsapp_responsavel = user_phone etc)
    -- O schema de alunos tem 'whatsapp_responsavel', 'nome_responsavel'. 
    -- Adicionamos 'cpf' e 'email' na tabela alunos recentemente? 
    -- No dump atual de 'alunos', vejo 'whatsapp_responsavel'. E no insert do `PublicCadastro.tsx` vi que passamos `cpf` e `email` mas nao sei se columns existem.
    -- Se as colunas não existirem, vamos criar ou usar logica de match por nome/telefone (arriscado).
    -- Vamos assumir que criamos as colunas cpf e email na tabela alunos para match seguro.
    
    -- Se user_type for 'responsavel', faz a busca
    IF (NEW.raw_user_meta_data->>'user_type' = 'responsavel') THEN
        
        -- Busca por CPF (se a coluna existir)
        IF user_cpf IS NOT NULL THEN
            FOR found_aluno_id IN 
                SELECT id FROM public.alunos WHERE cpf = user_cpf -- Supõe coluna cpf
            LOOP
                INSERT INTO public.responsavel_alunos (responsavel_id, aluno_id)
                VALUES (NEW.id, found_aluno_id)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;

        -- Busca por Email (se coluna existir)
        IF user_email IS NOT NULL THEN
             FOR found_aluno_id IN 
                SELECT id FROM public.alunos WHERE email = user_email -- Supõe coluna email
            LOOP
                INSERT INTO public.responsavel_alunos (responsavel_id, aluno_id)
                VALUES (NEW.id, found_aluno_id)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para execucao no cadastro
DROP TRIGGER IF EXISTS on_auth_user_created_link_responsavel ON auth.users;
CREATE TRIGGER on_auth_user_created_link_responsavel
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_link_responsavel();

-- Adicionar colunas CPF e Email na tabela alunos se não existirem (para o match funcionar)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'cpf') THEN
        ALTER TABLE public.alunos ADD COLUMN cpf TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'email') THEN
        ALTER TABLE public.alunos ADD COLUMN email TEXT;
    END IF;
END $$;
