DROP INDEX IF EXISTS roles_org_title_uidx;
DROP INDEX IF EXISTS generated_models_org_api_route_uidx;
DROP INDEX IF EXISTS products_org_type_slug_uidx;
DROP INDEX IF EXISTS pages_org_type_slug_uidx;
DROP INDEX IF EXISTS users_platform_email_uidx;
DROP INDEX IF EXISTS users_org_email_uidx;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX users_email_key ON users (email);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_organization_id_fkey;
ALTER TABLE users
  ADD CONSTRAINT users_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;
