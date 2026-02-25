
-- Assign admin role to both users
INSERT INTO public.user_roles (user_id, role) VALUES 
  ('e85f3437-5ba6-43d7-af62-bb2219f692a6', 'admin'),
  ('cc565e1b-7748-42b7-85c4-267830a649b7', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure profiles exist
INSERT INTO public.profiles (user_id, full_name) VALUES 
  ('e85f3437-5ba6-43d7-af62-bb2219f692a6', 'Admin Ecoland'),
  ('cc565e1b-7748-42b7-85c4-267830a649b7', 'Ecoland Valladolid')
ON CONFLICT DO NOTHING;

-- Create the trigger that was missing
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
