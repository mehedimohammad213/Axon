import { findWhereIn } from '../db';
import { createModel } from './BaseModel';

const base = createModel('navbars', {
  jsonFields: ['menu_item_ids'],
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
  return orderByIdList(rows, ids);
}

async function loadRelations(navbar: Record<string, any> | null | undefined) {
  if (!navbar) return navbar;
  const menuItemIds = normalizeIds(navbar.menu_item_ids);
  return {
    ...navbar,
    menu_item_ids: menuItemIds,
    menu_items: await loadMenuItems(menuItemIds),
  };
}

async function findAllWithRelationsPaginated({ page = 1, limit = 20 } = {}) {
  const { data, meta } = await base.findPaginated({ page, limit });
  return {
    data: await Promise.all(data.map((row: Record<string, any>) => loadRelations(row))),
    meta,
  };
}

async function findByIdWithRelations(id: number | string) {
  const navbar = await base.findById(id);
  return loadRelations(navbar);
}

async function createNavbar(data: Record<string, any>) {
  const payload = {
    ...data,
    menu_item_ids: normalizeIds(data.menu_item_ids),
  };
  const navbar = await base.create(payload);
  return loadRelations(navbar);
}

async function updateNavbar(id: number | string, data: Record<string, any>) {
  const payload = { ...data };
  if (Object.prototype.hasOwnProperty.call(payload, 'menu_item_ids')) {
    payload.menu_item_ids = normalizeIds(payload.menu_item_ids);
  }
  const updated = await base.update(id, payload);
  return loadRelations(updated);
}

export default {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createNavbar,
  updateNavbar,
};
