-- Cores de texto e cards no CMS do site
-- Rode este arquivo no SQL Editor do Supabase (uma única vez).
-- Todas as colunas são opcionais (null = usa o padrão atual).

ALTER TABLE public.site_hero
  ADD COLUMN IF NOT EXISTS texto_cor text;

ALTER TABLE public.site_header
  ADD COLUMN IF NOT EXISTS texto_cor_hex text;

ALTER TABLE public.site_rodape
  ADD COLUMN IF NOT EXISTS texto_cor_hex text,
  ADD COLUMN IF NOT EXISTS card_bg_cor   text,
  ADD COLUMN IF NOT EXISTS card_texto_cor text;

ALTER TABLE public.site_secoes
  ADD COLUMN IF NOT EXISTS texto_cor      text,
  ADD COLUMN IF NOT EXISTS card_bg_cor    text,
  ADD COLUMN IF NOT EXISTS card_texto_cor text,
  ADD COLUMN IF NOT EXISTS card_borda_cor text;