## Plano de Testes Completos — Estação Aprender

Vou executar os testes em 3 camadas no preview já logado, criando dados rotulados com prefixo `TESTE -` para limpar ao final.

### Camada 1 — Smoke test (todas as rotas)

Abro cada página, capturo screenshot, leio console/network. Marcar OK / ERRO:

**Site público**
- `/` (index), `/quem-somos`, `/servicos`, `/atendimento`, `/particular`, `/contato`

**Gestão**
- `/gestao` (redirect/index), `/gestao/dashboard`
- `/gestao/pacientes`, `/gestao/agenda`
- `/gestao/contratos`, `/gestao/financeiro`
- `/gestao/configuracoes` (serviços, profissionais, usuários)
- `/gestao/site/depoimentos`, `/gestao/site/equipe`

Critério: página renderiza, sem erro no console, sem 4xx/5xx em network.

### Camada 2 — CRUD por página

Em cada módulo: **Create → Read (listar/buscar/filtrar) → Update → Delete**.

| Módulo | Operações testadas |
|---|---|
| Profissionais (config) | Criar "TESTE - Dr. Plan", editar telefone, listar, excluir |
| Serviços (config) | Criar "TESTE - Avaliação", editar valor, excluir |
| Pacientes | Criar "TESTE - Paciente A" (com responsável), abrir ficha, editar, listar/buscar |
| Agenda | Criar agendamento para o paciente, mover status (agendado→confirmado→atendido), cancelar outro |
| Prontuário (tab da ficha) | Criar evolução, editar, marcar privada, excluir; verificar aba "Histórico de sessões" |
| Contratos | Criar contrato (template, cálculo de data término), editar, alterar status, imprimir/WhatsApp link, excluir |
| Financeiro | Verificar lançamento auto-gerado pelo trigger após "atendido", registrar pagamento, criar despesa manual, filtrar por período/status, excluir |
| Dashboard | Conferir KPIs, gráficos (linha + donut), próximos agendamentos, contas a receber, filtros de período/profissional |
| Site / Depoimentos & Equipe | Criar item, reordenar/editar, excluir |

### Camada 3 — Fluxo E2E real

Sequência única ligando tudo:
1. Criar paciente `TESTE - E2E Paciente`
2. Criar contrato ativo para esse paciente (valor R$ 200, semanal, 4 sessões)
3. Criar agendamento para hoje vinculado ao paciente/serviço
4. Mudar status do agendamento para `atendido`
5. Verificar que **trigger criou lançamento financeiro** automaticamente (R$ 200 pendente)
6. Registrar evolução vinculada à sessão no prontuário
7. Registrar pagamento do lançamento
8. Conferir Dashboard: KPI "receita paga" subiu, gráfico de atendimentos reflete a sessão, contas a receber diminuiu

### Verificações transversais

- **Auth/RLS**: deslogar e tentar acessar `/gestao/*` → deve redirecionar para `/gestao/login`
- **Privacidade prontuário**: evolução marcada como privada não aparece para outro usuário (se houver mais de um profissional cadastrado)
- **Console**: zero erros vermelhos durante todo o fluxo
- **Network**: zero 4xx/5xx (exceto 401 esperados pós-logout)
- **Responsivo**: revisar Dashboard e Agenda em viewport mobile (375px)

### Entregável

Relatório consolidado por módulo:
- ✅ **OK** — funcionando, com print de evidência
- ⚠️ **Aviso** — funciona mas com ressalva (UX, validação, etc.)
- ❌ **Bug** — descrição, passos para reproduzir, console/network, e proposta de correção

Bugs encontrados **não serão corrigidos automaticamente** — eu listo tudo e você decide o que priorizar (ou já me autoriza a corrigir todos).

### Limpeza final

Excluir todos os registros `TESTE -*` criados, na ordem: lançamentos → agendamentos → evoluções → contratos → pacientes → serviço/profissional de teste.

### Tempo estimado

~30-45 min de execução em sequência (várias chamadas de browser).
