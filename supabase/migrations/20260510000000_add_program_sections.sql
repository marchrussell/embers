CREATE TABLE program_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classes ADD COLUMN program_section_id UUID REFERENCES program_sections(id) ON DELETE SET NULL;

ALTER TABLE public.classes DROP CONSTRAINT classes_program_id_fkey;
ALTER TABLE public.classes
  ADD CONSTRAINT classes_program_id_fkey
  FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE SET NULL;
