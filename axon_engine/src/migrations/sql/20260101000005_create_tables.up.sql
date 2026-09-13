CREATE TABLE tables (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  page_name VARCHAR(255),
  title_en VARCHAR(255),
  title_bn VARCHAR(255),
  headers JSONB,
  rows JSONB,
  visible_columns JSONB,
  filter_columns JSONB,
  additional JSONB,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tables_organization_id_idx ON tables (organization_id);
