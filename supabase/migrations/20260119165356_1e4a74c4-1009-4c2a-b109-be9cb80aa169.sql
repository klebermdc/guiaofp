-- Add access control column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_access_enabled boolean DEFAULT false;

-- Update existing users with contracts to have access enabled
UPDATE public.profiles p
SET is_access_enabled = true
WHERE EXISTS (
  SELECT 1 FROM public.contracts c 
  WHERE c.user_id = p.user_id 
  AND c.status = 'active'
);

-- Also enable access for admins and guides
UPDATE public.profiles p
SET is_access_enabled = true
WHERE EXISTS (
  SELECT 1 FROM public.user_roles r 
  WHERE r.user_id = p.user_id 
  AND r.role IN ('admin', 'guide')
);