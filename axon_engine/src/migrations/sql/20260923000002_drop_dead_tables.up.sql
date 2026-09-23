DROP TABLE IF EXISTS page_cards;
DROP TABLE IF EXISTS cardables;
DROP TABLE IF EXISTS formables;
DROP TABLE IF EXISTS medex;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS personal_access_tokens;

ALTER TABLE forms DROP COLUMN IF EXISTS formable_id;
ALTER TABLE forms DROP COLUMN IF EXISTS formable_type;
