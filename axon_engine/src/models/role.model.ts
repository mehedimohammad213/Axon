export const ROLE_TABLE = 'roles';

export interface Role {
  id: number;
  organization_id: number | null;
  title: string | null;
  description: string | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoleWithPermissions extends Role {
  permission_headless: Record<string, any>[];
}

export interface CreateRoleInput {
  title?: string | null;
  description?: string | null;
  permission_ids?: number[];
  status?: boolean;
}

export interface UpdateRoleInput extends CreateRoleInput {}
