-- Add new column for array of program types
ALTER TABLE mentorship_modules 
ADD COLUMN program_types text[] DEFAULT ARRAY['diy'];

-- Migrate existing data from program_type to program_types
UPDATE mentorship_modules 
SET program_types = ARRAY[program_type]
WHERE program_type IS NOT NULL;

-- Drop the old column
ALTER TABLE mentorship_modules 
DROP COLUMN program_type;

-- Rename new column to match original name
ALTER TABLE mentorship_modules 
RENAME COLUMN program_types TO program_type;