-- Add mentorship_started_at field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mentorship_started_at timestamp with time zone;

-- Add is_bonus field to modules to distinguish bonus modules (6+)
ALTER TABLE mentorship_modules ADD COLUMN IF NOT EXISTS is_bonus boolean DEFAULT false;

-- Update existing modules 1-5 as core, mark others as bonus if any exist
UPDATE mentorship_modules SET is_bonus = false WHERE order_index <= 4;
UPDATE mentorship_modules SET is_bonus = true WHERE order_index > 4;