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

create policy "authenticated read historico"
  on public.paciente_historico for select
  to authenticated
  using (true);

create policy "authenticated insert historico"
  on public.paciente_historico for insert
  to authenticated
  with check (true);
