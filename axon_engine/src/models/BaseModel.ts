import { insert, update, remove, count } from '../db';
import { scopedQuery, withOrganizationId } from '../db/queryScope';
import { tableQuery } from '../db/queryBuilder';
import { paginatedResponse } from '../utils/pagination';
import { isSoftDeleteTable } from '../config/softDelete';

export interface CreateModelOptions {
  jsonFields?: string[];
  scoped?: boolean;
  softDelete?: boolean;
}

export interface QueryOptions {
  withTrashed?: boolean;
  onlyTrashed?: boolean;
}

export function createModel(tableName: string, options: CreateModelOptions = {}) {
  const jsonFields = options.jsonFields || [];
  const scoped = options.scoped !== false;
  const usesSoftDelete = options.softDelete ?? isSoftDeleteTable(tableName);

  function query(queryOptions: QueryOptions = {}) {
    const tableOptions = {
      softDelete: usesSoftDelete,
      withTrashed: queryOptions.withTrashed === true,
      onlyTrashed: queryOptions.onlyTrashed === true,
    };

    return scoped
      ? scopedQuery(tableName, tableOptions)
      : tableQuery(tableName, { scoped: false, ...tableOptions });
  }

  function serialize(data: Record<string, any>) {
    const result = { ...data };
    jsonFields.forEach((field) => {
      if (result[field] !== undefined && result[field] !== null && typeof result[field] !== 'string') {
        result[field] = JSON.stringify(result[field]);
      }
    });
    return result;
  }

  async function findAll(orderBy = 'id', direction: 'asc' | 'desc' = 'desc') {
    return query().orderBy(orderBy, direction);
  }

  async function findPaginated({
    page = 1,
    limit = 20,
    orderBy = 'id',
    direction = 'desc',
  }: { page?: number; limit?: number; orderBy?: string; direction?: 'asc' | 'desc' } = {}) {
    const offset = (page - 1) * limit;
    const baseQuery = query();
    const [data, countRow] = await Promise.all([
      baseQuery.clone().orderBy(orderBy, direction).limit(limit).offset(offset),
      baseQuery.clone().count().first(),
    ]);

    return paginatedResponse(data, countRow.count, page, limit);
  }

  async function findById(id: number | string, queryOptions: QueryOptions = {}) {
    return query(queryOptions).where(`${tableName}.id`, id).first();
  }

  async function findTrashedById(id: number | string) {
    return findById(id, { onlyTrashed: true });
  }

  async function findWhere(conditions: Record<string, any>, queryOptions: QueryOptions = {}) {
    return query(queryOptions).where(conditions);
  }

  async function findOneWhere(conditions: Record<string, any>, queryOptions: QueryOptions = {}) {
    return query(queryOptions).where(conditions).first();
  }

  async function create(data: Record<string, any>) {
    const payload = serialize({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    delete payload.deleted_at;

    return insert(tableName, scoped ? withOrganizationId(payload) : payload);
  }

  async function updateRecord(id: number | string, data: Record<string, any>) {
    const payload = serialize({ ...data, updated_at: new Date() });
    delete payload.id;
    delete payload.created_at;
    delete payload.deleted_at;

    return update(tableName, { id }, payload);
  }

  async function removeRecord(id: number | string) {
    if (!usesSoftDelete) {
      return remove(tableName, { id });
    }

    return update(tableName, { id }, { deleted_at: new Date(), updated_at: new Date() });
  }

  async function restore(id: number | string) {
    if (!usesSoftDelete) return null;
    return update(tableName, { id }, { deleted_at: null, updated_at: new Date() });
  }

  async function forceDelete(id: number | string) {
    return remove(tableName, { id });
  }

  async function countWhere(conditions: Record<string, any> = {}) {
    if (scoped) {
      const result = await query().where(conditions).count().first();
      return result.count;
    }
    return count(tableName, conditions);
  }

  return {
    tableName,
    usesSoftDelete,
    query,
    serialize,
    findAll,
    findPaginated,
    findById,
    findTrashedById,
    findWhere,
    findOneWhere,
    create,
    update: updateRecord,
    remove: removeRecord,
    restore,
    forceDelete,
    countWhere,
  };
}
