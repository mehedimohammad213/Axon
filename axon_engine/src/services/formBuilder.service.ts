import AppError from '../utils/AppError';
import FormBuilderRepository from '../repositories/formBuilder.repository';
import {
  validateCreateFormBuilderBody,
  validateUpdateFormBuilderBody,
} from '../validators/formBuilder.validator';
import type { CreateFormBuilderInput, UpdateFormBuilderInput } from '../models/formBuilder.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return FormBuilderRepository.findPaginated({ page, limit });
}

async function show(id: any) {
  const item = await FormBuilderRepository.findById(id);
  if (!item) throw new AppError(404, 'Form builder not found');
  return item;
}

async function create(body: CreateFormBuilderInput) {
  return FormBuilderRepository.create(validateCreateFormBuilderBody(body));
}

async function update(id: any, body: UpdateFormBuilderInput) {
  const item = await FormBuilderRepository.findById(id);
  if (!item) throw new AppError(404, 'Form builder not found');

  return FormBuilderRepository.update(id, validateUpdateFormBuilderBody(body));
}

async function remove(id: any) {
  const item = await FormBuilderRepository.findById(id);
  if (!item) throw new AppError(404, 'Form builder not found');

  await FormBuilderRepository.remove(id);
  return 'form_builder';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
