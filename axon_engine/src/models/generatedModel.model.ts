export const GENERATED_MODEL_TABLE = 'generated_models';

export interface GeneratedModel {
  id: number;
  organization_id: number | null;
  model_name: string;
  fields: any;
  status: boolean;
  api_route: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface GenerateModelInput {
  modelSingular: string;
  modelPlural: string;
  fields: Record<string, any>[];
  status?: boolean;
}

export interface UpdateGeneratedModelInput {
  model_name?: string;
  fields?: Record<string, any>[];
  status?: boolean;
  api_route?: string;
}
