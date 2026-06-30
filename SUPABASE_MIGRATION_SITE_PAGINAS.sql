-- =========================================================================
-- SUPABASE_MIGRATION_SITE_PAGINAS.sql
-- Adds a "pages" layer over the existing CMS so that each public page can
-- own its banner + its own set of dynamic sections, rendered via /$slug.
-- Safe to re-run.
-- =========================================================================

create table if not exists public.site_paginas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  is_home boolean not null default false,
  enabled boolean not null default true,
  meta_title text,
  meta_description text,
  og_image text,
  banner_eyebrow text,
  banner_titulo text,
  banner_descricao text,
  banner_imagem_url text,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PostgREST/Data API grants (mirror other site_* tables: public read, auth write)
grant select on public.site_paginas to anon;
grant select, insert, update, delete on public.site_paginas to authenticated;
grant all on public.site_paginas to service_role;

alter table public.site_paginas enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_paginas' and policyname='site_paginas_select_all') then
    create policy site_paginas_select_all on public.site_paginas for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_paginas' and policyname='site_paginas_write_auth') then
    create policy site_paginas_write_auth on public.site_paginas
      for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Link existing sections to a page (back-compat)
alter table public.site_secoes
  add column if not exists pagina_id uuid references public.site_paginas(id) on delete cascade;

create index if not exists site_secoes_pagina_id_idx on public.site_secoes(pagina_id);

-- Seed the Home page and re-parent the legacy sections
insert into public.site_paginas (slug, titulo, is_home, "order")
values ('home', 'Home', true, 0)
on conflict (slug) do nothing;

update public.site_secoes
   set pagina_id = (select id from public.site_paginas where slug = 'home')
 where pagina_id is null;

-- Seed entries for the legacy static pages so admin can edit their banners
insert into public.site_paginas (slug, titulo, "order", banner_eyebrow, banner_titulo, banner_descricao) values
  ('quem-somos', 'Quem Somos', 1, 'Sobre nós',     'Cuidamos de cada fase do desenvolvimento do seu filho', 'Com um olhar integrado, oferecemos acolhimento e atendimento especializado.'),
  ('servicos',   'Serviços',   2, null,            'Serviços',  null),
  ('atendimento','Atendimento',3, 'Como funciona', 'Atendimento','Conheça nosso processo de atendimento.'),
  ('contato',    'Contato',    4, 'Fale conosco',  'Contato',   'Estamos prontos para ajudar você e sua família.')
on conflict (slug) do nothing;

-- Garantia: apenas uma página home
create unique index if not exists site_paginas_one_home_idx
  on public.site_paginas ((1)) where is_home = true;