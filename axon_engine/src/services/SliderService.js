const AppError = require('../utils/AppError');
const SliderModel = require('../models/SliderModel');

async function list({ page, limit } = {}) {
  return SliderModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id) {
  const slider = await SliderModel.findByIdWithRelations(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  return slider;
}

async function create(body) {
  return SliderModel.createSlider(body);
}

async function update(id, body) {
  const slider = await SliderModel.findById(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  return SliderModel.updateSlider(id, body);
}

async function remove(id) {
  const slider = await SliderModel.findById(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  await SliderModel.remove(id);
  return 'Slider';
}

module.exports = { list, show, create, update, remove };
