import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, type DbContext } from '../db';
import permissionsConfig from '../config/permissions';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueOrganizationSlug(name: string, executor: DbContext = db): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (await executor.findOne('organizations', { slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function generateSiteKey(): string {
  return uuidv4().replace(/-/g, '');
}

async function seedPermissions(executor: DbContext = db): Promise<void> {
  const existing = await executor.count('permissions');
  if (existing > 0) return;

  const rows = permissionsConfig.definitions.map((p) => ({
    ...p,
    status: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await executor.insertMany('permissions', rows);
}

async function getPermissionIdsForSlugs(
  slugs: string | string[],
  executor: DbContext = db
): Promise<number[]> {
  const slugList = Array.isArray(slugs) ? slugs : [slugs];
  const alias = slugList.length === 1 ? slugList[0] : null;

  if (slugList.includes('admin_all')) {
    const all = await executor.queryAll('SELECT id FROM permissions');
    return all.map((p: { id: number }) => p.id);
  }

  let targetSlugs: string[];
  if (alias === 'all_except_system') {
    targetSlugs = permissionsConfig.definitions
      .map((p) => p.slug)
      .filter((s) => !permissionsConfig.systemSlugs.includes(s));
  } else if (alias === 'editor') {
    targetSlugs = permissionsConfig.editorSlugs;
  } else if (alias === 'viewer') {
    targetSlugs = permissionsConfig.viewerSlugs;
  } else {
    targetSlugs = slugList;
  }

  const placeholders = targetSlugs.map((_, i) => `$${i + 1}`).join(', ');
  const perms = await executor.queryAll(
    `SELECT id FROM permissions WHERE slug IN (${placeholders})`,
    targetSlugs
  );
  return perms.map((p: { id: number }) => p.id);
}

async function seedDefaultRolesForOrganization(
  organizationId: number,
  executor: DbContext = db
): Promise<Record<string, any>> {
  await seedPermissions(executor);
  const roles: Record<string, any> = {};

  for (const [title, config] of Object.entries(permissionsConfig.roles)) {
    const role = await executor.insert('roles', {
      organization_id: organizationId,
      title,
      description: config.description,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const ids = await getPermissionIdsForSlugs(config.permission_slugs, executor);

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

    roles[title] = role;
  }

  return roles;
}

async function backfillDefaultRolePermissions(executor: DbContext = db): Promise<number> {
  await seedPermissions(executor);

  const roles = await executor.findAll('roles');
  let updated = 0;

  for (const role of roles) {
    const config = permissionsConfig.roles[role.title as keyof typeof permissionsConfig.roles];
    if (!config) continue;

    const existingCount = await executor.count('role_permission', { role_id: role.id });
    if (existingCount > 0) continue;

    const ids = await getPermissionIdsForSlugs(config.permission_slugs, executor);
    if (!ids.length) continue;

    await syncRolePermissions(role.id, ids, executor);
    updated += 1;
  }

  return updated;
}

async function syncRolePermissions(
  roleId: number | string,
  permissionIds: number[],
  executor: DbContext = db
): Promise<void> {
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

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function signToken(user: { id: number; email: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
}

async function loadUserWithRelations(userId: number | string): Promise<any> {
  const user = await db.findOne('users', { id: userId });
  if (!user) return null;

  const organization = user.organization_id
    ? await db.findOne('organizations', { id: user.organization_id })
    : null;

  let role_headless: any = null;
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
  return { ...user, organization, role_headless };
}

async function userHasPermission(user: { role_id?: number }, slug: string): Promise<boolean> {
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

function extractComponentsFromArray(body: unknown): string[] {
  if (!body || !Array.isArray(body)) return [];
  const components: string[] = [];
  for (const item of body) {
    if (item && typeof item === 'object' && 'type' in item && (item as { type?: string }).type) {
      components.push((item as { type: string }).type);
    }
    if (item && typeof item === 'object' && 'children' in item) {
      components.push(...extractComponentsFromArray((item as { children?: unknown }).children));
    }
  }
  return components;
}

function sortRecursive(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortRecursive).sort();
  if (obj && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>)
      .sort()
      .forEach((k) => {
        sorted[k] = sortRecursive((obj as Record<string, unknown>)[k]);
      });
    return sorted;
  }
  return obj;
}

export {
  slugify,
  uniqueOrganizationSlug,
  generateSiteKey,
  seedPermissions,
  getPermissionIdsForSlugs,
  seedDefaultRolesForOrganization,
  backfillDefaultRolePermissions,
  syncRolePermissions,
  hashPassword,
  comparePassword,
  signToken,
  loadUserWithRelations,
  userHasPermission,
  extractComponentsFromArray,
  sortRecursive,
};
