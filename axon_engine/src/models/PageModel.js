const { db } = require('../db');
const { createModel } = require('./BaseModel');
const { extractComponentsFromArray, sortRecursive } = require('../utils/helpers');
const { paginatedResponse } = require('../utils/pagination');
const { takeActive, exposeActive } = require('../utils/activeField');
const AppError = require('../utils/AppError');

const base = createModel('pages', { active: true });

const LIST_COLUMNS = [
  'id', 'organization_id', 'slug', 'type', 'favicon_id',
  'page_name_en', 'page_name_bn', 'head', 'is_active', 'lifecycle',
  'published_at', 'created_by', 'updated_by', 'created_at', 'updated_at',
];

function actorId(actor) {
  return actor?.id || null;
}

function resolveLifecycle(body, existing) {
  const active = takeActive(body);
  const isActive = active !== undefined
    ? active
    : (existing ? existing.is_active !== false && existing.status !== false : true);

  if (body.lifecycle) return { isActive, lifecycle: body.lifecycle };

  if (existing && active === undefined) {
    return { isActive, lifecycle: existing.lifecycle || (isActive ? 'published' : 'draft') };
  }

  return { isActive, lifecycle: isActive ? 'published' : 'draft' };
}

function resolvePublishedAt(body, existing, lifecycle, isActive) {
  if (body.published_at !== undefined) return body.published_at;
  if (lifecycle === 'published' && isActive) {
    return existing?.published_at || new Date();
  }
  return existing?.published_at || null;
}

function buildPagePayload(body, actor, existing = null) {
  const body_raw = sortRecursive(extractComponentsFromArray(body.body));
  const { isActive, lifecycle } = resolveLifecycle(body, existing);

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
    is_active: isActive,
    lifecycle,
    published_at: resolvePublishedAt(body, existing, lifecycle, isActive),
    created_by: existing ? existing.created_by : actorId(actor),
    updated_by: actorId(actor),
  };
}

function exposePage(page) {
  return exposeActive(page);
}

async function findAllSummaryPaginated({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const baseQuery = base.query().select(...LIST_COLUMNS);
  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data.map(exposePage), countRow.count, page, limit);
}

async function findByTypePaginated(type, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const baseQuery = base.query().where({ type });
  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data.map(exposePage), countRow.count, page, limit);
}

async function findByIdOrSlug(idOrSlug) {
  if (/^\d+$/.test(idOrSlug)) {
    return base.findById(idOrSlug);
  }
  return exposePage(await base.query().where('slug', idOrSlug).first());
}

async function findPublishedPaginated({ type, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let baseQuery = base.query()
    .where({ is_active: true })
    .select(...LIST_COLUMNS);

  if (type) {
    baseQuery = baseQuery.where('type', type);
  }

  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data.map(exposePage), countRow.count, page, limit);
}

async function findPublishedByIdOrSlug(idOrSlug) {
  let page;
  if (/^\d+$/.test(idOrSlug)) {
    page = await base.query().where('pages.id', idOrSlug).where({ is_active: true }).first();
  } else {
    page = await base.query().where('slug', idOrSlug).where({ is_active: true }).first();
  }
  return exposePage(page);
}

function assertUnchanged(existing, body) {
  if (body.if_updated_at == null) return;
  const loaded = new Date(body.if_updated_at).getTime();
  const current = new Date(existing.updated_at).getTime();
  if (Number.isNaN(loaded) || loaded !== current) {
    throw new AppError(409, 'Page was updated by someone else. Reload and try again.');
  }
}

async function nextVersion(pageId) {
  const row = await db.queryOne(
    'SELECT COALESCE(MAX(version), 0)::int AS version FROM page_revisions WHERE page_id = $1',
    [pageId]
  );
  return (row?.version || 0) + 1;
}

async function snapshotPage(existing, actor) {
  if (!existing) return;
  await db.insert('page_revisions', {
    organization_id: existing.organization_id,
    page_id: existing.id,
    version: await nextVersion(existing.id),
    body: typeof existing.body === 'string' ? existing.body : JSON.stringify(existing.body || null),
    body_raw: typeof existing.body_raw === 'string' ? existing.body_raw : JSON.stringify(existing.body_raw || null),
    created_by: actorId(actor) || existing.updated_by || null,
    created_at: new Date(),
  });
}

async function listRevisions(pageId) {
  return db.queryAll(
    `SELECT id, page_id, version, created_by, created_at
     FROM page_revisions
     WHERE page_id = $1
     ORDER BY version DESC`,
    [pageId]
  );
}

async function findRevision(pageId, version) {
  return db.queryOne(
    'SELECT * FROM page_revisions WHERE page_id = $1 AND version = $2',
    [pageId, version]
  );
}

async function createPage(body, actor = null) {
  const page = await base.create(buildPagePayload(body, actor));
  await snapshotPage(page, actor);
  return page;
}

async function updatePage(id, body, existing, actor = null) {
  assertUnchanged(existing, body);
  await snapshotPage(existing, actor);
  return base.update(id, buildPagePayload(body, actor, existing));
}

async function restoreRevision(id, version, existing, actor = null) {
  const revision = await findRevision(id, version);
  if (!revision) throw new AppError(404, 'Revision not found');

  await snapshotPage(existing, actor);
  return base.update(id, {
    body: typeof revision.body === 'string' ? revision.body : JSON.stringify(revision.body),
    body_raw: typeof revision.body_raw === 'string' ? revision.body_raw : JSON.stringify(revision.body_raw),
    updated_by: actorId(actor),
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
  listRevisions,
  findRevision,
  restoreRevision,
};
