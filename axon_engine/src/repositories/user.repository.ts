import { db } from '../db';
import { createModel } from '../models/BaseModel';
import { scopedQuery, withOrganizationId } from '../db/queryScope';
import { loadUserWithRelations } from '../utils/helpers';
import {
  USER_TABLE,
  USER_LIST_COLUMNS,
  type CreateUserRecord,
  type UpdateUserInput,
  type User,
  type UserWithRelations,
} from '../models/user.model';

const base = createModel(USER_TABLE);

async function findAllForUser(
  currentUser: Record<string, any> | null | undefined,
  organizationId?: number | string
): Promise<UserWithRelations[]> {
  let users: Record<string, any>[];

  if (currentUser?.is_super_admin && organizationId) {
    users = await db.findAll(
      USER_TABLE,
      { organization_id: organizationId },
      { orderBy: 'id', orderDirection: 'desc' }
    );
  } else {
    users = await scopedQuery(USER_TABLE)
      .select(...USER_LIST_COLUMNS)
      .orderBy('id', 'desc');
  }

  return Promise.all(users.map((user) => loadUserWithRelations(user.id)));
}

async function findByEmail(email: string): Promise<User | null> {
  return db.findOne(USER_TABLE, { email });
}

async function findById(id: number | string): Promise<User | null> {
  return base.findById(id);
}

async function findByIdWithRelations(id: number | string): Promise<UserWithRelations | null> {
  return loadUserWithRelations(id);
}

async function createUser(
  data: CreateUserRecord,
  options: { organizationId?: number | string } = {}
): Promise<UserWithRelations> {
  const payload = withOrganizationId({
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (options.organizationId) {
    payload.organization_id = Number(options.organizationId);
  }

  const user = await db.insert(USER_TABLE, payload);
  return loadUserWithRelations(user.id);
}

async function updateUser(
  id: number | string,
  updates: UpdateUserInput
): Promise<UserWithRelations> {
  await db.update(USER_TABLE, { id }, { ...updates, updated_at: new Date() });
  return loadUserWithRelations(id);
}

async function changePassword(id: number | string, hashedPassword: string) {
  return db.update(USER_TABLE, { id }, {
    password: hashedPassword,
    updated_at: new Date(),
  });
}

async function remove(id: number | string) {
  return base.remove(id);
}

export default {
  findAllForUser,
  findByEmail,
  findById,
  findByIdWithRelations,
  createUser,
  updateUser,
  changePassword,
  remove,
};
