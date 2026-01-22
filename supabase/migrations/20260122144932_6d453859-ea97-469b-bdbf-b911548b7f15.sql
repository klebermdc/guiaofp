-- Create multipass_status table to track purchase confirmations
CREATE TABLE public.multipass_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_purchased boolean NOT NULL DEFAULT false,
    purchased_at timestamp with time zone,
    confirmed_by text, -- 'client' or 'guide'
    first_disney_park_date date,
    notification_start_date date,
    last_notification_sent text, -- 'day_d', 'reminder', 'urgent'
    last_notification_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.multipass_status ENABLE ROW LEVEL SECURITY;

-- Users can view their own status
CREATE POLICY "Users can view own multipass status"
ON public.multipass_status
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own status
CREATE POLICY "Users can update own multipass status"
ON public.multipass_status
FOR UPDATE
USING (auth.uid() = user_id);

-- Guides can view all statuses
CREATE POLICY "Guides can view all multipass statuses"
ON public.multipass_status
FOR SELECT
USING (is_guide_or_admin(auth.uid()));

-- Guides can update any status
CREATE POLICY "Guides can update any multipass status"
ON public.multipass_status
FOR UPDATE
USING (is_guide_or_admin(auth.uid()));

-- Guides can insert status
CREATE POLICY "Guides can insert multipass status"
ON public.multipass_status
FOR INSERT
WITH CHECK (is_guide_or_admin(auth.uid()));

-- System can insert (for edge function)
CREATE POLICY "Users can insert own multipass status"
ON public.multipass_status
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_multipass_status_updated_at
BEFORE UPDATE ON public.multipass_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();