const { db, findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const { normalizeIds, orderByIdList, replaceJunction } = require('../utils/junctions');

const base = createModel('footers', {
  active: 'numeric',
  extraActiveKeys: ['footer_status'],
  activeAlias: 'footer_status',
});

const SLOTS = ['column2', 'column3', 'column4', 'bottom'];

async function loadSlot(footerId, slot) {
  const rows = await db.queryAll(
    `SELECT menu_item_id
     FROM footer_menu_items
     WHERE footer_id = $1 AND slot = $2
     ORDER BY sort_order ASC, id ASC`,
    [footerId, slot]
  );
  return rows.map((row) => row.menu_item_id);
}

async function loadRelations(footer) {
  if (!footer) return footer;
  const result = { ...footer };

  if (footer.logo_id) {
    result.logo = await db.findOne('media', { id: footer.logo_id });
  }

  for (const slot of SLOTS) {
    const ids = await loadSlot(footer.id, slot);
    result[`${slot}_menu_item_ids`] = ids;
    if (ids.length) {
      const items = await findWhereIn('menu_items', 'id', ids);
      result[`${slot}_menu_items`] = orderByIdList(items, ids);
    } else {
      result[`${slot}_menu_items`] = [];
    }
  }

  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  if (payload.column3_logos) payload.column3_logos = JSON.stringify(payload.column3_logos);
  for (const slot of SLOTS) {
    delete payload[`${slot}_menu_item_ids`];
    delete payload[`${slot}_menu_items`];
    delete payload[`${slot}_menu_id`];
  }
  return payload;
}

async function syncSlots(footer, data) {
  for (const slot of SLOTS) {
    const key = `${slot}_menu_item_ids`;
    if (data[key] === undefined && data[`${slot}_menu_id`] === undefined) continue;
    await replaceJunction(
      'footer_menu_items',
      'footer_id',
      footer.id,
      'menu_item_id',
      normalizeIds(data[key]),
      {
        organizationId: footer.organization_id,
        extras: { slot },
        match: { slot },
      }
    );
  }
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
  await syncSlots(footer, data);
  return loadRelations(footer);
}

async function updateFooter(id, data) {
  const updated = await base.update(id, preparePayload(data));
  await syncSlots(updated, data);
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
