-- ===========================================================================
-- SUPABASE_MIGRATION_HOME_EQUIPE.sql
-- Converte a seção fixa TeamSection (Home) em uma seção editável do CMS,
-- template "equipe". Idempotente: só insere se ainda não existir uma seção
-- tipo 'equipe' na página Home.
-- ===========================================================================

DO $$
DECLARE
  v_home_id uuid;
  v_next_order int;
BEGIN
  SELECT id INTO v_home_id FROM public.site_paginas WHERE slug = 'home' LIMIT 1;
  IF v_home_id IS NULL THEN
    RAISE NOTICE 'Página home não encontrada — pulando seed.';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.site_secoes
     WHERE pagina_id = v_home_id
       AND tipo = 'equipe'
  ) THEN
    RAISE NOTICE 'Seção equipe já existe na Home — pulando.';
    RETURN;
  END IF;

  -- Posiciona ao final do bloco de seções dinâmicas (antes ficava depois
  -- das seções dinâmicas, entre elas e Depoimentos).
  SELECT COALESCE(MAX("order"), 0) + 1
    INTO v_next_order
    FROM public.site_secoes
   WHERE pagina_id = v_home_id;

  INSERT INTO public.site_secoes
    (pagina_id, tipo, eyebrow, titulo, descricao, bg_style, "order", enabled, dados)
  VALUES (
    v_home_id,
    'equipe',
    'Nossa equipe',
    'Profissionais especializados para o seu filho',
    'Cada profissional com dedicação específica ao desenvolvimento de crianças e adolescentes',
    'branco',
    v_next_order,
    true,
    jsonb_build_object(
      'colunas', 3,
      'mostrar_especialidades', true,
      'mostrar_registro', true
    )
  );
END $$;