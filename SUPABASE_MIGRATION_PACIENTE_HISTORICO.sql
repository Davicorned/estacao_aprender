-- Cria a tabela de histórico do paciente (linha do tempo)
-- Idempotente: pode ser rodado várias vezes sem erro.

create table if not exists public.paciente_historico (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  tipo text not null,
  descricao text not null,
  metadata jsonb not null default '{}'::jsonb,
  autor_id uuid null references auth.users(id) on delete set null,
  autor_nome text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_paciente_historico_paciente
  on public.paciente_historico (paciente_id, created_at desc);
create index if not exists idx_paciente_historico_tipo_created
  on public.paciente_historico (tipo, created_at desc);

grant select, insert on public.paciente_historico to authenticated;
grant all on public.paciente_historico to service_role;

alter table public.paciente_historico enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='paciente_historico'
      and policyname='authenticated read historico'
  ) then
    create policy "authenticated read historico"
      on public.paciente_historico for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='paciente_historico'
      and policyname='authenticated insert historico'
  ) then
    create policy "authenticated insert historico"
      on public.paciente_historico for insert
      to authenticated
      with check (true);
  end if;
end $$;

-- Força o PostgREST a recarregar o schema cache
notify pgrst, 'reload schema';