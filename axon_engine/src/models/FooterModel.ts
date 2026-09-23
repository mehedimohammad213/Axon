import { db, findWhereIn } from '../db';
import { createModel } from './BaseModel';

const MENU_ITEM_FIELDS = [
  'column2_menu_item_ids',
  'column3_menu_item_ids',
  'column4_menu_item_ids',
  'bottom_menu_item_ids',
];

const base = createModel('footers', {
  jsonFields: [...MENU_ITEM_FIELDS, 'column3_logos'],
});

function normalizeIds(value: unknown): (number | string)[] {
  if (value == null || value === '') return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return normalizeIds(parsed);
    } catch {
      return [];
    }
  }
  const ids = Array.isArray(value) ? value : [value];
  return ids.filter((id) => id != null && id !== '') as (number | string)[];
}

function orderByIdList(items: Record<string, any>[], ids: (number | string)[]) {
  const map = Object.fromEntries(items.map((item) => [String(item.id), item]));
  return ids.map((id) => map[String(id)]).filter(Boolean);
}

async function loadMenuItems(menuItemIds: unknown) {
  const ids = normalizeIds(menuItemIds);
  if (!ids.length) return [];

  const rows = await findWhereIn('menu_items', 'id', ids);
  return orderByIdList(rows.filter((row) => !row.deleted_at), ids);
}

async function loadRelations(footer: Record<string, any> | null | undefined) {
  if (!footer) return footer;
  const result: Record<string, any> = { ...footer };

  if (footer.logo_id) {
    result.logo = await db.findOne('media', { id: footer.logo_id });
  }

  for (const field of MENU_ITEM_FIELDS) {
    const ids = normalizeIds(footer[field]);
    result[field] = ids;
    result[field.replace('_ids', 's')] = await loadMenuItems(ids);
  }

  return result;
}

function preparePayload(data: Record<string, any>) {
  const payload = { ...data };
  for (const field of MENU_ITEM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      payload[field] = normalizeIds(payload[field]);
    }
  }
  return payload;
}

async function findAllWithRelationsPaginated({ page = 1, limit = 20 } = {}) {
  const { data, meta } = await base.findPaginated({ page, limit });
  return {
    data: await Promise.all(data.map((row: Record<string, any>) => loadRelations(row))),
    meta,
  };
}

async function findByIdWithRelations(id: number | string) {
  const footer = await base.findById(id);
  return loadRelations(footer);
}

async function createFooter(data: Record<string, any>) {
  const footer = await base.create(preparePayload(data));
  return loadRelations(footer);
}

async function updateFooter(id: number | string, data: Record<string, any>) {
  const updated = await base.update(id, preparePayload(data));
  return loadRelations(updated);
}

export default {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createFooter,
  updateFooter,
};
