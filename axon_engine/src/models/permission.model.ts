export const PERMISSION_TABLE = 'permissions';

export const PERMISSION_FIELDS = [
  'category',
  'title',
  'description',
  'slug',
  'sl_no',
  'status',
] as const;

export interface Permission {
  id: number;
  category: string | null;
  title: string | null;
  slug: string | null;
  description: string | null;
  sl_no: number | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePermissionInput {
  category?: string | null;
  title?: string | null;
  description?: string | null;
  slug?: string | null;
  sl_no?: number | null;
  status?: boolean;
}

export interface UpdatePermissionInput extends CreatePermissionInput {}
