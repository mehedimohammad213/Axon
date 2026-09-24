ALTER TABLE navbars DROP COLUMN IF EXISTS menu_item_ids;

ALTER TABLE footers DROP COLUMN IF EXISTS footer_status;
ALTER TABLE footers DROP COLUMN IF EXISTS column2_menu_item_ids;
ALTER TABLE footers DROP COLUMN IF EXISTS column3_menu_item_ids;
ALTER TABLE footers DROP COLUMN IF EXISTS column4_menu_item_ids;
ALTER TABLE footers DROP COLUMN IF EXISTS bottom_menu_item_ids;

ALTER TABLE cards DROP COLUMN IF EXISTS media_ids;
ALTER TABLE cards DROP COLUMN IF EXISTS status;

ALTER TABLE sliders DROP COLUMN IF EXISTS media_ids;
ALTER TABLE sliders DROP COLUMN IF EXISTS card_ids;
ALTER TABLE sliders DROP COLUMN IF EXISTS status;

ALTER TABLE pages DROP COLUMN IF EXISTS status;

ALTER TABLE form_builder DROP COLUMN IF EXISTS status;
