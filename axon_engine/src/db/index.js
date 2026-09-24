const pool = require('./pool');

function quoteIdent(name) {
  if (name.includes('.')) {
    return name.split('.').map(quoteIdent).join('.');
  }
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function query(sql, params = [], executor = null) {
  if (executor) {
    return executor.query(sql, params);
  }

  const OrganizationContext = require('../context/organizationContext');
  const ctxClient = OrganizationContext.getClient();
  if (ctxClient) {
    return ctxClient.query(sql, params);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.bypass_rls', 'on', true)");
    const result = await client.query(sql, params);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
    throw error;
  } finally {
    client.release();
  }
}

async function queryOne(sql, params = [], executor = null) {
  const result = await query(sql, params, executor);
  return result.rows[0] || null;
}

async function queryAll(sql, params = [], executor = null) {
  const result = await query(sql, params, executor);
  return result.rows;
}

function buildWhere(conditions, startIndex = 1) {
  const entries = Object.entries(conditions);
  if (!entries.length) {
    return { clause: '', params: [], nextIndex: startIndex };
  }

  const parts = [];
  const params = [];
  let idx = startIndex;

  for (const [key, value] of entries) {
    parts.push(`${quoteIdent(key)} = $${idx++}`);
    params.push(value);
  }

  return {
    clause: `WHERE ${parts.join(' AND ')}`,
    params,
    nextIndex: idx,
  };
}

async function findOne(table, conditions, executor = null) {
  const { clause, params } = buildWhere(conditions);
  return queryOne(`SELECT * FROM ${quoteIdent(table)} ${clause} LIMIT 1`, params, executor);
}

async function findAll(table, conditions = {}, options = {}, executor = null) {
  const { clause, params } = buildWhere(conditions);
  let sql = `SELECT * FROM ${quoteIdent(table)} ${clause}`;

  if (options.orderBy) {
    const direction = options.orderDirection === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${quoteIdent(options.orderBy)} ${direction}`;
  }

  return queryAll(sql, params, executor);
}

async function insert(table, data, executor = null) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const columns = keys.map(quoteIdent).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${quoteIdent(table)} (${columns}) VALUES (${placeholders}) RETURNING *`;
  return queryOne(sql, values, executor);
}

async function insertMany(table, rows, executor = null) {
  if (!rows.length) return [];

  const keys = Object.keys(rows[0]);
  const columns = keys.map(quoteIdent).join(', ');
  const valueGroups = [];
  const params = [];
  let paramIndex = 1;

  for (const row of rows) {
    const placeholders = keys.map(() => `$${paramIndex++}`);
    valueGroups.push(`(${placeholders.join(', ')})`);
    params.push(...keys.map((key) => row[key]));
  }

  const sql = `INSERT INTO ${quoteIdent(table)} (${columns}) VALUES ${valueGroups.join(', ')} RETURNING *`;
  return queryAll(sql, params, executor);
}

async function update(table, conditions, data, executor = null) {
  const dataEntries = Object.entries(data);
  const setParts = [];
  const setParams = [];
  let idx = 1;

  for (const [key, value] of dataEntries) {
    setParts.push(`${quoteIdent(key)} = $${idx++}`);
    setParams.push(value);
  }

  const { clause, params: whereParams } = buildWhere(conditions, idx);
  const sql = `UPDATE ${quoteIdent(table)} SET ${setParts.join(', ')} ${clause} RETURNING *`;
  const rows = await queryAll(sql, [...setParams, ...whereParams], executor);
  return rows[0] || null;
}

async function updateById(table, id, data, executor = null) {
  return update(table, { id }, data, executor);
}

async function remove(table, conditions, executor = null) {
  const { clause, params } = buildWhere(conditions);
  const result = await query(`DELETE FROM ${quoteIdent(table)} ${clause}`, params, executor);
  return result.rowCount;
}

async function count(table, conditions = {}, executor = null) {
  const { clause, params } = buildWhere(conditions);
  const row = await queryOne(
    `SELECT COUNT(*)::int AS count FROM ${quoteIdent(table)} ${clause}`,
    params,
    executor
  );
  return row.count;
}

async function findWhereIn(table, field, values, extraConditions = {}, executor = null) {
  if (!values.length) return [];

  const { clause, params, nextIndex } = buildWhere(extraConditions);
  const placeholders = values.map((_, i) => `$${nextIndex + i}`).join(', ');
  const whereClause = clause
    ? `${clause} AND ${quoteIdent(field)} IN (${placeholders})`
    : `WHERE ${quoteIdent(field)} IN (${placeholders})`;

  return queryAll(
    `SELECT * FROM ${quoteIdent(table)} ${whereClause}`,
    [...params, ...values],
    executor
  );
}

async function tableExists(tableName, executor = null) {
  const row = await queryOne(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName],
    executor
  );
  return row.exists;
}

async function dropTableIfExists(tableName, executor = null) {
  await query(`DROP TABLE IF EXISTS ${quoteIdent(tableName)} CASCADE`, [], executor);
}

function mapFieldType(field) {
  switch (field.type) {
    case 'text':
      return 'TEXT';
    case 'number':
      return 'INTEGER';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
      return 'DATE';
    case 'json':
    case 'array':
      return 'JSONB';
    default:
      return 'VARCHAR(255)';
  }
}

async function createDynamicTable(tableName, fields, executor = null) {
  const columns = [
    'id BIGSERIAL PRIMARY KEY',
    'organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE',
    ...fields.map((field) => {
      const type = mapFieldType(field);
      const unique = field.unique ? ' UNIQUE' : '';
      return `${quoteIdent(field.name)} ${type}${unique}`;
    }),
    'created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    'updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  ];

  const sql = `CREATE TABLE ${quoteIdent(tableName)} (${columns.join(', ')})`;
  await query(sql, [], executor);
}

function createDbContext(executor = null) {
  return {
    query: (sql, params) => query(sql, params, executor),
    queryOne: (sql, params) => queryOne(sql, params, executor),
    queryAll: (sql, params) => queryAll(sql, params, executor),
    findOne: (table, conditions) => findOne(table, conditions, executor),
    findAll: (table, conditions, options) => findAll(table, conditions, options, executor),
    insert: (table, data) => insert(table, data, executor),
    insertMany: (table, rows) => insertMany(table, rows, executor),
    update: (table, conditions, data) => update(table, conditions, data, executor),
    updateById: (table, id, data) => updateById(table, id, data, executor),
    remove: (table, conditions) => remove(table, conditions, executor),
    count: (table, conditions) => count(table, conditions, executor),
    findWhereIn: (table, field, values, extraConditions) =>
      findWhereIn(table, field, values, extraConditions, executor),
    tableExists: (name) => tableExists(name, executor),
    dropTableIfExists: (name) => dropTableIfExists(name, executor),
    createDynamicTable: (name, fields) => createDynamicTable(name, fields, executor),
  };
}

async function transaction(fn) {
  const OrganizationContext = require('../context/organizationContext');
  const existing = OrganizationContext.getClient();
  if (existing) {
    const scoped = createDbContext(existing);
    await existing.query('SAVEPOINT axon_inner');
    try {
      const result = await fn(scoped);
      await existing.query('RELEASE SAVEPOINT axon_inner');
      return result;
    } catch (error) {
      await existing.query('ROLLBACK TO SAVEPOINT axon_inner');
      throw error;
    }
  }

  const client = await pool.connect();
  const scoped = createDbContext(client);

  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.bypass_rls', 'on', true)");
    const result = await fn(scoped);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const db = createDbContext();

module.exports = {
  pool,
  db,
  quoteIdent,
  query,
  queryOne,
  queryAll,
  buildWhere,
  findOne,
  findAll,
  insert,
  insertMany,
  update,
  updateById,
  remove,
  count,
  findWhereIn,
  tableExists,
  dropTableIfExists,
  createDynamicTable,
  createDbContext,
  transaction,
};
