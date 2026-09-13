DO $$
BEGIN
  IF to_regclass('public.menus') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE navbars ADD COLUMN IF NOT EXISTS menu_item_ids JSONB;

  UPDATE navbars n
  SET menu_item_ids = COALESCE(m.menu_item_ids, '[]'::jsonb)
  FROM menus m
  WHERE n.menu_id IS NOT NULL
    AND n.menu_id = m.id
    AND (n.menu_item_ids IS NULL OR n.menu_item_ids = '[]'::jsonb);

  ALTER TABLE navbars DROP CONSTRAINT IF EXISTS navbars_menu_id_fkey;
  ALTER TABLE navbars DROP COLUMN IF EXISTS menu_id;

  ALTER TABLE footers ADD COLUMN IF NOT EXISTS column2_menu_item_ids JSONB;
  ALTER TABLE footers ADD COLUMN IF NOT EXISTS column3_menu_item_ids JSONB;
  ALTER TABLE footers ADD COLUMN IF NOT EXISTS column4_menu_item_ids JSONB;
  ALTER TABLE footers ADD COLUMN IF NOT EXISTS bottom_menu_item_ids JSONB;

  UPDATE footers f
  SET column2_menu_item_ids = COALESCE(m.menu_item_ids, '[]'::jsonb)
  FROM menus m
  WHERE f.column2_menu_id IS NOT NULL
    AND f.column2_menu_id = m.id
    AND (f.column2_menu_item_ids IS NULL OR f.column2_menu_item_ids = '[]'::jsonb);

  UPDATE footers f
  SET column3_menu_item_ids = COALESCE(m.menu_item_ids, '[]'::jsonb)
  FROM menus m
  WHERE f.column3_menu_id IS NOT NULL
    AND f.column3_menu_id = m.id
    AND (f.column3_menu_item_ids IS NULL OR f.column3_menu_item_ids = '[]'::jsonb);

  UPDATE footers f
  SET column4_menu_item_ids = COALESCE(m.menu_item_ids, '[]'::jsonb)
  FROM menus m
  WHERE f.column4_menu_id IS NOT NULL
    AND f.column4_menu_id = m.id
    AND (f.column4_menu_item_ids IS NULL OR f.column4_menu_item_ids = '[]'::jsonb);

  UPDATE footers f
  SET bottom_menu_item_ids = COALESCE(m.menu_item_ids, '[]'::jsonb)
  FROM menus m
  WHERE f.bottom_menu_id IS NOT NULL
    AND f.bottom_menu_id = m.id
    AND (f.bottom_menu_item_ids IS NULL OR f.bottom_menu_item_ids = '[]'::jsonb);

  ALTER TABLE footers DROP COLUMN IF EXISTS column2_menu_id;
  ALTER TABLE footers DROP COLUMN IF EXISTS column3_menu_id;
  ALTER TABLE footers DROP COLUMN IF EXISTS column4_menu_id;
  ALTER TABLE footers DROP COLUMN IF EXISTS bottom_menu_id;

  DROP TABLE IF EXISTS menx;
  DROP TABLE IF EXISTS menus;
END $$;
