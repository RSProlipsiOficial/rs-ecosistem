-- Criar políticas apenas para tabelas que não possuem
CREATE POLICY "Admin access only" ON public.assistants FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.drop_progress FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_categorias FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_clientes FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_enderecos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_envios FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_estoque FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_pagamentos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_pedido_itens FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_pedidos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_produto_categorias FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.ec_produtos FOR ALL USING (is_admin());
CREATE POLICY "Admin access only" ON public.conversations FOR ALL USING (is_admin());

-- Políticas específicas para afiliados
CREATE POLICY "Afiliados podem ver próprios dados" ON public.afiliados FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "Afiliados podem atualizar próprios dados" ON public.afiliados FOR UPDATE USING (usuario_id = auth.uid());
CREATE POLICY "Admin pode gerenciar afiliados" ON public.afiliados FOR ALL USING (is_admin());