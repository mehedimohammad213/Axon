const { db, findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');

const base = createModel('navbars');

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

async function loadMenuWithItems(menuId) {
  if (!menuId) return null;

  const menu = await db.findOne('menus', { id: menuId });
  if (!menu) return null;

  const menuItemIds = normalizeIds(menu.menu_item_ids);
  let menuItems = [];

  if (menuItemIds.length) {
    const rows = await findWhereIn('menu_items', 'id', menuItemIds);
    menuItems = orderByIdList(rows, menuItemIds);
  }

  return {
    ...menu,
    menu_item_ids: menuItemIds,
    menu_items: menuItems,
  };
}

async function loadRelations(navbar) {
  if (!navbar) return navbar;
  const result = { ...navbar };

  if (navbar.logo_id) {
    result.logo = await db.findOne('media', { id: navbar.logo_id });
  } else {
    result.logo = null;
  }

  result.menu = await loadMenuWithItems(navbar.menu_id);

  return result;
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
  const navbar = await base.create(data);
  return loadRelations(navbar);
}

async function updateNavbar(id, data) {
  const updated = await base.update(id, data);
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
