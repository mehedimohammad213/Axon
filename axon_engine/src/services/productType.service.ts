import AppError from '../utils/AppError';
import ProductTypeRepository from '../repositories/productType.repository';
import ProductRepository from '../repositories/product.repository';
import {
  normalizeFieldSchema,
  validateCreateProductTypeBody,
  validateUpdateProductTypeBody,
} from '../validators/productType.validator';
import type { CreateProductTypeInput, UpdateProductTypeInput } from '../models/productType.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return ProductTypeRepository.findPaginated({ page, limit });
}

async function show(id: any) {
  const productType = await ProductTypeRepository.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');
  return productType;
}

async function uniqueSlug(baseSlug: string, excludeId?: string | number) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await ProductTypeRepository.findOneWhere(
      { slug },
      { withTrashed: true }
    );
    if (!existing || (excludeId != null && String(existing.id) === String(excludeId))) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function create(body: CreateProductTypeInput) {
  const payload = validateCreateProductTypeBody(body);
  payload.slug = await uniqueSlug(payload.slug);

  try {
    return await ProductTypeRepository.create(payload);
  } catch (error: any) {
    if (error?.code === '23505') {
      payload.slug = await uniqueSlug(payload.slug);
      return ProductTypeRepository.create(payload);
    }
    throw error;
  }
}

async function update(id: any, body: UpdateProductTypeInput) {
  const productType = await ProductTypeRepository.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

  const payload = validateUpdateProductTypeBody(body);
  if (payload.slug) {
    const existing = await ProductTypeRepository.findOneWhere(
      { slug: payload.slug },
      { withTrashed: true }
    );
    if (existing && String(existing.id) !== String(id)) {
      throw new AppError(
        422,
        'A product type with this slug already exists. Choose a different name or slug.'
      );
    }
  }

  try {
    return await ProductTypeRepository.update(id, payload);
  } catch (error: any) {
    if (error?.code === '23505') {
      throw new AppError(
        422,
        'A product type with this slug already exists. Choose a different name or slug.'
      );
    }
    throw error;
  }
}

async function remove(id: any) {
  const productType = await ProductTypeRepository.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

  const linked = await ProductRepository.countWhere({ product_type_id: id });
  if (linked > 0) {
    throw new AppError(422, 'Cannot delete product type while products are using it');
  }

  await ProductTypeRepository.remove(id);
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
