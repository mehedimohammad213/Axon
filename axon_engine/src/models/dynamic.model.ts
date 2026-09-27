export interface DynamicField {
  name: string;
  type?: string;
  required?: boolean;
  [key: string]: any;
}

export interface DynamicRecord {
  id: number;
  organization_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
  [key: string]: any;
}

export interface DynamicListQuery {
  model?: string;
  architecture?: string;
  page?: number;
  limit?: number;
  requireActive?: boolean;
}
