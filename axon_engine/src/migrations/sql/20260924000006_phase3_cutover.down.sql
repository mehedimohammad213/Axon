SELECT set_config('app.bypass_rls', 'on', true);

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users', 'roles', 'media', 'menu_items', 'menus', 'menu_menu_items',
    'navbars', 'navbar_menu_items', 'cards', 'card_media',
    'sliders', 'slider_media', 'slider_cards',
    'footers', 'footer_menu_items',
    'pages', 'page_revisions',
    'form_builder', 'form_submissions', 'form_submission_media',
    'product_types', 'products', 'product_media',
    'generated_models', 'tables',
    'api_keys', 'password_reset_tokens'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
    EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END
$$;

DROP FUNCTION IF EXISTS axon_rls_visible(BIGINT);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_profile_picture_id_fkey;
ALTER TABLE users ALTER COLUMN profile_picture_id TYPE VARCHAR(255) USING profile_picture_id::text;

DROP TABLE IF EXISTS page_revisions;

ALTER TABLE footers ADD COLUMN IF NOT EXISTS footer_status SMALLINT;
UPDATE footers SET footer_status = CASE WHEN is_active THEN 1 ELSE 0 END;
ALTER TABLE footers DROP COLUMN IF EXISTS is_active;

ALTER TABLE sliders ADD COLUMN IF NOT EXISTS status SMALLINT;
UPDATE sliders SET status = CASE WHEN is_active THEN 1 ELSE 0 END;
ALTER TABLE sliders DROP COLUMN IF EXISTS is_active;

ALTER TABLE permissions RENAME COLUMN is_active TO status;
ALTER TABLE roles RENAME COLUMN is_active TO status;
ALTER TABLE tables RENAME COLUMN is_active TO status;
ALTER TABLE generated_models RENAME COLUMN is_active TO status;
ALTER TABLE product_types RENAME COLUMN is_active TO status;
ALTER TABLE products RENAME COLUMN is_active TO status;
ALTER TABLE form_builder RENAME COLUMN is_active TO status;
ALTER TABLE cards RENAME COLUMN is_active TO status;
ALTER TABLE pages RENAME COLUMN is_active TO status;

ALTER TABLE footers ADD COLUMN IF NOT EXISTS column2_menu_item_ids JSONB;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS column3_menu_item_ids JSONB;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS column4_menu_item_ids JSONB;
ALTER TABLE footers ADD COLUMN IF NOT EXISTS bottom_menu_item_ids JSONB;

UPDATE footers f SET
  column2_menu_item_ids = (
    SELECT COALESCE(jsonb_agg(j.menu_item_id::text ORDER BY j.sort_order, j.id), '[]'::jsonb)
    FROM footer_menu_items j WHERE j.footer_id = f.id AND j.slot = 'column2'
  ),
  column3_menu_item_ids = (
    SELECT COALESCE(jsonb_agg(j.menu_item_id::text ORDER BY j.sort_order, j.id), '[]'::jsonb)
    FROM footer_menu_items j WHERE j.footer_id = f.id AND j.slot = 'column3'
  ),
  column4_menu_item_ids = (
    SELECT COALESCE(jsonb_agg(j.menu_item_id::text ORDER BY j.sort_order, j.id), '[]'::jsonb)
    FROM footer_menu_items j WHERE j.footer_id = f.id AND j.slot = 'column4'
  ),
  bottom_menu_item_ids = (
    SELECT COALESCE(jsonb_agg(j.menu_item_id::text ORDER BY j.sort_order, j.id), '[]'::jsonb)
    FROM footer_menu_items j WHERE j.footer_id = f.id AND j.slot = 'bottom'
  );

DROP TABLE IF EXISTS footer_menu_items;
DROP TABLE IF EXISTS menu_menu_items;
DROP TABLE IF EXISTS menus;
