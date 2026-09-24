const { createModel } = require('./BaseModel');
const { extractComponentsFromArray, sortRecursive } = require('../utils/helpers');
const { paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');

const base = createModel('pages');

const LIST_COLUMNS = [
  'id', 'organization_id', 'slug', 'type', 'favicon_id',
  'page_name_en', 'page_name_bn', 'head', 'status', 'lifecycle',
  'published_at', 'created_by', 'updated_by', 'created_at', 'updated_at',
];

function actorId(actor) {
  return actor?.id || null;
}

function resolveLifecycle(body, existing) {
  const status = body.status !== undefined
    ? body.status
    : (existing ? existing.status : true);

  if (body.lifecycle) return { status, lifecycle: body.lifecycle };

  if (existing && body.status === undefined) {
    return { status, lifecycle: existing.lifecycle || (status ? 'published' : 'draft') };
  }

  return { status, lifecycle: status ? 'published' : 'draft' };
}

function resolvePublishedAt(body, existing, lifecycle, status) {
  if (body.published_at !== undefined) return body.published_at;
  if (lifecycle === 'published' && status) {
    return existing?.published_at || new Date();
  }
  return existing?.published_at || null;
}

function buildPagePayload(body, actor, existing = null) {
  const body_raw = sortRecursive(extractComponentsFromArray(body.body));
  const { status, lifecycle } = resolveLifecycle(body, existing);

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
    status,
    lifecycle,
    published_at: resolvePublishedAt(body, existing, lifecycle, status),
    created_by: existing ? existing.created_by : actorId(actor),
    updated_by: actorId(actor),
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

function assertUnchanged(existing, body) {
  if (body.if_updated_at == null) return;
  const loaded = new Date(body.if_updated_at).getTime();
  const current = new Date(existing.updated_at).getTime();
  if (Number.isNaN(loaded) || loaded !== current) {
    throw new AppError(409, 'Page was updated by someone else. Reload and try again.');
  }
}

async function createPage(body, actor = null) {
  return base.create(buildPagePayload(body, actor));
}

async function updatePage(id, body, existing, actor = null) {
  assertUnchanged(existing, body);
  return base.update(id, buildPagePayload(body, actor, existing));
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
