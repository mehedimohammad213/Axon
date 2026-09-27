import AppError from '../utils/AppError';
import SliderRepository from '../repositories/slider.repository';
import { validateCreateSliderBody, validateUpdateSliderBody } from '../validators/slider.validator';
import type { CreateSliderInput, UpdateSliderInput } from '../models/slider.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return SliderRepository.findAllWithRelationsPaginated({ page, limit });
}

async function show(id: any) {
  const slider = await SliderRepository.findByIdWithRelations(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  return slider;
}

async function create(body: CreateSliderInput) {
  return SliderRepository.createSlider(validateCreateSliderBody(body));
}

async function update(id: any, body: UpdateSliderInput) {
  const slider = await SliderRepository.findById(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  return SliderRepository.updateSlider(id, validateUpdateSliderBody(body));
}

async function remove(id: any) {
  const slider = await SliderRepository.findById(id);
  if (!slider) throw new AppError(404, 'Slider not found');
  await SliderRepository.remove(id);
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
