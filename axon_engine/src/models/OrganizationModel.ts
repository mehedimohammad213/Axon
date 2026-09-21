import { db, transaction } from '../db';
import { createModel } from './BaseModel';
import RoleModel from './RoleModel';
import {
  uniqueOrganizationSlug,
  seedDefaultRolesForOrganization,
  generateSiteKey,
  hashPassword,
  loadUserWithRelations,
  syncRolePermissions,
} from '../utils/helpers';

const base = createModel('organizations', { scoped: false });

async function findAllWithUserCounts() {
  return db.queryAll(
    `SELECT organizations.*, COUNT(users.id)::int AS users_count
     FROM organizations
     LEFT JOIN users ON users.organization_id = organizations.id
     GROUP BY organizations.id
     ORDER BY CASE WHEN organizations.slug = 'headless-platform' THEN 0 ELSE 1 END,
              organizations.id DESC`
  );
}

async function findByIdWithUsers(id: number | string) {
  const org = await db.findOne('organizations', { id });
  if (!org) return null;

  const users = await db.findAll('users', { organization_id: id }, { orderBy: 'id', orderDirection: 'asc' });
  const enrichedUsers = await Promise.all(users.map((u: Record<string, any>) => loadUserWithRelations(u.id)));

  return {
    ...org,
    site_key: org.site_key,
    users: enrichedUsers,
    admin_user: enrichedUsers[0] || null,
  };
}

async function createWithUsers({
  name,
  email,
  phone,
  usersList,
}: {
  name: string;
  email?: string;
  phone?: string;
  usersList: Record<string, any>[];
}) {
  return transaction(async (trx: any) => {
    const slug = await uniqueOrganizationSlug(name, trx);
    const org = await trx.insert('organizations', {
      name,
      slug,
      email: email || null,
      phone: phone || null,
      is_active: true,
      site_key: generateSiteKey(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const roles = await seedDefaultRolesForOrganization(org.id, trx);

    for (const u of usersList) {
      const role = roles[u.role_title] || roles.Admin;
      await trx.insert('users', {
        name: u.name,
        email: u.email,
        password: await hashPassword(u.password),
        organization_id: org.id,
        role_id: role.id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return org;
  });
}

async function getRoles(organizationId: number | string) {
  const roles = await db.findAll('roles', { organization_id: organizationId });
  return Promise.all(roles.map((role: Record<string, any>) => RoleModel.loadWithPermissions(role.id)));
}

async function getUsers(organizationId: number | string) {
  const users = await db.findAll('users', { organization_id: organizationId }, { orderBy: 'id', orderDirection: 'asc' });
  return Promise.all(users.map((u: Record<string, any>) => loadUserWithRelations(u.id)));
}

async function countUsers(organizationId: number | string) {
  return db.count('users', { organization_id: organizationId });
}

async function regenerateSiteKey(id: number | string) {
  const site_key = generateSiteKey();
  await db.update('organizations', { id }, { site_key, updated_at: new Date() });
  return site_key;
}

async function createRole(
  organizationId: number | string,
  { title, description, permission_ids, status }: Record<string, any>
) {
  const role = await db.insert('roles', {
    organization_id: organizationId,
    title,
    description: description || null,
    status: status !== undefined ? status : true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (permission_ids?.length) {
    await syncRolePermissions(role.id, permission_ids);
  }

  return RoleModel.loadWithPermissions(role.id);
}

async function updateRole(
  organizationId: number | string,
  roleId: number | string,
  { title, description, permission_ids, status }: Record<string, any>
) {
  const role = await db.findOne('roles', { id: roleId, organization_id: organizationId });
  if (!role) return null;

  await db.update('roles', { id: roleId }, {
    title: title ?? role.title,
    description: description ?? role.description,
    status: status !== undefined ? status : role.status,
    updated_at: new Date(),
  });

  if (permission_ids) {
    await syncRolePermissions(roleId, permission_ids);
  }

  return RoleModel.loadWithPermissions(roleId);
}

async function deleteRole(organizationId: number | string, roleId: number | string) {
  const assigned = await db.count('users', { role_id: roleId });
  if (assigned > 0) {
    return { error: 'Cannot delete role assigned to users.' };
  }

  await db.remove('roles', { id: roleId, organization_id: organizationId });
  return { success: true };
}

async function createUser(
  organizationId: number | string,
  { name, email, password, role_title }: Record<string, any>
) {
  const role = await db.findOne('roles', { organization_id: organizationId, title: role_title });

  const user = await db.insert('users', {
    name,
    email,
    password: await hashPassword(password),
    organization_id: organizationId,
    role_id: role?.id || null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return loadUserWithRelations(user.id);
}

async function updateUser(organizationId: number | string, userId: number | string, updates: Record<string, any>) {
  const user = await db.findOne('users', { id: userId, organization_id: organizationId });
  if (!user) return null;

  const data: Record<string, any> = { updated_at: new Date() };
  if (updates.name) data.name = updates.name;
  if (updates.email) data.email = updates.email;
  if (updates.password) data.password = await hashPassword(updates.password);

  if (updates.role_title) {
    const role = await db.findOne('roles', { organization_id: organizationId, title: updates.role_title });
    if (role) data.role_id = role.id;
  }

  await db.update('users', { id: userId }, data);
  return loadUserWithRelations(userId);
}

async function deleteUser(organizationId: number | string, userId: number | string) {
  const userCount = await countUsers(organizationId);
  if (userCount <= 1) {
    return { error: 'Cannot delete the last user of an organization.' };
  }

  await db.remove('users', { id: userId, organization_id: organizationId });
  return { success: true };
}

export default {
  ...base,
  findAllWithUserCounts,
  findByIdWithUsers,
  createWithUsers,
  getRoles,
  getUsers,
  countUsers,
  regenerateSiteKey,
  createRole,
  updateRole,
  deleteRole,
  createUser,
  updateUser,
  deleteUser,
};
