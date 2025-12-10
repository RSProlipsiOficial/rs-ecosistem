-- Adicionar campo para defeitos da van na tabela checklists_motorista
ALTER TABLE public.checklists_motorista 
ADD COLUMN defeitos_van TEXT;