-- Habilitar RLS nas tabelas que realmente existem
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas de segurança
CREATE POLICY "Public read subscription plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admin manage subscription plans" ON public.subscription_plans FOR ALL USING (is_admin());

CREATE POLICY "Users manage own AI credits" ON public.user_ai_credits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin view all AI credits" ON public.user_ai_credits FOR SELECT USING (is_admin());

CREATE POLICY "Users manage own subscriptions" ON public.user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin view all subscriptions" ON public.user_subscriptions FOR SELECT USING (is_admin());

CREATE POLICY "Users manage own vans" ON public.vans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin view all vans" ON public.vans FOR SELECT USING (is_admin());