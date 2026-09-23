CREATE TABLE form_builder (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  attributes JSONB,
  elements JSONB,
  additional JSONB,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX form_builder_organization_id_idx ON form_builder (organization_id);

CREATE TABLE form_submissions (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  form_id INTEGER,
  form_type VARCHAR(255),
  form_data JSONB,
  media_list JSONB,
  status VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX form_submissions_organization_id_idx ON form_submissions (organization_id);

CREATE TABLE generated_models (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  model_name VARCHAR(255) NOT NULL,
  fields JSONB NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  api_route VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX generated_models_organization_id_idx ON generated_models (organization_id);
