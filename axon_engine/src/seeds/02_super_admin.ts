import {
  generateSiteKey,
  seedDefaultRolesForOrganization,
  hashPassword,
} from '../utils/helpers';
import type { DbContext } from '../db';

export async function seed(db: DbContext): Promise<void> {
  const existing = await db.findOne('users', { email: 'superadmin@headless.local' });
  if (existing) return;

  const org = await db.insert('organizations', {
    name: 'Headless Platform',
    slug: 'headless-platform',
    email: 'superadmin@headless.local',
    is_active: true,
    site_key: generateSiteKey(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  const roles = await seedDefaultRolesForOrganization(org.id);
  const superAdminRole = roles['Super Admin'];

  await db.insert('users', {
    name: 'Super Admin',
    email: 'superadmin@headless.local',
    password: await hashPassword('password'),
    organization_id: org.id,
    role_id: superAdminRole.id,
    is_super_admin: true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  console.log('Seeded super admin: superadmin@headless.local / password');
  console.log(`Organization site key: ${org.site_key}`);
}
