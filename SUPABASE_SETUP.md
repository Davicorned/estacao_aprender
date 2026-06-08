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

## 7) Agendamentos (Fase 3 do /gestao)

Rode este bloco no SQL Editor:

```sql
-- Enum de status
do $$ begin
  create type agendamento_status as enum
    ('agendado','confirmado','em_atendimento','atendido','faltou','cancelado');
exception when duplicate_object then null; end $$;

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(id) on delete restrict,
  servico_id uuid references public.servicos(id) on delete set null,

  data date not null,
  hora_inicio time not null,
  hora_fim time not null,

  tipo text not null default 'presencial' check (tipo in ('presencial','online')),
  status agendamento_status not null default 'agendado',

  observacoes text,
  motivo_cancelamento text,
  recorrencia_grupo_id uuid,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.agendamentos to authenticated;
grant all on public.agendamentos to service_role;

alter table public.agendamentos enable row level security;

drop policy if exists "auth read agendamentos" on public.agendamentos;
create policy "auth read agendamentos" on public.agendamentos
for select to authenticated using (true);

drop policy if exists "auth write agendamentos" on public.agendamentos;
create policy "auth write agendamentos" on public.agendamentos
for all to authenticated using (true) with check (true);

create index if not exists agendamentos_prof_data_idx on public.agendamentos (profissional_id, data);
create index if not exists agendamentos_paciente_data_idx on public.agendamentos (paciente_id, data);
create index if not exists agendamentos_data_idx on public.agendamentos (data);

-- Habilita Realtime (ignora erro se já estiver na publicação)
do $$ begin
  alter publication supabase_realtime add table public.agendamentos;
exception when duplicate_object then null; end $$;
```

Depois disso, `/gestao/agenda` está pronto para uso e recebe atualizações em tempo real.

## 8) Prontuário Eletrônico (Fase 4 do /gestao)

Rode este bloco no SQL Editor:

```sql
create table if not exists public.evolucoes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(id) on delete restrict,
  agendamento_id uuid references public.agendamentos(id) on delete set null,

  data_sessao date not null default current_date,

  queixa text,
  observacao text,
  evolucao text,
  instrumentos text,
  plano text,
  encaminhamentos text,

  privado boolean not null default false,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.evolucoes to authenticated;
grant all on public.evolucoes to service_role;

alter table public.evolucoes enable row level security;

drop policy if exists "auth read evolucoes" on public.evolucoes;
create policy "auth read evolucoes" on public.evolucoes
for select to authenticated
using (
  privado = false
  or created_by = auth.uid()
  or public.has_role(auth.uid(), 'admin')
);

drop policy if exists "auth insert evolucoes" on public.evolucoes;
create policy "auth insert evolucoes" on public.evolucoes
for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "auth update evolucoes" on public.evolucoes;
create policy "auth update evolucoes" on public.evolucoes
for update to authenticated
using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
with check (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "auth delete evolucoes" on public.evolucoes;
create policy "auth delete evolucoes" on public.evolucoes
for delete to authenticated
using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));

create index if not exists evolucoes_paciente_data_idx
  on public.evolucoes (paciente_id, data_sessao desc);
create index if not exists evolucoes_profissional_idx
  on public.evolucoes (profissional_id);
create index if not exists evolucoes_agendamento_idx
  on public.evolucoes (agendamento_id);
```

Depois disso, a aba **Prontuário** na ficha do paciente está pronta para uso.

## 9) Contratos e Financeiro (Fase 5 do /gestao)

Rode este bloco no SQL Editor:

```sql
-- ================== CONTRATOS ==================
create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(id) on delete restrict,
  servico_id uuid not null references public.servicos(id) on delete restrict,

  valor_centavos int not null default 0,
  qtd_sessoes int,
  frequencia text not null default 'semanal' check (frequencia in ('semanal','quinzenal','mensal','livre')),

  data_inicio date not null,
  data_termino date,

  status text not null default 'rascunho' check (status in ('rascunho','ativo','encerrado','cancelado')),

  termos text not null default '',
  template_origem text,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.contratos to authenticated;
grant all on public.contratos to service_role;
alter table public.contratos enable row level security;

drop policy if exists "auth read contratos" on public.contratos;
create policy "auth read contratos" on public.contratos
for select to authenticated using (true);

drop policy if exists "auth write contratos" on public.contratos;
create policy "auth write contratos" on public.contratos
for all to authenticated using (true) with check (true);

create index if not exists contratos_paciente_idx on public.contratos (paciente_id);
create index if not exists contratos_status_idx on public.contratos (status);
create index if not exists contratos_prof_idx on public.contratos (profissional_id);

-- ================== LANÇAMENTOS FINANCEIROS ==================
create table if not exists public.lancamentos_financeiros (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references public.pacientes(id) on delete set null,
  contrato_id uuid references public.contratos(id) on delete set null,
  agendamento_id uuid references public.agendamentos(id) on delete set null,

  tipo text not null default 'receita' check (tipo in ('receita','despesa')),
  descricao text not null default '',
  valor_centavos int not null default 0,

  data_vencimento date not null,
  data_pagamento date,

  status text not null default 'pendente' check (status in ('pendente','pago','atrasado','cancelado')),
  forma_pagamento text check (forma_pagamento in ('dinheiro','pix','cartao_credito','cartao_debito','transferencia')),

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.lancamentos_financeiros to authenticated;
grant all on public.lancamentos_financeiros to service_role;
alter table public.lancamentos_financeiros enable row level security;

drop policy if exists "auth read lancamentos" on public.lancamentos_financeiros;
create policy "auth read lancamentos" on public.lancamentos_financeiros
for select to authenticated using (true);

drop policy if exists "auth write lancamentos" on public.lancamentos_financeiros;
create policy "auth write lancamentos" on public.lancamentos_financeiros
for all to authenticated using (true) with check (true);

create index if not exists lanc_status_venc_idx on public.lancamentos_financeiros (status, data_vencimento);
create index if not exists lanc_paciente_idx on public.lancamentos_financeiros (paciente_id);
create unique index if not exists lanc_agendamento_uidx on public.lancamentos_financeiros (agendamento_id)
  where agendamento_id is not null;

-- ================== TRIGGER: gerar lançamento ao atender agendamento ==================
create or replace function public.gerar_lancamento_para_agendamento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contrato_id uuid;
  v_valor int;
  v_servico_nome text;
begin
  if NEW.status = 'atendido' and (OLD is null or OLD.status is distinct from 'atendido') then
    -- já existe um lançamento para este agendamento?
    if exists (select 1 from public.lancamentos_financeiros where agendamento_id = NEW.id) then
      return NEW;
    end if;

    -- contrato ativo do paciente (mais recente)
    select c.id, c.valor_centavos into v_contrato_id, v_valor
    from public.contratos c
    where c.paciente_id = NEW.paciente_id and c.status = 'ativo'
    order by c.data_inicio desc
    limit 1;

    if v_valor is null then
      select s.valor_centavos into v_valor
      from public.servicos s where s.id = NEW.servico_id;
    end if;

    select s.nome into v_servico_nome from public.servicos s where s.id = NEW.servico_id;

    insert into public.lancamentos_financeiros (
      paciente_id, contrato_id, agendamento_id,
      tipo, descricao, valor_centavos,
      data_vencimento, status
    ) values (
      NEW.paciente_id, v_contrato_id, NEW.id,
      'receita',
      coalesce(v_servico_nome, 'Atendimento') || ' — ' || to_char(NEW.data, 'DD/MM/YYYY'),
      coalesce(v_valor, 0),
      NEW.data,
      'pendente'
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_gerar_lancamento on public.agendamentos;
create trigger trg_gerar_lancamento
  after insert or update of status on public.agendamentos
  for each row execute function public.gerar_lancamento_para_agendamento();
```

Depois disso, `/gestao/contratos`, `/gestao/financeiro` e `/gestao/dashboard` estão prontos para uso.

---

## Fase 7 — Anexo de contrato assinado (scan)

### 1. Colunas em `contratos`

```sql
alter table public.contratos
  add column if not exists arquivo_assinado_path text,
  add column if not exists arquivo_assinado_uploaded_at timestamptz,
  add column if not exists arquivo_assinado_mime text;
```

### 2. Bucket privado `contratos-assinados`

No Supabase Dashboard → Storage → **New bucket**:
- Nome: `contratos-assinados`
- Public: **OFF** (privado)
- File size limit: 10 MB
- Allowed MIME types: `application/pdf, image/jpeg, image/png`

### 3. Policies no bucket (RLS em `storage.objects`)

```sql
create policy "contratos_assinados_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'contratos-assinados');

create policy "contratos_assinados_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'contratos-assinados');

create policy "contratos_assinados_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'contratos-assinados')
  with check (bucket_id = 'contratos-assinados');

create policy "contratos_assinados_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'contratos-assinados');
```

Pronto: o botão **Baixar PDF** e o bloco **Contrato assinado** ficam funcionais em `/gestao/contratos`.
