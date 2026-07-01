-- Estilo global dos documentos (PDF de contratos, etc.).
-- Aditivo e idempotente. Singleton (id='singleton').

create table if not exists public.documento_estilo (
  id text primary key default 'singleton',
  logo_url text,
  logo_alinhamento text not null default 'esquerda',
  header_estilo text not null default 'curva',
  header_cor text not null default '#E08A3C',
  header_cor_2 text,
  header_texto_cor text not null default '#FFFFFF',
  header_altura int not null default 170,
  mostrar_tagline boolean not null default true,
  tagline text default 'Psicopedagogia · Psicomotricidade · Psicologia · Neuropsicologia · Alfabetização · Educação Neuroparental',
  rodape_mostrar boolean not null default true,
  rodape_usar_clinica boolean not null default true,
  rodape_telefone text,
  rodape_instagram text,
  rodape_endereco text,
  rodape_cor text,
  mostrar_paginacao boolean not null default true,
  fonte text not null default 'Inter',
  updated_at timestamptz not null default now(),
  constraint documento_estilo_singleton check (id = 'singleton')
);

grant select, insert, update on public.documento_estilo to authenticated;
grant all on public.documento_estilo to service_role;

alter table public.documento_estilo enable row level security;

drop policy if exists "doc_estilo read" on public.documento_estilo;
create policy "doc_estilo read" on public.documento_estilo
  for select to authenticated using (true);

drop policy if exists "doc_estilo write" on public.documento_estilo;
create policy "doc_estilo write" on public.documento_estilo
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

insert into public.documento_estilo (id) values ('singleton') on conflict (id) do nothing;