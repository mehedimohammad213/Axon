import { findWhereIn } from '../db';
import { createModel } from './BaseModel';
import { paginatedResponse } from '../utils/pagination';
import ProductTypeModel from './ProductTypeModel';

const base = createModel('products', {
  jsonFields: ['field_values', 'media_ids', 'additional'],
});

function normalizeMediaIds(mediaIds: unknown): (number | string)[] {
  if (mediaIds == null || mediaIds === '') return [];
  if (Array.isArray(mediaIds)) {
    return mediaIds.filter((id) => id != null && id !== '') as (number | string)[];
  }
  return [mediaIds as number | string];
}

async function loadRelations(product: Record<string, any> | null | undefined) {
  if (!product) return product;

  const result: Record<string, any> = { ...product };
  result.media_ids = normalizeMediaIds(product.media_ids);
  result.field_values =
    typeof product.field_values === 'string'
      ? JSON.parse(product.field_values || '{}')
      : product.field_values || {};
  result.additional =
    typeof product.additional === 'string'
      ? JSON.parse(product.additional || '{}')
      : product.additional || {};

  if (product.product_type_id) {
    const productType = await ProductTypeModel.findById(product.product_type_id);
    if (productType) {
      result.product_type = {
        ...productType,
        field_schema:
          typeof productType.field_schema === 'string'
            ? JSON.parse(productType.field_schema || '[]')
            : productType.field_schema || [],
      };
    }
  }

  const mediaIds = result.media_ids;
  if (mediaIds.length) {
    const mediaList = await findWhereIn('media', 'id', mediaIds);
    const byId = new Map(mediaList.map((item: Record<string, any>) => [String(item.id), item]));
    result.media = mediaIds.map((id: number | string) => byId.get(String(id))).filter(Boolean);
    result.media_files = result.media[0] || null;
  } else {
    result.media = [];
    result.media_files = null;
  }

  return result;
}

async function findPaginatedWithRelations({
  page = 1,
  limit = 20,
  product_type_id,
}: { page?: number; limit?: number; product_type_id?: number | string } = {}) {
  const offset = (page - 1) * limit;
  const query = base.query();

  if (product_type_id) {
    query.where('product_type_id', product_type_id);
  }

  const [data, countRow] = await Promise.all([
    query.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    query.clone().count().first(),
  ]);

  return {
    ...paginatedResponse(
      await Promise.all(data.map((row: Record<string, any>) => loadRelations(row))),
      Number(countRow.count),
      page,
      limit
    ),
  };
}

async function findByIdWithRelations(id: number | string) {
  const product = await base.findById(id);
  return loadRelations(product);
}

function preparePayload(data: Record<string, any>) {
  const payload = { ...data };

  if (payload.media_ids != null) {
    payload.media_ids = normalizeMediaIds(payload.media_ids);
  }
  if (payload.field_values == null) {
    payload.field_values = {};
  }
  if (payload.additional == null) {
    payload.additional = {};
  }

  delete payload.product_type;
  delete payload.media;
  delete payload.media_files;

  return payload;
}

async function createProduct(data: Record<string, any>) {
  const product = await base.create(preparePayload(data));
  return loadRelations(product);
}

async function updateProduct(id: number | string, data: Record<string, any>) {
  const updated = await base.update(id, preparePayload(data));
  return loadRelations(updated);
}

export default {
  ...base,
  loadRelations,
  findPaginatedWithRelations,
  findByIdWithRelations,
  createProduct,
  updateProduct,
};
