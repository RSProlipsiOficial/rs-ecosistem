-- Create edge function for OpenRouter chat
-- This will be handled by the edge function creation below

-- First, let's create some helper tables for the chat system
CREATE TABLE IF NOT EXISTS public.ai_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  model_id text NOT NULL,
  display_name text NOT NULL,
  description text,
  max_tokens integer DEFAULT 4000,
  pricing_input numeric(10,6) DEFAULT 0,
  pricing_output numeric(10,6) DEFAULT 0,
  supports_vision boolean DEFAULT false,
  supports_streaming boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Create policy for reading models (public access)
CREATE POLICY "Anyone can view AI models" ON public.ai_models
  FOR SELECT USING (true);

-- Create policy for managing models (admin only)
CREATE POLICY "Only admins can manage AI models" ON public.ai_models
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insert some popular models from OpenRouter
INSERT INTO public.ai_models (provider, model_id, display_name, description, max_tokens, supports_vision) VALUES
  ('OpenAI', 'openai/gpt-4o', 'GPT-4o', 'Mais recente modelo da OpenAI com visão', 128000, true),
  ('OpenAI', 'openai/gpt-4o-mini', 'GPT-4o Mini', 'Versão menor e mais rápida do GPT-4o', 128000, true),
  ('OpenAI', 'openai/gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Modelo rápido e eficiente da OpenAI', 16000, false),
  ('Anthropic', 'anthropic/claude-3-opus', 'Claude 3 Opus', 'Modelo mais inteligente da Anthropic', 200000, true),
  ('Anthropic', 'anthropic/claude-3-sonnet', 'Claude 3 Sonnet', 'Equilibrio perfeito entre velocidade e inteligência', 200000, true),
  ('Anthropic', 'anthropic/claude-3-haiku', 'Claude 3 Haiku', 'Modelo mais rápido da Anthropic', 200000, true),
  ('Google', 'google/gemini-pro', 'Gemini Pro', 'Modelo avançado do Google', 32000, false),
  ('Google', 'google/gemini-pro-vision', 'Gemini Pro Vision', 'Gemini com capacidades de visão', 32000, true),
  ('Meta', 'meta-llama/llama-3-70b-instruct', 'Llama 3 70B', 'Modelo open source da Meta', 8000, false),
  ('Mistral', 'mistralai/mixtral-8x7b-instruct', 'Mixtral 8x7B', 'Modelo de mistura de especialistas', 32000, false),
  ('Perplexity', 'perplexity/llama-3-sonar-large-32k-online', 'Sonar Large', 'Modelo com acesso à internet', 32000, false)
ON CONFLICT DO NOTHING;