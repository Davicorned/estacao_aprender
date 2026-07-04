## Relatório de auditoria: `/gestao/servicos` é a fonte única

Confirmação: tudo que consome "serviço" no sistema lê a tabela `servicos` (a mesma que a página `/gestao/servicos` edita). Nada ficou apontando para lista hardcoded. Detalhe por tela:

### Agenda / Agendamento
- `AgendaPage.tsx` carrega `fetchServicos(false)` (só ativos) via React Query e passa para `AgendamentoFormDialog`.
- `AgendamentoFormDialog.tsx`:
  - `<Select>` de serviço renderiza `servicos.map(...)`.
  - `duracao_min` do serviço define automaticamente `horaFim`.
  - Ao vincular um contrato, usa `servico_id` do contrato.
  - Salva em `agendamentos.servico_id`.
- **Resultado:** criar/editar/desativar serviço reflete imediatamente nos novos agendamentos. Agendamentos antigos preservam o `servico_id` original mesmo se o serviço for desativado.

### Contratos
- `ContratosPage.tsx` carrega `fetchServicos(false)` e passa para `ContratoFormDialog`.
- `ContratoFormDialog.tsx`:
  - `<Select>` de serviço renderiza `servicos.map(...)`.
  - `valor_centavos` e `duracao_min` do serviço alimentam preço e cálculo do contrato.
  - Salva em `contratos.servico_id`.
- Visualização/geração do PDF do contrato faz join `servico:servicos!contratos_servico_id_fkey(id,nome)` — pega nome direto da tabela.
- **Resultado:** renomear um serviço atualiza contratos existentes (porque é join por id, não cópia).

### Financeiro
- `financeiro.ts` lê `contratos.servico_id` → busca em `servicos` para nome/valor ao gerar lançamentos.
- Filtros por serviço usam `.eq("servico_id", ...)`.
- **Resultado:** valores e nomes seguem a configuração atual do serviço.

### Prontuário (Ficha Clínica)
- `FichaClinicaTab.tsx` usa `fetchServicos(false)` para listar serviços ativos como opções da ficha.
- **Resultado:** OK.

### Profissionais
- Novo multi-select de especialidades usa `fetchServicos(true)` (inclui inativos como opção, porque especialidade histórica pode não ser um serviço ativo).
- **Resultado:** OK — combina com decisão anterior de não normalizar dados antigos.

### Site público (`site_servicos`)
- É uma tabela **separada**, do CMS (o que aparece na home/página Serviços do site).
- Não se confunde com `servicos` da gestão. Isso é intencional (site tem descrição/ordem/link próprios).
- **Nada a mudar** — mas vale saber que editar em `/gestao/servicos` não altera o site, e vice-versa.

## Pontos de atenção (não são bugs, mas convém saber)
1. **Serviço desativado**: some dos selects novos, mas continua aparecendo em agendamentos/contratos antigos que já o referenciam (comportamento correto — histórico preservado).
2. **Excluir serviço**: se houver `agendamentos`/`contratos` vinculados, o Postgres bloqueia por FK. Recomendação: sempre **desativar**, não excluir. (Mesmo padrão que já aplicamos em pacientes.)
3. **`site_servicos` ≠ `servicos`**: se um dia você quiser unificar (o serviço da gestão gerar automaticamente o card do site), é uma mudança de escopo separado.

## Conclusão
Nada a corrigir. A refatoração foi puramente de navegação — o modelo de dados já era único e todas as telas consomem `servicos` corretamente.
