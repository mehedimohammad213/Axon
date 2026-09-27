import AppError from '../utils/AppError';
import RoleRepository from '../repositories/role.repository';
import { validateCreateRoleBody, validateUpdateRoleBody } from '../validators/role.validator';
import type { CreateRoleInput, UpdateRoleInput } from '../models/role.model';

async function list() {
  return RoleRepository.findAllWithPermissions();
}

async function getById(id: any) {
  const role = await RoleRepository.loadWithPermissions(id);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function create(body: CreateRoleInput) {
  return RoleRepository.createWithPermissions(validateCreateRoleBody(body));
}

async function update(id: any, body: UpdateRoleInput) {
  const role = await RoleRepository.updateWithPermissions(id, validateUpdateRoleBody(body));
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function remove(id: any) {
  const role = await RoleRepository.findById(id);
  if (!role) throw new AppError(404, 'Role not found');

  await RoleRepository.remove(id);
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
