const { db, findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');

const MENU_ITEM_FIELDS = [
  'column2_menu_item_ids',
  'column3_menu_item_ids',
  'column4_menu_item_ids',
  'bottom_menu_item_ids',
];

const base = createModel('footers', {
  jsonFields: [...MENU_ITEM_FIELDS, 'column3_logos'],
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

async function loadRelations(footer) {
  if (!footer) return footer;
  const result = { ...footer };

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

function preparePayload(data) {
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
    data: await Promise.all(data.map(loadRelations)),
    meta,
  };
}

async function findByIdWithRelations(id) {
  const footer = await base.findById(id);
  return loadRelations(footer);
}

async function createFooter(data) {
  const footer = await base.create(preparePayload(data));
  return loadRelations(footer);
}

async function updateFooter(id, data) {
  const updated = await base.update(id, preparePayload(data));
  return loadRelations(updated);
}

module.exports = {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createFooter,
  updateFooter,
};
