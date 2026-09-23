CREATE TABLE IF NOT EXISTS forms (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title_en VARCHAR(255) NOT NULL,
  title_bn VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  fields JSONB NOT NULL,
  submit_direction VARCHAR(255),
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS forms_organization_id_idx ON forms (organization_id);
CREATE INDEX IF NOT EXISTS forms_deleted_at_idx ON forms (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS form_data (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  form_id BIGINT,
  order_id VARCHAR(255),
  order_date DATE,
  order_type VARCHAR(255),
  gas_id BIGINT,
  order_details JSONB,
  total_amount DECIMAL(10, 2),
  customer_id BIGINT,
  dealer_id BIGINT,
  contact_person_id BIGINT,
  additional_person_id BIGINT,
  message TEXT,
  additionals JSONB,
  order_status VARCHAR(255),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS form_data_organization_id_idx ON form_data (organization_id);
CREATE INDEX IF NOT EXISTS form_data_deleted_at_idx ON form_data (deleted_at) WHERE deleted_at IS NOT NULL;
