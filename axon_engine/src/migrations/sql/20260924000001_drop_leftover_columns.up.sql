ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
ALTER TABLE users DROP COLUMN IF EXISTS remember_token;
ALTER TABLE users DROP COLUMN IF EXISTS permission_id;
ALTER TABLE users DROP COLUMN IF EXISTS license_key;
ALTER TABLE users DROP COLUMN IF EXISTS is_license_active;

ALTER TABLE permissions DROP COLUMN IF EXISTS api_request_type;
ALTER TABLE permissions DROP COLUMN IF EXISTS api_endpoint;
