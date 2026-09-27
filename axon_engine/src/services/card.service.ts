import AppError from '../utils/AppError';
import CardRepository from '../repositories/card.repository';
import { validateCreateCardBody, validateUpdateCardBody } from '../validators/card.validator';
import type { CreateCardInput, UpdateCardInput } from '../models/card.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return CardRepository.findAllWithMediaPaginated({ page, limit });
}

async function show(id: any) {
  const card = await CardRepository.findByIdWithMedia(id);
  if (!card) throw new AppError(404, 'Card not found');
  return card;
}

async function create(body: CreateCardInput) {
  return CardRepository.createCard(validateCreateCardBody(body));
}

async function update(id: any, body: UpdateCardInput) {
  const card = await CardRepository.findById(id);
  if (!card) throw new AppError(404, 'Card not found');

  return CardRepository.updateCard(id, validateUpdateCardBody(body));
}

async function remove(id: any) {
  const card = await CardRepository.findById(id);
  if (!card) throw new AppError(404, 'Card not found');

  await CardRepository.remove(id);
  return 'Card';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
