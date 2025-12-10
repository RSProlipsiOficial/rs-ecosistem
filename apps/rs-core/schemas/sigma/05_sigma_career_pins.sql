CREATE TABLE IF NOT EXISTS public.sigma_career_pins (
  settings_id uuid REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
  pin_code text NOT NULL,
  display_name text NOT NULL,
  cycles_required integer NOT NULL,
  min_lines integer NOT NULL,
  vmec_pattern text NOT NULL,
  reward_value numeric NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  PRIMARY KEY (settings_id, pin_code)
);

CREATE INDEX IF NOT EXISTS idx_sigma_career_pins_settings ON public.sigma_career_pins(settings_id);
