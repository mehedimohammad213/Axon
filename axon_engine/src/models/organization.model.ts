export const ORGANIZATION_TABLE = 'organizations';

export const ORGANIZATION_UPDATE_FIELDS = ['name', 'email', 'phone', 'is_active'] as const;

export interface Organization {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  site_key: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationUserInput {
  name: string;
  email: string;
  password: string;
  role_title?: string;
}

export interface CreateOrganizationInput {
  name: string;
  email?: string;
  phone?: string;
  users?: OrganizationUserInput[];
  admin_name?: string;
  admin_email?: string;
  admin_password?: string;
  admin_role_title?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface CreateOrganizationRoleInput {
  title: string;
  description?: string | null;
  permission_ids?: number[];
  status?: boolean;
}

export interface CreateOrganizationUserInput {
  name: string;
  email: string;
  password: string;
  role_title: string;
}

export interface UpdateOrganizationUserInput {
  name?: string;
  email?: string;
  password?: string;
  role_title?: string;
}
