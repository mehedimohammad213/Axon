import AppError from '../utils/AppError';
import MenuItemModel from '../models/MenuItemModel';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return MenuItemModel.findPaginated({ page, limit });
}

async function show(id: any) {
  const item = await MenuItemModel.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');
  return item;
}

async function create(body: any) {
  const items = Array.isArray(body) ? body : [body];

  for (const item of items) {
    if (!item.title || !item.link) {
      throw new AppError(422, 'Validation failed', {
        title: !item.title ? ['The title field is required.'] : undefined,
        link: !item.link ? ['The link field is required.'] : undefined,
      });
    }
  }

  return MenuItemModel.createMany(items);
}

async function update(id: any, body: any) {
  const item = await MenuItemModel.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');

  const { title, title_bn, link, parent_id } = body;
  if (!title || !link) {
    throw new AppError(422, 'Validation failed', {
      title: !title ? ['The title field is required.'] : undefined,
      link: !link ? ['The link field is required.'] : undefined,
    });
  }

  return MenuItemModel.update(id, { title, title_bn, link, parent_id });
}

async function remove(id: any) {
  const item = await MenuItemModel.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');

  await MenuItemModel.remove(id);
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
