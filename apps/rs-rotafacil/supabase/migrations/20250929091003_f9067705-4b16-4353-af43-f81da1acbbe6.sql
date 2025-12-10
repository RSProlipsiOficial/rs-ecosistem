-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.carreira_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carreira_premios_volume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carreira_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_ativacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_blocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_ciclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_fila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_top_fundos_mes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_top_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_top_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_top_rank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigme_top_ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_tx ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;

-- Criar políticas para essas tabelas
CREATE POLICY "Admin access only" ON public.carreira_pagamentos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.carreira_premios_volume FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.carreira_progresso FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_ativacoes FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_blocos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_ciclos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_config FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_fila FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_pagamentos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_slots FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_top_fundos_mes FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_top_periodos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_top_pool FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_top_rank FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.sigme_top_ranking FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.subscription_plans FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.pedidos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.pedido_itens FOR ALL USING (is_admin());

-- Políticas específicas para dados dos usuários
CREATE POLICY "Users can view their own data" ON public.user_ai_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own data" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own data" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view their own data" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own data" ON public.wallet_tx FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all user data" ON public.user_ai_credits FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage all user data" ON public.user_subscriptions FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage all user data" ON public.usuarios FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage all user data" ON public.wallets FOR ALL USING (is_admin());
CREATE POLICY "Admin can manage all user data" ON public.wallet_tx FOR ALL USING (is_admin());