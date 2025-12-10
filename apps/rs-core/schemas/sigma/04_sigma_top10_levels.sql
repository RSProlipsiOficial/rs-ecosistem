CREATE TABLE IF NOT EXISTS public.sigma_top10_levels (
  settings_id uuid REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 10),
  percent_of_pool numeric NOT NULL,
  pool_percent_base numeric NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  PRIMARY KEY (settings_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_sigma_top10_levels_settings ON public.sigma_top10_levels(settings_id);
