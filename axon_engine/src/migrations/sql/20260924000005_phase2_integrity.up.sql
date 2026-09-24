-- Phase 2 integrity pass.
-- Junctions replace JSONB/BIGINT id lists. API still synthesizes those arrays.
-- Do not rename status, form_builder, or role_permission.

-- ---------------------------------------------------------------------------
-- 1. Junction tables
-- ---------------------------------------------------------------------------

CREATE TABLE navbar_menu_items (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  navbar_id BIGINT NOT NULL REFERENCES navbars(id) ON DELETE CASCADE,
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (navbar_id, menu_item_id)
);

CREATE INDEX navbar_menu_items_navbar_sort_idx
  ON navbar_menu_items (navbar_id, sort_order);

CREATE TABLE card_media (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (card_id, media_id)
);

CREATE INDEX card_media_card_sort_idx
  ON card_media (card_id, sort_order);

CREATE TABLE slider_media (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  slider_id BIGINT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slider_id, media_id)
);

CREATE INDEX slider_media_slider_sort_idx
  ON slider_media (slider_id, sort_order);

CREATE TABLE slider_cards (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  slider_id BIGINT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slider_id, card_id)
);

CREATE INDEX slider_cards_slider_sort_idx
  ON slider_cards (slider_id, sort_order);

CREATE TABLE product_media (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, media_id)
);

CREATE INDEX product_media_product_sort_idx
  ON product_media (product_id, sort_order);

CREATE UNIQUE INDEX product_media_primary_uidx
  ON product_media (product_id)
  WHERE is_primary = TRUE;

CREATE TABLE form_submission_media (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  form_submission_id BIGINT NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  field_name VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX form_submission_media_submission_idx
  ON form_submission_media (form_submission_id, sort_order);

-- ---------------------------------------------------------------------------
-- 2. Backfill from live id lists (skip missing / duplicate ids)
-- ---------------------------------------------------------------------------

INSERT INTO navbar_menu_items (organization_id, navbar_id, menu_item_id, sort_order)
SELECT DISTINCT ON (n.id, elem::bigint)
  n.organization_id,
  n.id,
  elem::bigint,
  (ord.ordinality - 1)::int
FROM navbars n
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(n.menu_item_ids, '[]'::jsonb))
  WITH ORDINALITY AS ord(elem, ordinality)
WHERE elem ~ '^\d+$'
  AND EXISTS (SELECT 1 FROM menu_items mi WHERE mi.id = elem::bigint)
ORDER BY n.id, elem::bigint, ord.ordinality;

INSERT INTO card_media (organization_id, card_id, media_id, sort_order)
SELECT c.organization_id, c.id, c.media_ids, 0
FROM cards c
WHERE c.media_ids IS NOT NULL
  AND EXISTS (SELECT 1 FROM media m WHERE m.id = c.media_ids);

INSERT INTO slider_media (organization_id, slider_id, media_id, sort_order)
SELECT DISTINCT ON (s.id, elem::bigint)
  s.organization_id,
  s.id,
  elem::bigint,
  (ord.ordinality - 1)::int
FROM sliders s
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE
    WHEN jsonb_typeof(s.media_ids) = 'array' THEN s.media_ids
    WHEN s.media_ids IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(s.media_ids)
  END
) WITH ORDINALITY AS ord(elem, ordinality)
WHERE elem ~ '^\d+$'
  AND EXISTS (SELECT 1 FROM media m WHERE m.id = elem::bigint)
ORDER BY s.id, elem::bigint, ord.ordinality;

INSERT INTO slider_cards (organization_id, slider_id, card_id, sort_order)
SELECT DISTINCT ON (s.id, elem::bigint)
  s.organization_id,
  s.id,
  elem::bigint,
  (ord.ordinality - 1)::int
FROM sliders s
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE
    WHEN jsonb_typeof(s.card_ids) = 'array' THEN s.card_ids
    WHEN s.card_ids IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(s.card_ids)
  END
) WITH ORDINALITY AS ord(elem, ordinality)
WHERE elem ~ '^\d+$'
  AND EXISTS (SELECT 1 FROM cards c WHERE c.id = elem::bigint)
ORDER BY s.id, elem::bigint, ord.ordinality;

INSERT INTO product_media (organization_id, product_id, media_id, sort_order, is_primary)
SELECT DISTINCT ON (p.id, elem::bigint)
  p.organization_id,
  p.id,
  elem::bigint,
  (ord.ordinality - 1)::int,
  (ord.ordinality = 1)
FROM products p
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE
    WHEN jsonb_typeof(p.media_ids) = 'array' THEN p.media_ids
    WHEN p.media_ids IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(p.media_ids)
  END
) WITH ORDINALITY AS ord(elem, ordinality)
WHERE elem ~ '^\d+$'
  AND EXISTS (SELECT 1 FROM media m WHERE m.id = elem::bigint)
ORDER BY p.id, elem::bigint, ord.ordinality;

-- media_list is { field: { file_name, file_path } }, not an id array.
INSERT INTO form_submission_media (
  organization_id, form_submission_id, media_id, field_name, sort_order
)
SELECT DISTINCT ON (fs.id, ml.key)
  fs.organization_id,
  fs.id,
  m.id,
  ml.key,
  0
FROM form_submissions fs
CROSS JOIN LATERAL jsonb_each(fs.media_list) AS ml(key, value)
JOIN media m
  ON m.file_path = ml.value->>'file_path'
 AND m.organization_id IS NOT DISTINCT FROM fs.organization_id
WHERE fs.media_list IS NOT NULL
  AND jsonb_typeof(fs.media_list) = 'object'
ORDER BY fs.id, ml.key, m.id;

-- ---------------------------------------------------------------------------
-- 3. Drop old id-list columns
-- ---------------------------------------------------------------------------

ALTER TABLE navbars DROP COLUMN IF EXISTS menu_item_ids;
ALTER TABLE cards DROP COLUMN IF EXISTS media_ids;
ALTER TABLE sliders DROP COLUMN IF EXISTS media_ids;
ALTER TABLE sliders DROP COLUMN IF EXISTS card_ids;
ALTER TABLE products DROP COLUMN IF EXISTS media_ids;
ALTER TABLE form_submissions DROP COLUMN IF EXISTS media_list;

-- ---------------------------------------------------------------------------
-- 4. Navbar logo SET NULL; form_id FK; page favicon FK
-- ---------------------------------------------------------------------------

ALTER TABLE navbars ALTER COLUMN logo_id DROP NOT NULL;

ALTER TABLE navbars DROP CONSTRAINT IF EXISTS navbars_logo_id_foreign;
ALTER TABLE navbars DROP CONSTRAINT IF EXISTS navbars_logo_id_fkey;
ALTER TABLE navbars
  ADD CONSTRAINT navbars_logo_id_fkey
  FOREIGN KEY (logo_id) REFERENCES media(id) ON DELETE SET NULL;

ALTER TABLE form_submissions
  ALTER COLUMN form_id TYPE BIGINT USING form_id::bigint;

ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_form_id_fkey;
ALTER TABLE form_submissions
  ADD CONSTRAINT form_submissions_form_id_fkey
  FOREIGN KEY (form_id) REFERENCES form_builder(id) ON DELETE RESTRICT;

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_favicon_id_fkey;
ALTER TABLE pages
  ADD CONSTRAINT pages_favicon_id_fkey
  FOREIGN KEY (favicon_id) REFERENCES media(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. Same-organization triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION axon_enforce_same_org()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  parent_org BIGINT;
  child_org BIGINT;
  parent_id BIGINT;
  child_id BIGINT;
BEGIN
  parent_id := (to_jsonb(NEW) ->> TG_ARGV[1])::bigint;
  child_id := (to_jsonb(NEW) ->> TG_ARGV[3])::bigint;

  EXECUTE format('SELECT organization_id FROM %I WHERE id = $1', TG_ARGV[0])
    INTO parent_org
    USING parent_id;
  EXECUTE format('SELECT organization_id FROM %I WHERE id = $1', TG_ARGV[2])
    INTO child_org
    USING child_id;

  IF parent_org IS NOT NULL AND child_org IS NOT NULL AND parent_org IS DISTINCT FROM child_org THEN
    RAISE EXCEPTION 'organization_id mismatch: %.%(%) vs %.%(%)',
      TG_ARGV[0], TG_ARGV[1], parent_org, TG_ARGV[2], TG_ARGV[3], child_org
      USING ERRCODE = '23514';
  END IF;

  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := parent_org;
  ELSIF parent_org IS NOT NULL AND NEW.organization_id IS DISTINCT FROM parent_org THEN
    RAISE EXCEPTION 'junction organization_id (%) does not match parent (%)',
      NEW.organization_id, parent_org
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION axon_enforce_fk_same_org()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  child_org BIGINT;
  child_id BIGINT;
BEGIN
  child_id := (to_jsonb(NEW) ->> TG_ARGV[1])::bigint;
  IF child_id IS NULL THEN
    RETURN NEW;
  END IF;

  EXECUTE format('SELECT organization_id FROM %I WHERE id = $1', TG_ARGV[0])
    INTO child_org
    USING child_id;

  IF NEW.organization_id IS NOT NULL
     AND child_org IS NOT NULL
     AND NEW.organization_id IS DISTINCT FROM child_org THEN
    RAISE EXCEPTION 'organization_id mismatch for %', TG_ARGV[1]
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER navbar_menu_items_same_org
  BEFORE INSERT OR UPDATE ON navbar_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('navbars', 'navbar_id', 'menu_items', 'menu_item_id');

CREATE TRIGGER card_media_same_org
  BEFORE INSERT OR UPDATE ON card_media
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('cards', 'card_id', 'media', 'media_id');

CREATE TRIGGER slider_media_same_org
  BEFORE INSERT OR UPDATE ON slider_media
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('sliders', 'slider_id', 'media', 'media_id');

CREATE TRIGGER slider_cards_same_org
  BEFORE INSERT OR UPDATE ON slider_cards
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('sliders', 'slider_id', 'cards', 'card_id');

CREATE TRIGGER product_media_same_org
  BEFORE INSERT OR UPDATE ON product_media
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('products', 'product_id', 'media', 'media_id');

CREATE TRIGGER form_submission_media_same_org
  BEFORE INSERT OR UPDATE ON form_submission_media
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_same_org('form_submissions', 'form_submission_id', 'media', 'media_id');

CREATE TRIGGER navbars_logo_same_org
  BEFORE INSERT OR UPDATE ON navbars
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_fk_same_org('media', 'logo_id');

CREATE TRIGGER pages_favicon_same_org
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_fk_same_org('media', 'favicon_id');

CREATE TRIGGER products_type_same_org
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_fk_same_org('product_types', 'product_type_id');

CREATE TRIGGER form_submissions_form_same_org
  BEFORE INSERT OR UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION axon_enforce_fk_same_org('form_builder', 'form_id');

-- ---------------------------------------------------------------------------
-- 6. CHECK constraints from live values (plus the planned extras)
-- ---------------------------------------------------------------------------

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_type_check;
ALTER TABLE pages
  ADD CONSTRAINT pages_type_check
  CHECK (
    type IS NULL OR type IN (
      'Page', 'Footer', 'Subpage', 'landing', 'Blog', 'settings',
      'page', 'landing-page'
    )
  );

ALTER TABLE sliders DROP CONSTRAINT IF EXISTS sliders_type_check;
ALTER TABLE sliders
  ADD CONSTRAINT sliders_type_check
  CHECK (type IS NULL OR type IN ('image', 'card', 'card_media', 'hero'));

ALTER TABLE sliders DROP CONSTRAINT IF EXISTS sliders_status_check;
ALTER TABLE sliders
  ADD CONSTRAINT sliders_status_check
  CHECK (status IS NULL OR status IN (0, 1));

ALTER TABLE footers DROP CONSTRAINT IF EXISTS footers_footer_status_check;
ALTER TABLE footers
  ADD CONSTRAINT footers_footer_status_check
  CHECK (footer_status IS NULL OR footer_status IN (0, 1));

UPDATE form_submissions
SET status = 'new'
WHERE status IS NULL OR btrim(status) = '';

ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_status_check;
ALTER TABLE form_submissions
  ADD CONSTRAINT form_submissions_status_check
  CHECK (status IN ('new', 'reviewed', 'processed', 'archived', 'resolved'));

-- ---------------------------------------------------------------------------
-- 7. Page lifecycle + audit (keep boolean status)
-- ---------------------------------------------------------------------------

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS lifecycle VARCHAR(32),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL;

UPDATE pages
SET lifecycle = CASE WHEN status IS TRUE THEN 'published' ELSE 'draft' END
WHERE lifecycle IS NULL;

UPDATE pages
SET published_at = created_at
WHERE status IS TRUE AND published_at IS NULL;

ALTER TABLE pages
  ALTER COLUMN lifecycle SET DEFAULT 'draft';

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_lifecycle_check;
ALTER TABLE pages
  ADD CONSTRAINT pages_lifecycle_check
  CHECK (lifecycle IN ('draft', 'published', 'archived'));

-- ---------------------------------------------------------------------------
-- 8. Live-row indexes matching list queries
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS pages_org_live_status_idx
  ON pages (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS pages_org_live_lifecycle_idx
  ON pages (organization_id, lifecycle)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS cards_org_live_status_idx
  ON cards (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS sliders_org_live_status_idx
  ON sliders (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS products_org_live_status_idx
  ON products (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS form_builder_org_live_status_idx
  ON form_builder (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS form_submissions_org_live_status_idx
  ON form_submissions (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS media_org_live_idx
  ON media (organization_id)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 9. Advertised auth tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx
  ON password_reset_tokens (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS api_keys (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_keys_org_live_idx
  ON api_keys (organization_id)
  WHERE revoked_at IS NULL;
