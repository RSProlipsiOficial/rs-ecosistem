-- Habilitar RLS nas tabelas reais (excluindo views)
ALTER TABLE public.afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_managed_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carreira_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carreira_premios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissao_faixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_produto_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ec_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas de segurança para tabelas administrativas
CREATE POLICY "Admin access only" ON public.ai_managed_tables FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.app_settings FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.audit_events FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.carreira_pins FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.carreira_premios FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.cms_media FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.cms_posts FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.comissao_faixas FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.feature_flags FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.leads FOR ALL USING (is_admin());