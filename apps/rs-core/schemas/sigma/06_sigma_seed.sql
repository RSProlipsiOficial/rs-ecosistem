-- Seed inicial baseado no Plano de Marketing RS Prólipsi
-- Inserir configuração base
INSERT INTO public.sigma_settings (
  cycle_value, cycle_payout_value, cycle_payout_percent,
  reentry_enabled, reentry_limit_per_month, spillover_mode,
  fidelity_source_percent, top_pool_percent, career_percent
) VALUES (360.00, 108.00, 30.00, true, 10, 'linha_ascendente', 1.25, 4.5, 6.39);

-- Profundidade L1–L6
INSERT INTO public.sigma_depth_levels (settings_id, level, percent, value_per_cycle, order_index)
SELECT (SELECT id FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) AS settings_id,
       d.level, d.percent, ( (SELECT cycle_value FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) * 0.0681 ) * (d.percent/100.0), d.order_index
FROM (VALUES (1,7,0),(2,8,1),(3,10,2),(4,15,3),(5,25,4),(6,35,5)) AS d(level,percent,order_index);

-- Fidelidade L1–L6 (replicando percentuais)
INSERT INTO public.sigma_fidelity_levels (settings_id, level, percent, value_per_cycle, order_index)
SELECT (SELECT id FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) AS settings_id,
       f.level, f.percent,
       ( (SELECT cycle_value FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) * ((SELECT fidelity_source_percent FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1)/100.0) ) * (f.percent/100.0),
       f.order_index
FROM (VALUES (1,7,0),(2,8,1),(3,10,2),(4,15,3),(5,25,4),(6,35,5)) AS f(level,percent,order_index);

-- Top SIGMA (1–10)
INSERT INTO public.sigma_top10_levels (settings_id, rank, percent_of_pool, pool_percent_base, order_index)
SELECT (SELECT id FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) AS settings_id,
       t.rank, t.percent,
       (SELECT top_pool_percent FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) AS pool_base,
       t.order_index
FROM (VALUES (1,2.0,0),(2,1.5,1),(3,1.2,2),(4,1.0,3),(5,0.8,4),(6,0.7,5),(7,0.6,6),(8,0.5,7),(9,0.4,8),(10,0.3,9)) AS t(rank,percent,order_index);

-- PINs de carreira (exemplo mínimo - ajuste conforme documento oficial)
INSERT INTO public.sigma_career_pins (settings_id, pin_code, display_name, cycles_required, min_lines, vmec_pattern, reward_value, order_index)
SELECT (SELECT id FROM public.sigma_settings ORDER BY updated_at DESC LIMIT 1) AS settings_id,
       p.pin_code, p.display_name, p.cycles_required, p.min_lines, p.vmec_pattern, p.reward_value, p.order_index
FROM (VALUES
  ('BRONZE','Bronze',10,1,'100%',  100.00,0),
  ('PRATA','Prata',  30,2,'60/40', 300.00,1),
  ('OURO','Ouro',    60,2,'60/40', 600.00,2),
  ('SAFIRA','Safira',100,2,'60/40', 900.00,3),
  ('ESMERALDA','Esmeralda',150,3,'50/30/20',810.00,4),
  ('TOPAZIO','Topázio',250,3,'50/30/20',1350.00,5),
  ('RUBI','Rubi',    400,4,'40/30/20/10',2000.00,6),
  ('DIAMANTE','Diamante',600,5,'35/25/20/10/10',3000.00,7),
  ('DUPLO_DIAMANTE','Duplo Diamante',900,6,'30/20/18/12/10/10',5000.00,8),
  ('TRIPLO_DIAMANTE','Triplo Diamante',1200,6,'30/20/18/12/10/10',8000.00,9),
  ('DIAMANTE_RED','Diamante Red',1600,6,'30/20/18/12/10/10',12000.00,10),
  ('DIAMANTE_BLUE','Diamante Blue',2000,6,'30/20/18/12/10/10',18000.00,11),
  ('DIAMANTE_BLACK','Diamante Black',2500,6,'30/20/18/12/10/10',25000.00,12)
) AS p(pin_code,display_name,cycles_required,min_lines,vmec_pattern,reward_value,order_index);
