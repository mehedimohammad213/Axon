const { db } = require('../db');
const { createModel } = require('./BaseModel');

const base = createModel('footers');

async function loadRelations(footer) {
  if (!footer) return footer;
  const result = { ...footer };

  if (footer.logo_id) {
    result.logo = await db.findOne('media', { id: footer.logo_id });
  }

  for (const field of ['column2_menu_id', 'column3_menu_id', 'bottom_menu_id']) {
    if (footer[field]) {
      result[field.replace('_menu_id', '_menu')] = await db.findOne('menus', { id: footer[field] });
    }
  }

  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  if (payload.column3_logos) payload.column3_logos = JSON.stringify(payload.column3_logos);
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
