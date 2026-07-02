-- ===========================================================================
-- SUPABASE_MIGRATION_HOME_DEPOIMENTOS.sql
-- Converte a seção fixa Testimonials (Home) em uma seção editável do CMS,
-- template "depoimentos". Idempotente.
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
       AND tipo = 'depoimentos'
  ) THEN
    RAISE NOTICE 'Seção depoimentos já existe na Home — pulando.';
    RETURN;
  END IF;

  SELECT COALESCE(MAX("order"), 0) + 1
    INTO v_next_order
    FROM public.site_secoes
   WHERE pagina_id = v_home_id;

  INSERT INTO public.site_secoes
    (pagina_id, tipo, eyebrow, titulo, descricao, bg_style, "order", enabled, dados)
  VALUES (
    v_home_id,
    'depoimentos',
    'Depoimentos',
    'Cada evolução conta uma história',
    'Histórias reais de famílias que encontraram apoio e transformação',
    'branco',
    v_next_order,
    true,
    jsonb_build_object(
      'layout', 'grade',
      'colunas', 3,
      'mostrar_estrelas', true,
      'mostrar_fonte', true
    )
  );
END $$;
