import AppError from '../utils/AppError';
import { isPlatformSuperAdmin } from '../db/queryScope';
import OrganizationRepository from '../repositories/organization.repository';
import permissionsConfig from '../config/permissions';
import {
  validateCreateOrganizationBody,
  validateCreateOrganizationRoleBody,
  validateCreateOrganizationUserBody,
  validateUpdateOrganizationBody,
} from '../validators/organization.validator';
import type {
  CreateOrganizationInput,
  CreateOrganizationRoleInput,
  CreateOrganizationUserInput,
  UpdateOrganizationInput,
  UpdateOrganizationUserInput,
} from '../models/organization.model';

function assertPlatformAdmin(user: any) {
  if (!isPlatformSuperAdmin(user)) {
    throw new AppError(403, 'Only platform super admins can perform this action.');
  }
}

async function list(user: any) {
  assertPlatformAdmin(user);
  return OrganizationRepository.findAllWithUserCounts();
}

async function getById(user: any, id: any) {
  assertPlatformAdmin(user);
  const org = await OrganizationRepository.findByIdWithUsers(id);
  if (!org) throw new AppError(404, 'Organization not found');
  return org;
}

async function create(user: any, body: CreateOrganizationInput) {
  assertPlatformAdmin(user);
  const { name, email, phone, usersList } = validateCreateOrganizationBody(body);

  const organization = await OrganizationRepository.createWithUsers({ name, email, phone, usersList });
  const roles = await OrganizationRepository.getRoles(organization.id);
  const usersCount = await OrganizationRepository.countUsers(organization.id);

  return {
    organization: { ...organization, users_count: usersCount, site_key: organization.site_key },
    roles,
  };
}

async function update(user: any, id: any, body: UpdateOrganizationInput) {
  assertPlatformAdmin(user);

  const org = await OrganizationRepository.findById(id);
  if (!org) throw new AppError(404, 'Organization not found');

  return OrganizationRepository.update(id, validateUpdateOrganizationBody(body));
}

async function remove(user: any, id: any) {
  assertPlatformAdmin(user);

  const userCount = await OrganizationRepository.countUsers(id);
  if (userCount > 0) {
    throw new AppError(422, 'Cannot delete an organization that has users.');
  }

  await OrganizationRepository.remove(id);
  return 'Organization';
}

function roleTemplates(user: any) {
  assertPlatformAdmin(user);
  return Object.entries(permissionsConfig.roles).map(([title, config]) => ({
    title,
    description: (config as { description?: string }).description,
  }));
}

async function regenerateSiteKey(user: any, id: any) {
  assertPlatformAdmin(user);
  const site_key = await OrganizationRepository.regenerateSiteKey(id);

  return {
    message: "Site key regenerated. Update the live website's environment variable with the new key.",
    organization_id: parseInt(String(id), 10),
    site_key,
  };
}

async function listRoles(user: any, organizationId: any) {
  assertPlatformAdmin(user);
  return OrganizationRepository.getRoles(organizationId);
}

async function createRole(user: any, organizationId: any, body: CreateOrganizationRoleInput) {
  assertPlatformAdmin(user);
  return OrganizationRepository.createRole(organizationId, validateCreateOrganizationRoleBody(body));
}

async function updateRole(user: any, organizationId: any, roleId: any, body: any) {
  assertPlatformAdmin(user);

  const role = await OrganizationRepository.updateRole(organizationId, roleId, body);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function deleteRole(user: any, organizationId: any, roleId: any) {
  assertPlatformAdmin(user);

  const result = await OrganizationRepository.deleteRole(organizationId, roleId);
  if (result.error) throw new AppError(422, result.error);
  return 'Role';
}

async function listUsers(user: any, organizationId: any) {
  assertPlatformAdmin(user);
  return OrganizationRepository.getUsers(organizationId);
}

async function createUser(user: any, organizationId: any, body: CreateOrganizationUserInput) {
  assertPlatformAdmin(user);
  return OrganizationRepository.createUser(organizationId, validateCreateOrganizationUserBody(body));
}

async function updateUser(user: any, organizationId: any, userId: any, body: UpdateOrganizationUserInput) {
  assertPlatformAdmin(user);

  const updated = await OrganizationRepository.updateUser(organizationId, userId, body);
  if (!updated) throw new AppError(404, 'User not found');
  return updated;
}

async function deleteUser(user: any, organizationId: any, userId: any) {
  assertPlatformAdmin(user);

  const result = await OrganizationRepository.deleteUser(organizationId, userId);
  if (result.error) throw new AppError(422, result.error);
  return 'User';
}

export default {
  list,
  getById,
  create,
  update,
  remove,
  roleTemplates,
  regenerateSiteKey,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
export {
  list,
  getById,
  create,
  update,
  remove,
  roleTemplates,
  regenerateSiteKey,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
