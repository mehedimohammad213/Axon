CREATE TABLE product_types (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  field_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX product_types_organization_id_idx ON product_types (organization_id);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  product_type_id BIGINT NOT NULL REFERENCES product_types(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  media_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional JSONB NOT NULL DEFAULT '{}'::jsonb,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_organization_id_idx ON products (organization_id);
CREATE INDEX products_product_type_id_idx ON products (product_type_id);
CREATE INDEX products_title_idx ON products (title);
