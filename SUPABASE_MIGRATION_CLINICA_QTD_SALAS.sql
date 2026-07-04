alter table public.configuracoes_clinica
  add column if not exists qtd_salas int not null default 2
  check (qtd_salas between 1 and 50);
