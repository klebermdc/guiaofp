-- Allow guides and admins to delete contracts
CREATE POLICY "Guides can delete contracts"
ON public.contracts
FOR DELETE
USING (is_guide_or_admin(auth.uid()));