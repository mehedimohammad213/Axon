const { db } = require('../db');
const { scopedQuery, withOrganizationId } = require('../db/queryScope');
const OrganizationContext = require('../context/organizationContext');
const AppError = require('../utils/AppError');
const { isBlockedTable, isValidTableName } = require('../config/blockedTables');
const { paginatedResponse } = require('../utils/pagination');

function parseFields(fields) {
  if (!fields) return [];
  return typeof fields === 'string' ? JSON.parse(fields) : fields;
}

function validateDynamicFields(fields, data, { partial = false } = {}) {
  const errors = {};
  for (const field of fields) {
    const value = data[field.name];
    if (partial && value === undefined) continue;
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = [`The ${field.name} field is required.`];
    }
  }
  return Object.keys(errors).length ? errors : null;
}

async function findRegisteredModel(tableName) {
  const orgId = OrganizationContext.get();
  const params = [`%model=${tableName}%`, `%model=${tableName}&%`];
  let sql = `SELECT * FROM generated_models
             WHERE (api_route LIKE $1 OR api_route LIKE $2)`;

  if (orgId && !OrganizationContext.isBypassed()) {
    sql += ' AND organization_id = $3';
    params.push(orgId);
  }

  sql += ' ORDER BY id DESC LIMIT 1';
  return db.queryOne(sql, params);
}

async function assertAllowedTable(tableName, { requireActive = false } = {}) {
  if (!isValidTableName(tableName)) {
    throw new AppError(422, 'Validation failed', {
      model: ['Invalid table name.'],
    });
  }

  if (isBlockedTable(tableName)) {
    throw new AppError(403, 'Access to this table is not allowed.');
  }

  if (!(await db.tableExists(tableName))) {
    throw new AppError(404, `Table ${tableName} not found`);
  }

  const registered = await findRegisteredModel(tableName);
  if (!registered) {
    throw new AppError(403, 'This table is not registered as a generated model.');
  }

  if (requireActive && !registered.status) {
    throw new AppError(403, 'This model is not active.');
  }

  return registered;
}

async function findArchitecture(architecture) {
  const orgId = OrganizationContext.get();
  const params = [architecture, `%${architecture}%`];
  let sql = `SELECT * FROM generated_models
             WHERE (model_name ILIKE $1 OR api_route ILIKE $2)`;

  if (orgId && !OrganizationContext.isBypassed()) {
    sql += ' AND organization_id = $3';
    params.push(orgId);
  }

  sql += ' ORDER BY id DESC LIMIT 1';
  return db.queryOne(sql, params);
}

async function tableExists(tableName) {
  return db.tableExists(tableName);
}

async function findAllRecords(tableName, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const baseQuery = scopedQuery(tableName);
  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function findRecord(tableName, id) {
  return scopedQuery(tableName).where(`${tableName}.id`, id).first();
}

async function createRecord(tableName, data, fields = []) {
  const payload = { ...data, created_at: new Date(), updated_at: new Date() };
  for (const field of fields) {
    if ((field.type === 'json' || field.type === 'array') && payload[field.name]) {
      payload[field.name] = JSON.stringify(payload[field.name]);
    }
  }

  return db.insert(tableName, withOrganizationId(payload));
}

async function updateRecord(tableName, id, data, fields = []) {
  const payload = { ...data, updated_at: new Date() };
  delete payload.id;
  delete payload.created_at;

  for (const field of fields) {
    if ((field.type === 'json' || field.type === 'array') && payload[field.name] !== undefined) {
      payload[field.name] = JSON.stringify(payload[field.name]);
    }
  }

  return db.update(tableName, { id }, payload);
}

async function deleteRecord(tableName, id) {
  return db.remove(tableName, { id });
}

module.exports = {
  parseFields,
  validateDynamicFields,
  findRegisteredModel,
  assertAllowedTable,
  findArchitecture,
  tableExists,
  findAllRecords,
  findRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
