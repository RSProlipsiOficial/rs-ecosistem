CREATE TABLE IF NOT EXISTS public.sigma_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_value numeric NOT NULL DEFAULT 360.00,
  cycle_payout_value numeric NOT NULL DEFAULT 108.00,
  cycle_payout_percent numeric NOT NULL DEFAULT 30.00,
  reentry_enabled boolean NOT NULL DEFAULT true,
  reentry_limit_per_month integer NOT NULL DEFAULT 10,
  spillover_mode text NOT NULL DEFAULT 'linha_ascendente',
  fidelity_source_percent numeric NOT NULL DEFAULT 1.25,
  top_pool_percent numeric NOT NULL DEFAULT 4.5,
  career_percent numeric NOT NULL DEFAULT 6.39,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
