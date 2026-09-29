import AppError from '../utils/AppError';
import { getTrashableResource, TRASHABLE_RESOURCES } from '../config/softDelete';
import DynamicRepository from '../repositories/dynamic.repository';
import MediaRepository from '../repositories/media.repository';
import GeneratedModelRepository from '../repositories/generatedModel.repository';
import TrashRepository from '../repositories/trash.repository';
import { parseFields } from '../validators/dynamic.validator';
import type { TrashItem, TrashListQuery } from '../models/trash.model';

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

async function getDynamicResources() {
  const models = await TrashRepository.listGeneratedModelsWithTrashed();

  const resources: { type: string; table: string; label: string; titleFields: string[] }[] = [];
  const seen = new Set<string>();

  for (const model of models) {
    const tableName = GeneratedModelRepository.tableNameFromModel(model);
    if (!tableName || seen.has(tableName)) continue;
    seen.add(tableName);

    const fields = parseFields(model.fields);
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

  await DynamicRepository.assertAllowedTable(type, { withTrashed: true });
  if (!(await TrashRepository.columnExists(type, 'deleted_at'))) {
    throw new AppError(404, 'This resource does not support the trash.');
  }

  const registered = await DynamicRepository.findRegisteredModel(type, { withTrashed: true });
  return {
    type,
    table: type,
    label: registered?.model_name || 'Custom Record',
    titleFields: [] as string[],
    dynamic: true,
  };
}

async function list({ type }: TrashListQuery = {}) {
  const knownResources = type
    ? TRASHABLE_RESOURCES.filter((resource) => resource.type === type)
    : [...TRASHABLE_RESOURCES];

  const dynamicResources = type
    ? (getTrashableResource(type) ? [] : [{ type, table: type, label: 'Custom Record', titleFields: [] }])
    : await getDynamicResources();

  if (type && !getTrashableResource(type)) {
    await DynamicRepository.assertAllowedTable(type, { withTrashed: true });
  }

  const resources = [...knownResources, ...dynamicResources];
  const items: TrashItem[] = [];
  const byType: Record<string, number> = {};

  for (const resource of resources) {
    const rows = await TrashRepository.listTrashedRows(resource.table);
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
  const row = await TrashRepository.findTrashedById(resource.table, id);

  if (!row) {
    throw new AppError(404, `${resource.label} not found in the trash`);
  }

  await TrashRepository.restoreRow(resource.table, id);
  return { message: `${resource.label} restored successfully`, type: resource.type, id };
}

async function forceDelete(type: string, id: number | string) {
  const resource = await resolveResource(type);
  const row = await TrashRepository.findTrashedById(resource.table, id);

  if (!row) {
    throw new AppError(404, `${resource.label} not found in the trash`);
  }

  if (resource.type === 'media') {
    await MediaRepository.forceDeleteWithFile(id);
  } else if (resource.type === 'generated-models') {
    await GeneratedModelRepository.forceDeleteWithTable(id);
  } else {
    await TrashRepository.forceDeleteRow(resource.table, id);
  }

  return resource.label;
}

export default {
  list,
  restore,
  forceDelete,
};
export { list, restore, forceDelete };
