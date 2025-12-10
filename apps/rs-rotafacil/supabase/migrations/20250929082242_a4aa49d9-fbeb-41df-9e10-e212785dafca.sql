-- Adicionar política para admins poderem gerenciar créditos de IA de todos os usuários
CREATE POLICY "Admins podem gerenciar todos os créditos de IA" 
ON public.user_ai_credits 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());