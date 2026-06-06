# Plano — Página /Convenio

Nova rota com paleta cyan/blue (única no site), formulário interativo e barra de aviso amber.

## Arquivos a criar

- `src/components/site/sections/convenio/ConvenioBanner.tsx` — banner cyan/blue com blob, eyebrow "Plano de saúde", H1 e parágrafo
- `src/components/site/sections/convenio/AmberNotice.tsx` — faixa amber com prazo 15+ dias e link WhatsApp particular
- `src/components/site/sections/convenio/ConvenioFlow.tsx` — coluna esquerda: 3 steps numerados (gradient cyan→blue), card "Convênios aceitos" com 7 badges, card rose "Não quer esperar?"
- `src/components/site/sections/convenio/ConvenioForm.tsx` — coluna direita: Card com formulário controlado (useState), Select × 2, Textarea, Checkbox LGPD, submit cyan→blue. Submit abre WhatsApp com a mensagem formatada e navega para `/ConvenioObrigado`. Botão desabilitado até `consentimento === true`.
- `src/routes/Convenio.tsx` — rota `/Convenio` montando Banner → AmberNotice → grid 2 colunas (Flow | Form). `head()` com title/description/og próprios.
- `src/routes/ConvenioObrigado.tsx` — rota `/ConvenioObrigado` simples com mensagem de agradecimento e link para Home/WhatsApp.

## Dependências shadcn

Verificar/garantir presença de `select`, `checkbox`, `textarea`, `input`, `label`, `card`, `button`, `badge` em `src/components/ui/`. Instalar via shadcn apenas os ausentes.

## Header

Adicionar link "Convênio" no `Header.tsx` apontando para `/Convenio` (mantendo ordem do menu atual).

## Detalhes técnicos

- WhatsApp números: links "particular" usam `5511966654857` (conforme prompt). Todos os `<a>` para wa.me recebem `id="whatsapp_start"`. Botão submit recebe `id="negativar"`.
- Formulário: estado único `formData`, handlers controlados; submit faz `e.preventDefault()`, monta mensagem, `window.open(wa.me/..., '_blank')`, depois `navigate({ to: '/ConvenioObrigado' })`.
- Cores: usar classes Tailwind cyan/blue diretamente (paleta exclusiva desta página, fora do design token rose padrão).
- Animações fade-in via `FadeUp` existente.
- SEO: title "Atendimento por Convênio — IDE Psicologia Morumbi", description sobre validação de plano.

## Checklist coberto

Banner cyan, blob, barra amber, 3 steps, 7 badges de convênios, card rose CTA, formulário completo com Select/Checkbox/Textarea, submit cyan + id="negativar", desabilitado até LGPD, ids whatsapp_start, Header/Footer/FAB reaproveitados.
