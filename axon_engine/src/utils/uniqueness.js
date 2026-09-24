const { db } = require('../db');
const OrganizationContext = require('../context/organizationContext');
const AppError = require('./AppError');

function taken(field, message) {
  throw new AppError(422, message, { [field]: [message] });
}

async function findOrganizationByHint(hint, executor = db) {
  if (hint == null || String(hint).trim() === '') return null;
  const value = String(hint).trim();

  if (/^\d+$/.test(value)) {
    return executor.findOne('organizations', { id: Number(value) });
  }

  return (
    (await executor.findOne('organizations', { slug: value })) ||
    (await executor.findOne('organizations', { site_key: value }))
  );
}

function currentOrganizationId(fallback) {
  return OrganizationContext.get() || fallback || null;
}

async function existsWhere(sql, params) {
  const row = await db.queryOne(sql, params);
  return Boolean(row);
}

async function assertEmailAvailable(email, organizationId, excludeUserId = null) {
  if (!email) return;

  if (organizationId) {
    const params = [email, organizationId];
    let sql = 'SELECT id FROM users WHERE email = $1 AND organization_id = $2';
    if (excludeUserId) {
      params.push(excludeUserId);
      sql += ' AND id <> $3';
    }
    if (await existsWhere(`${sql} LIMIT 1`, params)) {
      taken('email', 'The email has already been taken in this organization.');
    }
    return;
  }

  const params = [email];
  let sql = 'SELECT id FROM users WHERE email = $1 AND organization_id IS NULL';
  if (excludeUserId) {
    params.push(excludeUserId);
    sql += ' AND id <> $2';
  }
  if (await existsWhere(`${sql} LIMIT 1`, params)) {
    taken('email', 'The email has already been taken.');
  }
}

async function assertPageSlugAvailable(slug, type, excludeId = null) {
  if (!slug) return;
  const orgId = currentOrganizationId();
  if (!orgId) return;

  const params = [orgId, type || 'page', slug];
  let sql = `
    SELECT id FROM pages
    WHERE organization_id = $1
      AND COALESCE(type, 'page') = $2
      AND slug = $3
      AND deleted_at IS NULL
  `;
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $4';
  }
  if (await existsWhere(`${sql} LIMIT 1`, params)) {
    taken('slug', 'A page with this slug already exists.');
  }
}

async function assertProductSlugAvailable(slug, productTypeId, excludeId = null) {
  if (!slug || !productTypeId) return;
  const orgId = currentOrganizationId();
  if (!orgId) return;

  const params = [orgId, productTypeId, slug];
  let sql = `
    SELECT id FROM products
    WHERE organization_id = $1
      AND product_type_id = $2
      AND slug = $3
      AND deleted_at IS NULL
  `;
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $4';
  }
  if (await existsWhere(`${sql} LIMIT 1`, params)) {
    taken('slug', 'A product with this slug already exists.');
  }
}

async function assertProductTypeSlugAvailable(slug, excludeId = null) {
  if (!slug) return;
  const orgId = currentOrganizationId();
  if (!orgId) return;

  const params = [orgId, slug];
  let sql = 'SELECT id FROM product_types WHERE organization_id = $1 AND slug = $2 AND deleted_at IS NULL';
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $3';
  }
  if (await existsWhere(`${sql} LIMIT 1`, params)) {
    taken('slug', 'A product type with this slug already exists.');
  }
}

async function assertGeneratedRouteAvailable(apiRoute, excludeId = null) {
  if (!apiRoute) return;
  const orgId = currentOrganizationId();
  if (!orgId) return;

  const params = [orgId, apiRoute];
  let sql = 'SELECT id FROM generated_models WHERE organization_id = $1 AND api_route = $2 AND deleted_at IS NULL';
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $3';
  }
  if (await existsWhere(`${sql} LIMIT 1`, params)) {
    taken('api_route', 'A generated model already uses this API route.');
  }
}

async function assertRoleTitleAvailable(title, organizationId, excludeId = null) {
  if (!title) return;
  const orgId = organizationId || currentOrganizationId();
  if (!orgId) return;

  const params = [orgId, title];
  let sql = 'SELECT id FROM roles WHERE organization_id = $1 AND title = $2';
  if (excludeId) {
    params.push(excludeId);
    sql += ' AND id <> $3';
  }
  if (await existsWhere(`${sql} LIMIT 1`, params)) {
    taken('title', 'A role with this title already exists.');
  }
}

module.exports = {
  findOrganizationByHint,
  currentOrganizationId,
  assertEmailAvailable,
  assertPageSlugAvailable,
  assertProductSlugAvailable,
  assertProductTypeSlugAvailable,
  assertGeneratedRouteAvailable,
  assertRoleTitleAvailable,
};
