const AppError = require('../utils/AppError');
const ProductModel = require('../models/ProductModel');
const ProductTypeModel = require('../models/ProductTypeModel');
const { assertProductSlugAvailable } = require('../utils/uniqueness');

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function parseFieldSchema(fieldSchema) {
  if (typeof fieldSchema === 'string') {
    try {
      return JSON.parse(fieldSchema || '[]');
    } catch {
      return [];
    }
  }
  return Array.isArray(fieldSchema) ? fieldSchema : [];
}

function isEmptyValue(raw, fieldType) {
  if (fieldType === 'checkbox' || fieldType === 'toggle') {
    return raw === undefined || raw === null;
  }

  if (fieldType === 'rating' || fieldType === 'range' || fieldType === 'quantity' || fieldType === 'price') {
    return raw === undefined || raw === null || raw === '';
  }

  if (fieldType === 'location') {
    return !raw || (raw.division == null && raw.district == null);
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

function validateFieldValues(fieldSchema, fieldValues = {}) {
  const values = fieldValues && typeof fieldValues === 'object' ? fieldValues : {};
  const normalized = {};

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

async function list({ page, limit, product_type_id } = {}) {
  return ProductModel.findPaginatedWithRelations({ page, limit, product_type_id });
}

async function show(id) {
  const product = await ProductModel.findByIdWithRelations(id);
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

async function create(body) {
  const title = String(body.title || '').trim();
  if (!title) throw new AppError(422, 'Product title is required');

  const productTypeId = body.product_type_id;
  if (!productTypeId) throw new AppError(422, 'Product type is required');

  const productType = await ProductTypeModel.findById(productTypeId);
  if (!productType) throw new AppError(404, 'Product type not found');

  const fieldSchema = parseFieldSchema(productType.field_schema);
  const fieldValues = validateFieldValues(fieldSchema, body.field_values);
  const slug = slugify(body.slug || title) || null;
  await assertProductSlugAvailable(slug, productTypeId);

  return ProductModel.createProduct({
    product_type_id: productTypeId,
    title,
    slug,
    description: body.description || null,
    field_values: fieldValues,
    media_ids: body.media_ids || [],
    additional: body.additional || {},
    status: body.status !== false && body.status !== 0,
  });
}

async function update(id, body) {
  const product = await ProductModel.findById(id);
  if (!product) throw new AppError(404, 'Product not found');

  const productTypeId = body.product_type_id || product.product_type_id;
  const productType = await ProductTypeModel.findById(productTypeId);
  if (!productType) throw new AppError(404, 'Product type not found');

  const payload = {};
  if (body.title !== undefined) {
    payload.title = String(body.title).trim();
    if (!payload.title) throw new AppError(422, 'Product title is required');
  }
  if (body.slug !== undefined) payload.slug = slugify(body.slug) || null;
  if (body.description !== undefined) payload.description = body.description;
  if (body.media_ids !== undefined) payload.media_ids = body.media_ids;
  if (body.additional !== undefined) payload.additional = body.additional;
  if (body.status !== undefined) {
    payload.status = body.status !== false && body.status !== 0;
  }
  if (body.product_type_id !== undefined) {
    payload.product_type_id = productTypeId;
  }
  if (body.field_values !== undefined) {
    const fieldSchema = parseFieldSchema(productType.field_schema);
    payload.field_values = validateFieldValues(fieldSchema, body.field_values);
  }

  await assertProductSlugAvailable(
    payload.slug !== undefined ? payload.slug : product.slug,
    productTypeId,
    product.id
  );

  return ProductModel.updateProduct(id, payload);
}

async function remove(id) {
  const product = await ProductModel.findById(id);
  if (!product) throw new AppError(404, 'Product not found');
  await ProductModel.remove(id);
  return 'Product';
}

module.exports = { list, show, create, update, remove };
