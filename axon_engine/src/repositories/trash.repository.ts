import { db } from '../db';
import { scopedQuery } from '../db/queryScope';

async function listTrashedRows(table: string) {
  if (!(await db.tableExists(table))) return [];
  if (!(await db.columnExists(table, 'deleted_at'))) return [];

  return scopedQuery(table, { softDelete: true, onlyTrashed: true }).orderBy('deleted_at', 'desc');
}

async function findTrashedById(table: string, id: number | string) {
  return scopedQuery(table, { softDelete: true, onlyTrashed: true })
    .where(`${table}.id`, id)
    .first();
}

async function restoreRow(table: string, id: number | string) {
  return db.update(table, { id }, { deleted_at: null, updated_at: new Date() });
}

async function forceDeleteRow(table: string, id: number | string) {
  return db.remove(table, { id });
}

async function listGeneratedModelsWithTrashed() {
  return scopedQuery('generated_models', {
    softDelete: true,
    withTrashed: true,
  });
}

async function columnExists(table: string, column: string) {
  return db.columnExists(table, column);
}

export default {
  listTrashedRows,
  findTrashedById,
  restoreRow,
  forceDeleteRow,
  listGeneratedModelsWithTrashed,
  columnExists,
};
