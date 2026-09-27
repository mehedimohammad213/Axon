import AppError from '../utils/AppError';
import { asMiddleware } from './http';
import type { CreateProductTypeInput, UpdateProductTypeInput } from '../models/productType.model';

function slugify(value: any) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

export function normalizeFieldSchema(fieldSchema: any[] = []) {
  if (!Array.isArray(fieldSchema)) return [];

  const usedNames = new Set<string>();

  return fieldSchema.map((field, index) => {
    const label = String(field.label || `Field ${index + 1}`).trim();
    let name = String(field.name || label)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!name) name = `field_${index + 1}`;
    let uniqueName = name;
    let counter = 2;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${name}_${counter}`;
      counter += 1;
    }
    usedNames.add(uniqueName);

    return {
      id: field.id || `field_${Date.now()}_${index}`,
      name: uniqueName,
      label,
      field_type: field.field_type || 'text',
      required: Boolean(field.required),
      placeholder: field.placeholder || '',
      options: Array.isArray(field.options) ? field.options : [],
      show_in_list: field.show_in_list !== false,
      currency: field.currency || 'BDT',
      min: field.min ?? 0,
      max: field.max ?? 100,
      step: field.step ?? 1,
      max_rating: field.max_rating ?? 5,
      division_label: field.division_label || 'Select Division',
      district_label: field.district_label || 'Select District',
    };
  });
}

export function validateCreateProductTypeBody(body: CreateProductTypeInput) {
  const name = String(body?.name || '').trim();
  if (!name) throw new AppError(422, 'Product type name is required');

  const slug = slugify(body.slug || name);
  if (!slug) throw new AppError(422, 'Product type slug is required');

  return {
    name,
    slug,
    description: body.description || null,
    field_schema: normalizeFieldSchema(body.field_schema),
    status: body.status !== false && body.status !== 0,
  };
}

export function validateUpdateProductTypeBody(body: UpdateProductTypeInput) {
  const payload: Record<string, any> = {};
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.description !== undefined) payload.description = body.description;
  if (body.field_schema !== undefined) {
    payload.field_schema = normalizeFieldSchema(body.field_schema);
  }
  if (body.status !== undefined) {
    payload.status = body.status !== false && body.status !== 0;
  }

  if (payload.name === '') throw new AppError(422, 'Product type name is required');
  if (payload.slug === '') throw new AppError(422, 'Product type slug is required');

  return payload;
}

export const validateCreateProductType = asMiddleware((req) => {
  req.body = validateCreateProductTypeBody(req.body);
});

export const validateUpdateProductType = asMiddleware((req) => {
  req.body = validateUpdateProductTypeBody(req.body);
});
