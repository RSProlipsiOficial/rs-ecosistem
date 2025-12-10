-- Habilitar RLS nas tabelas que precisam
ALTER TABLE public.ganhos_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_mensais ENABLE ROW LEVEL SECURITY;