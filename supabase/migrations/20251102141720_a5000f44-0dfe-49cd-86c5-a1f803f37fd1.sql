-- Add Meditations category
INSERT INTO categories (name, description)
SELECT 'MEDITATIONS', 'Guided meditations to deepen your practice and connect with stillness.'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'MEDITATIONS'
);