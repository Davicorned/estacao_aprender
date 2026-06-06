# Plano — Páginas internas IDE Psicologia (/QuemSomos, /Servicos, /Atendimento, /Contato)

Vou adicionar as 4 rotas faltantes mantendo o Header, Footer e WhatsAppFloat já criados. Reutilizo os componentes existentes (`FadeUp`, `Header`, `Footer`, `WhatsAppFloat`, e a seção `Contact` da home no `/Contato`).

## Arquivos a criar

```
src/components/site/PageBanner.tsx        → banner interno reutilizável (eyebrow + h1 + p + slot opcional)
src/components/site/CTABanner.tsx         → faixa rose-500→pink-500 com h2/p/botão branco
src/components/site/sections/quemsomos/   → OurStory, OurValues, Founder
src/components/site/sections/servicos/    → ServicesAccordion
src/components/site/sections/atendimento/ → Modalities, ProcessSteps, SchedulingTimes
src/components/site/sections/contato/     → QuickChoiceCards (reusa Contact existente p/ info+mapa)

src/routes/QuemSomos.tsx
src/routes/Servicos.tsx
src/routes/Atendimento.tsx
src/routes/Contato.tsx
```

## Conteúdo (verbatim do spec)
Todos os textos, números de WhatsApp, URLs de imagem, ícones lucide e classes Tailwind seguem exatamente o spec — incluindo o detalhe dos **dois números** (geral `5511966654857`, página /Atendimento `5511982556501`).

## Detalhes-chave por página

**/QuemSomos**
- `PageBanner` (eyebrow "Sobre nós" + título + subtítulo)
- `OurStory`: grid 2 col texto+imagem (usa logo como placeholder à direita)
- `OurValues`: bg-gray-50, 4 cards (Heart/Award/Users/Shield) em gradient rose-100→pink-100
- `Founder`: foto circular Dra Karine (sem grid de stats — estava vazio no DOM)
- `CTABanner` "Vamos cuidar da sua família juntos?"

**/Servicos**
- `PageBanner` com slot extra: botão WhatsApp gradient + pill "Particular em até 24h" (CheckCircle2)
- `ServicesAccordion`: shadcn `Accordion type="single" collapsible` com 4 itens (Brain, ClipboardList, MessageCircle, GraduationCap) e descrições do spec
- CTA final bg-gray-50 "Não sabe qual serviço…" + botão gradient

**/Atendimento**
- `PageBanner` ("Como funciona" / "Atendimento")
- `Modalities`: 2 cards — Presencial (faixa rose, ícone Building2/MapPin) e Online (faixa cyan, ícone Video/Monitor) com listas de 4 bullets cada (CheckCircle2)
- `ProcessSteps`: 4 cards numerados (MessageSquare, Calendar, Stethoscope/ClipboardCheck, FileText), conectores `hidden lg:block` em rose-200
- `SchedulingTimes`: 2 cards — Particular (destaque, badge "Mais Rápido", Zap, "Até 24h") e Convênio (Clock, "15+ dias")
- `CTABanner` "Pronto para dar o primeiro passo?" — usa número 5511982556501

**/Contato**
- `PageBanner` ("Fale conosco" / "Contato")
- `QuickChoiceCards`: 2 cards no topo (Particular verde com Phone + badge "Até 24h"; Convênio cyan com Shield + badge outline "15+ dias")
- Reusa o componente `Contact` existente (4 itens info + mapa) — sem refazer

## Ajustes adicionais
- `Header.tsx` e `Footer.tsx`: links já apontam para `/QuemSomos`, `/Servicos`, etc. — agora as rotas existem, sem mudanças necessárias.
- `src/routes/index.tsx`: continua renderizando o conteúdo de Particular (home = página principal).
- Cada rota terá `head()` próprio com title/description/og:title/og:description únicos (sem og:image, conforme regras — só leaf com imagem própria; manteremos imagem só na home/Particular).
- `/Convenio` referenciado em alguns botões/footer permanece como `<a href>` simples sem rota (404 graceful), pois não foi especificado.

Pronto para implementar quando aprovado.