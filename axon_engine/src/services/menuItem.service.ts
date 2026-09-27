import AppError from '../utils/AppError';
import MenuItemRepository from '../repositories/menuItem.repository';
import { validateCreateMenuItemBody, validateUpdateMenuItemBody } from '../validators/menuItem.validator';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '../models/menuItem.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return MenuItemRepository.findPaginated({ page, limit });
}

async function show(id: any) {
  const item = await MenuItemRepository.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');
  return item;
}

async function create(body: CreateMenuItemInput | CreateMenuItemInput[]) {
  return MenuItemRepository.createMany(validateCreateMenuItemBody(body));
}

async function update(id: any, body: UpdateMenuItemInput) {
  const item = await MenuItemRepository.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');

  return MenuItemRepository.update(id, validateUpdateMenuItemBody(body));
}

async function remove(id: any) {
  const item = await MenuItemRepository.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');

  await MenuItemRepository.remove(id);
  return 'Menu item';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
