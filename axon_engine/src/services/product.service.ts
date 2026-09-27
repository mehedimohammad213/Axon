import AppError from '../utils/AppError';
import ProductRepository from '../repositories/product.repository';
import ProductTypeRepository from '../repositories/productType.repository';
import {
  parseFieldSchema,
  slugify,
  validateCreateProductBody,
  validateFieldValues,
  validateUpdateProductTitle,
} from '../validators/product.validator';
import type { CreateProductInput, UpdateProductInput } from '../models/product.model';

async function list({
  page,
  limit,
  product_type_id,
}: { page?: number; limit?: number; product_type_id?: any } = {}) {
  return ProductRepository.findPaginatedWithRelations({ page, limit, product_type_id });
}

async function show(id: any) {
  const product = await ProductRepository.findByIdWithRelations(id);
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

async function create(body: CreateProductInput) {
  const { title: rawTitle, product_type_id: productTypeId } = validateCreateProductBody(body);
  const title = String(rawTitle || '').trim();

  const productType = await ProductTypeRepository.findById(productTypeId);
  if (!productType) throw new AppError(404, 'Product type not found');

  const fieldSchema = parseFieldSchema(productType.field_schema);
  const fieldValues = validateFieldValues(fieldSchema, body.field_values);

  return ProductRepository.createProduct({
    product_type_id: productTypeId,
    title,
    slug: slugify(body.slug || title) || null,
    description: body.description || null,
    field_values: fieldValues,
    media_ids: body.media_ids || [],
    additional: body.additional || {},
    status: body.status !== false && body.status !== 0,
  });
}

async function update(id: any, body: UpdateProductInput) {
  const product = await ProductRepository.findById(id);
  if (!product) throw new AppError(404, 'Product not found');

  const productTypeId = body.product_type_id || product.product_type_id;
  const productType = await ProductTypeRepository.findById(productTypeId);
  if (!productType) throw new AppError(404, 'Product type not found');

  const payload: Record<string, any> = {};
  if (body.title !== undefined) {
    payload.title = validateUpdateProductTitle(body.title);
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

  return ProductRepository.updateProduct(id, payload);
}

async function remove(id: any) {
  const product = await ProductRepository.findById(id);
  if (!product) throw new AppError(404, 'Product not found');
  await ProductRepository.remove(id);
  return 'Product';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
