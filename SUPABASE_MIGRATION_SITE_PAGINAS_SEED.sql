-- =========================================================================
-- SUPABASE_MIGRATION_SITE_PAGINAS_SEED.sql
-- Seeds the CMS pages "quem-somos", "servicos", "atendimento" e "contato"
-- com as seções equivalentes ao conteúdo hardcoded das rotas legadas.
--
-- Idempotente: cada bloco só insere seções se a página ainda não tem nenhuma.
-- Requer migrations: SITE_TEMA, SITE_PAGINAS, SITE_TEMPLATES já executadas.
-- =========================================================================

-- 1) Garante as 4 páginas (com banner default igual ao das rotas legadas).
INSERT INTO public.site_paginas (slug, titulo, "order", banner_eyebrow, banner_titulo, banner_descricao)
VALUES
  ('quem-somos',  'Quem Somos',  1, 'Sobre nós',     'Cuidamos de cada fase do desenvolvimento do seu filho', 'Com um olhar integrado, entendemos as necessidades do seu filho e direcionamos caminhos para o seu desenvolvimento.'),
  ('servicos',    'Serviços',    2, 'Especialidades','Serviços',     'Reunimos diferentes especialidades para cuidar do desenvolvimento de crianças e adolescentes de forma personalizada.'),
  ('atendimento', 'Atendimento', 3, 'Como funciona', 'Atendimento',  'Conheça como funciona nosso processo de atendimento e escolha a modalidade que melhor se adapta às suas necessidades.'),
  ('contato',     'Contato',     4, 'Fale conosco',  'Contato',      'Estamos prontos para ajudar você e sua família. Entre em contato e agende sua consulta.')
ON CONFLICT (slug) DO NOTHING;

-- 2) Seed das seções por página (guarda: só se a página não tem nenhuma).
DO $seed$
DECLARE
  v_pid uuid;
  v_sid uuid;
  WA_AGENDAR text := 'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20no%20Esta%C3%A7%C3%A3o%20Aprender.';
  WA_FAMILIA text := 'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20mais%20sobre%20o%20Esta%C3%A7%C3%A3o%20Aprender.';
  WA_SERVICOS text := 'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20do%20Esta%C3%A7%C3%A3o%20Aprender.';
  WA_PARTICULAR text := 'https://wa.me/5511932139815?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20particular%20no%20Esta%C3%A7%C3%A3o%20Aprender.';
BEGIN
  ----------------------------------------------------------------- QUEM-SOMOS
  SELECT id INTO v_pid FROM public.site_paginas WHERE slug = 'quem-somos';
  IF v_pid IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.site_secoes WHERE pagina_id = v_pid) THEN

    -- 1. texto-imagem-direita (OurStory)
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, descricao, bg_style, "order", enabled)
    VALUES (v_pid, 'texto-imagem-direita', 'Nossa história', 'Nossa História',
      E'O Estação Aprender nasceu do sonho de criar um lugar onde crianças e adolescentes pudessem encontrar apoio especializado para seu desenvolvimento emocional e cognitivo, em um ambiente acolhedor e humanizado.\n\nAcreditamos que cada criança é única e merece um olhar individualizado. Por isso, reunimos profissionais de diferentes especialidades que trabalham de forma integrada, oferecendo uma abordagem completa e personalizada.\n\nNosso compromisso é promover não apenas o bem-estar da criança, mas também fortalecer os vínculos familiares, criando um ambiente propício para o crescimento saudável e feliz.',
      'branco', 1, true);

    -- 2. cards-icones (OurValues)
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, bg_style, "order", enabled)
    VALUES (v_pid, 'cards-icones', 'Nossos valores', 'O que nos guia',
      'branco', 2, true)
    RETURNING id INTO v_sid;
    INSERT INTO public.site_secao_itens (secao_id, titulo, descricao, icone, "order") VALUES
      (v_sid, 'Acolhimento',     'Ambiente acolhedor e seguro para crianças e famílias, onde cada pessoa se sente respeitada e compreendida.', 'Heart',  1),
      (v_sid, 'Excelência',      'Compromisso com a qualidade no atendimento, utilizando técnicas baseadas em evidências científicas.',        'Award',  2),
      (v_sid, 'Cuidado Integral','Abordagem multidisciplinar que considera todos os aspectos do desenvolvimento infantojuvenil.',              'Users',  3),
      (v_sid, 'Transparência',   'Comunicação clara e honesta com as famílias sobre o processo terapêutico e evolução.',                       'Shield', 4);

    -- 3. destaque-pessoa (Founder)
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, descricao, bg_style, "order", enabled)
    VALUES (v_pid, 'destaque-pessoa', 'Idealizadora',
      'Erica Roberta Alves da Silva Cornedi',
      'Psicopedagoga · Psicomotricidade · Orientação Parental',
      'branco', 3, true);

    -- 4. cta-banner
    INSERT INTO public.site_secoes
      (pagina_id, tipo, titulo, descricao, cta_texto, cta_link, bg_style, "order", enabled)
    VALUES (v_pid, 'cta-banner',
      'Vamos cuidar da sua família juntos?',
      'Estamos prontos para ajudar você e seu filho a superar desafios e construir uma vida mais feliz e saudável.',
      'Fale conosco', WA_FAMILIA, 'branco', 4, true);
  END IF;

  -------------------------------------------------------------------- SERVICOS
  SELECT id INTO v_pid FROM public.site_paginas WHERE slug = 'servicos';
  IF v_pid IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.site_secoes WHERE pagina_id = v_pid) THEN

    -- 1. accordion (ServicesAccordion)
    INSERT INTO public.site_secoes
      (pagina_id, tipo, bg_style, "order", enabled)
    VALUES (v_pid, 'accordion', 'branco', 1, true)
    RETURNING id INTO v_sid;
    INSERT INTO public.site_secao_itens (secao_id, titulo, descricao, icone, "order") VALUES
      (v_sid, 'Psicoterapia',              'Atendimento psicoterápico para crianças e adolescentes com foco em desenvolvimento emocional, comportamental e social. Abordagem personalizada por faixa etária.', 'Brain',          1),
      (v_sid, 'Avaliação Neuropsicológica','Avaliação completa do funcionamento cognitivo e comportamental, incluindo atenção, memória, funções executivas e aprendizagem. Laudo detalhado para escola e saúde.', 'ClipboardList',  2),
      (v_sid, 'Fonoaudiologia',            'Avaliação e tratamento de distúrbios de linguagem, fala, voz, fluência e comunicação oral e escrita. Atendimento para crianças e adolescentes.',              'MessageCircle',  3),
      (v_sid, 'Psicopedagogia',            'Avaliação e intervenção nas dificuldades de aprendizagem escolar. Identifica causas e desenvolve estratégias pedagógicas e terapêuticas personalizadas.',     'GraduationCap',  4);

    -- 2. cta-banner (final)
    INSERT INTO public.site_secoes
      (pagina_id, tipo, titulo, descricao, cta_texto, cta_link, bg_style, "order", enabled)
    VALUES (v_pid, 'cta-banner',
      'Não sabe qual serviço é ideal para seu filho?',
      'Entre em contato conosco para uma avaliação inicial. Nossa equipe irá orientar você sobre a melhor abordagem terapêutica.',
      'Falar com especialista', WA_SERVICOS, 'branco', 2, true);
  END IF;

  ----------------------------------------------------------------- ATENDIMENTO
  SELECT id INTO v_pid FROM public.site_paginas WHERE slug = 'atendimento';
  IF v_pid IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.site_secoes WHERE pagina_id = v_pid) THEN

    -- 1. modalidades (Modalities) → dados = DEFAULT_MODALIDADES
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, bg_style, "order", enabled, dados)
    VALUES (v_pid, 'modalidades', 'Modalidades',
      'Escolha a melhor opção para o seu filho(a)',
      'branco', 1, true,
      jsonb_build_object('cards', jsonb_build_array(
        jsonb_build_object(
          'titulo','Presencial',
          'descricao','Atendimento em nosso espaço físico, ambiente acolhedor e preparado especialmente para crianças e adolescentes.',
          'icone','MapPin',
          'cor','var(--site-primary)',
          'bullets', jsonb_build_array(
            'Ambiente lúdico e acolhedor',
            'Salas equipadas com materiais especializados',
            'Localização de fácil acesso',
            'Estacionamento disponível'
          ),
          'cta_texto','Agendar presencial',
          'cta_link', WA_AGENDAR
        ),
        jsonb_build_object(
          'titulo','Online',
          'descricao','Atendimento por videochamada com a mesma qualidade do presencial, no conforto da sua casa.',
          'icone','Video',
          'cor','#06b6d4',
          'bullets', jsonb_build_array(
            'Flexibilidade de horários',
            'Sem necessidade de deslocamento',
            'Ideal para quem mora longe',
            'Plataforma segura e privada'
          ),
          'cta_texto','Agendar online',
          'cta_link', WA_AGENDAR
        )
      ))
    );

    -- 2. passos-processo (ProcessSteps)
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, bg_style, "order", enabled)
    VALUES (v_pid, 'passos-processo', 'Processo', 'Etapas do primeiro atendimento',
      'gradiente', 2, true)
    RETURNING id INTO v_sid;
    INSERT INTO public.site_secao_itens (secao_id, titulo, descricao, icone, "order") VALUES
      (v_sid, 'Entre em contato',  'Fale conosco via WhatsApp ou formulário e conte um pouco sobre sua necessidade.',  'MessageSquare',   1),
      (v_sid, 'Agendamento',       'Nossa equipe irá agendar a consulta inicial no melhor horário para você.',         'Calendar',        2),
      (v_sid, 'Avaliação inicial', 'Na primeira consulta, realizamos uma avaliação completa para entender as necessidades.', 'ClipboardCheck', 3),
      (v_sid, 'Plano terapêutico', 'Desenvolvemos um plano personalizado com as melhores intervenções para o caso.',   'FileText',        4);

    -- 3. cta-banner
    INSERT INTO public.site_secoes
      (pagina_id, tipo, titulo, descricao, cta_texto, cta_link, bg_style, "order", enabled)
    VALUES (v_pid, 'cta-banner',
      'Pronto para dar o primeiro passo?',
      'Entre em contato agora e agende sua consulta.',
      'Agendar consulta', WA_AGENDAR, 'branco', 3, true);
  END IF;

  --------------------------------------------------------------------- CONTATO
  SELECT id INTO v_pid FROM public.site_paginas WHERE slug = 'contato';
  IF v_pid IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.site_secoes WHERE pagina_id = v_pid) THEN

    -- 1. cards-icones (QuickChoiceCards) — 1 card com link
    INSERT INTO public.site_secoes
      (pagina_id, tipo, bg_style, "order", enabled)
    VALUES (v_pid, 'cards-icones', 'branco', 1, true)
    RETURNING id INTO v_sid;
    INSERT INTO public.site_secao_itens (secao_id, titulo, descricao, icone, link, "order") VALUES
      (v_sid, 'Consulta Particular',
       'Atendimento rápido via WhatsApp. Agende sua consulta com nossa equipe.',
       'Phone', WA_PARTICULAR, 1);

    -- 2. contato-mapa (Contact) → dados = DEFAULT_CONTATO_MAPA
    INSERT INTO public.site_secoes
      (pagina_id, tipo, eyebrow, titulo, descricao, bg_style, "order", enabled, dados)
    VALUES (v_pid, 'contato-mapa', 'Contato', 'Entre em contato',
      'Estamos prontos para ajudar você e sua família',
      'branco', 2, true,
      jsonb_build_object(
        'telefone','(11) 93213-9815',
        'telefone_link', WA_AGENDAR,
        'email','contato@estacaoaprender.com.br',
        'endereco_titulo','Unidade Engenheiro Goulart',
        'endereco_texto','Praça Gajé, 56 - Eng. Goulart, São Paulo - SP, 03725-040',
        'horarios', jsonb_build_array('Segunda a Sexta: 8h às 20h', 'Sábado: 8h às 14h'),
        'mapa_embed_url','https://www.google.com/maps?q=Pra%C3%A7a%20Gaj%C3%A9%2C%2056%20-%20Eng.%20Goulart%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003725-040&output=embed'
      )
    );
  END IF;
END
$seed$;