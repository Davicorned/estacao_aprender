-- Identidade: logo unificado (usado em cabeçalho, rodapé, painel, PDF, favicon, og:image)
alter table public.site_tema
  add column if not exists logo_url text,
  add column if not exists logo_escuro_url text,
  add column if not exists favicon_url text;