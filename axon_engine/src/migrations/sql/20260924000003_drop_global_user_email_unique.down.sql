ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
