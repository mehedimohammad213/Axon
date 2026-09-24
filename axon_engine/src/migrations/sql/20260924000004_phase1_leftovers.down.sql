DROP INDEX IF EXISTS product_types_org_slug_live_uidx;
ALTER TABLE product_types
  ADD CONSTRAINT product_types_organization_id_slug_key UNIQUE (organization_id, slug);

DROP INDEX IF EXISTS generated_models_org_api_route_uidx;
CREATE UNIQUE INDEX generated_models_org_api_route_uidx
  ON generated_models (organization_id, api_route)
  WHERE api_route IS NOT NULL AND btrim(api_route) <> '';

DROP INDEX IF EXISTS products_org_type_slug_uidx;
CREATE UNIQUE INDEX products_org_type_slug_uidx
  ON products (organization_id, product_type_id, slug)
  WHERE slug IS NOT NULL AND btrim(slug) <> '';

DROP INDEX IF EXISTS pages_org_type_slug_uidx;
CREATE UNIQUE INDEX pages_org_type_slug_uidx
  ON pages (organization_id, COALESCE(type, 'page'), slug)
  WHERE slug IS NOT NULL AND btrim(slug) <> '';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_organization_id_foreign;
ALTER TABLE users
  ADD CONSTRAINT users_organization_id_foreign
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
