-- Fase: Templates de seção reutilizáveis
-- Aditivo e idempotente. Não altera RLS — herda das policies de site_secoes.

alter table public.site_secoes
  add column if not exists dados jsonb not null default '{}'::jsonb;

alter table public.site_secao_itens
  add column if not exists link text;