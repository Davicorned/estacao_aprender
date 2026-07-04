## Objetivo

1. Tirar **Serviços** de Configurações e criar página própria `/gestao/servicos`, abaixo de **Profissionais** no menu.
2. Em **Profissionais**, trocar o campo texto de especialidades (separado por vírgulas) por um **multi-select** com as opções vindas dos **Serviços cadastrados**.

## Mudanças

### 1) Nova rota `src/routes/gestao.servicos.tsx`
- Renderiza `<ServicosSection />` (o componente já existe e não precisa mudar).

### 2) `src/routes/gestao.configuracoes.tsx`
- Remover import e uso de `ServicosSection`. A página passa a mostrar apenas `ClinicaSection` (e o que mais estiver lá).

### 3) `src/components/gestao/GestaoShell.tsx`
- Adicionar item de menu **Serviços** (ícone `Briefcase` ou `Stethoscope`) logo abaixo de **Profissionais**, apontando para `/gestao/servicos`.
- Adicionar o `match` no mapa de títulos para `/gestao/servicos`.

### 4) `src/components/gestao/config/ProfissionaisSection.tsx` — multi-select de especialidades
- Ao montar, carregar `fetchServicos(true)` e derivar a lista de nomes como opções (`servico.nome`).
- Substituir o `<Input>` de especialidades (linha de edição) por um componente multi-select com checkboxes usando `Popover` + `Command` (já disponíveis em `src/components/ui`), padrão combobox multi do shadcn:
  - Trigger mostra as especialidades selecionadas como badges (mesmo estilo laranja usado na tabela) + placeholder "Selecionar…".
  - Lista com busca, cada item com checkbox; clicar alterna seleção.
  - Estado no `draft.especialidades` passa a ser `string[]` em vez de `string`.
- Migração dos dados atuais: conforme escolhido, **manter como está**. Ao abrir a edição, os valores atuais viram o array inicial; os que casam (case-insensitive) com um serviço aparecem marcados na lista, os que não casam continuam salvos e aparecem como badge extra (com um "×" para remover), mas não são reintroduzidos automaticamente. Nada é reescrito até o usuário salvar.
- Salvamento continua igual: `especialidades: string[]` direto no update/insert.
- Exibição na tabela (linha não-editando) permanece igual — já usa `p.especialidades.map(...)`.

### 5) Sem migration
Nenhuma alteração de schema. `profissionais.especialidades` continua `text[]`.

## Fora de escopo
- Não criar CRUD/tabela separada de especialidades.
- Não normalizar/renomear especialidades existentes automaticamente.
- Não mexer em agendamentos nem em outras telas.
