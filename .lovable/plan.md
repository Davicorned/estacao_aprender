# Plano — Fase 1: Shell do Sistema de Gestão (/gestao)

Objetivo: criar um shell de back-office em `/gestao/*` totalmente separado do site público, com autenticação Supabase, sidebar, header, dashboard placeholder, e absorver o admin atual de Equipe/Depoimentos como submenu interno. Nenhuma rota pública (`/Particular`, `/QuemSomos`, etc.) será tocada.

## Escopo desta fase

Somente o **shell + auth + dashboard placeholder + relocação do admin**. As páginas reais de Agenda, Pacientes, Contratos e Financeiro são criadas apenas como **placeholders "Em breve"** — a estrutura de dados delas vem em fases seguintes.

## Estrutura de rotas (TanStack file-based, convenção com pontos)

Novos arquivos em `src/routes/`:

```
gestao.tsx                       → layout pai: provider Auth + Toaster + Outlet
gestao.login.tsx                 → tela de login (pública dentro do layout)
gestao.index.tsx                 → redirect para /gestao/dashboard
gestao.dashboard.tsx             → cards placeholder
gestao.agenda.tsx                → placeholder "Em breve"
gestao.pacientes.tsx             → layout (Outlet) — lista quando index
gestao.pacientes.index.tsx       → lista placeholder
gestao.pacientes.$id.tsx         → ficha placeholder
gestao.contratos.tsx             → placeholder
gestao.financeiro.tsx            → placeholder
gestao.site.equipe.tsx           → re-aproveita UI de admin.equipe
gestao.site.depoimentos.tsx      → re-aproveita UI de admin.depoimentos
```

Rotas `/admin/*` atuais ficam funcionando (compatibilidade), mas o link "oficial" passa a ser `/gestao/site/*`. Em fase futura podemos deprecá-las.

## Componentes novos

- `src/components/gestao/GestaoShell.tsx` — header + sidebar fixa (desktop) + Sheet drawer (mobile), recebe `title` e `children`.
- `src/components/gestao/GestaoGuard.tsx` — usa `useAuth()` (já existe em `src/lib/auth-context.tsx`). Se `loading` mostra spinner; se sem `user` → `navigate({ to: "/gestao/login" })`. **Não exige `isAdmin`** nesta fase (qualquer usuário autenticado entra; controle granular vem com tabela `profissionais`).
- `src/components/gestao/StatCard.tsx` — card de indicador do dashboard.

## Sidebar — itens e ícones (lucide-react)

Grupo principal:
- Dashboard — `LayoutDashboard` → `/gestao/dashboard`
- Agenda — `Calendar` → `/gestao/agenda`
- Pacientes — `Users` → `/gestao/pacientes`
- Contratos — `FileText` → `/gestao/contratos`
- Financeiro — `DollarSign` → `/gestao/financeiro`

Separador + grupo "Admin do site":
- Equipe — `UserCog` → `/gestao/site/equipe`
- Depoimentos — `MessageSquareQuote` → `/gestao/site/depoimentos`

Rodapé da sidebar:
- "Ver site" (link externo `/Particular` em nova aba) — `ExternalLink`
- "Sair" — `LogOut` (chama `signOut()` e redireciona para `/gestao/login`)
- E-mail do usuário em texto pequeno

Estado ativo: comparar `location.pathname` (igual ou `startsWith`) e aplicar `bg-[#FEF3E8] text-[#D67F43] font-medium border-r-2 border-[#D67F43]`.

## Header

`h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between`:
- Esquerda: botão hamburger (mobile apenas, abre Sheet) + título da página.
- Direita: nome/email do usuário, botão "Ver site" (oculto no mobile, já está no drawer), botão "Sair".

## Tela de login `/gestao/login`

Card centralizado, gradiente de fundo `from-[#FEF3E8] to-white`:
- Logo SVG da Estação Aprender no topo.
- Subtítulo "Sistema de Gestão".
- Inputs Email + Senha (shadcn).
- Botão "Entrar" gradiente `from-[#D67F43] to-[#C4682E]`.
- Link "Esqueci minha senha" → chama `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/gestao/reset-password" })`. *(Tela de reset fica como TODO desta fase — link só mostra toast "Verifique seu email" por enquanto, para não criar página meio-pronta.)*
- Se já logado, redireciona para `/gestao/dashboard`.

Usa `signIn` do `useAuth()` existente (já encapsula `signInWithPassword`).

## Dashboard placeholder

Grid de 4 `StatCard`:
1. Pacientes cadastrados — `Users`
2. Agendamentos hoje — `Calendar`
3. Sessões no mês — `Activity`
4. Receita do mês — `DollarSign` (formatado BRL)

Nesta fase os valores são literais `"—"` (ou `0`) com uma nota discreta "Disponível após Fase 2". Sem queries de Supabase ainda — as tabelas `pacientes`, `agendamentos`, `sessoes`, `lancamentos` não existem.

Estilo: `bg-white rounded-xl shadow-sm border border-gray-100 p-6`, número `text-3xl font-bold text-gray-900`, label `text-sm text-gray-500`, ícone em `w-12 h-12 rounded-xl bg-[#FEF3E8] text-[#D67F43]`.

## Páginas placeholder (Agenda, Pacientes, Contratos, Financeiro)

Cada uma renderiza dentro do `GestaoShell` um bloco vazio:
> "Em breve — esta área será ativada na próxima fase."

Mantém ícone e título corretos para validar navegação e estado ativo.

## Storage — bucket `fotos-pacientes`

Criar bucket **público** `fotos-pacientes` via tool de storage. Sem políticas de upload nesta fase (sem UI de upload de paciente ainda). Apenas deixar o bucket pronto.

## Reaproveitamento do admin atual

`/admin/equipe` e `/admin/depoimentos` já têm CRUD funcionando. Para "Admin do site" no novo shell, criamos `gestao.site.equipe.tsx` e `gestao.site.depoimentos.tsx` que **importam o mesmo conteúdo interno**. Faremos uma pequena refatoração: extrair o corpo de `admin.equipe.tsx`/`admin.depoimentos.tsx` para componentes `EquipeManager` e `DepoimentosManager` em `src/components/gestao/`, e as duas rotas (`/admin/*` e `/gestao/site/*`) os renderizam — uma envolvendo em `AdminShell`, a outra em `GestaoShell`. Zero duplicação.

## Cores / design tokens

Reuso da paleta laranja já presente no admin (`#D67F43`, `#B85A24`, `#FEF3E8`). Sem mudanças em `src/styles.css`.

## Detalhes técnicos

- Layout pai `gestao.tsx` envolve com `<AuthProvider>` + `<Toaster>` + `<GestaoGuard><Outlet/></GestaoGuard>`. Login fica **fora** do guard — guard checa pathname e libera `/gestao/login`.
- `gestao.index.tsx` faz `throw redirect({ to: "/gestao/dashboard" })` em `beforeLoad`.
- Mobile sidebar: `Sheet` do shadcn controlado por estado local no `GestaoShell`.
- Nenhuma rota de servidor / serverFn nesta fase — tudo via cliente Supabase já configurado.
- Sem alteração no `routeTree.gen.ts` (auto-gerado).

## Fora de escopo (próximas fases)

- Tabelas `pacientes`, `agendamentos`, `contratos`, `lancamentos` e suas UIs.
- Tabela `profissionais` + roles granulares.
- Página `/gestao/reset-password` completa.
- Upload de fotos de pacientes.
- Deprecação das rotas `/admin/*`.
