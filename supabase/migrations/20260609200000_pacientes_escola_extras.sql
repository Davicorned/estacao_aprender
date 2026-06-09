-- Campos opcionais de contato escolar no cadastro básico do paciente.
alter table public.pacientes
  add column if not exists escola_turma text,
  add column if not exists escola_professor text,
  add column if not exists escola_coordenacao text;
