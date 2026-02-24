-- ================================================================
-- FIX: Visibilidade de Comunicados na Área da Família
-- Data: 14/01/2026
-- ================================================================

-- 1. Garantir que todos os comunicados atuais estejam marcados como Ativos
UPDATE public.comunicados SET ativo = true WHERE ativo IS NULL;

-- 2. Atualizar a política de RLS para ser mais robusta
-- Agora permite que o responsável veja comunicados se ele tiver qualquer aluno 
-- vinculado àquele dono de van (owner_id).
DROP POLICY IF EXISTS "Responsaveis can view their owner's comunicados" ON public.comunicados;

CREATE POLICY "Responsaveis can view their owner's comunicados"
    ON public.comunicados
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.responsavel_alunos ra
            JOIN public.alunos a ON ra.aluno_id = a.id
            WHERE ra.responsavel_id = auth.uid()
            AND a.user_id = comunicados.owner_id
        )
        OR 
        owner_id IN (
            SELECT sponsor_id 
            FROM public.user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Sincronizar sponsor_id para perfis existentes que ainda não têm
-- Isso ajuda a manter a integridade para outras funções que dependem do sponsor_id
UPDATE public.user_profiles up
SET sponsor_id = (
    SELECT a.user_id 
    FROM public.responsavel_alunos ra
    JOIN public.alunos a ON ra.aluno_id = a.id
    WHERE ra.responsavel_id = up.user_id
    LIMIT 1
)
WHERE up.sponsor_id IS NULL 
AND EXISTS (
    SELECT 1 FROM public.responsavel_alunos ra WHERE ra.responsavel_id = up.user_id
);

-- ================================================================
-- FIM DO SCRIPT
-- ================================================================
