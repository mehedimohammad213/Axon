export const TABLE_TABLE = 'tables';

export const TABLE_JSON_FIELDS = ['headers', 'rows', 'visible_columns', 'filter_columns', 'additional'] as const;

export interface Table {
  id: number;
  organization_id: number | null;
  headers?: any;
  rows?: any;
  visible_columns?: any;
  filter_columns?: any;
  additional?: any;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CreateTableInput {
  [key: string]: any;
}

export interface UpdateTableInput {
  [key: string]: any;
}
