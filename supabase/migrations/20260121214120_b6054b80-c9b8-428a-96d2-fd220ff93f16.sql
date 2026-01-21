-- Allow guides/admins to delete profiles (for complete user deletion)
CREATE POLICY "Guides can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (is_guide_or_admin(auth.uid()));