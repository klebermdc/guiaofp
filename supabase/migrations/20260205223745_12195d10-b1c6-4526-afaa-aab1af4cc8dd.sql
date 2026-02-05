-- Add new tracking config entries for sGTM and enhanced tracking
INSERT INTO tracking_config (config_key, config_value, description, is_active) VALUES
  ('sgtm_url', NULL, 'URL do servidor sGTM (Stape). Ex: sgtm.seudominio.com', false),
  ('sgtm_container_id', NULL, 'Container ID do Server GTM. Ex: GTM-XXXXXX', false),
  ('fb_access_token', NULL, 'Token de acesso da Conversions API (CAPI) do Facebook', false),
  ('fb_test_event_code', NULL, 'Código de teste para eventos CAPI (opcional)', false),
  ('enhanced_conversions', NULL, 'Habilitar Enhanced Conversions para GA4 (true/false)', false),
  ('first_party_collection', NULL, 'Coleta first-party via sGTM (true/false)', false)
ON CONFLICT (config_key) DO NOTHING;