# Atualizar idealizadora — Erica Cornedi

Trocar os dados da seção `Founder` em `/QuemSomos`:

- Upload da foto via `lovable-assets` → `src/assets/founder-erica.png.asset.json`.
- Atualizar `src/components/site/sections/quemsomos/Founder.tsx`:
  - Nome: **Erica Roberta Alves da Silva Cornedi**
  - Subtítulo: substituir "Neuropsicóloga pelo Albert Einstein" por linha de especialidades:
    **Psicopedagoga · Psicomotricidade · Orientação Parental**
  - `FOUNDER_IMG` aponta para a nova URL do asset, `alt` atualizado.
  - A imagem enviada já contém ilustrações decorativas (passarinho, nuvens, selo "+10 anos"); por isso vou remover o frame `rounded-full + ring` para não cortar o desenho, usando um wrapper quadrado com `object-contain` que preserva o PNG inteiro.

Nada mais é alterado.
