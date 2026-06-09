## Objetivo
Reorganizar o diálogo **Novo/Editar contrato** (`ContratoFormDialog.tsx`) usando um **wizard em etapas**, no mesmo estilo do cadastro de pacientes — reduzindo o scroll vertical e deixando o preenchimento mais guiado.

## Etapas propostas

1. **Paciente & Serviço**
   - Busca de paciente, Profissional, Tipo de serviço.
2. **Responsável**
   - Nome, CPF, RG, Endereço (pré-preenchidos a partir do paciente).
3. **Modalidade & Pagamento**
   - Modalidade, Aulas/mês, Dia vencimento, Valor c/ e s/ desconto, Forma de pagamento, prévia do **valor mensal**.
4. **Vigência**
   - Qtd sessões, Frequência, Data início/término, Status, Cidade da assinatura, Autoriza imagem.
5. **Revisão & Termos**
   - Resumo (paciente, responsável, valores, datas) + Textarea dos termos + botão *Reaplicar template*.
   - Botão final **"Gerar contrato"** / **"Salvar"**.

## UX do wizard

- Cabeçalho com **stepper** (1 → 5) mostrando etapa atual e títulos curtos.
- Barra `Progress` fina abaixo do stepper.
- Footer com **Voltar** / **Próximo**; na última etapa, **Voltar** + **Gerar contrato/Salvar**.
- Permitir **clicar nas etapas já visitadas** para navegação livre.
- **Validações por etapa** antes de avançar:
  - Etapa 1: paciente, profissional, serviço obrigatórios.
  - Etapa 2: nome e CPF obrigatórios.
  - Etapa 4: data de início obrigatória.
- No **modo edição**, todas as etapas começam liberadas (sem bloqueio sequencial).

## Detalhes técnicos

- Arquivo único: `src/components/gestao/contratos/ContratoFormDialog.tsx`.
- Adicionar `const [step, setStep] = useState(0)` + array `STEPS` com `{ id, title, validate }`.
- Manter **todo o estado e lógica atuais** (`useEffect`s, `buildVars`, `regenerarTemplate`, `handleSubmit`, payload) — só envolver o conteúdo em um `switch(step)` que renderiza o bloco da etapa.
- Resetar `step` para 0 sempre que `open` virar `true`.
- Usar `@/components/ui/progress` (já existente) para a barra.
- Sem mudanças em dados/DB nem em `contratos.ts`.

## Arquivos a editar
- `src/components/gestao/contratos/ContratoFormDialog.tsx` (apenas UI/estrutura).
