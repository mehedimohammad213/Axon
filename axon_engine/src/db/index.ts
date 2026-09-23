import type { Pool, PoolClient, QueryResult } from 'pg';
import pool from './pool';

export type QueryExecutor = Pool | PoolClient;

export interface FindAllOptions {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface DynamicField {
  name: string;
  type: string;
  unique?: boolean;
}

export interface DbContext {
  query: (sql: string, params?: unknown[]) => Promise<QueryResult>;
  queryOne: (sql: string, params?: unknown[]) => Promise<any>;
  queryAll: (sql: string, params?: unknown[]) => Promise<any[]>;
  findOne: (table: string, conditions: Record<string, unknown>) => Promise<any>;
  findAll: (
    table: string,
    conditions?: Record<string, unknown>,
    options?: FindAllOptions
  ) => Promise<any[]>;
  insert: (table: string, data: Record<string, unknown>) => Promise<any>;
  insertMany: (table: string, rows: Record<string, unknown>[]) => Promise<any[]>;
  update: (
    table: string,
    conditions: Record<string, unknown>,
    data: Record<string, unknown>
  ) => Promise<any>;
  updateById: (table: string, id: unknown, data: Record<string, unknown>) => Promise<any>;
  remove: (table: string, conditions: Record<string, unknown>) => Promise<number>;
  count: (table: string, conditions?: Record<string, unknown>) => Promise<number>;
  findWhereIn: (
    table: string,
    field: string,
    values: unknown[],
    extraConditions?: Record<string, unknown>
  ) => Promise<any[]>;
  tableExists: (name: string) => Promise<boolean>;
  columnExists: (table: string, column: string) => Promise<boolean>;
  dropTableIfExists: (name: string) => Promise<void>;
  createDynamicTable: (name: string, fields: DynamicField[]) => Promise<void>;
}

function quoteIdent(name: string): string {
  if (name.includes('.')) {
    return name.split('.').map(quoteIdent).join('.');
  }
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function query(
  sql: string,
  params: unknown[] = [],
  executor: QueryExecutor | null = null
): Promise<QueryResult> {
  const client = executor || pool;
  return client.query(sql, params);
}

async function queryOne(
  sql: string,
  params: unknown[] = [],
  executor: QueryExecutor | null = null
): Promise<any> {
  const result = await query(sql, params, executor);
  return result.rows[0] || null;
}

async function queryAll(
  sql: string,
  params: unknown[] = [],
  executor: QueryExecutor | null = null
): Promise<any[]> {
  const result = await query(sql, params, executor);
  return result.rows;
}

function buildWhere(conditions: Record<string, unknown>, startIndex = 1) {
  const entries = Object.entries(conditions);
  if (!entries.length) {
    return { clause: '', params: [] as unknown[], nextIndex: startIndex };
  }

  const parts: string[] = [];
  const params: unknown[] = [];
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

async function findOne(
  table: string,
  conditions: Record<string, unknown>,
  executor: QueryExecutor | null = null
): Promise<any> {
  const { clause, params } = buildWhere(conditions);
  return queryOne(`SELECT * FROM ${quoteIdent(table)} ${clause} LIMIT 1`, params, executor);
}

async function findAll(
  table: string,
  conditions: Record<string, unknown> = {},
  options: FindAllOptions = {},
  executor: QueryExecutor | null = null
): Promise<any[]> {
  const { clause, params } = buildWhere(conditions);
  let sql = `SELECT * FROM ${quoteIdent(table)} ${clause}`;

  if (options.orderBy) {
    const direction = options.orderDirection === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${quoteIdent(options.orderBy)} ${direction}`;
  }

  return queryAll(sql, params, executor);
}

async function insert(
  table: string,
  data: Record<string, unknown>,
  executor: QueryExecutor | null = null
): Promise<any> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const columns = keys.map(quoteIdent).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${quoteIdent(table)} (${columns}) VALUES (${placeholders}) RETURNING *`;
  return queryOne(sql, values, executor);
}

async function insertMany(
  table: string,
  rows: Record<string, unknown>[],
  executor: QueryExecutor | null = null
): Promise<any[]> {
  if (!rows.length) return [];

  const keys = Object.keys(rows[0]);
  const columns = keys.map(quoteIdent).join(', ');
  const valueGroups: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const row of rows) {
    const placeholders = keys.map(() => `$${paramIndex++}`);
    valueGroups.push(`(${placeholders.join(', ')})`);
    params.push(...keys.map((key) => row[key]));
  }

  const sql = `INSERT INTO ${quoteIdent(table)} (${columns}) VALUES ${valueGroups.join(', ')} RETURNING *`;
  return queryAll(sql, params, executor);
}

async function update(
  table: string,
  conditions: Record<string, unknown>,
  data: Record<string, unknown>,
  executor: QueryExecutor | null = null
): Promise<any> {
  const dataEntries = Object.entries(data);
  const setParts: string[] = [];
  const setParams: unknown[] = [];
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

async function updateById(
  table: string,
  id: unknown,
  data: Record<string, unknown>,
  executor: QueryExecutor | null = null
): Promise<any> {
  return update(table, { id }, data, executor);
}

async function remove(
  table: string,
  conditions: Record<string, unknown>,
  executor: QueryExecutor | null = null
): Promise<number> {
  const { clause, params } = buildWhere(conditions);
  const result = await query(`DELETE FROM ${quoteIdent(table)} ${clause}`, params, executor);
  return result.rowCount ?? 0;
}

async function count(
  table: string,
  conditions: Record<string, unknown> = {},
  executor: QueryExecutor | null = null
): Promise<number> {
  const { clause, params } = buildWhere(conditions);
  const row = await queryOne(
    `SELECT COUNT(*)::int AS count FROM ${quoteIdent(table)} ${clause}`,
    params,
    executor
  );
  return row.count;
}

async function findWhereIn(
  table: string,
  field: string,
  values: unknown[],
  extraConditions: Record<string, unknown> = {},
  executor: QueryExecutor | null = null
): Promise<any[]> {
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

async function tableExists(tableName: string, executor: QueryExecutor | null = null): Promise<boolean> {
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

async function columnExists(
  tableName: string,
  columnName: string,
  executor: QueryExecutor | null = null
): Promise<boolean> {
  const row = await queryOne(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS exists`,
    [tableName, columnName],
    executor
  );
  return row.exists;
}

async function dropTableIfExists(tableName: string, executor: QueryExecutor | null = null): Promise<void> {
  await query(`DROP TABLE IF EXISTS ${quoteIdent(tableName)} CASCADE`, [], executor);
}

function mapFieldType(field: DynamicField): string {
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

async function createDynamicTable(
  tableName: string,
  fields: DynamicField[],
  executor: QueryExecutor | null = null
): Promise<void> {
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
    'deleted_at TIMESTAMPTZ',
  ];

  const sql = `CREATE TABLE ${quoteIdent(tableName)} (${columns.join(', ')})`;
  await query(sql, [], executor);
  await query(
    `CREATE INDEX ${quoteIdent(`${tableName}_deleted_at_idx`)} ON ${quoteIdent(tableName)} (deleted_at) WHERE deleted_at IS NOT NULL`,
    [],
    executor
  );
}

function createDbContext(executor: QueryExecutor | null = null): DbContext {
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
    columnExists: (table, column) => columnExists(table, column, executor),
    dropTableIfExists: (name) => dropTableIfExists(name, executor),
    createDynamicTable: (name, fields) => createDynamicTable(name, fields, executor),
  };
}

async function transaction<T>(fn: (db: DbContext) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  const dbCtx = createDbContext(client);

  try {
    await client.query('BEGIN');
    const result = await fn(dbCtx);
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

export {
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
  columnExists,
  dropTableIfExists,
  createDynamicTable,
  createDbContext,
  transaction,
};
