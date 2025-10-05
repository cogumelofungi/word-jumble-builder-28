-- Add full_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN full_name text;

-- Update the handle_new_user function to include full_name from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Create user_status with phone from metadata
  INSERT INTO public.user_status (user_id, is_active, plan_id, phone)
  VALUES (NEW.id, true, NULL, NEW.raw_user_meta_data ->> 'phone');
  
  RETURN NEW;
END;
$$;