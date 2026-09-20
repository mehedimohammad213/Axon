import AppError from '../utils/AppError';
import CardModel from '../models/CardModel';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return CardModel.findAllWithMediaPaginated({ page, limit });
}

async function show(id: any) {
  const card = await CardModel.findByIdWithMedia(id);
  if (!card) throw new AppError(404, 'Card not found');
  return card;
}

async function create(body: any) {
  return CardModel.createCard(body);
}

async function update(id: any, body: any) {
  const card = await CardModel.findById(id);
  if (!card) throw new AppError(404, 'Card not found');

  return CardModel.updateCard(id, body);
}

async function remove(id: any) {
  const card = await CardModel.findById(id);
  if (!card) throw new AppError(404, 'Card not found');

  await CardModel.remove(id);
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
