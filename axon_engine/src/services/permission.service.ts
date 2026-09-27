import AppError from '../utils/AppError';
import PermissionRepository from '../repositories/permission.repository';
import {
  validateCreatePermissionBody,
  validateUpdatePermissionBody,
} from '../validators/permission.validator';
import type { CreatePermissionInput, UpdatePermissionInput } from '../models/permission.model';

async function list() {
  return PermissionRepository.findAllOrdered();
}

async function getById(id: any) {
  const permission = await PermissionRepository.findById(id);
  if (!permission) throw new AppError(404, 'Permission not found');
  return permission;
}

async function create(body: CreatePermissionInput) {
  return PermissionRepository.create(validateCreatePermissionBody(body));
}

async function update(id: any, body: UpdatePermissionInput) {
  const permission = await PermissionRepository.findById(id);
  if (!permission) throw new AppError(404, 'Permission not found');

  return PermissionRepository.update(id, validateUpdatePermissionBody(body));
}

async function remove(id: any) {
  await PermissionRepository.remove(id);
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
