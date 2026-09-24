-- Phase 1 safety pass.
-- Keep footers: this migration does not drop or rewrite the footers table.

-- 1. Deleting a parent menu item must not wipe children.
UPDATE menu_items
SET parent_id = NULL
WHERE parent_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM menu_items AS parent WHERE parent.id = menu_items.parent_id
  );

ALTER TABLE menu_items
  DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;

ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE SET NULL;

-- 2. Super admins must survive organization delete.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_organization_id_fkey;

ALTER TABLE users
  ADD CONSTRAINT users_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- 3. Email is unique per organization, not globally.
--    Platform users (organization_id IS NULL) still have a unique email.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;
DROP INDEX IF EXISTS users_email_key;
DROP INDEX IF EXISTS users_email_unique;

CREATE UNIQUE INDEX users_org_email_uidx
  ON users (organization_id, email)
  WHERE organization_id IS NOT NULL;

CREATE UNIQUE INDEX users_platform_email_uidx
  ON users (email)
  WHERE organization_id IS NULL;

-- 4. Live slug uniqueness. This database has no deleted_at yet, so these
--    are regular unique indexes. Convert to WHERE deleted_at IS NULL
--    when soft delete is added.

UPDATE pages
SET slug = slug || '-' || id::text
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY organization_id, COALESCE(type, 'page'), slug
      ORDER BY id
    ) AS rn
    FROM pages
    WHERE slug IS NOT NULL AND btrim(slug) <> ''
  ) ranked
  WHERE ranked.rn > 1
);

CREATE UNIQUE INDEX pages_org_type_slug_uidx
  ON pages (organization_id, COALESCE(type, 'page'), slug)
  WHERE slug IS NOT NULL AND btrim(slug) <> '';

UPDATE products
SET slug = slug || '-' || id::text
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY organization_id, product_type_id, slug
      ORDER BY id
    ) AS rn
    FROM products
    WHERE slug IS NOT NULL AND btrim(slug) <> ''
  ) ranked
  WHERE ranked.rn > 1
);

CREATE UNIQUE INDEX products_org_type_slug_uidx
  ON products (organization_id, product_type_id, slug)
  WHERE slug IS NOT NULL AND btrim(slug) <> '';

UPDATE generated_models
SET api_route = api_route || '-' || id::text
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY organization_id, api_route
      ORDER BY id
    ) AS rn
    FROM generated_models
    WHERE api_route IS NOT NULL AND btrim(api_route) <> ''
  ) ranked
  WHERE ranked.rn > 1
);

CREATE UNIQUE INDEX generated_models_org_api_route_uidx
  ON generated_models (organization_id, api_route)
  WHERE api_route IS NOT NULL AND btrim(api_route) <> '';

-- Collapse duplicate role titles in the same org before adding uniqueness.
UPDATE users
SET role_id = keeper.id
FROM (
  SELECT DISTINCT ON (organization_id, title) id, organization_id, title
  FROM roles
  ORDER BY organization_id, title, id
) keeper
JOIN roles dup
  ON dup.organization_id = keeper.organization_id
 AND dup.title = keeper.title
 AND dup.id <> keeper.id
WHERE users.role_id = dup.id;

DELETE FROM role_permission
WHERE role_id IN (
  SELECT a.id
  FROM roles a
  JOIN roles b
    ON a.organization_id = b.organization_id
   AND a.title = b.title
   AND a.id > b.id
);

DELETE FROM roles a
USING roles b
WHERE a.organization_id = b.organization_id
  AND a.title = b.title
  AND a.id > b.id;

CREATE UNIQUE INDEX roles_org_title_uidx
  ON roles (organization_id, title);
