import AppError from '../utils/AppError';
import PermissionModel from '../models/PermissionModel';

async function list() {
  return PermissionModel.findAllOrdered();
}

async function getById(id: any) {
  const permission = await PermissionModel.findById(id);
  if (!permission) throw new AppError(404, 'Permission not found');
  return permission;
}

async function create(body: any) {
  const {
    category,
    title,
    description,
    slug,
    sl_no,
    status,
  } = body;

  return PermissionModel.create({
    category,
    title,
    description,
    slug,
    sl_no,
    status,
  });
}

async function update(id: any, body: any) {
  const permission = await PermissionModel.findById(id);
  if (!permission) throw new AppError(404, 'Permission not found');

  const fields = [
    'category',
    'title',
    'description',
    'slug',
    'sl_no',
    'status',
  ];
  const updates: Record<string, any> = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  return PermissionModel.update(id, updates);
}

async function remove(id: any) {
  await PermissionModel.remove(id);
  return 'Permission';
}

export default {
  list,
  getById,
  create,
  update,
  remove,
};
export { list, getById, create, update, remove };
