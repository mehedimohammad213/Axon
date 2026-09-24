const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const permissionsConfig = require('../config/permissions');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueOrganizationSlug(name, executor = db) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (await executor.findOne('organizations', { slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function generateSiteKey() {
  return uuidv4().replace(/-/g, '');
}

async function seedPermissions(executor = db) {
  const existing = await executor.count('permissions');
  if (existing > 0) return;

  const rows = permissionsConfig.definitions.map((p) => ({
    ...p,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await executor.insertMany('permissions', rows);
}

async function getPermissionIdsForSlugs(slugs, executor = db) {
  if (slugs.includes('admin_all')) {
    const all = await executor.queryAll('SELECT id FROM permissions');
    return all.map((p) => p.id);
  }

  let targetSlugs = slugs;
  if (slugs === 'all_except_system') {
    targetSlugs = permissionsConfig.definitions
      .map((p) => p.slug)
      .filter((s) => !permissionsConfig.systemSlugs.includes(s));
  } else if (slugs === 'editor') {
    targetSlugs = permissionsConfig.editorSlugs;
  } else if (slugs === 'viewer') {
    targetSlugs = permissionsConfig.viewerSlugs;
  }

  const placeholders = targetSlugs.map((_, i) => `$${i + 1}`).join(', ');
  const perms = await executor.queryAll(
    `SELECT id FROM permissions WHERE slug IN (${placeholders})`,
    targetSlugs
  );
  return perms.map((p) => p.id);
}

async function seedDefaultRolesForOrganization(organizationId, executor = db) {
  await seedPermissions(executor);
  const roles = {};

  for (const [title, config] of Object.entries(permissionsConfig.roles)) {
    let role = await executor.findOne('roles', {
      organization_id: organizationId,
      title,
    });

    if (!role) {
      role = await executor.insert('roles', {
        organization_id: organizationId,
        title,
        description: config.description,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const permissionSlugs = Array.isArray(config.permission_slugs)
        ? config.permission_slugs
        : [config.permission_slugs];

      const ids = config.permission_slugs === 'all_except_system'
        ? await getPermissionIdsForSlugs('all_except_system', executor)
        : await getPermissionIdsForSlugs(permissionSlugs, executor);

      if (ids.length) {
        await executor.insertMany(
          'role_permission',
          ids.map((permissionId) => ({
            role_id: role.id,
            permission_id: permissionId,
            created_at: new Date(),
            updated_at: new Date(),
          }))
        );
      }
    }

    roles[title] = role;
  }

  return roles;
}

async function syncRolePermissions(roleId, permissionIds, executor = db) {
  await executor.remove('role_permission', { role_id: roleId });
  if (permissionIds.length) {
    await executor.insertMany(
      'role_permission',
      permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function loadUserWithRelations(userId) {
  const user = await db.findOne('users', { id: userId });
  if (!user) return null;

  const organization = user.organization_id
    ? await db.findOne('organizations', { id: user.organization_id })
    : null;

  let role_headless = null;
  if (user.role_id) {
    role_headless = await db.findOne('roles', { id: user.role_id });
    if (role_headless) {
      const perms = await db.queryAll(
        `SELECT permissions.*
         FROM role_permission
         JOIN permissions ON permissions.id = role_permission.permission_id
         WHERE role_permission.role_id = $1`,
        [user.role_id]
      );
      role_headless.permission_headless = perms;
    }
  }

  delete user.password;
  return {
    ...user,
    organization,
    role_headless: role_headless
      ? { ...role_headless, status: role_headless.is_active !== false, permission_headless: (role_headless.permission_headless || []).map((perm) => ({ ...perm, status: perm.is_active !== false })) }
      : null,
  };
}

async function userHasPermission(user, slug) {
  if (!user?.role_id) return false;

  const hasAdminAll = await db.queryOne(
    `SELECT 1
     FROM role_permission
     JOIN permissions ON permissions.id = role_permission.permission_id
     WHERE role_permission.role_id = $1 AND permissions.slug = $2
     LIMIT 1`,
    [user.role_id, 'admin_all']
  );

  if (hasAdminAll) return true;

  const perm = await db.queryOne(
    `SELECT 1
     FROM role_permission
     JOIN permissions ON permissions.id = role_permission.permission_id
     WHERE role_permission.role_id = $1 AND permissions.slug = $2
     LIMIT 1`,
    [user.role_id, slug]
  );

  return !!perm;
}

function extractComponentsFromArray(body) {
  if (!body || !Array.isArray(body)) return [];
  const components = [];
  for (const item of body) {
    if (item?.type) components.push(item.type);
    if (item?.children) {
      components.push(...extractComponentsFromArray(item.children));
    }
  }
  return components;
}

function sortRecursive(obj) {
  if (Array.isArray(obj)) return obj.map(sortRecursive).sort();
  if (obj && typeof obj === 'object') {
    const sorted = {};
    Object.keys(obj).sort().forEach((k) => {
      sorted[k] = sortRecursive(obj[k]);
    });
    return sorted;
  }
  return obj;
}

module.exports = {
  slugify,
  uniqueOrganizationSlug,
  generateSiteKey,
  seedPermissions,
  getPermissionIdsForSlugs,
  seedDefaultRolesForOrganization,
  syncRolePermissions,
  hashPassword,
  comparePassword,
  signToken,
  loadUserWithRelations,
  userHasPermission,
  extractComponentsFromArray,
  sortRecursive,
};
