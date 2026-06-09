
## Diagnóstico

O modelo em papel da clínica é uma **ficha de abertura** (anamnese leve + dados clínicos/escolares/contatos), não um histórico de sessões. Hoje no sistema temos:

- **Dados Pessoais** (form atual) — dados de identificação, endereço, 1 responsável.
- **Prontuário** — somente evoluções (sessões).
- **Histórico de Sessões** e **Financeiro**.

O modelo em papel traz informações que **não cabem** em "Dados Pessoais" (ficaria gigante e misturaria identificação com dados clínicos), e **também não cabem** em "Evoluções" (são dados permanentes do paciente, não de uma sessão).

## Proposta: separar em duas camadas

### 1. Manter "Dados Pessoais" enxuto
Continua como hoje (identificação, endereço, 1 responsável, foto). Acrescentar **apenas 2 campos** que são realmente identificação/contato:

- **2º Responsável** (nome + parentesco + celular) — opcional, recolhível "+ adicionar segundo responsável"
- **Escolaridade resumida**: nível (Educação Infantil / Fund. I / Fund. II / Médio / Outro) + nome da escola

Isso resolve o "Dados dos Responsáveis" e "Escolaridade" do papel sem virar formulário gigante.

### 2. Nova aba "Ficha Clínica" (entre "Dados Pessoais" e "Prontuário")
Tudo que é informação clínica/escolar/rede de apoio do paciente — preenchida na abertura e revisada quando muda. Estrutura em blocos colapsáveis para não intimidar:

**Bloco A — Atendimento na clínica**
- Data de abertura (auto = created_at, editável)
- Especialidades de interesse (multi-check): Psicologia, Neuropsicologia, Psicopedagogia, Psicomotricidade, Atendimento Pedagógico, Fonoaudiologia, T.O. *(reaproveita a lista de serviços ativos da clínica)*
- Queixa inicial / motivo da procura (textarea curto)

**Bloco B — Saúde**
- Limitações (multi-check): Cognitiva, Locomoção, Visão, Audição, Outras + campo livre
- Alergias (texto curto)
- Medicação em uso (texto curto) *— acréscimo nosso, pediátrico padrão*
- Diagnósticos / hipótese diagnóstica (texto curto) *— acréscimo nosso*

**Bloco C — Médicos / rede externa**
- Lista dinâmica "Adicionar profissional": nome, especialidade, contato. Até 5 linhas.

**Bloco D — Escola (detalhada)**
- Telefone da escola, turma, professor(a), coordenação, observações da escola.
- (Nível e nome já vêm de Dados Pessoais.)

**Bloco E — Segundo contato familiar**
- Nome, parentesco, celular, e-mail. Para casos de pais separados / cuidador adicional.

Tudo opcional. A aba mostra um indicador "Ficha preenchida 4/5 blocos" para incentivar completude sem bloquear.

## Por que assim e não tudo no cadastro

- **Quem cadastra** geralmente é a recepção (dados básicos rápidos). **Quem completa a ficha clínica** é o profissional na primeira sessão. Separar reflete o fluxo real.
- Mantém a tela inicial leve (~7 campos obrigatórios) e move o resto para uma aba dedicada que só aparece após salvar.
- Permite imprimir uma "Ficha do Paciente" idêntica ao modelo em papel (botão Imprimir na aba), preservando o documento que a clínica já usa.

## Modelo de dados

Nova tabela `paciente_ficha_clinica` (1-1 com `pacientes`) com colunas para todos os campos acima (jsonb para `medicos` e arrays para `especialidades_interesse` e `limitacoes`). Mantém `pacientes` enxuta e evita migration pesada na tabela principal.

Adicionar em `pacientes`: `responsavel2_nome`, `responsavel2_parentesco`, `responsavel2_celular`, `escolaridade_nivel`, `escola_nome` (5 colunas opcionais).

## Entregáveis

1. Migration: 5 colunas novas em `pacientes` + tabela `paciente_ficha_clinica` (RLS + grants).
2. `src/lib/pacientes.ts`: tipos atualizados.
3. `src/lib/ficha-clinica.ts` (novo): get/upsert da ficha.
4. `PacienteForm.tsx`: nova seção "Responsável adicional" e "Escolaridade (resumo)" em Dados Pessoais; nova aba `FichaClinicaTab`.
5. `src/components/gestao/prontuario/FichaClinicaTab.tsx` (novo) com os 5 blocos colapsáveis e botão "Imprimir ficha" (replica o layout do PDF do modelo).

## Pontos para você decidir

- **Especialidades de interesse**: puxar da tabela `servicos` (dinâmico, reflete o que a clínica oferece hoje) ou lista fixa como no papel? Recomendo puxar de `servicos`.
- **2º responsável**: você quer no cadastro básico (recepção preenche) ou só na Ficha Clínica? Recomendo no básico — é informação de contato, não clínica.
- **Médicos externos**: limite de 5 está bom, ou prefere ilimitado?
