CREATE TABLE IF NOT EXISTS public.sigma_depth_levels (
  settings_id uuid REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level BETWEEN 1 AND 6),
  percent numeric NOT NULL,
  value_per_cycle numeric NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  PRIMARY KEY (settings_id, level)
);

CREATE INDEX IF NOT EXISTS idx_sigma_depth_levels_settings ON public.sigma_depth_levels(settings_id);
