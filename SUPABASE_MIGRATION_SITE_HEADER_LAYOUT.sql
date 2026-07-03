-- Adiciona coluna de layout ao Cabeçalho (Header) singleton.
alter table public.site_header
  add column if not exists layout text not null default 'logo-esquerda';
