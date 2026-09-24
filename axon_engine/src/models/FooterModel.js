const { db, findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const { normalizeIds, orderByIdList } = require('../utils/junctions');

const base = createModel('footers');

const MENU_ITEM_FIELDS = [
  'column2_menu_item_ids',
  'column3_menu_item_ids',
  'column4_menu_item_ids',
  'bottom_menu_item_ids',
];

async function loadMenuItems(ids) {
  const normalized = normalizeIds(ids);
  if (!normalized.length) return [];
  const rows = await findWhereIn('menu_items', 'id', normalized);
  return orderByIdList(rows, normalized);
}

async function loadRelations(footer) {
  if (!footer) return footer;
  const result = { ...footer };

  if (footer.logo_id) {
    result.logo = await db.findOne('media', { id: footer.logo_id });
  }

  for (const field of MENU_ITEM_FIELDS) {
    result[field] = normalizeIds(footer[field]);
    result[field.replace('_ids', 's')] = await loadMenuItems(result[field]);
  }

  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  if (payload.column3_logos) payload.column3_logos = JSON.stringify(payload.column3_logos);
  for (const field of MENU_ITEM_FIELDS) {
    if (payload[field] !== undefined) {
      payload[field] = JSON.stringify(normalizeIds(payload[field]));
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
