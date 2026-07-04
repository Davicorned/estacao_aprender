-- Blog: tabela de posts com RLS (leitura pública apenas dos publicados).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  resumo text,
  conteudo text not null default '',
  capa_url text,
  autor text,
  categoria text,
  tags text[] not null default '{}',
  status text not null default 'rascunho' check (status in ('rascunho','publicado')),
  publicado_em timestamptz,
  meta_title text,
  meta_description text,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_status_idx on public.blog_posts (status);
create index if not exists blog_posts_publicado_em_idx on public.blog_posts (publicado_em desc);

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;

alter table public.blog_posts enable row level security;

-- Leitura pública apenas de posts publicados.
do $$ begin
  create policy "blog_posts_select_publicados"
    on public.blog_posts for select
    to anon using (status = 'publicado');
exception when duplicate_object then null; end $$;

-- Usuários autenticados (admin) veem tudo e podem escrever.
do $$ begin
  create policy "blog_posts_select_auth_all"
    on public.blog_posts for select
    to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "blog_posts_write_auth"
    on public.blog_posts for all
    to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;