export const PRODUCT_TABLE = 'products';

export interface Product {
  id: number;
  organization_id: number | null;
  product_type_id: number;
  title: string;
  slug: string | null;
  description: string | null;
  field_values: Record<string, any> | string;
  media_ids: any;
  additional: Record<string, any> | string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  title: string;
  product_type_id: number | string;
  slug?: string;
  description?: string | null;
  field_values?: Record<string, any>;
  media_ids?: any;
  additional?: Record<string, any>;
  status?: boolean | number;
}

export interface UpdateProductInput {
  title?: string;
  product_type_id?: number | string;
  slug?: string;
  description?: string | null;
  field_values?: Record<string, any>;
  media_ids?: any;
  additional?: Record<string, any>;
  status?: boolean | number;
}
