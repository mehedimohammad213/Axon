import AppError from '../utils/AppError';
import FormSubmissionModel from '../models/FormSubmissionModel';

async function list({
  form_id,
  form_type,
  page,
  limit,
}: { form_id?: any; form_type?: string; page?: number; limit?: number } = {}) {
  return FormSubmissionModel.findAllFilteredPaginated({ form_id, form_type, page, limit });
}

async function create(body: any) {
  const submission = await FormSubmissionModel.createSubmission(body);
  return { message: 'Form submitted successfully', data: submission };
}

async function update(id: any, body: any) {
  const item = await FormSubmissionModel.findById(id);
  if (!item) throw new AppError(404, 'Submission not found');

  const updated = await FormSubmissionModel.updateSubmission(id, body, item);
  return { message: 'Submission updated', data: updated };
}

async function remove(id: any) {
  await FormSubmissionModel.remove(id);
  return 'Form submission';
}

export default {
  list,
  create,
  update,
  remove,
};
export { list, create, update, remove };
