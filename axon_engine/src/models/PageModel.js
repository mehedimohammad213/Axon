const { createModel } = require('./BaseModel');
const { extractComponentsFromArray, sortRecursive } = require('../utils/helpers');
const { paginatedResponse } = require('../utils/pagination');

const base = createModel('pages');

const LIST_COLUMNS = [
  'id', 'organization_id', 'slug', 'type', 'favicon_id',
  'page_name_en', 'page_name_bn', 'head', 'status', 'created_at', 'updated_at',
];

function buildPagePayload(body) {
  const body_raw = sortRecursive(extractComponentsFromArray(body.body));

  return {
    slug: body.slug,
    type: body.type,
    favicon_id: body.favicon_id,
    page_name_en: body.page_name_en,
    page_name_bn: body.page_name_bn,
    head: body.head ? JSON.stringify(body.head) : null,
    body: body.body ? JSON.stringify(body.body) : null,
    body_raw: JSON.stringify(body_raw),
    additional: body.additional ? JSON.stringify(body.additional) : null,
    status: body.status !== undefined ? body.status : true,
  };
}

async function findAllSummaryPaginated({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const baseQuery = base.query().select(...LIST_COLUMNS);
  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function findByTypePaginated(type, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const baseQuery = base.query().where({ type });
  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function findByIdOrSlug(idOrSlug) {
  if (/^\d+$/.test(idOrSlug)) {
    return base.findById(idOrSlug);
  }
  return base.query().where('slug', idOrSlug).first();
}

async function findPublishedPaginated({ type, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let baseQuery = base.query()
    .where({ status: true })
    .select(...LIST_COLUMNS);

  if (type) {
    baseQuery = baseQuery.where('type', type);
  }

  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function findPublishedByIdOrSlug(idOrSlug) {
  let page;
  if (/^\d+$/.test(idOrSlug)) {
    page = await base.query().where('pages.id', idOrSlug).where({ status: true }).first();
  } else {
    page = await base.query().where('slug', idOrSlug).where({ status: true }).first();
  }
  return page;
}

async function createPage(body) {
  return base.create(buildPagePayload(body));
}

async function updatePage(id, body, existing) {
  return base.update(id, {
    ...buildPagePayload({ ...body, status: body.status !== undefined ? body.status : existing.status }),
  });
}

module.exports = {
  ...base,
  findAllSummaryPaginated,
  findByTypePaginated,
  findByIdOrSlug,
  findPublishedPaginated,
  findPublishedByIdOrSlug,
  createPage,
  updatePage,
};
