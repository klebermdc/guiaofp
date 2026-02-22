
-- Make sensitive document buckets private (policies already exist)
UPDATE storage.buckets SET public = false WHERE id IN ('user-documents', 'hotel-vouchers', 'itinerary-tickets');
