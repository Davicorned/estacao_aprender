# Setup do Supabase — Estação Aprender

Você só precisa rodar isso UMA VEZ. Tudo no SQL Editor do seu projeto Supabase
(https://supabase.com/dashboard → seu projeto → SQL Editor → New query).

## 1) Schema, roles, RLS, storage e seed

Cole o bloco abaixo inteiro e clique em **Run**:

```sql
-- =========================================
-- ENUMS
-- =========================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin');
  end if;
end $$;

-- =========================================
-- USER ROLES (NUNCA armazenar role no profiles)
-- =========================================
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles
for select to authenticated
using (user_id = auth.uid());

-- has_role (security definer evita recursão de RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- =========================================
-- TEAM MEMBERS
-- =========================================
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  titulo text not null,
  foto_url text,
  especialidades text[] not null default '{}',
  bio text,
  registro text,
  "order" int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated;
grant all on public.team_members to service_role;

alter table public.team_members enable row level security;

drop policy if exists "public read enabled team" on public.team_members;
create policy "public read enabled team" on public.team_members
for select to anon, authenticated
using (enabled = true or public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin insert team" on public.team_members;
create policy "admin insert team" on public.team_members
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin update team" on public.team_members;
create policy "admin update team" on public.team_members
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin delete team" on public.team_members;
create policy "admin delete team" on public.team_members
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- TESTIMONIALS
-- =========================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  texto text not null,
  fonte text default 'Google',
  "order" int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;

alter table public.testimonials enable row level security;

drop policy if exists "public read enabled testimonials" on public.testimonials;
create policy "public read enabled testimonials" on public.testimonials
for select to anon, authenticated
using (enabled = true or public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin insert testimonials" on public.testimonials;
create policy "admin insert testimonials" on public.testimonials
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin update testimonials" on public.testimonials;
create policy "admin update testimonials" on public.testimonials
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin delete testimonials" on public.testimonials;
create policy "admin delete testimonials" on public.testimonials
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- STORAGE BUCKET (fotos de equipe etc.)
-- =========================================
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "public read site-images" on storage.objects;
create policy "public read site-images" on storage.objects
for select to anon, authenticated
using (bucket_id = 'site-images');

drop policy if exists "admin insert site-images" on storage.objects;
create policy "admin insert site-images" on storage.objects
for insert to authenticated
with check (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin update site-images" on storage.objects;
create policy "admin update site-images" on storage.objects
for update to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin delete site-images" on storage.objects;
create policy "admin delete site-images" on storage.objects
for delete to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

-- =========================================
-- SEED (conteúdo atual da /Particular)
-- =========================================
insert into public.team_members (nome, titulo, especialidades, bio, "order") values
('Érica Cornedi', 'Fundadora',
  ARRAY['Psicopedagogia','Psicomotricidade','ABA','Alfabetização','Reforço escolar'],
  'Fundadora da Estação Aprender. Especializada no atendimento de crianças com dificuldades de aprendizagem, transtornos do desenvolvimento e necessidade de olhar diferenciado.',
  0),
('Mariana Lopes', 'Psicóloga Infantil',
  ARRAY['Psicologia infantil','TCC','Avaliação psicológica','Orientação parental'],
  'Atua há 10 anos no acompanhamento emocional de crianças e adolescentes, com foco em ansiedade e regulação emocional.',
  1),
('Camila Ribeiro', 'Fonoaudióloga',
  ARRAY['Fonoaudiologia','Linguagem infantil','Atraso de fala','Comunicação alternativa'],
  'Especialista em desenvolvimento da linguagem e estímulo da comunicação em crianças com atraso de fala e TEA.',
  2),
('Beatriz Alves', 'Terapeuta Ocupacional',
  ARRAY['Terapia Ocupacional','Integração sensorial','Coordenação motora','AVDs'],
  'Trabalha o desenvolvimento da autonomia e da integração sensorial em crianças com necessidades específicas.',
  3),
('Rafael Mendes', 'Psicólogo ABA',
  ARRAY['ABA','TEA','Manejo comportamental','Habilidades sociais'],
  'Foco no atendimento de crianças no espectro autista usando os princípios da Análise do Comportamento Aplicada (ABA).',
  4),
('Juliana Castro', 'Psicopedagoga',
  ARRAY['Psicopedagogia','Dislexia','TDAH','Reforço escolar','Métodos de estudo'],
  'Apoio a crianças com dificuldades de aprendizagem, com estratégias personalizadas para cada perfil.',
  5)
on conflict do nothing;

insert into public.testimonials (nome, texto, fonte, "order") values
('Yuri Caroline',
  'Tenho uma experiência muito positiva com o Espaço Ide. É um lugar acolhedor e aconchegante, onde meu filho faz terapia e se sente bem. O ambiente é agradável e ainda conta com um cafezinho que faz toda a diferença enquanto esperamos. Recomendo!',
  'Google', 0),
('Daniela De Oliveira Silva Ribeiro',
  'O Estação Aprender é um ambiente acolhedor e bem organizado, com oficinas criativas e envolventes. Meu filho participa das oficinas e a última foi a de Páscoa e ele adorou! Atividades bem planejadas, com cuidado e estímulo à criatividade. Recomendo bastante!',
  'Google', 1),
('Isah Adriano',
  'Tive uma experiência muito boa no Estação Aprender. A equipe é super atenciosa, acolhedora e dá pra ver que realmente se importam com as crianças. Além do espaço belíssimo e acolhedor, os profissionais passam bastante segurança, explicam tudo direitinho e mantêm a gente sempre informado.',
  'Google', 2)
on conflict do nothing;
```

## 2) Criar sua conta de admin

1. Vá em **Authentication → Providers → Email** e DESLIGUE "Confirm email"
   (só pra você não precisar verificar email no primeiro login). Pode religar depois.
2. Abra `/admin/login` no site, clique em **"Criar conta"**, use seu email + senha.
3. Volte ao Supabase em **Authentication → Users**, copie o `User UID` da sua conta.
4. No SQL Editor rode (trocando `COLE_AQUI`):

```sql
insert into public.user_roles (user_id, role)
values ('COLE_AQUI', 'admin');
```

5. Faça logout/login no `/admin/login`. Pronto — agora você consegue editar tudo.

## 3) (Opcional) Bloquear novos cadastros

Depois que sua conta admin já estiver criada, vá em
**Authentication → Providers → Email** e desligue **"Enable signups"**.
Assim ninguém mais consegue se cadastrar pelo `/admin/login`.

## 4) Configurar CORS (se necessário)

Normalmente o Supabase já libera qualquer origem. Se aparecer erro de CORS no
console do navegador, vá em **Project Settings → API → CORS Allowed Origins**
e adicione a URL do seu site Lovable.
## 4) Storage bucket: fotos-pacientes (Fase 1 do /gestao)

No SQL Editor, rode:

```sql
insert into storage.buckets (id, name, public)
values ('fotos-pacientes', 'fotos-pacientes', true)
on conflict (id) do update set public = true;
```

(Ou no Dashboard → Storage → "New bucket" → nome `fotos-pacientes`, marque "Public bucket".)

Esse bucket é usado pelo `/gestao/pacientes` em fases futuras para armazenar fotos dos pacientes. Não precisa de políticas extras agora — qualquer usuário autenticado já pode fazer upload via o cliente Supabase enquanto for público para leitura.

## 5) Configurações: serviços, profissionais e dados da clínica

Rode este bloco no SQL Editor:

```sql
-- =========================================
-- SERVICOS / PROCEDIMENTOS
-- =========================================
create table if not exists public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 100),
  duracao_min int not null default 50 check (duracao_min in (30,40,50,60,90,120)),
  valor_centavos int not null default 0 check (valor_centavos >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.servicos to authenticated;
grant all on public.servicos to service_role;

alter table public.servicos enable row level security;

drop policy if exists "auth read servicos" on public.servicos;
create policy "auth read servicos" on public.servicos
for select to authenticated using (true);

drop policy if exists "admin write servicos" on public.servicos;
create policy "admin write servicos" on public.servicos
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- PROFISSIONAIS (operacional, separado de team_members do site)
-- =========================================
create table if not exists public.profissionais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null check (char_length(nome) between 1 and 100),
  titulo text check (titulo is null or char_length(titulo) <= 80),
  especialidades text[] not null default '{}',
  cor_agenda text not null default '#D67F43' check (cor_agenda ~ '^#[0-9a-fA-F]{6}$'),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profissionais to authenticated;
grant all on public.profissionais to service_role;

alter table public.profissionais enable row level security;

drop policy if exists "auth read profissionais" on public.profissionais;
create policy "auth read profissionais" on public.profissionais
for select to authenticated using (true);

drop policy if exists "admin write profissionais" on public.profissionais;
create policy "admin write profissionais" on public.profissionais
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- CONFIGURACOES DA CLINICA (singleton: sempre id = 1)
-- =========================================
create table if not exists public.configuracoes_clinica (
  id int primary key default 1 check (id = 1),
  nome text not null default 'Estação Aprender',
  telefone text,
  email text,
  endereco text,
  horario_seg_sex_inicio time,
  horario_seg_sex_fim time,
  horario_sab_inicio time,
  horario_sab_fim time,
  horario_almoco_inicio time,
  horario_almoco_fim time,
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.configuracoes_clinica to authenticated;
grant all on public.configuracoes_clinica to service_role;

alter table public.configuracoes_clinica enable row level security;

drop policy if exists "auth read clinica" on public.configuracoes_clinica;
create policy "auth read clinica" on public.configuracoes_clinica
for select to authenticated using (true);

drop policy if exists "admin write clinica" on public.configuracoes_clinica;
create policy "admin write clinica" on public.configuracoes_clinica
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Linha singleton inicial
insert into public.configuracoes_clinica (id, nome)
values (1, 'Estação Aprender')
on conflict (id) do nothing;

-- Seed opcional de serviços
insert into public.servicos (nome, duracao_min, valor_centavos) values
  ('Sessão de Psicopedagogia', 50, 18000),
  ('Sessão de Psicomotricidade', 50, 18000),
  ('Atendimento ABA', 50, 20000)
on conflict do nothing;
```

Depois disso, `/gestao/configuracoes` está pronto para uso.

## 6) Pacientes (Fase 2 do /gestao)

Rode este bloco no SQL Editor:

```sql
-- =========================================
-- PACIENTES
-- =========================================
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),

  -- pessoais
  nome text not null check (char_length(nome) between 1 and 150),
  data_nascimento date not null,
  sexo text not null check (sexo in ('M','F','O')),
  cpf text unique,
  rg text,
  email text,

  -- responsável (menores)
  responsavel_nome text,
  responsavel_parentesco text,

  -- telefones
  telefone_celular text not null,
  telefone_residencial text,

  -- endereço
  cep text,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,

  -- outros
  como_conheceu text,
  observacoes text,
  foto_url text,
  ativo boolean not null default true,
  profissional_responsavel_id uuid references public.profissionais(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.pacientes to authenticated;
grant all on public.pacientes to service_role;

alter table public.pacientes enable row level security;

drop policy if exists "auth read pacientes" on public.pacientes;
create policy "auth read pacientes" on public.pacientes
for select to authenticated using (true);

drop policy if exists "auth write pacientes" on public.pacientes;
create policy "auth write pacientes" on public.pacientes
for all to authenticated using (true) with check (true);

create index if not exists pacientes_nome_idx on public.pacientes (lower(nome));
create index if not exists pacientes_cpf_idx on public.pacientes (cpf);
create index if not exists pacientes_telefone_idx on public.pacientes (telefone_celular);
create index if not exists pacientes_ativo_idx on public.pacientes (ativo);
```

Depois disso, `/gestao/pacientes` está pronto para uso.
