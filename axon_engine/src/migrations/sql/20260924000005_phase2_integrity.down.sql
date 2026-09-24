DROP INDEX IF EXISTS api_keys_org_live_idx;
DROP TABLE IF EXISTS api_keys;

DROP INDEX IF EXISTS password_reset_tokens_user_idx;
DROP TABLE IF EXISTS password_reset_tokens;

DROP INDEX IF EXISTS media_org_live_idx;
DROP INDEX IF EXISTS form_submissions_org_live_status_idx;
DROP INDEX IF EXISTS form_builder_org_live_status_idx;
DROP INDEX IF EXISTS products_org_live_status_idx;
DROP INDEX IF EXISTS sliders_org_live_status_idx;
DROP INDEX IF EXISTS cards_org_live_status_idx;
DROP INDEX IF EXISTS pages_org_live_lifecycle_idx;
DROP INDEX IF EXISTS pages_org_live_status_idx;

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_lifecycle_check;
ALTER TABLE pages DROP COLUMN IF EXISTS updated_by;
ALTER TABLE pages DROP COLUMN IF EXISTS created_by;
ALTER TABLE pages DROP COLUMN IF EXISTS published_at;
ALTER TABLE pages DROP COLUMN IF EXISTS lifecycle;

ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_status_check;
ALTER TABLE footers DROP CONSTRAINT IF EXISTS footers_footer_status_check;
ALTER TABLE sliders DROP CONSTRAINT IF EXISTS sliders_status_check;
ALTER TABLE sliders DROP CONSTRAINT IF EXISTS sliders_type_check;
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_type_check;

DROP FUNCTION IF EXISTS axon_enforce_same_org() CASCADE;
DROP FUNCTION IF EXISTS axon_enforce_fk_same_org() CASCADE;

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_favicon_id_fkey;
ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_form_id_fkey;

ALTER TABLE navbars DROP CONSTRAINT IF EXISTS navbars_logo_id_fkey;
ALTER TABLE navbars DROP CONSTRAINT IF EXISTS navbars_logo_id_foreign;
ALTER TABLE navbars
  ADD CONSTRAINT navbars_logo_id_foreign
  FOREIGN KEY (logo_id) REFERENCES media(id) ON DELETE CASCADE;

ALTER TABLE navbars ADD COLUMN IF NOT EXISTS menu_item_ids JSONB;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS media_ids BIGINT;
ALTER TABLE sliders ADD COLUMN IF NOT EXISTS media_ids JSONB;
ALTER TABLE sliders ADD COLUMN IF NOT EXISTS card_ids JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS media_ids JSONB;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS media_list JSONB;

UPDATE navbars n
SET menu_item_ids = COALESCE((
  SELECT jsonb_agg(j.menu_item_id::text ORDER BY j.sort_order, j.id)
  FROM navbar_menu_items j
  WHERE j.navbar_id = n.id
), '[]'::jsonb);

UPDATE cards c
SET media_ids = (
  SELECT j.media_id
  FROM card_media j
  WHERE j.card_id = c.id
  ORDER BY j.sort_order, j.id
  LIMIT 1
);

UPDATE sliders s
SET media_ids = COALESCE((
  SELECT jsonb_agg(j.media_id::text ORDER BY j.sort_order, j.id)
  FROM slider_media j
  WHERE j.slider_id = s.id
), '[]'::jsonb);

UPDATE sliders s
SET card_ids = COALESCE((
  SELECT jsonb_agg(j.card_id::text ORDER BY j.sort_order, j.id)
  FROM slider_cards j
  WHERE j.slider_id = s.id
), '[]'::jsonb);

UPDATE products p
SET media_ids = COALESCE((
  SELECT jsonb_agg(j.media_id::text ORDER BY j.sort_order, j.id)
  FROM product_media j
  WHERE j.product_id = p.id
), '[]'::jsonb);

UPDATE form_submissions fs
SET media_list = COALESCE((
  SELECT jsonb_object_agg(
    COALESCE(j.field_name, 'media_' || j.id::text),
    jsonb_build_object('file_name', m.file_name, 'file_path', m.file_path)
  )
  FROM form_submission_media j
  JOIN media m ON m.id = j.media_id
  WHERE j.form_submission_id = fs.id
), NULL);

DROP TABLE IF EXISTS form_submission_media;
DROP TABLE IF EXISTS product_media;
DROP TABLE IF EXISTS slider_cards;
DROP TABLE IF EXISTS slider_media;
DROP TABLE IF EXISTS card_media;
DROP TABLE IF EXISTS navbar_menu_items;
