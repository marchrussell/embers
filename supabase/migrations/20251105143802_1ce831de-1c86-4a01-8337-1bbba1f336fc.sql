-- Update the handle_new_user function to automatically assign mentorship roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  mentorship_role text;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Check if user signed up with a mentorship program type
  mentorship_role := NEW.raw_user_meta_data->>'mentorship_program_type';
  
  -- Assign the appropriate mentorship role if program type exists
  IF mentorship_role = 'guided' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'mentorship_guided');
  ELSIF mentorship_role = 'diy' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'mentorship_diy');
  END IF;
  
  RETURN NEW;
END;
$function$;