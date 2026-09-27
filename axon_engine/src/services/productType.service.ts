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

async function create(body: CreateProductTypeInput) {
  return ProductTypeRepository.create(validateCreateProductTypeBody(body));
}

async function update(id: any, body: UpdateProductTypeInput) {
  const productType = await ProductTypeRepository.findById(id);
  if (!productType) throw new AppError(404, 'Product type not found');

  return ProductTypeRepository.update(id, validateUpdateProductTypeBody(body));
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
