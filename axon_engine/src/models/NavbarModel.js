const { db, findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');

const base = createModel('navbars', {
  jsonFields: ['menu_item_ids'],
});

function normalizeIds(value) {
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
  return ids.filter((id) => id != null && id !== '');
}

function orderByIdList(items, ids) {
  const map = Object.fromEntries(items.map((item) => [String(item.id), item]));
  return ids.map((id) => map[String(id)]).filter(Boolean);
}

async function loadMenuItems(menuItemIds) {
  const ids = normalizeIds(menuItemIds);
  if (!ids.length) return [];

  const rows = await findWhereIn('menu_items', 'id', ids);
  return orderByIdList(rows, ids);
}

async function loadRelations(navbar) {
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
    data: await Promise.all(data.map(loadRelations)),
    meta,
  };
}

async function findByIdWithRelations(id) {
  const navbar = await base.findById(id);
  return loadRelations(navbar);
}

async function createNavbar(data) {
  const payload = {
    ...data,
    menu_item_ids: normalizeIds(data.menu_item_ids),
  };
  const navbar = await base.create(payload);
  return loadRelations(navbar);
}

async function updateNavbar(id, data) {
  const payload = { ...data };
  if (Object.prototype.hasOwnProperty.call(payload, 'menu_item_ids')) {
    payload.menu_item_ids = normalizeIds(payload.menu_item_ids);
  }
  const updated = await base.update(id, payload);
  return loadRelations(updated);
}

module.exports = {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createNavbar,
  updateNavbar,
};
