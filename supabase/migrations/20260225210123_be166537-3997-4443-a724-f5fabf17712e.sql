
-- Drop FK constraints that reference auth.users so we can clean up
ALTER TABLE public.cash_sessions DROP CONSTRAINT IF EXISTS cash_sessions_opened_by_fkey;
ALTER TABLE public.cash_sessions DROP CONSTRAINT IF EXISTS cash_sessions_closed_by_fkey;
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
ALTER TABLE public.refunds DROP CONSTRAINT IF EXISTS refunds_user_id_fkey;

-- Now delete the corrupt system user
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';
