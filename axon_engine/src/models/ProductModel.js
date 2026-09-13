const { findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const { paginatedResponse } = require('../utils/pagination');
const ProductTypeModel = require('./ProductTypeModel');

const base = createModel('products', {
  jsonFields: ['field_values', 'media_ids', 'additional'],
});

function normalizeMediaIds(mediaIds) {
  if (mediaIds == null || mediaIds === '') return [];
  if (Array.isArray(mediaIds)) {
    return mediaIds.filter((id) => id != null && id !== '');
  }
  return [mediaIds];
}

async function loadRelations(product) {
  if (!product) return product;

  const result = { ...product };
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
    const byId = new Map(mediaList.map((item) => [String(item.id), item]));
    result.media = mediaIds.map((id) => byId.get(String(id))).filter(Boolean);
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
} = {}) {
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
      await Promise.all(data.map(loadRelations)),
      Number(countRow.count),
      page,
      limit
    ),
  };
}

async function findByIdWithRelations(id) {
  const product = await base.findById(id);
  return loadRelations(product);
}

function preparePayload(data) {
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

async function createProduct(data) {
  const product = await base.create(preparePayload(data));
  return loadRelations(product);
}

async function updateProduct(id, data) {
  const updated = await base.update(id, preparePayload(data));
  return loadRelations(updated);
}

module.exports = {
  ...base,
  loadRelations,
  findPaginatedWithRelations,
  findByIdWithRelations,
  createProduct,
  updateProduct,
};
