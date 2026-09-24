const { queryAll, queryOne } = require('../db');
const { createModel } = require('./BaseModel');
const { paginatedResponse } = require('../utils/pagination');
const OrganizationContext = require('../context/organizationContext');

const base = createModel('api_keys');

function publicRow(row) {
  if (!row) return row;
  const result = { ...row };
  delete result.key_hash;
  return result;
}

function liveScope() {
  const params = [];
  const wheres = ['revoked_at IS NULL'];
  const orgId = OrganizationContext.get();
  if (orgId && !OrganizationContext.isBypassed()) {
    params.push(orgId);
    wheres.push(`organization_id = $${params.length}`);
  }
  return { where: `WHERE ${wheres.join(' AND ')}`, params };
}

async function findByIdPublic(id) {
  return publicRow(await base.findById(id));
}

async function findAllLivePaginated({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { where, params } = liveScope();
  const [data, countRow] = await Promise.all([
    queryAll(
      `SELECT * FROM api_keys ${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    queryOne(`SELECT COUNT(*)::int AS count FROM api_keys ${where}`, params),
  ]);

  return paginatedResponse(data.map(publicRow), countRow.count, page, limit);
}

module.exports = {
  ...base,
  publicRow,
  findByIdPublic,
  findAllLivePaginated,
};
