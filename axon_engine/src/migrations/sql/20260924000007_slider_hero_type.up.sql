ALTER TABLE sliders DROP CONSTRAINT IF EXISTS sliders_type_check;
ALTER TABLE sliders
  ADD CONSTRAINT sliders_type_check
  CHECK (type IS NULL OR type IN ('image', 'card', 'card_media', 'hero'));
