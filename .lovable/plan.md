# Teste E2E — Prontuário Eletrônico (Fase 4)

Validar o fluxo completo do prontuário usando a sessão já logada (`estacao_aprender@outlook.com`) no preview.

## Passos

1. **Abrir ficha do paciente existente** (`Paciente Teste E2E`) em `/gestao/pacientes/:id` e confirmar que as tabs **Prontuário** e **Histórico de Sessões** aparecem.
2. **Tab Prontuário — estado vazio**: verificar header (nome + idade calculada), botão "Nova Evolução", filtros (profissional, período, busca).
3. **Criar nova evolução** via modal:
   - Profissional auto-preenchido
   - Vincular ao agendamento atendido criado na Fase 3
   - Preencher: queixa, observação, evolução, instrumentos, plano, encaminhamentos
   - Salvar
4. **Validar timeline**: card aparece colapsado (data + profissional + preview), expandir mostra todos os campos, botões Editar/Imprimir.
5. **Testar filtros**: profissional, período, busca por texto.
6. **Editar evolução** criada e confirmar persistência.
7. **Impressão**: clicar "Imprimir" e validar layout (header com paciente, footer confidencial).
8. **Tab Histórico de Sessões**: confirmar que o agendamento atendido mostra ✓ na coluna Evolução (vinculado); agendamentos sem evolução mostram botão "Registrar".
9. **Auditoria de gaps vs. prompt da Fase 4**: campo `privado` no schema, RLS, aviso CONFIDENCIAL na impressão — reportar o que falta.

## Entrega

Relatório final com ✅/❌ por item e lista de gaps (se houver) para decidir próximos ajustes. Sem alterações de código nesta rodada — apenas teste + auditoria.
