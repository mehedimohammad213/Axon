CREATE TABLE IF NOT EXISTS page_cards (
  id BIGSERIAL PRIMARY KEY,
  image VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_bn VARCHAR(255),
  description_en TEXT NOT NULL,
  description_bn TEXT,
  link_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cardables (
  id BIGSERIAL PRIMARY KEY,
  card_id BIGINT NOT NULL,
  cardable_id BIGINT NOT NULL,
  cardable_type VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (card_id, cardable_id, cardable_type)
);

CREATE TABLE IF NOT EXISTS formables (
  id BIGSERIAL PRIMARY KEY,
  form_id BIGINT NOT NULL,
  formable_id BIGINT NOT NULL,
  formable_type VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (form_id, formable_id, formable_type)
);

CREATE TABLE IF NOT EXISTS medex (
  id BIGSERIAL PRIMARY KEY,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  entity_id BIGINT NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medex_entity_idx ON medex (entity_id, entity_type);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id BIGSERIAL PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  abilities TEXT,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_idx
  ON personal_access_tokens (tokenable_type, tokenable_id);

ALTER TABLE forms ADD COLUMN IF NOT EXISTS formable_id BIGINT;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS formable_type VARCHAR(255);
