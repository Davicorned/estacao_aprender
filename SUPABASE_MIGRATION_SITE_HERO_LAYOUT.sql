-- Adiciona coluna de layout ao Banner (Hero) singleton.
alter table public.site_hero
  add column if not exists layout text not null default 'imagem-direita';