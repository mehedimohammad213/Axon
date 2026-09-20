import AppError from '../utils/AppError';
import ProductTypeModel from '../models/ProductTypeModel';
import ProductModel from '../models/ProductModel';

function slugify(value: any) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function normalizeFieldSchema(fieldSchema: any[] = []) {
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

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return ProductTypeModel.findPaginated({ page, limit });
}

async function show(id: any) {
  const productType = await ProductTypeModel.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');
  return productType;
}

async function create(body: any) {
  const name = String(body.name || '').trim();
  if (!name) throw new AppError(422, 'Product type name is required');

  const slug = slugify(body.slug || name);
  if (!slug) throw new AppError(422, 'Product type slug is required');

  return ProductTypeModel.create({
    name,
    slug,
    description: body.description || null,
    field_schema: normalizeFieldSchema(body.field_schema),
    status: body.status !== false && body.status !== 0,
  });
}

async function update(id: any, body: any) {
  const productType = await ProductTypeModel.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

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

  return ProductTypeModel.update(id, payload);
}

async function remove(id: any) {
  const productType = await ProductTypeModel.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

  const linked = await ProductModel.countWhere({ product_type_id: id });
  if (linked > 0) {
    throw new AppError(422, 'Cannot delete product type while products are using it');
  }

  await ProductTypeModel.remove(id);
  return 'Product type';
}

export default {
  list,
  show,
  create,
  update,
  remove,
  normalizeFieldSchema,
};
export { list, show, create, update, remove, normalizeFieldSchema };
