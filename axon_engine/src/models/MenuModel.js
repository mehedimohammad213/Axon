const { findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const { listChildIds, replaceJunction, orderByIdList, normalizeIds } = require('../utils/junctions');

const base = createModel('menus');

async function loadRelations(menu) {
  if (!menu) return menu;
  const menuItemIds = await listChildIds('menu_menu_items', 'menu_id', menu.id, 'menu_item_id');
  const result = { ...menu, menu_item_ids: menuItemIds };
  if (menuItemIds.length) {
    const rows = await findWhereIn('menu_items', 'id', menuItemIds);
    result.menu_items = orderByIdList(rows, menuItemIds);
  } else {
    result.menu_items = [];
  }
  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  delete payload.menu_item_ids;
  delete payload.menu_items;
  return payload;
}

async function syncItems(menu, data) {
  if (data.menu_item_ids === undefined) return;
  await replaceJunction(
    'menu_menu_items',
    'menu_id',
    menu.id,
    'menu_item_id',
    normalizeIds(data.menu_item_ids),
    { organizationId: menu.organization_id }
  );
}

async function findAllWithRelationsPaginated({ page = 1, limit = 20 } = {}) {
  const { data, meta } = await base.findPaginated({ page, limit });
  return {
    data: await Promise.all(data.map(loadRelations)),
    meta,
  };
}

async function findByIdWithRelations(id) {
  return loadRelations(await base.findById(id));
}

async function createMenu(data) {
  const menu = await base.create(preparePayload(data));
  await syncItems(menu, data);
  return loadRelations(menu);
}

async function updateMenu(id, data) {
  const updated = await base.update(id, preparePayload(data));
  await syncItems(updated, data);
  return loadRelations(updated);
}

module.exports = {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createMenu,
  updateMenu,
};
