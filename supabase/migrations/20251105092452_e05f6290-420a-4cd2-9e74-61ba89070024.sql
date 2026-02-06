-- Add test_user role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'test_user';