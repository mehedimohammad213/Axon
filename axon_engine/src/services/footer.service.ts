import AppError from '../utils/AppError';
import FooterRepository from '../repositories/footer.repository';
import { validateCreateFooterBody, validateUpdateFooterBody } from '../validators/footer.validator';
import type { CreateFooterInput, UpdateFooterInput } from '../models/footer.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return FooterRepository.findAllWithRelationsPaginated({ page, limit });
}

async function show(id: any) {
  const footer = await FooterRepository.findByIdWithRelations(id);
  if (!footer) throw new AppError(404, 'Footer not found');
  return footer;
}

async function create(body: CreateFooterInput) {
  return FooterRepository.createFooter(validateCreateFooterBody(body));
}

async function update(id: any, body: UpdateFooterInput) {
  const footer = await FooterRepository.findById(id);
  if (!footer) throw new AppError(404, 'Footer not found');

  return FooterRepository.updateFooter(id, validateUpdateFooterBody(body));
}

async function remove(id: any) {
  const footer = await FooterRepository.findById(id);
  if (!footer) throw new AppError(404, 'Footer not found');

  await FooterRepository.remove(id);
  return 'Footer';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
