import AppError from '../utils/AppError';
import FormDataModel from '../models/FormDataModel';

async function list({
  page,
  limit,
  form_id,
}: { page?: number; limit?: number; form_id?: any } = {}) {
  return FormDataModel.findAllFilteredPaginated({ page, limit, formId: form_id });
}

async function show(id: any) {
  const item = await FormDataModel.findById(id);
  if (!item) throw new AppError(404, 'Form data not found');
  return item;
}

async function update(id: any, body: any) {
  const item = await FormDataModel.findById(id);
  if (!item) throw new AppError(404, 'Form data not found');

  return FormDataModel.updateStatus(id, body, item);
}

export default {
  list,
  show,
  update,
};
export { list, show, update };
