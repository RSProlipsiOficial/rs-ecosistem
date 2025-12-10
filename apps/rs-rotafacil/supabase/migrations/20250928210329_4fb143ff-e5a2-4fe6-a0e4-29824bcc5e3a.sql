-- Atualizar todos os alunos do user_id padrão para o user_id real do admin
UPDATE alunos 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000' AND ativo = true;

-- Atualizar também outras tabelas relacionadas que podem ter o mesmo problema
UPDATE vans 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE checklists_motorista 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE manutencoes_van 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE gastos 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE ganhos_extras 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE presencas_diarias 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE pagamentos_mensais 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE checklist_items_personalizados 
SET user_id = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
WHERE user_id = '00000000-0000-0000-0000-000000000000';