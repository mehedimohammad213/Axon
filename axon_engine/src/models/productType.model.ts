export const PRODUCT_TYPE_TABLE = 'product_types';

export interface ProductTypeField {
  id: string;
  name: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder?: string;
  options?: any[];
  show_in_list?: boolean;
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
  max_rating?: number;
  division_label?: string;
  district_label?: string;
}

export interface ProductType {
  id: number;
  organization_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  field_schema: ProductTypeField[] | string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductTypeInput {
  name: string;
  slug?: string;
  description?: string | null;
  field_schema?: any[];
  status?: boolean | number;
}

export interface UpdateProductTypeInput {
  name?: string;
  slug?: string;
  description?: string | null;
  field_schema?: any[];
  status?: boolean | number;
}
