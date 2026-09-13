CREATE TABLE permissions (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(255),
  title VARCHAR(255),
  slug VARCHAR(255),
  description TEXT,
  api_request_type VARCHAR(255),
  api_endpoint VARCHAR(255),
  sl_no INTEGER,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description VARCHAR(555),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX roles_organization_id_idx ON roles (organization_id);

CREATE TABLE role_permission (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, permission_id)
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMPTZ,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  profile_picture_id VARCHAR(255),
  license_key VARCHAR(255),
  is_license_active BOOLEAN,
  remember_token VARCHAR(100),
  role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
  permission_id JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_organization_id_idx ON users (organization_id);
CREATE INDEX users_role_id_idx ON users (role_id);

CREATE TABLE password_reset_tokens (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ
);

CREATE TABLE personal_access_tokens (
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

CREATE INDEX personal_access_tokens_tokenable_idx ON personal_access_tokens (tokenable_type, tokenable_id);
