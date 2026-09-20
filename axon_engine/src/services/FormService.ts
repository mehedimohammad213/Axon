import AppError from '../utils/AppError';
import FormModel from '../models/FormModel';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return FormModel.findPaginated({ page, limit });
}

async function show(id: any) {
  const form = await FormModel.findById(id);
  if (!form) throw new AppError(404, 'Form not found');
  return form;
}

export default {
  list,
  show,
};
export { list, show };
