export const FORM_BUILDER_TABLE = 'form_builder';

export const FORM_BUILDER_JSON_FIELDS = ['attributes', 'elements', 'additional'] as const;

export interface FormBuilder {
  id: number;
  organization_id: number | null;
  attributes?: any;
  elements?: any;
  additional?: any;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CreateFormBuilderInput {
  [key: string]: any;
}

export interface UpdateFormBuilderInput {
  [key: string]: any;
}
