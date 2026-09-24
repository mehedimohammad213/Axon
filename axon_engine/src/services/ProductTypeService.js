const AppError = require('../utils/AppError');
const ProductTypeModel = require('../models/ProductTypeModel');
const { assertProductTypeSlugAvailable } = require('../utils/uniqueness');

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function normalizeFieldSchema(fieldSchema = []) {
  if (!Array.isArray(fieldSchema)) return [];

  const usedNames = new Set();

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

async function list({ page, limit } = {}) {
  return ProductTypeModel.findPaginated({ page, limit });
}

async function show(id) {
  const productType = await ProductTypeModel.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');
  return productType;
}

async function create(body) {
  const name = String(body.name || '').trim();
  if (!name) throw new AppError(422, 'Product type name is required');

  const slug = slugify(body.slug || name);
  if (!slug) throw new AppError(422, 'Product type slug is required');
  await assertProductTypeSlugAvailable(slug);

  return ProductTypeModel.create({
    name,
    slug,
    description: body.description || null,
    field_schema: normalizeFieldSchema(body.field_schema),
    status: body.status !== false && body.status !== 0,
  });
}

async function update(id, body) {
  const productType = await ProductTypeModel.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

  const payload = {};
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
  await assertProductTypeSlugAvailable(
    payload.slug !== undefined ? payload.slug : productType.slug,
    productType.id
  );

  return ProductTypeModel.update(id, payload);
}

async function remove(id) {
  const productType = await ProductTypeModel.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

  const ProductModel = require('../models/ProductModel');
  const linked = await ProductModel.countWhere({ product_type_id: id });
  if (linked > 0) {
    throw new AppError(422, 'Cannot delete product type while products are using it');
  }

  await ProductTypeModel.remove(id);
  return 'Product type';
}

module.exports = { list, show, create, update, remove, normalizeFieldSchema };
