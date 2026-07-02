-- ===========================================================================
-- SUPABASE_MIGRATION_HOME_ABORDAGEM_CONTATO.sql
-- Converte OurApproach → texto-imagem-direita e Contact → contato-mapa
-- na página Home. Idempotente (guarda por tipo + título por página).
-- ===========================================================================

DO $$
DECLARE
  v_home_id uuid;
  v_min_order int;
  v_max_order int;
  v_titulo_abordagem text := 'Apoio especializado para o desenvolvimento infantojuvenil';
  v_titulo_contato text := 'Entre em contato';
BEGIN
  SELECT id INTO v_home_id FROM public.site_paginas WHERE slug = 'home' LIMIT 1;
  IF v_home_id IS NULL THEN
    RAISE NOTICE 'Página home não encontrada — pulando seed.';
    RETURN;
  END IF;

  SELECT COALESCE(MIN("order"), 1) - 1,
         COALESCE(MAX("order"), 0) + 1
    INTO v_min_order, v_max_order
    FROM public.site_secoes
   WHERE pagina_id = v_home_id;

  -- A) Nossa abordagem (texto-imagem-direita)
  IF NOT EXISTS (
    SELECT 1 FROM public.site_secoes
     WHERE pagina_id = v_home_id
       AND tipo = 'texto-imagem-direita'
       AND titulo = v_titulo_abordagem
  ) THEN
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, descricao, imagem_url,
       cta_texto, cta_link, bg_style, "order", enabled)
    VALUES (
      v_home_id,
      'texto-imagem-direita',
      'Nossa abordagem',
      v_titulo_abordagem,
      E'No Estação Aprender, oferecemos um atendimento especializado para crianças e suas famílias, proporcionando suporte emocional e terapêutico de forma personalizada. Com técnicas adaptadas à demanda de cada paciente, idade, contexto familiar e escolar.\n\nNossos profissionais atuam para estimular o desenvolvimento infantil de maneira eficaz. Através de intervenções assertivas e diagnósticos precisos, ajudamos a identificar e tratar dificuldades emocionais, comportamentais e de aprendizagem.',
      'https://media.base44.com/images/public/6953b58ae89e14e21e4d4c20/89a88ba32_WhatsApp_Image_2023-12-09_at_002649.jpeg',
      'Agende um atendimento!',
      'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20atendimento%20no%20Esta%C3%A7%C3%A3o%20Aprender.',
      'branco',
      v_min_order,
      true
    );
  ELSE
    RAISE NOTICE 'Seção abordagem já existe — pulando.';
  END IF;

  -- B) Contato + Mapa (contato-mapa)
  IF NOT EXISTS (
    SELECT 1 FROM public.site_secoes
     WHERE pagina_id = v_home_id
       AND tipo = 'contato-mapa'
       AND titulo = v_titulo_contato
  ) THEN
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, descricao, dados, bg_style, "order", enabled)
    VALUES (
      v_home_id,
      'contato-mapa',
      'Contato',
      v_titulo_contato,
      'Estamos prontos para ajudar você e sua família',
      jsonb_build_object(
        'telefone', '(11) 93213-9815',
        'telefone_link', 'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.',
        'email', 'contato@estacaoaprender.com.br',
        'endereco_titulo', 'Unidade Engenheiro Goulart',
        'endereco_texto', 'Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040',
        'horarios', jsonb_build_array('Segunda a Sexta: 8h às 20h', 'Sábado: 8h às 14h'),
        'mapa_embed_url', 'https://www.google.com/maps?q=Pra%C3%A7a%20Gaj%C3%A9%2C%2056%20-%20Eng.%20Goulart%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003725-040&output=embed'
      ),
      'branco',
      v_max_order,
      true
    );
  ELSE
    RAISE NOTICE 'Seção contato-mapa já existe — pulando.';
  END IF;
END $$;
