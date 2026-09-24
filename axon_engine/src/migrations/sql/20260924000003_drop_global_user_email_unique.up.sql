-- The live database used users_email_unique (not users_email_key).
-- Phase 1 requires email uniqueness to be per organization.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;
DROP INDEX IF EXISTS users_email_key;
DROP INDEX IF EXISTS users_email_unique;
