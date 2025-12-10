-- Adicionar política para admins poderem gerenciar todas as assinaturas
CREATE POLICY "Admins podem gerenciar todas as assinaturas" 
ON public.user_subscriptions 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());