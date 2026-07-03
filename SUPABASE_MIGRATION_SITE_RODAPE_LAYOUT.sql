-- Adiciona coluna de layout ao Rodapé (Footer) singleton.
alter table public.site_rodape
  add column if not exists layout text not null default 'colunas';
