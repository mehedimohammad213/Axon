const AppError = require('../utils/AppError');
const CardModel = require('../models/CardModel');

async function list({ page, limit } = {}) {
  return CardModel.findAllWithMediaPaginated({ page, limit });
}

async function show(id) {
  const card = await CardModel.findByIdWithMedia(id);
  if (!card) throw new AppError(404, 'Card not found');
  return card;
}

async function create(body) {
  return CardModel.createCard(body);
}

async function update(id, body) {
  const card = await CardModel.findById(id);
  if (!card) throw new AppError(404, 'Card not found');

  return CardModel.updateCard(id, body);
}

async function remove(id) {
  const card = await CardModel.findById(id);
  if (!card) throw new AppError(404, 'Card not found');

  await CardModel.remove(id);
  return 'Card';
}

module.exports = { list, show, create, update, remove };
