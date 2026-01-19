-- Allow guides/admins to update is_access_enabled field
CREATE POLICY "Guides can update client access" 
ON public.profiles 
FOR UPDATE 
USING (is_guide_or_admin(auth.uid()))
WITH CHECK (is_guide_or_admin(auth.uid()));