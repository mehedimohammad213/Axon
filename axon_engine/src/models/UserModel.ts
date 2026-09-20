import { db } from '../db';
import { createModel } from './BaseModel';
import { scopedQuery, withOrganizationId } from '../db/queryScope';
import { hashPassword, loadUserWithRelations } from '../utils/helpers';

const base = createModel('users');

async function findAllForUser(currentUser: Record<string, any> | null | undefined, organizationId?: number | string) {
  let users: Record<string, any>[];

  if (currentUser?.is_super_admin && organizationId) {
    users = await db.findAll('users', { organization_id: organizationId }, { orderBy: 'id', orderDirection: 'desc' });
  } else {
    users = await scopedQuery('users')
      .select(
        'id', 'organization_id', 'name', 'email', 'phone', 'profile_picture_id',
        'role_id', 'is_super_admin', 'created_at', 'updated_at'
      )
      .orderBy('id', 'desc');
  }

  return Promise.all(users.map((u) => loadUserWithRelations(u.id)));
}

async function findByEmail(email: string) {
  return db.findOne('users', { email });
}

async function findByIdWithRelations(id: number | string) {
  return loadUserWithRelations(id);
}

async function createUser(data: Record<string, any>, options: { organizationId?: number | string } = {}) {
  const payload = withOrganizationId({
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (options.organizationId) {
    payload.organization_id = Number(options.organizationId);
  }

  const user = await db.insert('users', payload);
  return loadUserWithRelations(user.id);
}

async function updateUser(id: number | string, updates: Record<string, any>) {
  await db.update('users', { id }, { ...updates, updated_at: new Date() });
  return loadUserWithRelations(id);
}

async function changePassword(id: number | string, hashedPassword: string) {
  return db.update('users', { id }, {
    password: hashedPassword,
    updated_at: new Date(),
  });
}

export default {
  ...base,
  findAllForUser,
  findByEmail,
  findByIdWithRelations,
  createUser,
  updateUser,
  changePassword,
  hashPassword,
};
