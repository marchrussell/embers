-- Add safety note and show safety reminder columns to classes table
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS safety_note TEXT,
ADD COLUMN IF NOT EXISTS show_safety_reminder BOOLEAN DEFAULT false;