-- Corrigir problemas críticos de segurança apenas nas tabelas existentes
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para essas tabelas
CREATE POLICY "Users can manage their own data" ON public.pagamentos_mensais FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON public.presencas_diarias FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON public.vans FOR ALL USING (auth.uid() = user_id);

-- Políticas para admin
CREATE POLICY "Admin can manage all" ON public.pagamentos_mensais FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage all" ON public.presencas_diarias FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage all" ON public.vans FOR ALL USING (is_admin());