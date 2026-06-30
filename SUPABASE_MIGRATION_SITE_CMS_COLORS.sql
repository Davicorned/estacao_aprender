-- Cores customizadas para Seções, Hero e Rodapé.
-- Executar no SQL Editor do Supabase. Idempotente.

ALTER TABLE public.site_secoes
  ADD COLUMN IF NOT EXISTS bg_cor    text,
  ADD COLUMN IF NOT EXISTS bg_cor_2  text;

ALTER TABLE public.site_hero
  ADD COLUMN IF NOT EXISTS bg_cor    text,
  ADD COLUMN IF NOT EXISTS bg_cor_2  text;

ALTER TABLE public.site_rodape
  ADD COLUMN IF NOT EXISTS bg_cor      text,
  ADD COLUMN IF NOT EXISTS texto_cor   text;  -- 'claro' | 'escuro' | null