-- Insert missing profiles for users who exist in auth.users but not in profiles
INSERT INTO public.profiles (user_id, email, full_name)
SELECT 
  id as user_id,
  email,
  raw_user_meta_data ->> 'full_name' as full_name
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);