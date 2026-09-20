import AppError from '../utils/AppError';
import { isPlatformSuperAdmin } from '../db/queryScope';
import OrganizationModel from '../models/OrganizationModel';
import permissionsConfig from '../config/permissions';

function assertPlatformAdmin(user: any) {
  if (!isPlatformSuperAdmin(user)) {
    throw new AppError(403, 'Only platform super admins can perform this action.');
  }
}

async function list(user: any) {
  assertPlatformAdmin(user);
  return OrganizationModel.findAllWithUserCounts();
}

async function getById(user: any, id: any) {
  assertPlatformAdmin(user);
  const org = await OrganizationModel.findByIdWithUsers(id);
  if (!org) throw new AppError(404, 'Organization not found');
  return org;
}

async function create(user: any, body: any) {
  assertPlatformAdmin(user);

  const {
    name,
    email,
    phone,
    users: usersPayload,
    admin_name,
    admin_email,
    admin_password,
    admin_role_title,
  } = body;

  if (!name) {
    throw new AppError(422, 'Validation failed', { name: ['The name field is required.'] });
  }

  const usersList = usersPayload || [
    {
      name: admin_name,
      email: admin_email,
      password: admin_password,
      role_title: admin_role_title || 'Admin',
    },
  ];

  if (!usersList.length || !usersList[0].email) {
    throw new AppError(422, 'Validation failed', { users: ['At least one user is required.'] });
  }

  const organization = await OrganizationModel.createWithUsers({ name, email, phone, usersList });
  const roles = await OrganizationModel.getRoles(organization.id);
  const usersCount = await OrganizationModel.countUsers(organization.id);

  return {
    organization: { ...organization, users_count: usersCount, site_key: organization.site_key },
    roles,
  };
}

async function update(user: any, id: any, body: any) {
  assertPlatformAdmin(user);

  const org = await OrganizationModel.findById(id);
  if (!org) throw new AppError(404, 'Organization not found');

  const updates: Record<string, any> = {};
  ['name', 'email', 'phone', 'is_active'].forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  return OrganizationModel.update(id, updates);
}

async function remove(user: any, id: any) {
  assertPlatformAdmin(user);

  const userCount = await OrganizationModel.countUsers(id);
  if (userCount > 0) {
    throw new AppError(422, 'Cannot delete organization with users.');
  }

  await OrganizationModel.remove(id);
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
  const site_key = await OrganizationModel.regenerateSiteKey(id);

  return {
    message: 'Site key regenerated. Update the live website env with the new key.',
    organization_id: parseInt(String(id), 10),
    site_key,
  };
}

async function listRoles(user: any, organizationId: any) {
  assertPlatformAdmin(user);
  return OrganizationModel.getRoles(organizationId);
}

async function createRole(user: any, organizationId: any, body: any) {
  assertPlatformAdmin(user);

  const { title, description, permission_ids, status } = body;
  if (!title) {
    throw new AppError(422, 'Validation failed', { title: ['The title field is required.'] });
  }

  return OrganizationModel.createRole(organizationId, {
    title,
    description,
    permission_ids,
    status,
  });
}

async function updateRole(user: any, organizationId: any, roleId: any, body: any) {
  assertPlatformAdmin(user);

  const role = await OrganizationModel.updateRole(organizationId, roleId, body);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function deleteRole(user: any, organizationId: any, roleId: any) {
  assertPlatformAdmin(user);

  const result = await OrganizationModel.deleteRole(organizationId, roleId);
  if (result.error) throw new AppError(422, result.error);
  return 'Role';
}

async function listUsers(user: any, organizationId: any) {
  assertPlatformAdmin(user);
  return OrganizationModel.getUsers(organizationId);
}

async function createUser(user: any, organizationId: any, body: any) {
  assertPlatformAdmin(user);

  const { name, email, password, role_title } = body;
  if (!name || !email || !password || !role_title) {
    throw new AppError(422, 'name, email, password, and role_title are required.');
  }

  return OrganizationModel.createUser(organizationId, {
    name,
    email,
    password,
    role_title,
  });
}

async function updateUser(user: any, organizationId: any, userId: any, body: any) {
  assertPlatformAdmin(user);

  const updated = await OrganizationModel.updateUser(organizationId, userId, body);
  if (!updated) throw new AppError(404, 'User not found');
  return updated;
}

async function deleteUser(user: any, organizationId: any, userId: any) {
  assertPlatformAdmin(user);

  const result = await OrganizationModel.deleteUser(organizationId, userId);
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
export { list, getById, create, update, remove, roleTemplates, regenerateSiteKey, listRoles, createRole, updateRole, deleteRole, listUsers, createUser, updateUser, deleteUser };
