-- Fase: transforma /Servicos em GRADE DE CARDS puxando site_servicos
-- Aditivo e idempotente.

-- ícone para o fallback sem foto
alter table public.site_servicos add column if not exists icone text;

-- seed dos 4 serviços (só se a tabela estiver vazia)
insert into public.site_servicos (titulo, descricao, icone, link, "order", enabled)
select * from (values
  ('Psicoterapia','Foco no desenvolvimento emocional, comportamental e social, por faixa etária.','Brain','/Servicos?servico=psicoterapia',1,true),
  ('Avaliação Neuropsicológica','Atenção, memória, funções executivas e aprendizagem, com laudo detalhado.','ClipboardList','/Servicos?servico=neuropsicologia',2,true),
  ('Fonoaudiologia','Linguagem, fala, voz, fluência e comunicação oral e escrita.','MessageCircle','/Servicos?servico=fonoaudiologia',3,true),
  ('Psicopedagogia','Intervenção nas dificuldades de aprendizagem, com estratégias personalizadas.','GraduationCap','/Servicos?servico=psicopedagogia',4,true)
) as t(titulo,descricao,icone,link,"order",enabled)
where not exists (select 1 from public.site_servicos);

-- adiciona a seção "servicos-cards" na página Serviços (idempotente)
insert into public.site_secoes (pagina_id, tipo, eyebrow, titulo, descricao, "order", enabled)
select p.id, 'servicos-cards', 'Especialidades', 'Tratamentos para cada necessidade',
       'Reunimos diferentes áreas para cuidar do desenvolvimento de crianças e adolescentes.', 1, true
from public.site_paginas p
where p.slug = 'servicos'
  and not exists (select 1 from public.site_secoes s where s.pagina_id = p.id and s.tipo = 'servicos-cards');

-- desativa o accordion antigo (reversível: é só religar)
update public.site_secoes s set enabled = false
from public.site_paginas p
where s.pagina_id = p.id and p.slug = 'servicos' and s.tipo = 'accordion';