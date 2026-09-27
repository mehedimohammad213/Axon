import { asMiddleware, validationFailed } from './http';
import type { DynamicField } from '../models/dynamic.model';

export function parseFields(fields: string | Record<string, any>[] | null | undefined) {
  if (!fields) return [];
  return typeof fields === 'string' ? JSON.parse(fields) : fields;
}

export function validateDynamicFields(
  fields: DynamicField[],
  data: Record<string, any>,
  { partial = false } = {}
) {
  const errors: Record<string, string[]> = {};
  for (const field of fields) {
    const value = data[field.name];
    if (partial && value === undefined) continue;
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = [`The ${field.name} field is required.`];
    }
  }
  return Object.keys(errors).length ? errors : null;
}

export function requireModelQuery(model: string | undefined) {
  if (!model) {
    validationFailed({ model: ['The model query parameter is required.'] });
  }
  return model;
}

export function requireModelQueryForList(model: string | undefined) {
  if (!model) {
    validationFailed({ model: ['The model query parameter is required for listing.'] });
  }
  return model;
}

export const validateDynamicModelQuery = asMiddleware((req) => {
  requireModelQuery(req.query.model as string | undefined);
});
