import { createModel } from './BaseModel';
import { paginatedResponse } from '../utils/pagination';

const base = createModel('form_submissions');

async function findAllFilteredPaginated({
  form_id,
  form_type,
  page = 1,
  limit = 20,
}: { form_id?: number | string; form_type?: string; page?: number; limit?: number } = {}) {
  let query = base.query().orderBy('id', 'desc');
  if (form_id) query = query.where('form_id', form_id);
  if (form_type) query = query.where('form_type', form_type);

  const offset = (page - 1) * limit;
  const [data, countRow] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().count().first(),
  ]);

  return paginatedResponse(data, countRow.count, page, limit);
}

async function createSubmission({ form_id, form_type, form_data, status }: Record<string, any>) {
  return base.create({
    form_id: form_id || null,
    form_type: form_type || null,
    form_data: form_data ? JSON.stringify(form_data) : null,
    media_list: null,
    status: status || null,
  });
}

async function updateSubmission(
  id: number | string,
  { form_id, form_type, form_data, status }: Record<string, any>,
  existing: Record<string, any>
) {
  return base.update(id, {
    form_id: form_id ?? existing.form_id,
    form_type: form_type ?? existing.form_type,
    form_data: form_data ? JSON.stringify(form_data) : existing.form_data,
    status: status ?? existing.status,
  });
}

export default {
  ...base,
  findAllFilteredPaginated,
  createSubmission,
  updateSubmission,
};
