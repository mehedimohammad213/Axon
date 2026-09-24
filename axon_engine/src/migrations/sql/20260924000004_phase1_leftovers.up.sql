-- Drop leftover CASCADE so only SET NULL remains on users.organization_id.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_organization_id_foreign;

-- Unique slugs apply to live rows only. Trashed rows no longer occupy the slug.
DROP INDEX IF EXISTS pages_org_type_slug_uidx;
CREATE UNIQUE INDEX pages_org_type_slug_uidx
  ON pages (organization_id, COALESCE(type, 'page'), slug)
  WHERE deleted_at IS NULL
    AND slug IS NOT NULL
    AND btrim(slug) <> '';

DROP INDEX IF EXISTS products_org_type_slug_uidx;
CREATE UNIQUE INDEX products_org_type_slug_uidx
  ON products (organization_id, product_type_id, slug)
  WHERE deleted_at IS NULL
    AND slug IS NOT NULL
    AND btrim(slug) <> '';

DROP INDEX IF EXISTS generated_models_org_api_route_uidx;
CREATE UNIQUE INDEX generated_models_org_api_route_uidx
  ON generated_models (organization_id, api_route)
  WHERE deleted_at IS NULL
    AND api_route IS NOT NULL
    AND btrim(api_route) <> '';

ALTER TABLE product_types DROP CONSTRAINT IF EXISTS product_types_organization_id_slug_key;
DROP INDEX IF EXISTS product_types_organization_id_slug_key;
CREATE UNIQUE INDEX product_types_org_slug_live_uidx
  ON product_types (organization_id, slug)
  WHERE deleted_at IS NULL;
