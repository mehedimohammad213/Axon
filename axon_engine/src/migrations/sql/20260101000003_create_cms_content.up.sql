CREATE TABLE media (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255),
  file_name VARCHAR(255),
  file_type VARCHAR(255),
  file_path VARCHAR(255),
  file_size BIGINT,
  tags JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX media_organization_id_idx ON media (organization_id);

CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255),
  title_bn VARCHAR(255),
  link VARCHAR(255),
  parent_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX menu_items_organization_id_idx ON menu_items (organization_id);

CREATE TABLE navbars (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title_en VARCHAR(255),
  title_bn VARCHAR(255),
  menu_item_ids JSONB,
  logo_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX navbars_organization_id_idx ON navbars (organization_id);

CREATE TABLE cards (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  page_name VARCHAR(255),
  media_ids BIGINT,
  title_en VARCHAR(255),
  title_bn VARCHAR(255),
  description_en TEXT,
  description_bn TEXT,
  link_url VARCHAR(255),
  additional JSONB,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cards_organization_id_idx ON cards (organization_id);

CREATE TABLE sliders (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(255),
  title_en VARCHAR(255),
  title_bn VARCHAR(255),
  description_en TEXT,
  description_bn TEXT,
  media_ids JSONB,
  card_ids JSONB,
  additional JSONB,
  status SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sliders_organization_id_idx ON sliders (organization_id);

CREATE TABLE footers (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title_en VARCHAR(255),
  title_bn VARCHAR(255),
  footer_status SMALLINT DEFAULT 0,
  logo_id BIGINT,
  address1_title_en VARCHAR(255),
  address1_title_bn VARCHAR(255),
  address1_description_en TEXT,
  address1_description_bn TEXT,
  address1_status SMALLINT DEFAULT 1,
  address2_title_en VARCHAR(255),
  address2_title_bn VARCHAR(255),
  address2_description_en TEXT,
  address2_description_bn TEXT,
  address2_status SMALLINT DEFAULT 1,
  column2_menu_item_ids JSONB,
  column2_status SMALLINT DEFAULT 1,
  column3_menu_item_ids JSONB,
  column3_logos JSONB,
  column3_status SMALLINT DEFAULT 1,
  column4_title_en VARCHAR(255),
  column4_title_bn VARCHAR(255),
  column4_text_en TEXT,
  column4_text_bn TEXT,
  column4_image BIGINT,
  column4_menu_item_ids JSONB,
  column4_description_en TEXT,
  column4_description_bn TEXT,
  column4_status SMALLINT DEFAULT 1,
  bottom_menu_item_ids JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX footers_organization_id_idx ON footers (organization_id);

CREATE TABLE pages (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  slug VARCHAR(255),
  type VARCHAR(255),
  favicon_id BIGINT,
  page_name_en VARCHAR(255),
  page_name_bn VARCHAR(255),
  head JSONB,
  body JSONB,
  body_raw JSONB,
  additional JSONB,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX pages_organization_id_idx ON pages (organization_id);
CREATE INDEX pages_slug_idx ON pages (slug);

CREATE TABLE page_cards (
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
