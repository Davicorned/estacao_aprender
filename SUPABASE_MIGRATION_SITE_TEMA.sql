-- Tema global do site público (cores, fontes, radius).
-- Singleton row editável apenas por usuários autenticados (admin).

create table if not exists public.site_tema (
  id text primary key default 'singleton',
  cor_primaria text not null default '#D67F43',
  cor_primaria_hover text not null default '#C4682E',
  cor_secundaria text,
  cor_texto text not null default '#1A1A1A',
  cor_fundo text not null default '#FFFFFF',
  cor_eyebrow text,
  fonte_titulos text not null default 'Inter',
  fonte_corpo text not null default 'Inter',
  radius_px int not null default 10,
  updated_at timestamptz not null default now(),
  constraint site_tema_singleton check (id = 'singleton')
);

grant select on public.site_tema to anon, authenticated;
grant insert, update, delete on public.site_tema to authenticated;
grant all on public.site_tema to service_role;

alter table public.site_tema enable row level security;

drop policy if exists "site_tema read all" on public.site_tema;
create policy "site_tema read all" on public.site_tema for select using (true);

drop policy if exists "site_tema write auth" on public.site_tema;
create policy "site_tema write auth" on public.site_tema for all to authenticated
  using (true) with check (true);

insert into public.site_tema (id) values ('singleton') on conflict (id) do nothing;