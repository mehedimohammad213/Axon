const { createModel } = require('./BaseModel');
const { paginatedResponse } = require('../utils/pagination');

const base = createModel('form_data');

async function findAllFilteredPaginated({ formId, page = 1, limit = 20 } = {}) {
  let query = base.query().orderBy('id', 'desc');
  if (formId) query = query.where('form_id', formId);

  const offset = (page - 1) * limit;
  const [data, countRow] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function updateStatus(id, { order_status, status }, existing) {
  return base.update(id, {
    order_status: order_status ?? existing.order_status,
    status: status !== undefined ? status : existing.status,
  });
}

module.exports = {
  ...base,
  findAllFilteredPaginated,
  updateStatus,
};
