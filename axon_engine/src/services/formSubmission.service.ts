import AppError from '../utils/AppError';
import FormSubmissionRepository from '../repositories/formSubmission.repository';
import {
  validateCreateFormSubmissionBody,
  validateUpdateFormSubmissionBody,
} from '../validators/formSubmission.validator';
import type { CreateFormSubmissionInput, UpdateFormSubmissionInput } from '../models/formSubmission.model';

async function list({
  form_id,
  form_type,
  page,
  limit,
}: { form_id?: any; form_type?: string; page?: number; limit?: number } = {}) {
  return FormSubmissionRepository.findAllFilteredPaginated({ form_id, form_type, page, limit });
}

async function create(body: CreateFormSubmissionInput) {
  const submission = await FormSubmissionRepository.createSubmission(validateCreateFormSubmissionBody(body));
  return { message: 'Form submitted successfully', data: submission };
}

async function update(id: any, body: UpdateFormSubmissionInput) {
  const item = await FormSubmissionRepository.findById(id);
  if (!item) throw new AppError(404, 'Submission not found');

  const updated = await FormSubmissionRepository.updateSubmission(
    id,
    validateUpdateFormSubmissionBody(body),
    item
  );
  return { message: 'Submission updated', data: updated };
}

async function remove(id: any) {
  await FormSubmissionRepository.remove(id);
  return 'Form submission';
}

export default {
  list,
  create,
  update,
  remove,
};
export { list, create, update, remove };
