import AppError from '../utils/AppError';
import RoleModel from '../models/RoleModel';

async function list() {
  return RoleModel.findAllWithPermissions();
}

async function getById(id: any) {
  const role = await RoleModel.loadWithPermissions(id);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function create(body: any) {
  const { title, description, permission_ids, status } = body;

  return RoleModel.createWithPermissions({
    title: title || null,
    description: description || null,
    status,
    permission_ids,
  });
}

async function update(id: any, body: any) {
  const role = await RoleModel.updateWithPermissions(id, body);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function remove(id: any) {
  const role = await RoleModel.findById(id);
  if (!role) throw new AppError(404, 'Role not found');

  await RoleModel.remove(id);
  return 'Role';
}

export default {
  list,
  getById,
  create,
  update,
  remove,
};
export { list, getById, create, update, remove };
