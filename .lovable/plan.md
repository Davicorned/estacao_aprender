## Fase 2 — Cadastro de Pacientes (CRUD completo)

### 1. Schema do banco (SUPABASE_SETUP.md — nova seção 6)

Adicionar bloco SQL para o usuário rodar no SQL Editor:

```sql
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  -- pessoais
  nome text not null,
  data_nascimento date not null,
  sexo text not null check (sexo in ('M','F','O')),
  cpf text unique,
  rg text,
  email text,
  -- responsável
  responsavel_nome text,
  responsavel_parentesco text,
  -- telefones
  telefone_celular text not null,
  telefone_residencial text,
  -- endereço
  cep text, endereco text, numero text, complemento text,
  bairro text, cidade text, estado text,
  -- outros
  como_conheceu text,
  observacoes text,
  foto_url text,
  ativo boolean not null default true,
  profissional_responsavel_id uuid references public.profissionais(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- grants + RLS: leitura/escrita para authenticated; service_role total.
-- índices: nome (trigram), cpf, telefone_celular.
```

### 2. Camada de dados — `src/lib/pacientes.ts`

- Tipos `Paciente`, `PacienteInput`.
- Funções (cliente Supabase autenticado): `listPacientes({ search, status, profissionalId, page, sortBy })`, `getPaciente(id)`, `createPaciente(input)`, `updatePaciente(id, input)`, `deletePaciente(id)`, `checkCpfDisponivel(cpf, excludeId?)`, `uploadFotoPaciente(file, pacienteId)`.
- Helpers: `calcularIdade(data)`, máscaras CPF/telefone/CEP/data, `buscarCep(cep)` via ViaCEP.

### 3. Lista — `/gestao/pacientes` (`src/routes/gestao.pacientes.index.tsx`)

- Header: título + botão "Novo Paciente" (gradiente laranja) → `/gestao/pacientes/novo`.
- Input de busca com ícone Search, debounce 300 ms.
- Filtros: Select status (Todos / Ativos / Inativos), Select profissional responsável.
- Tabela shadcn: Avatar (foto ou iniciais), Nome, Telefone, Última sessão (placeholder "—" até Fase 4), Próx. agendamento (placeholder), Ações (Pencil → editar, Calendar → agendar).
- Row hover, clique navega para a ficha; paginação 20 por página; ordenação por nome/criado/última sessão.
- Contagem "X pacientes encontrados".
- Mobile: lista de cards.

### 4. Formulário — Novo/Editar paciente

Rotas:
- `src/routes/gestao.pacientes.novo.tsx` — criação.
- `src/routes/gestao.pacientes.$id.tsx` — edição (substitui placeholder atual).

Componentes em `src/components/gestao/pacientes/`:
- `PacienteForm.tsx` — wrapper com Tabs.
- `tabs/DadosPessoaisTab.tsx` — todos os campos da Tab 1 com máscaras (`react-imask` ou helpers próprios), upload de foto para bucket `fotos-pacientes`, validação Zod + react-hook-form, idade calculada, busca de CEP via ViaCEP no blur.
- `tabs/ProntuarioTab.tsx`, `tabs/AgendamentosTab.tsx`, `tabs/FinanceiroTab.tsx` — placeholders informativos (entregues nas Fases 4 e 6), só aparecem em edição.

Botões: Cancelar (outline), Salvar (gradiente laranja, loading), Excluir paciente (texto vermelho + AlertDialog) apenas em edição.

UX:
- Validação: nome, data nascimento, sexo, celular obrigatórios; CPF único (check antes do submit).
- Salvar novo → toast sucesso + redirect para `/gestao/pacientes/:id`.
- Salvar edição → toast + permanecer.

### 5. Storage

Bucket `fotos-pacientes` já existe (Fase 1). Upload via `supabase.storage.from('fotos-pacientes').upload(...)`, salva URL pública em `pacientes.foto_url`.

### 6. Dependência

Adicionar `react-imask` (ou usar máscaras manuais; preferência por `react-imask` para CPF/telefone/CEP/data).

### Itens fora de escopo (próximas fases)
Tabs Prontuário, Agendamentos e Financeiro ficam como placeholders. Coluna "Última sessão" e "Próx. agendamento" mostram "—" até Fase 3/4.

### Ação do usuário
Rodar o novo bloco SQL (seção 6 do `SUPABASE_SETUP.md`) no Supabase antes de usar a tela.
