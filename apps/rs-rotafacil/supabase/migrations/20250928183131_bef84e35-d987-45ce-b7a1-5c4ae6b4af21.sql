-- Remover campo defeitos_van da tabela checklists_motorista já que agora tem aba separada
ALTER TABLE public.checklists_motorista DROP COLUMN IF EXISTS defeitos_van;