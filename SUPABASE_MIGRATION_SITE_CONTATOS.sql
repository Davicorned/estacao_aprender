-- Centraliza os contatos do site em 3 tabelas (telefones, e-mails, endereços).
-- Idempotente. Faz seed a partir de site_rodape se as tabelas novas estiverem vazias.

-- ============ TELEFONES ============
create table if not exists public.site_contato_telefones (
  id uuid primary key default gen_random_uuid(),
  rotulo text,
  telefone_exibido text not null,
  whatsapp_enabled boolean not null default false,
  whatsapp_mensagem text,
  usar_no_botao_flutuante boolean not null default false,
  mostrar_no_header boolean not null default false,
  ordem int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.site_contato_telefones to anon, authenticated;
grant insert, update, delete on public.site_contato_telefones to authenticated;
grant all on public.site_contato_telefones to service_role;

alter table public.site_contato_telefones enable row level security;

do $$ begin
  create policy "site_contato_telefones_select_public"
    on public.site_contato_telefones for select
    to anon, authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "site_contato_telefones_write_auth"
    on public.site_contato_telefones for all
    to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- ============ E-MAILS ============
create table if not exists public.site_contato_emails (
  id uuid primary key default gen_random_uuid(),
  rotulo text,
  email text not null,
  ordem int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.site_contato_emails to anon, authenticated;
grant insert, update, delete on public.site_contato_emails to authenticated;
grant all on public.site_contato_emails to service_role;

alter table public.site_contato_emails enable row level security;

do $$ begin
  create policy "site_contato_emails_select_public"
    on public.site_contato_emails for select
    to anon, authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "site_contato_emails_write_auth"
    on public.site_contato_emails for all
    to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- ============ ENDEREÇOS ============
create table if not exists public.site_contato_enderecos (
  id uuid primary key default gen_random_uuid(),
  rotulo text,
  endereco_texto text not null,
  mapa_embed_url text,
  horarios text,
  ordem int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.site_contato_enderecos to anon, authenticated;
grant insert, update, delete on public.site_contato_enderecos to authenticated;
grant all on public.site_contato_enderecos to service_role;

alter table public.site_contato_enderecos enable row level security;

do $$ begin
  create policy "site_contato_enderecos_select_public"
    on public.site_contato_enderecos for select
    to anon, authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "site_contato_enderecos_write_auth"
    on public.site_contato_enderecos for all
    to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- ============ SEED a partir de site_rodape (só se as novas estiverem vazias) ============
insert into public.site_contato_telefones
  (rotulo, telefone_exibido, whatsapp_enabled, whatsapp_mensagem, usar_no_botao_flutuante, mostrar_no_header, ordem, enabled)
select
  'Principal',
  coalesce(r.telefone, '(11) 93213-9815'),
  true,
  'Olá! Vim pelo site e gostaria de mais informações.',
  true,
  true,
  0,
  true
from public.site_rodape r
where r.id = 'singleton'
  and not exists (select 1 from public.site_contato_telefones);

-- fallback se nem site_rodape existir
insert into public.site_contato_telefones
  (rotulo, telefone_exibido, whatsapp_enabled, whatsapp_mensagem, usar_no_botao_flutuante, mostrar_no_header, ordem, enabled)
select 'Principal', '(11) 93213-9815', true, 'Olá! Vim pelo site e gostaria de mais informações.', true, true, 0, true
where not exists (select 1 from public.site_contato_telefones);

insert into public.site_contato_emails (rotulo, email, ordem, enabled)
select 'Principal', coalesce(r.email, 'contato@estacaoaprender.com.br'), 0, true
from public.site_rodape r
where r.id = 'singleton'
  and not exists (select 1 from public.site_contato_emails);

insert into public.site_contato_emails (rotulo, email, ordem, enabled)
select 'Principal', 'contato@estacaoaprender.com.br', 0, true
where not exists (select 1 from public.site_contato_emails);

insert into public.site_contato_enderecos (rotulo, endereco_texto, mapa_embed_url, horarios, ordem, enabled)
select
  coalesce(r.endereco_titulo, 'Unidade Principal'),
  coalesce(r.endereco_texto, 'Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040'),
  null,
  'Segunda a Sexta: 8h às 20h' || chr(10) || 'Sábado: 8h às 14h',
  0,
  true
from public.site_rodape r
where r.id = 'singleton'
  and not exists (select 1 from public.site_contato_enderecos);

insert into public.site_contato_enderecos (rotulo, endereco_texto, mapa_embed_url, horarios, ordem, enabled)
select 'Unidade Principal', 'Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040', null,
  'Segunda a Sexta: 8h às 20h' || chr(10) || 'Sábado: 8h às 14h', 0, true
where not exists (select 1 from public.site_contato_enderecos);