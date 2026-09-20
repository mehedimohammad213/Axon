import { createModel } from './BaseModel';
import { paginatedResponse } from '../utils/pagination';

const base = createModel('form_data');

async function findAllFilteredPaginated({ formId, page = 1, limit = 20 }: { formId?: number | string; page?: number; limit?: number } = {}) {
  let query = base.query().orderBy('id', 'desc');
  if (formId) query = query.where('form_id', formId);

  const offset = (page - 1) * limit;
  const [data, countRow] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function updateStatus(id: number | string, { order_status, status }: Record<string, any>, existing: Record<string, any>) {
  return base.update(id, {
    order_status: order_status ?? existing.order_status,
    status: status !== undefined ? status : existing.status,
  });
}

export default {
  ...base,
  findAllFilteredPaginated,
  updateStatus,
};
