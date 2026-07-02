-- ===========================================================================
-- SUPABASE_MIGRATION_HOME_WHENTOSEEKHELP.sql
-- Converte a seção fixa WhenToSeekHelp (Home) em uma seção editável do CMS
-- (template grade-cards). Idempotente: só insere se ainda não existir uma
-- seção grade-cards com o mesmo título na página Home.
-- ===========================================================================

DO $$
DECLARE
  v_home_id uuid;
  v_secao_id uuid;
  v_min_order int;
  v_titulo text := 'Você sente que algo mudou, mas não sabe ao certo o quê?';
BEGIN
  SELECT id INTO v_home_id FROM public.site_paginas WHERE slug = 'home' LIMIT 1;
  IF v_home_id IS NULL THEN
    RAISE NOTICE 'Página home não encontrada — pulando seed.';
    RETURN;
  END IF;

  -- Guarda contra duplicação
  IF EXISTS (
    SELECT 1 FROM public.site_secoes
     WHERE pagina_id = v_home_id
       AND tipo = 'grade-cards'
       AND titulo = v_titulo
  ) THEN
    RAISE NOTICE 'Seção "%" já existe na Home — pulando.', v_titulo;
    RETURN;
  END IF;

  -- Posiciona no início do bloco de seções dinâmicas
  SELECT COALESCE(MIN("order"), 1) - 1
    INTO v_min_order
    FROM public.site_secoes
   WHERE pagina_id = v_home_id;

  INSERT INTO public.site_secoes
    (pagina_id, tipo, eyebrow, titulo, descricao, imagem_url, bg_style, "order", enabled)
  VALUES (
    v_home_id,
    'grade-cards',
    'Atenção aos sinais',
    v_titulo,
    E'Esse instinto que você tem — de que seu filho não está bem, mas é difícil colocar em palavras — merece ser levado a sério. Ansiedade, desmotivação, dificuldades de aprendizagem ou mudanças de comportamento são formas que a criança tem de pedir ajuda.\n\nReconhecer isso já é o primeiro passo. O segundo é saber que existe suporte especializado para caminhar junto com você e seu filho.',
    'https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/a73015a67_ChatGPT_Image_6_de_jan_de_2026__20_11_53.png',
    'branco',
    v_min_order,
    true
  )
  RETURNING id INTO v_secao_id;

  INSERT INTO public.site_secao_itens (secao_id, titulo, descricao, icone, "order")
  VALUES
    (v_secao_id, 'Dificuldades de aprendizagem', NULL, 'BookOpen', 1),
    (v_secao_id, 'Ansiedade e medos',            NULL, 'Heart',    2),
    (v_secao_id, 'Problemas de comportamento',   NULL, 'Brain',    3),
    (v_secao_id, 'Desmotivação escolar',         NULL, 'TrendingDown', 4);
END $$;