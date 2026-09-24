-- The live schema dropped JSONB/status columns during a later cutover to
-- junction tables + is_active. Application models and seeders still use the
-- original columns, so restore them if they are missing.

ALTER TABLE navbars ADD COLUMN IF NOT EXISTS menu_item_ids JSONB;

ALTER TABLE footers ADD COLUMN IF NOT EXISTS footer_status SMALLINT DEFAULT 0;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS column2_menu_item_ids JSONB;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS column3_menu_item_ids JSONB;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS column4_menu_item_ids JSONB;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS bottom_menu_item_ids JSONB;

ALTER TABLE cards ADD COLUMN IF NOT EXISTS media_ids BIGINT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

ALTER TABLE sliders ADD COLUMN IF NOT EXISTS media_ids JSONB;
ALTER TABLE sliders ADD COLUMN IF NOT EXISTS card_ids JSONB;
ALTER TABLE sliders ADD COLUMN IF NOT EXISTS status SMALLINT DEFAULT 0;

ALTER TABLE pages ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

ALTER TABLE form_builder ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

UPDATE footers
SET footer_status = CASE WHEN COALESCE(is_active, FALSE) THEN 1 ELSE 0 END
WHERE footer_status IS NULL;

UPDATE cards
SET status = COALESCE(is_active, TRUE)
WHERE status IS NULL;

UPDATE sliders
SET status = CASE WHEN COALESCE(is_active, FALSE) THEN 1 ELSE 0 END
WHERE status IS NULL;

UPDATE pages
SET status = COALESCE(is_active, TRUE)
WHERE status IS NULL;

UPDATE form_builder
SET status = COALESCE(is_active, TRUE)
WHERE status IS NULL;
