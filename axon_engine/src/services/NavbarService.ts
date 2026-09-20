import AppError from '../utils/AppError';
import NavbarModel from '../models/NavbarModel';

function normalizeIds(value: any): any[] {
  if (value == null || value === '') return [];
  if (typeof value === 'string') {
    try {
      return normalizeIds(JSON.parse(value));
    } catch {
      return [];
    }
  }
  const ids = Array.isArray(value) ? value : [value];
  return ids.filter((id) => id != null && id !== '');
}

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return NavbarModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id: any) {
  const navbar = await NavbarModel.findByIdWithRelations(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');
  return navbar;
}

async function create(body: any) {
  const errors: Record<string, string[]> = {};
  if (!body.title_en) errors.title_en = ['The title_en field is required.'];
  if (!body.logo_id) errors.logo_id = ['The logo_id field is required.'];

  const menuItemIds = normalizeIds(body.menu_item_ids);
  if (!menuItemIds.length) {
    errors.menu_item_ids = ['At least one menu item is required.'];
  }

  if (Object.keys(errors).length) {
    throw new AppError(422, 'Validation failed', errors);
  }

  return NavbarModel.createNavbar({ ...body, menu_item_ids: menuItemIds });
}

async function update(id: any, body: any) {
  const navbar = await NavbarModel.findById(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');

  const payload = { ...body };
  if (Object.prototype.hasOwnProperty.call(payload, 'menu_item_ids')) {
    payload.menu_item_ids = normalizeIds(payload.menu_item_ids);
  }

  return NavbarModel.updateNavbar(id, payload);
}

async function remove(id: any) {
  const navbar = await NavbarModel.findById(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');

  await NavbarModel.remove(id);
  return 'Navbar';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
