# Novo modelo de contrato — Estação Aprender

## Resumo do que muda
O modelo atual é um texto único com 6 cláusulas genéricas. O contrato real tem estrutura mais rica:

- **Partes**: nome / CPF / RG / endereço do responsável + nome do beneficiário (paciente).
- **Pagamento**: quantidade de aulas mensais, valor com desconto (pacote) e sem desconto (avulso), modalidade escolhida, forma de pagamento (pix/transferência/boleto/débito = desconto; cartão = +R$10/aula), dia de vencimento.
- **Cláusulas fixas** (texto padronizado): objeto, desistência, férias/recesso, faltas e reagendamentos.
- **Página de assinatura**: cidade + data + nome do responsável.
- **Anexo separado**: Autorização de Uso de Imagem (autoriza / não autoriza), assinada à parte.

Decisões já tomadas: armazenamento **híbrido** (colunas tipadas para o que importa em listagem/relatório + JSONB para o resto) e **geração de PDF visual** no sistema (cabeçalho, rodapé com contato/endereço, página de assinatura e anexo de autorização de imagem).

## O que vai ser feito

### 1. Banco (migration nova)
Acrescentar à tabela `contratos`:

- `modalidade` text — `"pacote_mensal" | "avulso"`
- `aulas_por_mes` int — ex.: 4
- `valor_com_desconto_centavos` int — preço por aula no pacote
- `valor_sem_desconto_centavos` int — preço por aula avulso
- `forma_pagamento` text — `"pix" | "transferencia" | "boleto" | "debito" | "cartao_credito"`
- `dia_vencimento` int — 1–28
- `cidade_assinatura` text default `'São Paulo'`
- `dados_responsavel` jsonb — `{ nome, cpf, rg, endereco }`
- `autoriza_imagem` bool nullable — null = não preencheu ainda
- `observacoes` text nullable

(Campos antigos `valor_centavos`, `qtd_sessoes`, `frequencia`, `data_inicio`, `data_termino` continuam — `valor_centavos` passa a ser “valor mensal do pacote” calculado.)

Migration roda no Supabase próprio do projeto (`iscgrqldjytzhhvtgcmy`), portanto será fornecida como SQL para você executar manualmente no SQL Editor (mesma forma que o `updated_at` foi tratado).

### 2. `src/lib/contratos.ts`
- Adicionar os novos tipos (`Modalidade`, `FormaPagamento`, `DadosResponsavel`).
- Substituir `TEMPLATE_PADRAO` pelo texto do contrato real (5 seções: Partes, Objeto, Pagamento, Desistência, Férias/Recesso, Faltas/Atrasos/Reagendamentos) com placeholders `{{...}}`.
- Adicionar `TEMPLATE_AUTORIZACAO_IMAGEM` (texto da página de autorização).
- Função `montarVariaveis(contrato)` centralizando substituição.
- Helper `calcularValorMensal(aulas, valorPorAula, formaPagamento)` que aplica +R$10 para cartão.

### 3. Formulário (`ContratoFormDialog.tsx`)
Reorganizar em seções com o `Tabs` (UI já presente no projeto) ou blocos visuais:

- **Partes**: paciente (já existe) + bloco “Dados do responsável” (nome, CPF, RG, endereço). Pré-preencher a partir do `responsaveis` do paciente quando existir.
- **Serviço & Modalidade**: profissional, serviço, modalidade (radio: Pacote Mensal / Avulso), aulas por mês, dia de vencimento, forma de pagamento.
- **Valores**: valor por aula (com desconto) e valor por aula (sem desconto) — pré-preenchidos a partir do serviço, editáveis. Mostra preview do valor mensal calculado (com regra do cartão).
- **Período**: data início, data término, status.
- **Autorização de imagem**: switch “Autoriza uso de imagem em mídias sociais”.
- **Termos**: textarea com o template aplicado (igual hoje, mas com o template novo).

### 4. Geração de PDF (`ContratoView.tsx`)
Substituir o `handleDownloadPdf` atual (texto puro) por um PDF estruturado com `jsPDF`:

- **Cabeçalho** em todas as páginas: logo + nome “Estação Aprender” + subtítulo (Psicopedagogia, Psicomotricidade, etc.).
- **Rodapé** em todas as páginas: telefones, @estacaoaprender_, endereço (Praça Gajé n° 56 – Conj. 1 – Engenheiro Goulart).
- **Páginas 1–3**: texto do contrato renderizado a partir dos termos (já com variáveis substituídas), com numeração de seção em negrito.
- **Página de assinatura**: “Eu, [nome], CPF [cpf], responsável por [paciente] li e concordo… São Paulo, [data]. ____ Responsável”.
- **Anexo (página separada)**: Autorização de Uso de Imagem, com checkboxes marcados conforme `autoriza_imagem` e linha de assinatura.

Mantém os botões existentes (Imprimir, WhatsApp, Anexar/Ver PDF assinado).

### 5. Detalhes que NÃO mudam
- Fluxo de upload do PDF assinado (rota proxy `/api/public/file-proxy/...`) e bucket `contratos-assinados` ficam exatamente como estão.
- Tabela `contratos`, RLS, integrações com Financeiro/Pacientes.

## Arquivos tocados
- `supabase/migrations/<nova>.sql` (e SQL espelhado para o Supabase externo)
- `src/lib/contratos.ts` — tipos + templates novos + helpers
- `src/components/gestao/contratos/ContratoFormDialog.tsx` — novos campos
- `src/components/gestao/contratos/ContratoView.tsx` — gerador de PDF visual

## Pontos em aberto / suposições
- A logo no PDF: usarei o SVG já presente em `src/assets/logo-estacao-aprender.svg.asset.json`. Se preferir outra imagem (a do PDF é mais elaborada), me avise.
- Vou manter o campo livre `termos` (editável) — útil quando precisar de cláusula especial num contrato pontual sem mudar o template global.
- Migração de contratos existentes: os contratos atuais continuam funcionando; novos campos ficam `null` neles e o PDF cai num modo “simples” (sem dados do responsável estruturados) se o usuário não editar.
