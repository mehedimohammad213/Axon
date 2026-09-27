import AppError from '../utils/AppError';
import { asMiddleware } from './http';
import type { CreateProductInput, UpdateProductInput } from '../models/product.model';

export function slugify(value: any) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

export function parseFieldSchema(fieldSchema: any) {
  if (typeof fieldSchema === 'string') {
    try {
      return JSON.parse(fieldSchema || '[]');
    } catch {
      return [];
    }
  }
  return Array.isArray(fieldSchema) ? fieldSchema : [];
}

function isEmptyValue(raw: any, fieldType: string) {
  if (fieldType === 'checkbox' || fieldType === 'toggle') {
    return raw === undefined || raw === null;
  }

  if (
    fieldType === 'rating' ||
    fieldType === 'range' ||
    fieldType === 'quantity' ||
    fieldType === 'price'
  ) {
    return raw === undefined || raw === null || raw === '';
  }

  if (fieldType === 'location') {
    const loc = raw as { division?: any; district?: any } | null;
    return !raw || (loc?.division == null && loc?.district == null);
  }

  if (fieldType === 'gallery') {
    return !Array.isArray(raw) || raw.length === 0;
  }

  return (
    raw === undefined ||
    raw === null ||
    (typeof raw === 'string' && raw.trim() === '') ||
    (Array.isArray(raw) && raw.length === 0)
  );
}

export function validateFieldValues(fieldSchema: any[], fieldValues: Record<string, any> = {}) {
  const values = fieldValues && typeof fieldValues === 'object' ? fieldValues : {};
  const normalized: Record<string, any> = {};

  for (const field of fieldSchema) {
    const raw = values[field.name];
    const empty = isEmptyValue(raw, field.field_type);

    if (field.required && empty) {
      throw new AppError(422, `${field.label || field.name} is required`);
    }

    if (field.required && field.field_type === 'checkbox' && raw !== true) {
      throw new AppError(422, `${field.label || field.name} is required`);
    }

    if (!empty || typeof raw === 'boolean') {
      if (field.field_type === 'price') {
        normalized[field.name] = {
          amount: Number(raw),
          currency: field.currency || 'BDT',
        };
      } else {
        normalized[field.name] = raw;
      }
    }
  }

  return normalized;
}

export function validateCreateProductBody(body: CreateProductInput) {
  const title = String(body?.title || '').trim();
  if (!title) throw new AppError(422, 'Product title is required');
  if (!body?.product_type_id) throw new AppError(422, 'Product type is required');
  return body;
}

export function validateUpdateProductTitle(title: unknown) {
  const trimmed = String(title).trim();
  if (!trimmed) throw new AppError(422, 'Product title is required');
  return trimmed;
}

export const validateCreateProduct = asMiddleware((req) => {
  validateCreateProductBody(req.body);
});
