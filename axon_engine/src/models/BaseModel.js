const { insert, update, remove, count } = require('../db');
const { scopedQuery, withOrganizationId } = require('../db/queryScope');
const { tableQuery } = require('../db/queryBuilder');
const { paginatedResponse } = require('../utils/pagination');
const { stripActiveAliases, exposeActive, mapActiveRows } = require('../utils/activeField');

function createModel(tableName, options = {}) {
  const jsonFields = options.jsonFields || [];
  const scoped = options.scoped !== false;
  const active = options.active || null;
  const extraActiveKeys = options.extraActiveKeys || [];
  const exposeOptions = {
    numeric: active === 'numeric',
    extra: options.activeAlias || null,
  };

  function query() {
    return scoped ? scopedQuery(tableName) : tableQuery(tableName, { scoped: false });
  }

  function serialize(data) {
    const prepared = active ? stripActiveAliases(data, extraActiveKeys) : { ...data };
    jsonFields.forEach((field) => {
      if (prepared[field] !== undefined && prepared[field] !== null && typeof prepared[field] !== 'string') {
        prepared[field] = JSON.stringify(prepared[field]);
      }
    });
    return prepared;
  }

  function expose(row) {
    return active ? exposeActive(row, exposeOptions) : row;
  }

  async function findAll(orderBy = 'id', direction = 'desc') {
    return mapActiveRows(await query().orderBy(orderBy, direction), exposeOptions);
  }

  async function findPaginated({ page = 1, limit = 20, orderBy = 'id', direction = 'desc' } = {}) {
    const offset = (page - 1) * limit;
    const baseQuery = query();
    const [data, countRow] = await Promise.all([
      baseQuery.clone().orderBy(orderBy, direction).limit(limit).offset(offset),
      baseQuery.clone().count().first(),
    ]);

    return paginatedResponse(data.map(expose), countRow.count, page, limit);
  }

  async function findById(id) {
    return expose(await query().where(`${tableName}.id`, id).first());
  }

  async function findWhere(conditions) {
    return mapActiveRows(await query().where(conditions), exposeOptions);
  }

  async function findOneWhere(conditions) {
    return expose(await query().where(conditions).first());
  }

  async function create(data) {
    const payload = serialize({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return expose(await insert(tableName, scoped ? withOrganizationId(payload) : payload));
  }

  async function updateRecord(id, data) {
    const payload = serialize({ ...data, updated_at: new Date() });
    delete payload.id;
    delete payload.created_at;

    return expose(await update(tableName, { id }, payload));
  }

  async function removeRecord(id) {
    return remove(tableName, { id });
  }

  async function countWhere(conditions = {}) {
    if (scoped) {
      const result = await query().where(conditions).count().first();
      return result.count;
    }
    return count(tableName, conditions);
  }

  return {
    tableName,
    query,
    serialize,
    findAll,
    findPaginated,
    findById,
    findWhere,
    findOneWhere,
    create,
    update: updateRecord,
    remove: removeRecord,
    countWhere,
    expose,
  };
}

module.exports = { createModel };
