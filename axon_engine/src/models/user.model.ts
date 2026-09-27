export const USER_TABLE = 'users';

export const USER_LIST_COLUMNS = [
  'id',
  'organization_id',
  'name',
  'email',
  'phone',
  'profile_picture_id',
  'role_id',
  'is_super_admin',
  'created_at',
  'updated_at',
] as const;

export const USER_UPDATE_FIELDS = [
  'name',
  'phone',
  'email',
  'profile_picture_id',
  'role_id',
] as const;

export interface User {
  id: number;
  organization_id: number | null;
  is_super_admin: boolean;
  name: string;
  email: string;
  password?: string;
  phone: string | null;
  profile_picture_id: string | null;
  role_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserRole {
  id: number;
  organization_id: number | null;
  title: string;
  description?: string | null;
  status?: boolean;
  permission_headless?: Record<string, any>[];
}

export interface UserOrganization {
  id: number;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
  site_key?: string | null;
}

export interface UserWithRelations extends Omit<User, 'password'> {
  organization: UserOrganization | null;
  role_headless: UserRole | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
  phone?: string | null;
  profile_picture_id?: string | null;
  role_id?: number | string | null;
  organization_id?: number | string;
}

export interface CreateUserRecord {
  name: string;
  email: string;
  password: string;
  phone: string | null;
  profile_picture_id: string | null;
  role_id: number | string | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string | null;
  profile_picture_id?: string | null;
  role_id?: number | string | null;
}

export type UserUpdateField = (typeof USER_UPDATE_FIELDS)[number];
