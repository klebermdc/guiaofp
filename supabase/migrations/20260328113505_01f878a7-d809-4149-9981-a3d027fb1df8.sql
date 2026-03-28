CREATE TABLE public.webhook_idempotency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_key TEXT UNIQUE NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_idempotency ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed — only service_role accesses this table

-- Auto-cleanup: remove entries older than 7 days (via index for efficient queries)
CREATE INDEX idx_webhook_idempotency_processed_at ON public.webhook_idempotency (processed_at);