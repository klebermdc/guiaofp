-- Add style columns to editable_content for visual customization
ALTER TABLE public.editable_content
ADD COLUMN IF NOT EXISTS text_color TEXT,
ADD COLUMN IF NOT EXISTS bg_color TEXT,
ADD COLUMN IF NOT EXISTS border_color TEXT,
ADD COLUMN IF NOT EXISTS accent_color TEXT,
ADD COLUMN IF NOT EXISTS font_size TEXT,
ADD COLUMN IF NOT EXISTS font_weight TEXT,
ADD COLUMN IF NOT EXISTS custom_classes TEXT,
ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.editable_content.text_color IS 'HSL color value for text, e.g., "262 60% 55%"';
COMMENT ON COLUMN public.editable_content.bg_color IS 'HSL color value for background';
COMMENT ON COLUMN public.editable_content.border_color IS 'HSL color value for borders';
COMMENT ON COLUMN public.editable_content.accent_color IS 'HSL color value for accents/highlights';
COMMENT ON COLUMN public.editable_content.font_size IS 'Tailwind font size class, e.g., "text-xl"';
COMMENT ON COLUMN public.editable_content.font_weight IS 'Tailwind font weight class, e.g., "font-bold"';
COMMENT ON COLUMN public.editable_content.custom_classes IS 'Additional custom Tailwind classes';
COMMENT ON COLUMN public.editable_content.styles IS 'JSON object for additional dynamic styles';