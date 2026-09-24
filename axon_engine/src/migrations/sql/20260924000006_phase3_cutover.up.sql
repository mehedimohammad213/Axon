-- Phase 3 cutover.
-- Keep form_builder, role_permission, and permission slugs.
-- Rename content status → is_active. Keep form_submissions.status (workflow enum).

SELECT set_config('app.bypass_rls', 'on', true);

-- ---------------------------------------------------------------------------
-- 1. Restore menus + junction
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS menus (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS menus_organization_id_idx ON menus (organization_id);
CREATE INDEX IF NOT EXISTS menus_org_live_idx
  ON menus (organization_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS menu_menu_items (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (menu_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS menu_menu_items_menu_sort_idx
  ON menu_menu_items (menu_id, sort_order);

-- ---------------------------------------------------------------------------
-- 2. Footer menu junctions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS footer_menu_items (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  footer_id BIGINT NOT NULL REFERENCES footers(id) ON DELETE CASCADE,
  slot VARCHAR(32) NOT NULL,
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (footer_id, slot, menu_item_id),
  CHECK (slot IN ('column2', 'column3', 'column4', 'bottom'))
);

CREATE INDEX IF NOT EXISTS footer_menu_items_footer_slot_idx
  ON footer_menu_items (footer_id, slot, sort_order);

INSERT INTO footer_menu_items (organization_id, footer_id, slot, menu_item_id, sort_order)
SELECT DISTINCT ON (f.id, slot.slot, elem::bigint)
  f.organization_id,
  f.id,
  slot.slot,
  elem::bigint,
  (ord.ordinality - 1)::int
FROM footers f
CROSS JOIN LATERAL (VALUES
  ('column2', f.column2_menu_item_ids),
  ('column3', f.column3_menu_item_ids),
  ('column4', f.column4_menu_item_ids),
  ('bottom', f.bottom_menu_item_ids)
) AS slot(slot, ids)
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(slot.ids, '[]'::jsonb))
  WITH ORDINALITY AS ord(elem, ordinality)
WHERE elem ~ '^\d+$'
  AND EXISTS (SELECT 1 FROM menu_items mi WHERE mi.id = elem::bigint)
ORDER BY f.id, slot.slot, elem::bigint, ord.ordinality;

ALTER TABLE footers DROP COLUMN IF EXISTS column2_menu_item_ids;
ALTER TABLE footers DROP COLUMN IF EXISTS column3_menu_item_ids;
ALTER TABLE footers DROP COLUMN IF EXISTS column4_menu_item_ids;
ALTER TABLE footers DROP COLUMN IF EXISTS bottom_menu_item_ids;

-- ---------------------------------------------------------------------------
-- 3. status → is_active (not form_submissions)
-- ---------------------------------------------------------------------------

ALTER TABLE pages RENAME COLUMN status TO is_active;

ALTER TABLE cards RENAME COLUMN status TO is_active;

ALTER TABLE form_builder RENAME COLUMN status TO is_active;

ALTER TABLE products RENAME COLUMN status TO is_active;

ALTER TABLE product_types RENAME COLUMN status TO is_active;

ALTER TABLE generated_models RENAME COLUMN status TO is_active;

ALTER TABLE tables RENAME COLUMN status TO is_active;

ALTER TABLE roles RENAME COLUMN status TO is_active;

ALTER TABLE permissions RENAME COLUMN status TO is_active;

ALTER TABLE sliders ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
UPDATE sliders SET is_active = (COALESCE(status, 0) = 1) WHERE is_active IS NULL;
ALTER TABLE sliders DROP CONSTRAINT IF EXISTS sliders_status_check;
DROP INDEX IF EXISTS sliders_org_live_status_idx;
ALTER TABLE sliders DROP COLUMN IF EXISTS status;
ALTER TABLE sliders ALTER COLUMN is_active SET DEFAULT TRUE;

ALTER TABLE footers ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
UPDATE footers SET is_active = (COALESCE(footer_status, 0) = 1) WHERE is_active IS NULL;
ALTER TABLE footers DROP CONSTRAINT IF EXISTS footers_footer_status_check;
ALTER TABLE footers DROP COLUMN IF EXISTS footer_status;
ALTER TABLE footers ALTER COLUMN is_active SET DEFAULT FALSE;

DROP INDEX IF EXISTS pages_org_live_status_idx;
DROP INDEX IF EXISTS cards_org_live_status_idx;
DROP INDEX IF EXISTS products_org_live_status_idx;
DROP INDEX IF EXISTS form_builder_org_live_status_idx;

CREATE INDEX IF NOT EXISTS pages_org_live_active_idx
  ON pages (organization_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS cards_org_live_active_idx
  ON cards (organization_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS sliders_org_live_active_idx
  ON sliders (organization_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS products_org_live_active_idx
  ON products (organization_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS form_builder_org_live_active_idx
  ON form_builder (organization_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS tables_org_live_active_idx
  ON tables (organization_id, is_active)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Page revisions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS page_revisions (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  body JSONB,
  body_raw JSONB,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, version)
);

CREATE INDEX IF NOT EXISTS page_revisions_page_idx
  ON page_revisions (page_id, version DESC);

INSERT INTO page_revisions (organization_id, page_id, version, body, body_raw, created_by, created_at)
SELECT
  p.organization_id,
  p.id,
  1,
  p.body,
  p.body_raw,
  p.updated_by,
  p.updated_at
FROM pages p;

-- ---------------------------------------------------------------------------
-- 5. users.profile_picture_id → media FK
-- ---------------------------------------------------------------------------

UPDATE users
SET profile_picture_id = NULL
WHERE profile_picture_id IS NOT NULL
  AND (
    btrim(profile_picture_id::text) = ''
    OR profile_picture_id::text !~ '^\d+$'
    OR NOT EXISTS (
      SELECT 1 FROM media m WHERE m.id = NULLIF(btrim(profile_picture_id::text), '')::bigint
    )
  );

ALTER TABLE users
  ALTER COLUMN profile_picture_id TYPE BIGINT
  USING NULLIF(btrim(profile_picture_id::text), '')::bigint;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_profile_picture_id_fkey;
ALTER TABLE users
  ADD CONSTRAINT users_profile_picture_id_fkey
  FOREIGN KEY (profile_picture_id) REFERENCES media(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 6. Same-org triggers for new junctions
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS menu_menu_items_same_org ON menu_menu_items;
CREATE TRIGGER menu_menu_items_same_org
  BEFORE INSERT OR UPDATE ON menu_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('menus', 'menu_id', 'menu_items', 'menu_item_id');

DROP TRIGGER IF EXISTS footer_menu_items_same_org ON footer_menu_items;
CREATE TRIGGER footer_menu_items_same_org
  BEFORE INSERT OR UPDATE ON footer_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('footers', 'footer_id', 'menu_items', 'menu_item_id');

DROP TRIGGER IF EXISTS page_revisions_page_same_org ON page_revisions;
CREATE TRIGGER page_revisions_page_same_org
  BEFORE INSERT OR UPDATE ON page_revisions
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_fk_same_org('pages', 'page_id');

-- ---------------------------------------------------------------------------
-- 7. Row Level Security
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION axon_rls_visible(row_org BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    current_setting('app.bypass_rls', true) = 'on'
    OR (
      NULLIF(current_setting('app.organization_id', true), '') IS NOT NULL
      AND row_org IS NOT DISTINCT FROM NULLIF(current_setting('app.organization_id', true), '')::bigint
    )
$$;

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
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (axon_rls_visible(organization_id)) WITH CHECK (axon_rls_visible(organization_id))',
      tbl
    );
  END LOOP;
END
$$;
