-- Notify PostgREST to reload schema cache
-- This is needed after dropping constraints for the API to recognize the changes
NOTIFY pgrst, 'reload schema';