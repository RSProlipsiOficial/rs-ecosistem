-- Criar constraint única e inserir itens padrão
ALTER TABLE public.checklist_items_personalizados 
ADD CONSTRAINT unique_user_nome UNIQUE (user_id, nome);

-- Inserir itens padrão do checklist
INSERT INTO public.checklist_items_personalizados (user_id, nome, descricao, tipo, obrigatorio, ordem, ativo) VALUES
('00000000-0000-0000-0000-000000000000', 'Pneus', 'Verificar estado e calibragem', 'boolean', true, 1, true),
('00000000-0000-0000-0000-000000000000', 'Estepe', 'Verificar se está em boas condições', 'boolean', true, 2, true),
('00000000-0000-0000-0000-000000000000', 'Óleo do motor', 'Conferir nível e validade', 'boolean', true, 3, true),
('00000000-0000-0000-0000-000000000000', 'Água do radiador', 'Verificar nível', 'boolean', true, 4, true),
('00000000-0000-0000-0000-000000000000', 'Freios', 'Testar pedal, ruído, resposta', 'boolean', true, 5, true),
('00000000-0000-0000-0000-000000000000', 'Luzes externas', 'Verificar funcionamento completo (farol, seta, ré)', 'boolean', true, 6, true),
('00000000-0000-0000-0000-000000000000', 'Cinto de segurança', 'Conferir se todos funcionam', 'boolean', true, 7, true),
('00000000-0000-0000-0000-000000000000', 'Limpador de para-brisa', 'Testar funcionamento', 'boolean', true, 8, true),
('00000000-0000-0000-0000-000000000000', 'Vidros e retrovisores', 'Conferir se estão limpos e íntegros', 'boolean', true, 9, true),
('00000000-0000-0000-0000-000000000000', 'Itens soltos na van', 'Verificar se não há objetos soltos ou perigosos', 'boolean', true, 10, true),
('00000000-0000-0000-0000-000000000000', 'Portas e trancas', 'Testar se abrem/fecham corretamente', 'boolean', true, 11, true)

ON CONFLICT (user_id, nome) DO NOTHING;