import AppError from '../utils/AppError';
import SliderModel from '../models/SliderModel';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return SliderModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id: any) {
  const slider = await SliderModel.findByIdWithRelations(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  return slider;
}

async function create(body: any) {
  return SliderModel.createSlider(body);
}

async function update(id: any, body: any) {
  const slider = await SliderModel.findById(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  return SliderModel.updateSlider(id, body);
}

async function remove(id: any) {
  const slider = await SliderModel.findById(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  await SliderModel.remove(id);
  return 'Slider';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
