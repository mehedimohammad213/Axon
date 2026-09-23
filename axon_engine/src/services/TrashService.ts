import AppError from '../utils/AppError';
import { db } from '../db';
import { scopedQuery } from '../db/queryScope';
import { getTrashableResource, TRASHABLE_RESOURCES } from '../config/softDelete';
import DynamicModel from '../models/DynamicModel';
import MediaModel from '../models/MediaModel';
import GeneratedModelModel from '../models/GeneratedModelModel';

export interface TrashItem {
  id: number;
  type: string;
  type_label: string;
  title: string;
  deleted_at: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
}

function pickTitle(row: Record<string, any>, titleFields: string[]): string {
  for (const field of titleFields) {
    if (row[field] != null && String(row[field]).trim() !== '') {
      return String(row[field]);
    }
  }
  return `#${row.id}`;
}

function toTrashItem(
  row: Record<string, any>,
  type: string,
  typeLabel: string,
  titleFields: string[]
): TrashItem {
  return {
    id: row.id,
    type,
    type_label: typeLabel,
    title: pickTitle(row, titleFields),
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function listTrashedRows(table: string) {
  if (!(await db.tableExists(table))) return [];
  if (!(await db.columnExists(table, 'deleted_at'))) return [];

  return scopedQuery(table, { softDelete: true, onlyTrashed: true }).orderBy('deleted_at', 'desc');
}

async function getDynamicResources() {
  const models = await scopedQuery('generated_models', {
    softDelete: true,
    withTrashed: true,
  });

  const resources: { type: string; table: string; label: string; titleFields: string[] }[] = [];
  const seen = new Set<string>();

  for (const model of models) {
    const tableName = GeneratedModelModel.tableNameFromModel(model);
    if (!tableName || seen.has(tableName)) continue;
    seen.add(tableName);

    const fields = DynamicModel.parseFields(model.fields);
    const titleFields = fields
      .filter((field) => ['string', 'text', 'varchar'].includes(String(field.type || '').toLowerCase()))
      .map((field) => field.name)
      .slice(0, 3);

    resources.push({
      type: tableName,
      table: tableName,
      label: model.model_name || 'Custom Record',
      titleFields,
    });
  }

  return resources;
}

async function resolveResource(type: string) {
  const known = getTrashableResource(type);
  if (known) return { ...known, dynamic: false };

  await DynamicModel.assertAllowedTable(type, { withTrashed: true });
  if (!(await db.columnExists(type, 'deleted_at'))) {
    throw new AppError(404, 'This resource does not support trash.');
  }

  const registered = await DynamicModel.findRegisteredModel(type, { withTrashed: true });
  return {
    type,
    table: type,
    label: registered?.model_name || 'Custom Record',
    titleFields: [] as string[],
    dynamic: true,
  };
}

async function list({ type }: { type?: string } = {}) {
  const knownResources = type
    ? TRASHABLE_RESOURCES.filter((resource) => resource.type === type)
    : [...TRASHABLE_RESOURCES];

  const dynamicResources = type
    ? (getTrashableResource(type) ? [] : [{ type, table: type, label: 'Custom Record', titleFields: [] }])
    : await getDynamicResources();

  if (type && !getTrashableResource(type)) {
    await DynamicModel.assertAllowedTable(type, { withTrashed: true });
  }

  const resources = [...knownResources, ...dynamicResources];
  const items: TrashItem[] = [];
  const byType: Record<string, number> = {};

  for (const resource of resources) {
    const rows = await listTrashedRows(resource.table);
    const mapped = rows.map((row) =>
      toTrashItem(row, resource.type, resource.label, resource.titleFields)
    );
    items.push(...mapped);
    if (mapped.length) {
      byType[resource.type] = mapped.length;
    }
  }

  items.sort((a, b) => {
    const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
    const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
    return bTime - aTime;
  });

  return {
    data: items,
    meta: {
      total: items.length,
      byType,
    },
  };
}

async function restore(type: string, id: number | string) {
  const resource = await resolveResource(type);
  const row = await scopedQuery(resource.table, { softDelete: true, onlyTrashed: true })
    .where(`${resource.table}.id`, id)
    .first();

  if (!row) {
    throw new AppError(404, `${resource.label} not found in trash`);
  }

  await db.update(resource.table, { id }, { deleted_at: null, updated_at: new Date() });
  return { message: `${resource.label} restored successfully`, type: resource.type, id };
}

async function forceDelete(type: string, id: number | string) {
  const resource = await resolveResource(type);
  const row = await scopedQuery(resource.table, { softDelete: true, onlyTrashed: true })
    .where(`${resource.table}.id`, id)
    .first();

  if (!row) {
    throw new AppError(404, `${resource.label} not found in trash`);
  }

  if (resource.type === 'media') {
    await MediaModel.forceDeleteWithFile(id);
  } else if (resource.type === 'generated-models') {
    await GeneratedModelModel.forceDeleteWithTable(id);
  } else {
    await db.remove(resource.table, { id });
  }

  return resource.label;
}

export default {
  list,
  restore,
  forceDelete,
};
export { list, restore, forceDelete };
