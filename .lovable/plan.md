# Redesign do PDF do contrato

Hoje o PDF é montado com `jsPDF` "puro": faixa laranja retangular + texto helvetica. O modelo original tem logotipo (borboleta + "estação aprender" em script), um blob laranja com curva orgânica no topo, e um rodapé com ícones (telefone, Instagram, localização). Vamos reproduzir isso.

## Abordagem

Trocar a geração "linha por linha" do jsPDF por **render HTML → imagem → PDF** usando `html2canvas` + `jsPDF`. Isso permite reproduzir fielmente o blob laranja, a tipografia e o rodapé com ícones via HTML/CSS, sem precisar desenhar curvas Bézier manualmente.

Por que essa abordagem:
- Logo SVG é renderizado nativamente pelo browser (fiel ao original).
- Blob laranja vira `border-radius` + `clip-path` ou um SVG inline — controle visual total.
- Tipografia, espaçamentos e ícones (lucide ou inline SVG) funcionam direto do CSS.
- Cada "página" é um `<section>` A4 capturado separadamente e adicionado ao PDF.

## Passos

1. **Dependência**
   - `bun add html2canvas` (jspdf já está instalado).

2. **Componente de template (offscreen)** — `src/components/gestao/contratos/ContratoPdfTemplate.tsx`
   - Container fixo `210mm × 297mm`, posicionado fora da tela (`position: fixed; left: -10000px`) para o html2canvas conseguir capturar.
   - Header: SVG inline com o blob laranja orgânico + `<img src={logoAsset.url} />` à esquerda + bloco de especialidades à direita ("Psicopedagogia · Psicomotricidade · Psicologia · Neuropsicologia · Alfabetização · Educação Neuroparental").
   - Body: parágrafos do contrato com a mesma heurística atual (títulos numerados em negrito).
   - Footer fixo no rodapé de cada página: linha laranja + ícones (telefone, Instagram, pin de localização) + textos `(11) 2621-9800 · (11) 9 3213-9800`, `@estacaoaprender_`, `Praça Gajé n° 56 — Conj. 1, Engenheiro Goulart`.
   - Páginas: corpo do contrato → página de assinatura → anexo de autorização de imagem (mesma estrutura atual).

3. **Paginação inteligente**
   - Dividir o texto em blocos (parágrafos) e empilhá-los em `<section className="page">`; quebrar para nova página quando o conteúdo passar da altura útil (medido via `offsetHeight`).
   - Alternativa mais simples (recomendada no primeiro corte): renderizar tudo numa coluna A4 com `page-break-inside: avoid` por parágrafo e deixar o `html2canvas` capturar uma imagem alta; depois fatiar em páginas A4 no `jspdf` (`addImage` com `y` offset negativo por página). Este é o padrão "html2pdf".

4. **Refatorar `ContratoView.handleDownloadPdf`**
   - Montar `vars` (mesma função `montarVariaveis` já existente).
   - Renderizar o template offscreen (state booleano + ref).
   - Aguardar fontes (`document.fonts.ready`) e a `<img>` do logo (`onload`).
   - `html2canvas(ref, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })` → `addImage` no jsPDF fatiando por página A4.
   - `doc.save(...)` com o nome atual.

5. **Fontes**
   - Para se aproximar do original (script no logo + sans no corpo), usar:
     - Logo: imagem (já tem o script desenhado).
     - Corpo: `Inter` ou `Manrope` via Google Fonts (já carregados? confirmar `index.html`); fallback `system-ui`.
   - Sem necessidade de embed de fonte no jsPDF — o rasterizador resolve.

6. **Ajustes finais**
   - Manter `aplicarTemplate(contrato.termos, vars)` para o corpo.
   - Manter páginas de assinatura e autorização de imagem como `<section>` separadas (cada uma com header/footer próprios).
   - Marca d'água/numeração `1 / N` no rodapé direito.

## Arquivos afetados

- `package.json` / lockfile — adicionar `html2canvas`.
- `src/components/gestao/contratos/ContratoPdfTemplate.tsx` (novo) — JSX do contrato pronto para renderização.
- `src/components/gestao/contratos/ContratoView.tsx` — substituir `handleDownloadPdf` pela versão html2canvas + jsPDF; montar o template offscreen via ref.

## Fora do escopo

- Texto/cláusulas do contrato (já estão corretas).
- Schema do banco e formulário (sem mudanças).
- Visual do diálogo na tela (somente o PDF baixado muda).

## Riscos

- `html2canvas` aumenta um pouco o tamanho do bundle (~50 KB gz) — aceitável.
- Renderização do logo SVG remoto: garantir `crossOrigin="anonymous"` na `<img>` e `useCORS: true` no html2canvas; o CDN da Lovable já envia CORS permissivo.
- Tempo de geração sobe de instantâneo para ~1-2 s — adicionar um spinner no botão "Baixar PDF".
