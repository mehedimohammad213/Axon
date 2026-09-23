import { db } from '../db';
import { scopedQuery, withOrganizationId } from '../db/queryScope';
import OrganizationContext from '../context/organizationContext';
import AppError from '../utils/AppError';
import { isBlockedTable, isValidTableName } from '../config/blockedTables';
import { paginatedResponse } from '../utils/pagination';

function parseFields(fields: string | Record<string, any>[] | null | undefined) {
  if (!fields) return [];
  return typeof fields === 'string' ? JSON.parse(fields) : fields;
}

function validateDynamicFields(fields: Record<string, any>[], data: Record<string, any>, { partial = false } = {}) {
  const errors: Record<string, string[]> = {};
  for (const field of fields) {
    const value = data[field.name];
    if (partial && value === undefined) continue;
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = [`The ${field.name} field is required.`];
    }
  }
  return Object.keys(errors).length ? errors : null;
}

async function findRegisteredModel(tableName: string, { withTrashed = false } = {}) {
  const orgId = OrganizationContext.get();
  const params: (string | number)[] = [`%model=${tableName}%`, `%model=${tableName}&%`];
  let sql = `SELECT * FROM generated_models
             WHERE (api_route LIKE $1 OR api_route LIKE $2)`;

  if (!withTrashed) {
    sql += ' AND deleted_at IS NULL';
  }

  if (orgId && !OrganizationContext.isBypassed()) {
    sql += ` AND organization_id = $${params.length + 1}`;
    params.push(orgId);
  }

  sql += ' ORDER BY id DESC LIMIT 1';
  return db.queryOne(sql, params);
}

async function assertAllowedTable(
  tableName: string,
  { requireActive = false, withTrashed = false } = {}
) {
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

  const registered = await findRegisteredModel(tableName, { withTrashed });
  if (!registered) {
    throw new AppError(403, 'This table is not registered as a generated model.');
  }

  if (requireActive && !registered.status) {
    throw new AppError(403, 'This model is not active.');
  }

  return registered;
}

async function findArchitecture(architecture: string) {
  const orgId = OrganizationContext.get();
  const params: (string | number)[] = [architecture, `%${architecture}%`];
  let sql = `SELECT * FROM generated_models
             WHERE deleted_at IS NULL
               AND (model_name ILIKE $1 OR api_route ILIKE $2)`;

  if (orgId && !OrganizationContext.isBypassed()) {
    sql += ' AND organization_id = $3';
    params.push(orgId);
  }

  sql += ' ORDER BY id DESC LIMIT 1';
  return db.queryOne(sql, params);
}

async function tableExists(tableName: string) {
  return db.tableExists(tableName);
}

async function findAllRecords(tableName: string, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const baseQuery = scopedQuery(tableName, { softDelete: true });
  const [data, countRow] = await Promise.all([
    baseQuery.clone().orderBy('id', 'desc').limit(limit).offset(offset),
    baseQuery.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function findRecord(tableName: string, id: number | string) {
  return scopedQuery(tableName, { softDelete: true }).where(`${tableName}.id`, id).first();
}

async function createRecord(tableName: string, data: Record<string, any>, fields: Record<string, any>[] = []) {
  const payload: Record<string, any> = { ...data, created_at: new Date(), updated_at: new Date() };
  delete payload.deleted_at;
  for (const field of fields) {
    if ((field.type === 'json' || field.type === 'array') && payload[field.name]) {
      payload[field.name] = JSON.stringify(payload[field.name]);
    }
  }

  return db.insert(tableName, withOrganizationId(payload));
}

async function updateRecord(
  tableName: string,
  id: number | string,
  data: Record<string, any>,
  fields: Record<string, any>[] = []
) {
  const payload: Record<string, any> = { ...data, updated_at: new Date() };
  delete payload.id;
  delete payload.created_at;
  delete payload.deleted_at;

  for (const field of fields) {
    if ((field.type === 'json' || field.type === 'array') && payload[field.name] !== undefined) {
      payload[field.name] = JSON.stringify(payload[field.name]);
    }
  }

  return db.update(tableName, { id }, payload);
}

async function findTrashedRecord(tableName: string, id: number | string) {
  return scopedQuery(tableName, { softDelete: true, onlyTrashed: true })
    .where(`${tableName}.id`, id)
    .first();
}

async function findTrashedRecords(tableName: string) {
  return scopedQuery(tableName, { softDelete: true, onlyTrashed: true }).orderBy('deleted_at', 'desc');
}

async function deleteRecord(tableName: string, id: number | string) {
  return db.update(tableName, { id }, { deleted_at: new Date(), updated_at: new Date() });
}

async function restoreRecord(tableName: string, id: number | string) {
  return db.update(tableName, { id }, { deleted_at: null, updated_at: new Date() });
}

async function forceDeleteRecord(tableName: string, id: number | string) {
  return db.remove(tableName, { id });
}

export default {
  parseFields,
  validateDynamicFields,
  findRegisteredModel,
  assertAllowedTable,
  findArchitecture,
  tableExists,
  findAllRecords,
  findRecord,
  findTrashedRecord,
  findTrashedRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  restoreRecord,
  forceDeleteRecord,
};
