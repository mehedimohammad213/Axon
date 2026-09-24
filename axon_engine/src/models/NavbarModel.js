const { db, findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const {
  listChildIds,
  replaceJunction,
  orderByIdList,
  resolveMenuItemIdsFromBody,
} = require('../utils/junctions');

const base = createModel('navbars');

function navbarRowPayload(data) {
  const payload = { ...data };
  delete payload.menu_id;
  delete payload.menu;
  delete payload.menu_item_ids;
  delete payload.menu_items;
  delete payload.logo;
  return payload;
}

async function loadRelations(navbar) {
  if (!navbar) return navbar;
  const result = { ...navbar };

  if (navbar.logo_id) {
    result.logo = await db.findOne('media', { id: navbar.logo_id });
  } else {
    result.logo = null;
  }

  const menuItemIds = await listChildIds(
    'navbar_menu_items',
    'navbar_id',
    navbar.id,
    'menu_item_id'
  );
  result.menu_item_ids = menuItemIds;

  let menuItems = [];
  if (menuItemIds.length) {
    const rows = await findWhereIn('menu_items', 'id', menuItemIds);
    menuItems = orderByIdList(rows, menuItemIds);
  }

  result.menu = {
    id: navbar.id,
    name: navbar.title_en || 'Navbar Menu',
    menu_item_ids: menuItemIds,
    menu_items: menuItems,
  };

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

async function syncMenuItems(navbar, body) {
  const resolved = await resolveMenuItemIdsFromBody(body);
  if (!resolved.provided) return;
  await replaceJunction(
    'navbar_menu_items',
    'navbar_id',
    navbar.id,
    'menu_item_id',
    resolved.ids,
    { organizationId: navbar.organization_id }
  );
}

async function createNavbar(data) {
  const navbar = await base.create(navbarRowPayload(data));
  await syncMenuItems(navbar, data);
  return loadRelations(navbar);
}

async function updateNavbar(id, data) {
  const updated = await base.update(id, navbarRowPayload(data));
  await syncMenuItems(updated, data);
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
